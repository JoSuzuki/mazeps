import { redirect, useFetcher } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import Spacer from '~/components/spacer/spacer.component'
import { Role, TournamentStatus } from '~/generated/prisma/enums'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  let [tournament, tournamentPlayer] = await Promise.all([
    context.prisma.tournament.findUniqueOrThrow({
      where: { id: Number(params.tournamentId) },
      include: {
        players: { include: { user: { select: { nickname: true } } } },
        rounds: {
          include: {
            matches: {
              include: {
                players: { include: { user: { select: { nickname: true } } } },
              },
            },
          },
        },
      },
    }),
    context.currentUser &&
      context.prisma.tournamentPlayer.findFirst({
        where: {
          userId: context.currentUser.id,
          tournamentId: Number(params.tournamentId),
        },
      }),
  ])

  let isAdmin = context.currentUser.role == Role.ADMIN

  return {
    tournament,
    tournamentPlayer,
    isAdmin,
  }
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  const fetcher = useFetcher()

  let lastRound = loaderData.tournament.rounds.sort(
    (a, b) => b.roundNumber - a.roundNumber,
  )[0]

  return (
    <Center>
      <Link to="/tournaments" viewTransition className="absolute top-2 left-6">
        ← Voltar
      </Link>
      <div className="absolute top-2 right-2">
        {loaderData.tournamentPlayer ? (
          <Link
            to={`/tournaments/${params.tournamentId}/tournament-players/${loaderData.tournamentPlayer.id}`}
          >
            Ver inscrição
          </Link>
        ) : (
          <fetcher.Form
            method="post"
            action={`/tournaments/${params.tournamentId}/tournament-players/new`}
          >
            <Button type="submit">Inscrever-se</Button>
          </fetcher.Form>
        )}
      </div>
      <h1
        className={`flex justify-center text-lg`}
        style={{
          viewTransitionName: `tournament-title-${params.tournamentId}`,
        }}
      >
        {loaderData.tournament.name}
      </h1>
      <h2>Jogadores</h2>
      <ul className="list-outside list-disc">
        {loaderData.tournament.players.map((player) => (
          <li key={player.user.nickname}>
            <Link
              viewTransition
              to={`/tournaments/${params.tournamentId}/tournament-players/${player.id}`}
              style={{ viewTransitionName: `tournament-player-${player.id}` }}
            >
              {player.user.nickname}
            </Link>
          </li>
        ))}
      </ul>
      {loaderData.isAdmin &&
        (loaderData.tournament.status === TournamentStatus.REGISTRATION_OPEN ||
          loaderData.tournament.status === TournamentStatus.FINISHED_ROUND) && (
          <fetcher.Form
            method="post"
            action={`/tournaments/${params.tournamentId}/launch-round`}
          >
            <Button type="submit">Lançar Rodada</Button>
          </fetcher.Form>
        )}
      <Spacer size="md" />
      {loaderData.tournament.status === TournamentStatus.OPEN_ROUND && (
        <div>
          <h2>Round Ativo</h2>
          <ul className="list-outside list-disc">
            {lastRound.matches.map((match) => (
              <li key={match.id}>
                <Link
                  viewTransition
                  to={`/matches/${match.id}`}
                  style={{ viewTransitionName: `match-${match.id}` }}
                >
                  Match {match.id}
                </Link>
                <ul className="list-circle ml-6 list-inside">
                  {match.players.map((player) => (
                    <li key={player.id}>{player.user.nickname}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <fetcher.Form
            method="post"
            action={`/tournaments/${params.tournamentId}/end-round`}
          >
            <Button type="submit">Encerrar Rodada</Button>
          </fetcher.Form>
        </div>
      )}
    </Center>
  )
}

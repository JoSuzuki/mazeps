import { Fragment } from 'react/jsx-runtime'
import { redirect, useFetcher } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import Spacer from '~/components/spacer/spacer.component'
import Table from '~/components/table/table.component'
import { Role, TournamentPlayerStatus } from '~/generated/prisma/enums'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  let tournamentPlayer =
    await context.prisma.tournamentPlayer.findUniqueOrThrow({
      where: { id: Number(params.tournamentPlayerId) },
      include: {
        user: true,
        matches: {
          include: {
            matchResults: { include: { player: { include: { user: true } } } },
          },
        },
      },
    })

  let isAdmin = context.currentUser.role == Role.ADMIN

  return {
    tournamentPlayer,
    isAdmin,
  }
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  const fetcher = useFetcher()

  return (
    <>
      <div className="flex justify-between px-6 py-2">
        <Link to={`/tournaments/${params.tournamentId}`} viewTransition>
          ← Voltar
        </Link>
      </div>
      <Center>
        <div className="flex justify-center">
          <h1
            className={`text-lg`}
            style={{
              viewTransitionName: `tournament-player-${params.tournamentPlayerId}`,
            }}
          >
            {loaderData.tournamentPlayer.user.nickname}
          </h1>
        </div>
        <Spacer size="lg" />
        {loaderData.tournamentPlayer.matches.length === 0 &&
          'Não há partidas jogadas ainda'}
        {loaderData.tournamentPlayer.matches.map((match) => (
          <Fragment key={match.id}>
            <h2>Partida {match.roundId}</h2>
            <Table
              emptyState={'Não há resulltados para a partida jogada ainda'}
              data={match.matchResults}
              columns={[
                {
                  key: 'name',
                  title: 'Nome',
                  value: (matchResult) => matchResult.player.user.nickname,
                },
                {
                  key: 'points',
                  title: 'pontuação',
                  value: (matchResult) => matchResult.points,
                },
              ]}
            />
            <Spacer size="md" />
          </Fragment>
        ))}
        <div>
          {loaderData.isAdmin &&
            loaderData.tournamentPlayer.status ===
              TournamentPlayerStatus.ACTIVE && (
              <fetcher.Form
                method="post"
                action={`/tournaments/${params.tournamentId}/tournament-players/${params.tournamentPlayerId}/change-status`}
              >
                <Button type="submit">Dropar Jogador</Button>
              </fetcher.Form>
            )}

          {loaderData.isAdmin &&
            loaderData.tournamentPlayer.status ===
              TournamentPlayerStatus.DROPPED && (
              <fetcher.Form
                method="post"
                action={`/tournaments/${params.tournamentId}/tournament-players/${params.tournamentPlayerId}/change-status`}
              >
                <Button type="submit">Reativar Jogador</Button>
              </fetcher.Form>
            )}
        </div>
      </Center>
    </>
  )
}

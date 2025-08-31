import { redirect, useFetcher } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  let [tournament, tournamentPlayer] = await Promise.all([
    context.prisma.tournament.findUniqueOrThrow({
      where: { id: Number(params.tournamentId) },
      include: {
        players: { include: { user: { select: { nickname: true } } } },
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

  return {
    tournament,
    tournamentPlayer,
  }
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  const fetcher = useFetcher()
  return (
    <Center>
      <Link to="/tournaments" className="absolute top-2 left-2">
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
      <h1 className="flex justify-center text-lg">
        {loaderData.tournament.name}
      </h1>
      <h2>Jogadores</h2>
      <ul className="list-inside list-disc">
        {loaderData.tournament.players.map((player) => (
          <li key={player.user.nickname}>
            <Link
              to={`/tournaments/${params.tournamentId}/tournament-players/${player.id}`}
            >
              {player.user.nickname}
            </Link>
          </li>
        ))}
      </ul>
    </Center>
  )
}

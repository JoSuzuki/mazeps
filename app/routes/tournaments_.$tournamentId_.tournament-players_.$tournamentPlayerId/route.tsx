import { redirect } from 'react-router'
import type { Route } from './+types/route'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import Table from '~/components/table/table.component'

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

  return {
    tournamentPlayer,
  }
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  return (
    <Center>
      <Link
        to={`/tournaments/${params.tournamentId}`}
        className="absolute top-2 left-2"
      >
        ← Voltar
      </Link>
      <h1 className="flex justify-center text-lg">
        {loaderData.tournamentPlayer.user.nickname}
      </h1>
      {loaderData.tournamentPlayer.matches.length === 0 &&
        'Não há partidas jogadas ainda'}
      {loaderData.tournamentPlayer.matches.map((match) => (
        <div key={match.id}>
          <h2>Partida ${match.roundId}</h2>
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
        </div>
      ))}
    </Center>
  )
}

import { redirect, useFetcher } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  let match = await context.prisma.match.findUniqueOrThrow({
    where: { id: Number(params.matchId) },
    include: {
      players: { include: { user: { select: { nickname: true } } } },
      matchResults: { select: { playerId: true, points: true } },
    },
  })

  return { match }
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  const fetcher = useFetcher()

  return (
    <Center>
      <h2>Jogadores</h2>
      <ul className="list-outside list-disc">
        <fetcher.Form
          method="post"
          action={`/matches/${params.matchId}/report-results`}
        >
          {loaderData.match.players.map((player) => (
            <li key={player.id}>
              {player.user.nickname} <br></br>
              <input
                type="number"
                step="0.01"
                min="0"
                id={String(player.id)}
                defaultValue={
                  loaderData.match.matchResults.find(
                    (result) => result.playerId === player.id,
                  )?.points || ''
                }
                name={String(player.id)}
              />
            </li>
          ))}
          <br></br>
          <Button type="submit">Reportar resultados</Button>
        </fetcher.Form>
      </ul>
    </Center>
  )
}

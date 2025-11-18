import { Fragment } from 'react/jsx-runtime'
import { Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import NumberInput from '~/components/number-input/number-input.component'
import Spacer from '~/components/spacer/spacer.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  let match = await context.prisma.match.findUniqueOrThrow({
    where: { id: Number(params.matchId) },
    include: {
      players: { include: { user: { select: { nickname: true } } } },
      matchResults: { select: { playerId: true, points: true } },
    },
  })

  return { match, isAdmin: context.currentUser.role === Role.ADMIN }
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  return (
    <>
      <BackButtonPortal to={`/tournaments/${params.tournamentId}`} />
      <Center>
        <div className="flex justify-center">
          <h1
            className="text-xl"
            style={{ viewTransitionName: `match-${params.matchId}` }}
          >
            Partida {params.matchId}
          </h1>
        </div>
        <Spacer size="lg" />
        <h2 className="flex justify-center text-lg">Jogadores</h2>
        <Spacer size="md" />
        <ul className="list-outside list-disc">
          <Form
            method="post"
            action={`/tournaments/${params.tournamentId}/matches/${params.matchId}/report-results`}
          >
            {loaderData.match.players.map((player) => {
              const points =
                loaderData.match.matchResults.find(
                  (result) => result.playerId === player.id,
                )?.points ?? 0
              return (
                <Fragment key={player.id}>
                  <li>
                    {loaderData.isAdmin ? (
                      <NumberInput
                        id={String(player.id)}
                        label={player.user.nickname}
                        min={0}
                        step={0.01}
                        name={String(player.id)}
                        required={true}
                        defaultValue={points}
                      />
                    ) : (
                      <div>
                        {player.user.nickname}: {points} pontos
                      </div>
                    )}
                  </li>
                  <Spacer size="sm" />
                </Fragment>
              )
            })}
            {loaderData.isAdmin && (
              <>
                <Spacer size="md" />
                <Button type="submit">Reportar resultados</Button>
              </>
            )}
          </Form>
        </ul>
      </Center>
    </>
  )
}

import { Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import LinkButton from '~/components/link-button/link-button.component'
import SupporterNameDisplay from '~/components/supporter-name-display/supporter-name-display.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  const match = await context.prisma.match.findUniqueOrThrow({
    where: { id: Number(params.matchId) },
    include: {
      round: { select: { roundNumber: true } },
      players: {
        include: { user: { select: { nickname: true, isSupporter: true } } },
      },
      matchResults: { select: { playerId: true, points: true } },
    },
  })

  const tournament = await context.prisma.tournament.findUniqueOrThrow({
    where: { id: Number(params.tournamentId) },
    select: { name: true },
  })

  const canReportResults =
    context.currentUser.role === Role.ADMIN ||
    context.currentUser.role === Role.STAFF

  return {
    match,
    tournament,
    canReportResults,
  }
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  const { match, tournament, canReportResults } = loaderData

  return (
    <>
      <BackButtonPortal to={`/tournaments/${params.tournamentId}`} />
      <Center>
        <div className="mx-auto max-w-xl px-6 py-10">
          {/* Header */}
          <header className="mb-10">
            <LinkButton
              styleType="secondary"
              to={`/tournaments/${params.tournamentId}`}
              viewTransition
              className="mb-6 inline-flex"
            >
              ← Voltar ao torneio
            </LinkButton>
            <div>
              <h1
                className="font-brand text-3xl tracking-wide"
                style={{ viewTransitionName: `match-${params.matchId}` }}
              >
                Partida {params.matchId}
              </h1>
              <p className="mt-2 text-foreground/70">
                Rodada {match.round.roundNumber} — {tournament.name}
              </p>
            </div>
          </header>

          {/* Resultados */}
          <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Resultados
            </h2>
            <Form
              method="post"
              action={`/tournaments/${params.tournamentId}/matches/${params.matchId}/report-results`}
              className="space-y-6"
            >
              <div className="space-y-4">
                {(canReportResults
                  ? match.players
                  : [...match.players].sort((a, b) => {
                      const ptsA =
                        match.matchResults.find((r) => r.playerId === a.id)
                          ?.points ?? 0
                      const ptsB =
                        match.matchResults.find((r) => r.playerId === b.id)
                          ?.points ?? 0
                      return ptsB - ptsA
                    })
                ).map((player) => {
                  const points =
                    match.matchResults.find(
                      (result) => result.playerId === player.id,
                    )?.points ?? 0
                  return (
                    <div
                      key={player.id}
                      className="flex flex-col gap-2 rounded-xl border border-foreground/10 bg-background/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-medium">
                        <SupporterNameDisplay
                          name={player.user.nickname}
                          isSupporter={player.user.isSupporter}
                          nameClassName="font-medium"
                        />
                      </span>
                      {canReportResults ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            id={String(player.id)}
                            name={String(player.id)}
                            min={0}
                            step={0.01}
                            required
                            defaultValue={points}
                            className="w-24 rounded-lg border border-foreground/20 bg-background px-3 py-2 text-right font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <span className="text-sm text-foreground/60">pts</span>
                        </div>
                      ) : (
                        <span className="font-semibold">{points} pts</span>
                      )}
                    </div>
                  )
                })}
              </div>
              {canReportResults && (
                <div className="pt-2">
                  <Button type="submit" className="w-full sm:w-auto">
                    Salvar resultados
                  </Button>
                </div>
              )}
            </Form>
          </section>
        </div>
      </Center>
    </>
  )
}

import { redirect, useFetcher } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import { Role, TournamentPlayerStatus } from '~/generated/prisma/enums'

const STATUS_LABELS: Record<TournamentPlayerStatus, string> = {
  [TournamentPlayerStatus.ACTIVE]: 'Ativo',
  [TournamentPlayerStatus.DROPPED]: 'Dropado',
}

const STATUS_STYLES: Record<TournamentPlayerStatus, string> = {
  [TournamentPlayerStatus.ACTIVE]: 'bg-green-100 text-green-800 border-green-200',
  [TournamentPlayerStatus.DROPPED]: 'bg-slate-100 text-slate-600 border-slate-200',
}

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  const tournamentPlayer =
    await context.prisma.tournamentPlayer.findUniqueOrThrow({
      where: { id: Number(params.tournamentPlayerId) },
      include: {
        user: { select: { nickname: true, name: true } },
        tournament: { select: { name: true } },
        matches: {
          include: {
            round: { select: { roundNumber: true } },
            matchResults: {
              include: { player: { include: { user: { select: { nickname: true } } } } },
            },
          },
        },
      },
    })

  const isAdmin = context.currentUser.role === Role.ADMIN

  return {
    tournamentPlayer,
    isAdmin,
  }
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  const fetcher = useFetcher()
  const { tournamentPlayer, isAdmin } = loaderData

  const sortedMatches = [...tournamentPlayer.matches].sort(
    (a, b) => a.round.roundNumber - b.round.roundNumber,
  )

  return (
    <>
      <BackButtonPortal to={`/tournaments/${params.tournamentId}`} />
      <Center>
        <div className="mx-auto max-w-2xl px-6 py-10">
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1
                  className="font-brand text-3xl tracking-wide"
                  style={{
                    viewTransitionName: `tournament-player-${params.tournamentPlayerId}`,
                  }}
                >
                  {tournamentPlayer.user.nickname}
                </h1>
                <p className="mt-1 text-foreground/70">
                  {tournamentPlayer.user.name}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                      STATUS_STYLES[tournamentPlayer.status] ??
                      STATUS_STYLES[TournamentPlayerStatus.ACTIVE]
                    }`}
                  >
                    {STATUS_LABELS[tournamentPlayer.status] ??
                      tournamentPlayer.status}
                  </span>
                  <span className="rounded-full border border-foreground/20 bg-foreground/5 px-4 py-1.5 text-sm font-medium">
                    {tournamentPlayer.tournament.name}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Partidas */}
          <section className="mb-8 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Partidas ({sortedMatches.length})
            </h2>
            {sortedMatches.length === 0 ? (
              <p className="text-foreground/50">
                Nenhuma partida jogada ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {sortedMatches.map((match) => (
                  <Link
                    key={match.id}
                    viewTransition
                    to={`/tournaments/${params.tournamentId}/matches/${match.id}`}
                    className="block rounded-xl border border-foreground/10 bg-background/40 p-4 transition-colors hover:border-foreground/20 hover:bg-foreground/5"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-medium">
                        Rodada {match.round.roundNumber} — Partida {match.id}
                      </span>
                      <span className="text-foreground/50">→</span>
                    </div>
                    <ul className="space-y-2">
                      {match.matchResults
                        .sort((a, b) => b.points - a.points)
                        .map((result) => (
                          <li
                            key={result.id}
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                          >
                            <span
                              className={
                                result.playerId === tournamentPlayer.id
                                  ? 'font-semibold'
                                  : ''
                              }
                            >
                              {result.player.user.nickname}
                              {result.playerId === tournamentPlayer.id && (
                                <span className="ml-2 text-foreground/50">
                                  (você)
                                </span>
                              )}
                            </span>
                            <span className="font-medium">{result.points} pts</span>
                          </li>
                        ))}
                    </ul>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Ações admin */}
          {isAdmin && (
            <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Ações
              </h2>
              {tournamentPlayer.status === TournamentPlayerStatus.ACTIVE ? (
                <fetcher.Form
                  method="post"
                  action={`/tournaments/${params.tournamentId}/tournament-players/${params.tournamentPlayerId}/change-status`}
                >
                  <Button
                    type="submit"
                    className="bg-red-100 text-red-800 hover:bg-red-200"
                  >
                    Dropar jogador
                  </Button>
                </fetcher.Form>
              ) : (
                <fetcher.Form
                  method="post"
                  action={`/tournaments/${params.tournamentId}/tournament-players/${params.tournamentPlayerId}/change-status`}
                >
                  <Button type="submit">Reativar jogador</Button>
                </fetcher.Form>
              )}
            </section>
          )}
        </div>
      </Center>
    </>
  )
}

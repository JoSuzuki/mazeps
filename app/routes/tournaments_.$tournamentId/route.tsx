import { useState } from 'react'
import { Form, redirect, useFetcher } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import type { MatchResult } from '~/generated/prisma/client'
import { Role, TournamentStatus } from '~/generated/prisma/enums'
import type { Unpacked } from '~/lib/type-helpers'

const STATUS_LABELS: Record<TournamentStatus, string> = {
  [TournamentStatus.REGISTRATION_OPEN]: 'Inscrições abertas',
  [TournamentStatus.OPEN_ROUND]: 'Rodada em andamento',
  [TournamentStatus.FINISHED_ROUND]: 'Rodada finalizada',
  [TournamentStatus.TOURNAMENT_FINISHED]: 'Torneio encerrado',
}

const STATUS_STYLES: Record<TournamentStatus, string> = {
  [TournamentStatus.REGISTRATION_OPEN]: 'bg-green-100 text-green-800 border-green-200',
  [TournamentStatus.OPEN_ROUND]: 'bg-blue-100 text-blue-800 border-blue-200',
  [TournamentStatus.FINISHED_ROUND]: 'bg-amber-100 text-amber-800 border-amber-200',
  [TournamentStatus.TOURNAMENT_FINISHED]: 'bg-slate-100 text-slate-700 border-slate-200',
}

type MatchWithPlayers = Unpacked<
  Route.ComponentProps['loaderData']['tournamentMatches']
>

type PlayerWithUser = Unpacked<
  Route.ComponentProps['loaderData']['tournament']['players']
>

interface TournamentPoints {
  [key: number | string]: number
}

interface OpponentsWeights {
  [key: number | string]: { [key: number | string]: number }
}

function calculateTotalPoints(
  tournamentPlayersIds: number[],
  tournamentMatchResults: MatchResult[],
): TournamentPoints {
  const totalPoints = Object.fromEntries(
    tournamentPlayersIds.map((playerId) => [playerId, 0]),
  )

  tournamentMatchResults.forEach((matchResult) => {
    totalPoints[matchResult.playerId] += matchResult.points
  })

  return totalPoints
}

function calculateOpponentsWeights(
  tournamentMatches: MatchWithPlayers[],
  tournamentPlayersIds: number[],
): OpponentsWeights {
  const opponentsWeights = Object.fromEntries(
    tournamentPlayersIds.map((playerId) => [
      playerId,
      Object.fromEntries(
        tournamentPlayersIds.map((opponentId) => [opponentId, 0]),
      ),
    ]),
  )

  tournamentMatches.forEach((match) => {
    match.players.forEach((player) => {
      match.players.forEach((opponent) => {
        if (player.id != opponent.id) {
          opponentsWeights[player.id][opponent.id] += 1
        }
      })
    })
  })

  return opponentsWeights
}

function calculateTieBreaker(
  points: TournamentPoints,
  opponentsWeights: OpponentsWeights,
  tournamentPlayersIds: number[],
): TournamentPoints {
  const totalTieBreakers = Object.fromEntries(
    tournamentPlayersIds.map((playerId) => [playerId, 0]),
  )
  tournamentPlayersIds.forEach((playerId) => {
    let denominator = 0.0
    let numerator = 0.0
    let opponents = opponentsWeights[playerId]

    tournamentPlayersIds.forEach((opponentId) => {
      denominator += opponents[opponentId]
      numerator += opponents[opponentId] * points[opponentId]
    })

    totalTieBreakers[playerId] = numerator / denominator
  })

  return totalTieBreakers
}

function calculateRankWithTieBreakers(
  tournamentPlayersIds: number[],
  tournamentPoints: TournamentPoints,
  tournamentFirstTieBreaker: TournamentPoints,
  tournamentSecondTieBreaker: TournamentPoints,
): number[] {
  return tournamentPlayersIds.sort(function (a, b) {
    if (tournamentPoints[a] > tournamentPoints[b]) {
      return -1
    } else if (tournamentPoints[a] < tournamentPoints[b]) {
      return 1
    } else {
      if (tournamentFirstTieBreaker[a] > tournamentFirstTieBreaker[b]) {
        return -1
      } else if (tournamentFirstTieBreaker[a] < tournamentFirstTieBreaker[b]) {
        return 1
      } else {
        if (tournamentSecondTieBreaker[a] > tournamentSecondTieBreaker[b]) {
          return -1
        } else if (
          tournamentSecondTieBreaker[a] < tournamentSecondTieBreaker[b]
        ) {
          return 1
        } else {
          return 0
        }
      }
    }
  })
}

function calculateRank(
  tournamentMatchResults: MatchResult[],
  tournamentPlayersIds: number[],
  tournamentMatches: MatchWithPlayers[],
  tournamentPlayers: PlayerWithUser[],
) {
  const totalPoints = calculateTotalPoints(
    tournamentPlayersIds,
    tournamentMatchResults,
  )

  const opponentsWeights = calculateOpponentsWeights(
    tournamentMatches,
    tournamentPlayersIds,
  )

  const firstTieBreaker = calculateTieBreaker(
    totalPoints,
    opponentsWeights,
    tournamentPlayersIds,
  )

  const secondTieBreaker = calculateTieBreaker(
    firstTieBreaker,
    opponentsWeights,
    tournamentPlayersIds,
  )

  const rank = calculateRankWithTieBreakers(
    tournamentPlayersIds,
    totalPoints,
    firstTieBreaker,
    secondTieBreaker,
  )

  const tournamentPlayersById = Object.fromEntries(
    tournamentPlayers.map((tournamentPlayer) => [
      tournamentPlayer.id,
      tournamentPlayer,
    ]),
  )

  return rank.map((playerId, index) => ({
    id: playerId,
    position: index + 1,
    player: tournamentPlayersById[playerId],
    points: totalPoints[playerId],
    firstTieBreaker: firstTieBreaker[playerId],
    secondTieBreaker: secondTieBreaker[playerId],
  }))
}

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  let [tournament, currentTournamentPlayer] = await Promise.all([
    context.prisma.tournament.findUniqueOrThrow({
      where: { id: Number(params.tournamentId) },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            badgeFile: true,
          },
        },
        players: { include: { user: { select: { nickname: true } } } },
        rounds: {
          include: {
            matches: {
              include: {
                players: { include: { user: { select: { nickname: true } } } },
                matchResults: true,
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
        include: { user: { select: { nickname: true } } },
      }),
  ])

  let tournamentMatchResults = await context.prisma.matchResult.findMany({
    where: {
      playerId: {
        in: tournament.players.map((player) => player.id),
      },
    },
  })

  type Matches = Unpacked<typeof tournament.rounds>['matches']
  let tournamentMatches: Matches = []

  tournament.rounds.forEach((round) =>
    round.matches.forEach((match) => tournamentMatches.push(match)),
  )

  let isAdmin = context.currentUser.role == Role.ADMIN

  return {
    tournament,
    currentTournamentPlayer,
    isAdmin,
    tournamentMatchResults,
    tournamentMatches,
  }
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  const fetcher = useFetcher()
  const [showEndTournamentConfirm, setShowEndTournamentConfirm] =
    useState(false)

  let lastRound = loaderData.tournament.rounds.sort(
    (a, b) => b.roundNumber - a.roundNumber,
  )[0]

  let tournamentPlayersIds = loaderData.tournament.players.map(
    (player) => player.id,
  )

  let rankData = calculateRank(
    loaderData.tournamentMatchResults,
    tournamentPlayersIds,
    loaderData.tournamentMatches,
    loaderData.tournament.players,
  )

  const event = loaderData.tournament.event

  return (
    <>
      <BackButtonPortal to="/tournaments" />
      <Center>
        <div className="mx-auto max-w-2xl px-6 py-10">
          {/* Header: badge + nome + status + ações */}
          <header className="mb-10 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
            {event?.badgeFile && (
              <img
                src={event.badgeFile}
                alt={`Badge de ${loaderData.tournament.name}`}
                className="h-32 w-32 shrink-0 rounded-2xl border border-foreground/10 object-contain shadow-md"
              />
            )}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1
                className="font-brand text-3xl tracking-wide"
                style={{ viewTransitionName: `tournament-title-${params.tournamentId}` }}
              >
                {loaderData.tournament.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <span
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                    STATUS_STYLES[loaderData.tournament.status] ??
                    STATUS_STYLES[TournamentStatus.REGISTRATION_OPEN]
                  }`}
                >
                  {STATUS_LABELS[loaderData.tournament.status] ??
                    loaderData.tournament.status}
                </span>
                <span className="rounded-full border border-foreground/20 bg-foreground/5 px-4 py-1.5 text-sm font-medium uppercase tracking-wider">
                  Torneio
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {event && loaderData.isAdmin && (
                  <LinkButton
                    styleType="secondary"
                    to={`/events/${event.id}`}
                    viewTransition
                  >
                    Ver evento
                  </LinkButton>
                )}
                {loaderData.currentTournamentPlayer ? (
                  <LinkButton
                    styleType="secondary"
                    to={`/tournaments/${params.tournamentId}/tournament-players/${loaderData.currentTournamentPlayer.id}`}
                    viewTransition
                  >
                    Ver minha inscrição
                  </LinkButton>
                ) : (
                  loaderData.tournament.status ===
                    TournamentStatus.REGISTRATION_OPEN && (
                    <fetcher.Form
                      method="post"
                      action={`/tournaments/${params.tournamentId}/tournament-players/new`}
                    >
                      <Button type="submit">Inscrever-se</Button>
                    </fetcher.Form>
                  )
                )}
              </div>
            </div>
          </header>

          {/* Inscritos (registro aberto) */}
          {loaderData.tournament.status ===
            TournamentStatus.REGISTRATION_OPEN && (
            <section className="mb-8 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Inscritos ({loaderData.tournament.players.length})
              </h2>
              {loaderData.tournament.players.length === 0 ? (
                <p className="text-foreground/50">Nenhum inscrito ainda.</p>
              ) : (
                <ol className="space-y-2">
                  {loaderData.tournament.players.map((player, index) => (
                    <li key={player.id}>
                      <Link
                        viewTransition
                        to={`/tournaments/${params.tournamentId}/tournament-players/${player.id}`}
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-foreground/5 ${
                          loaderData.currentTournamentPlayer?.id === player.id
                            ? 'bg-primary/10 ring-1 ring-primary/30'
                            : ''
                        }`}
                        style={{
                          viewTransitionName: `tournament-player-${player.id}`,
                        }}
                      >
                        <span className="w-6 text-sm font-medium text-foreground/50">
                          {index + 1}.
                        </span>
                        <span className="font-medium">
                          {player.user.nickname}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
              {loaderData.isAdmin && (
                <fetcher.Form
                  method="post"
                  action={`/tournaments/${params.tournamentId}/launch-round`}
                  className="mt-6"
                >
                  <Button type="submit">Lançar rodada</Button>
                </fetcher.Form>
              )}
            </section>
          )}

          {/* Classificação (rodadas em andamento ou finalizadas) */}
          {loaderData.tournament.status !==
            TournamentStatus.REGISTRATION_OPEN && (
            <section className="mb-8 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Classificação
              </h2>
              {rankData.length === 0 ? (
                <p className="text-foreground/50">Sem classificação ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-foreground/10">
                        <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                          #
                        </th>
                        <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                          Jogador
                        </th>
                        <th className="pb-3 pr-4 text-right text-xs font-semibold uppercase tracking-wider text-foreground/60">
                          Pts
                        </th>
                        <th className="pb-3 pr-4 text-right text-xs font-semibold uppercase tracking-wider text-foreground/60">
                          SoS
                        </th>
                        <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground/60">
                          SSoS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankData.map((rank) => (
                        <tr
                          key={rank.id}
                          className={`border-b border-foreground/5 last:border-0 ${
                            loaderData.currentTournamentPlayer?.id === rank.id
                              ? 'bg-primary/5'
                              : ''
                          }`}
                        >
                          <td className="py-3 pr-4 font-medium text-foreground/70">
                            {rank.position}
                          </td>
                          <td className="py-3 pr-4">
                            <Link
                              to={`/tournaments/${params.tournamentId}/tournament-players/${rank.id}`}
                              viewTransition
                              className="font-medium hover:underline"
                              style={{
                                viewTransitionName: `tournament-player-${rank.id}`,
                              }}
                            >
                              {rank.player.user.nickname}
                            </Link>
                          </td>
                          <td className="py-3 pr-4 text-right font-semibold">
                            {rank.points}
                          </td>
                          <td className="py-3 pr-4 text-right text-foreground/80">
                            {rank.firstTieBreaker.toFixed(3)}
                          </td>
                          <td className="py-3 text-right text-foreground/80">
                            {rank.secondTieBreaker.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {loaderData.isAdmin &&
                loaderData.tournament.status ===
                  TournamentStatus.FINISHED_ROUND && (
                  <fetcher.Form
                    method="post"
                    action={`/tournaments/${params.tournamentId}/launch-round`}
                    className="mt-6"
                  >
                    <Button type="submit">Lançar próxima rodada</Button>
                  </fetcher.Form>
                )}
            </section>
          )}

          {/* Round ativo */}
          {loaderData.tournament.status === TournamentStatus.OPEN_ROUND &&
            lastRound && (
              <section className="mb-8 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  Rodada {lastRound.roundNumber} — Partidas
                </h2>
                <div className="space-y-4">
                  {lastRound.matches.map((match, index) => (
                    <Link
                      key={match.id}
                      viewTransition
                      to={`/tournaments/${params.tournamentId}/matches/${match.id}`}
                      className="block rounded-xl border border-foreground/10 bg-background/40 p-4 transition-colors hover:border-foreground/20 hover:bg-foreground/5"
                      style={{ viewTransitionName: `match-${match.id}` }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium">
                          Mesa {index + 1} — Partida {match.id}
                        </span>
                        <span className="text-foreground/50">→</span>
                      </div>
                      <ul className="space-y-1 text-sm text-foreground/80">
                        {match.players.map((player) => (
                          <li key={player.id} className="flex justify-between">
                            <span>{player.user.nickname}</span>
                            <span className="font-medium">
                              {match.matchResults.find(
                                (matchResult) =>
                                  matchResult.playerId === player.id,
                              )?.points ?? 0}{' '}
                              pts
                            </span>
                          </li>
                        ))}
                      </ul>
                    </Link>
                  ))}
                </div>
                {loaderData.isAdmin && (
                  <fetcher.Form
                    method="post"
                    action={`/tournaments/${params.tournamentId}/end-round`}
                    className="mt-6"
                  >
                    <input
                      type="hidden"
                      name="lastRoundId"
                      defaultValue={lastRound.id}
                    />
                    <Button type="submit">Encerrar rodada</Button>
                    {fetcher.data && (
                      <p className="mt-2 text-sm text-red-600">
                        {(fetcher.data as { error?: string })?.error}
                      </p>
                    )}
                  </fetcher.Form>
                )}
              </section>
            )}

          {/* Encerrar torneio (apenas ADMIN) */}
          {loaderData.isAdmin &&
            loaderData.tournament.status !==
              TournamentStatus.TOURNAMENT_FINISHED && (
              <section className="mt-12 rounded-2xl border border-red-200 bg-red-50/50 p-6">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-700">
                  Encerrar torneio
                </h2>
                <p className="mb-4 text-sm text-red-800/90">
                  Ao encerrar o torneio, não será possível lançar novas rodadas
                  nem alterar resultados. Esta ação é irreversível.
                </p>
                <Button
                  type="button"
                  onClick={() => setShowEndTournamentConfirm(true)}
                  className="bg-red-100 text-red-800 hover:bg-red-200"
                >
                  Encerrar torneio
                </Button>
              </section>
            )}

          {/* Modal de confirmação encerrar torneio */}
          {showEndTournamentConfirm && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setShowEndTournamentConfirm(false)}
            >
              <div
                className="max-w-md rounded-2xl border border-foreground/10 bg-background p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-brand text-xl">Encerrar torneio?</h3>
                <p className="mt-3 text-foreground/80">
                  Tem certeza que deseja encerrar{' '}
                  <strong>{loaderData.tournament.name}</strong>? Não será
                  possível lançar novas rodadas ou alterar resultados.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button
                    type="button"
                    styleType="secondary"
                    onClick={() => setShowEndTournamentConfirm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Form
                    method="post"
                    action={`/tournaments/${params.tournamentId}/end-tournament`}
                    className="flex-1"
                    onSubmit={() => setShowEndTournamentConfirm(false)}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-red-600 text-white hover:bg-red-700"
                    >
                      Sim, encerrar
                    </Button>
                  </Form>
                </div>
              </div>
            </div>
          )}
        </div>
      </Center>
    </>
  )
}

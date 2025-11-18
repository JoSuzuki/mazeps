import { Fragment } from 'react/jsx-runtime'
import { redirect, useFetcher } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import Spacer from '~/components/spacer/spacer.component'
import Table from '~/components/table/table.component'
import type { MatchResult } from '~/generated/prisma/client'
import { Role, TournamentStatus } from '~/generated/prisma/enums'
import type { Unpacked } from '~/lib/type-helpers'

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

  return (
    <>
      <BackButtonPortal to="/tournaments" />
      <div className="flex justify-end px-6 py-2">
        {loaderData.currentTournamentPlayer ? (
          <Link
            viewTransition
            to={`/tournaments/${params.tournamentId}/tournament-players/${loaderData.currentTournamentPlayer.id}`}
          >
            Ver inscrição
          </Link>
        ) : (
          loaderData.tournament.status === 'REGISTRATION_OPEN' && (
            <fetcher.Form
              method="post"
              action={`/tournaments/${params.tournamentId}/tournament-players/new`}
            >
              <Button type="submit">Inscrever-se</Button>
            </fetcher.Form>
          )
        )}
      </div>
      <Center>
        <div className={`flex justify-center`}>
          <h1
            className="text-xl"
            style={{
              viewTransitionName: `tournament-title-${params.tournamentId}`,
            }}
          >
            {loaderData.tournament.name}
          </h1>
        </div>
        <Spacer size="lg" />
        {loaderData.tournament.status ===
          TournamentStatus.REGISTRATION_OPEN && (
          <>
            <h2 className="flex justify-center text-lg">Inscritos</h2>
            <Spacer size="md" />
            <ol className="list-inside list-decimal">
              {loaderData.tournament.players.map((player) => (
                <li key={player.id}>
                  <Link
                    viewTransition
                    to={`/tournaments/${params.tournamentId}/tournament-players/${player.id}`}
                    style={{
                      viewTransitionName: `tournament-player-${player.id}`,
                    }}
                    styleType={
                      loaderData.currentTournamentPlayer?.id === player.id
                        ? 'solid'
                        : 'default'
                    }
                  >
                    {player.user.nickname}
                  </Link>
                </li>
              ))}
            </ol>
          </>
        )}
        {loaderData.tournament.status != TournamentStatus.REGISTRATION_OPEN && (
          <Table
            data={rankData}
            columns={[
              {
                key: 'position',
                title: 'Classificação',
                value: (rank) => rank.position,
              },
              {
                key: 'player',
                title: 'Jogador',
                value: (rank) => (
                  <Link
                    to={`/tournaments/${params.tournamentId}/tournament-players/${rank.id}`}
                    viewTransition
                    style={{
                      viewTransitionName: `tournament-player-${rank.id}`,
                    }}
                    styleType={
                      loaderData.currentTournamentPlayer?.id === rank.id
                        ? 'solid'
                        : 'default'
                    }
                  >
                    {rank.player.user.nickname}
                  </Link>
                ),
              },
              {
                key: 'points',
                title: 'Pontos',
                value: (rank) => rank.points,
              },
              {
                key: 'firstTieBreaker',
                title: 'SoS',
                value: (rank) => rank.firstTieBreaker.toFixed(3),
              },
              {
                key: 'secondTieBreaker',
                title: 'SSoS',
                value: (rank) => rank.secondTieBreaker.toFixed(3),
              },
            ]}
            emptyState="Sem classificação"
          />
        )}
        {loaderData.isAdmin &&
          (loaderData.tournament.status ===
            TournamentStatus.REGISTRATION_OPEN ||
            loaderData.tournament.status ===
              TournamentStatus.FINISHED_ROUND) && (
            <>
              <Spacer size="md" />
              <fetcher.Form
                method="post"
                action={`/tournaments/${params.tournamentId}/launch-round`}
              >
                <Button type="submit">Lançar Rodada</Button>
              </fetcher.Form>
            </>
          )}
        <Spacer size="md" />
        {loaderData.tournament.status === TournamentStatus.OPEN_ROUND && (
          <div>
            <h2 className="flex justify-center text-lg">Round Ativo</h2>
            <Spacer size="md" />
            {lastRound.matches.map((match, index) => (
              <Fragment key={match.id}>
                <h3>
                  <Link
                    viewTransition
                    to={`/tournaments/${params.tournamentId}/matches/${match.id}`}
                  >
                    Mesa {index + 1} -{' '}
                    <span style={{ viewTransitionName: `match-${match.id}` }}>
                      Partida {match.id}
                    </span>
                  </Link>
                </h3>
                <Spacer size="sm" />
                <ul className="list-inside list-disc">
                  {match.players.map((player) => (
                    <li key={player.id}>
                      {player.user.nickname} -{' '}
                      {match.matchResults.find(
                        (matchResult) => matchResult.playerId === player.id,
                      )?.points ?? 0}{' '}
                      pontos
                    </li>
                  ))}
                </ul>
                <Spacer size="md" />
              </Fragment>
            ))}
            {loaderData.isAdmin && (
              <fetcher.Form
                method="post"
                action={`/tournaments/${params.tournamentId}/end-round`}
              >
                <input
                  className="hidden"
                  name="lastRoundId"
                  defaultValue={lastRound.id}
                />
                <Button type="submit">Encerrar Rodada</Button>
                {fetcher.data && (
                  <>
                    <Spacer size="sm" />
                    <div className="text-error">{fetcher.data?.error}</div>
                  </>
                )}
              </fetcher.Form>
            )}
          </div>
        )}
      </Center>
    </>
  )
}

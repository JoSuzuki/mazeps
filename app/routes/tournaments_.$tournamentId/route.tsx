import { redirect, useFetcher } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import Spacer from '~/components/spacer/spacer.component'
import type { MatchResult, Prisma } from '~/generated/prisma/client'
import { Role, TournamentStatus } from '~/generated/prisma/enums'

type MatchWithPlayers = Prisma.MatchGetPayload<{
  include: {
    players: {
      include: {
        user: {
          select: { nickname: true }
        }
      }
    }
  }
}>

type PlayerWithUser = Prisma.TournamentPlayerGetPayload<{
  include: {
    user: { select: { nickname: true } }
  }
}>

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
  // result[player][opponent] = x

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
  // console.log(opponentsWeights[13])
  tournamentPlayersIds.forEach((playerId) => {
    let denominator = 0.0
    let numerator = 0.0
    let opponents = opponentsWeights[playerId]

    tournamentPlayersIds.forEach((opponentId) => {
      // console.log(`opponentes: ${opponents}`)
      // console.log(`timesFacedOpponent: ${opponents[opponentId]}`)
      denominator += opponents[opponentId]
      // console.log(denominator)
      numerator += opponents[opponentId] * points[opponentId]
      // console.log(numerator)
    })

    totalTieBreakers[playerId] = numerator / denominator
    // console.log(totalTieBreakers[playerId])
  })

  // console.log(totalTieBreakers)
  return totalTieBreakers
}

function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }
  return array
}

function calculateRankWithTieBreakers(
  tournamentPlayersIds: number[],
  tournamentPoints: TournamentPoints,
  tournamentFirstTieBreaker: TournamentPoints,
  tournamentSecondTieBreaker: TournamentPoints,
): number[] {
  let shuffledPlayerIds = shuffle(tournamentPlayersIds)

  return shuffledPlayerIds.sort(function (a, b) {
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

function calculateRankAndComposeTable(
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

  return rank.map((playerId, index) => (
    <tr key={playerId}>
      <td>{index + 1}</td>
      <td>
        {
          Object.fromEntries(
            tournamentPlayers.map((player) => [
              player.id,
              player.user.nickname,
            ]),
          )[playerId]
        }
      </td>
      <td>{totalPoints[playerId]}</td>
      <td>{Math.round(firstTieBreaker[playerId] * 100) / 100}</td>
      <td>{Math.round(secondTieBreaker[playerId] * 100) / 100}</td>
    </tr>
  ))
}

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

  let tournamentMatchResults = await context.prisma.matchResult.findMany({
    where: {
      playerId: {
        in: tournament.players.map((player) => player.id),
      },
    },
  })

  let tournamentMatches: MatchWithPlayers[] = []

  tournament.rounds.forEach((round) =>
    round.matches.forEach((match) => tournamentMatches.push(match)),
  )

  let isAdmin = context.currentUser.role == Role.ADMIN

  return {
    tournament,
    tournamentPlayer,
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
      {loaderData.tournament.status === TournamentStatus.REGISTRATION_OPEN && (
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
      )}
      {loaderData.tournament.status != TournamentStatus.REGISTRATION_OPEN && (
        <table>
          <tr>
            <th>
              Classificação&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </th>
            <th>
              Jogador&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </th>
            <th>
              Pontos&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </th>
            <th>
              SoS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </th>
            <th>
              SSoS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </th>
          </tr>
          {calculateRankAndComposeTable(
            loaderData.tournamentMatchResults,
            tournamentPlayersIds,
            loaderData.tournamentMatches,
            loaderData.tournament.players,
          )}
        </table>
      )}
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

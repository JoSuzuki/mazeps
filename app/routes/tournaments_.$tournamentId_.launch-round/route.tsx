import { number } from 'motion/react'
import { data, redirect } from 'react-router'
import type { Route } from '../+types/_base-layout'
import type { Round, Tournament } from '~/generated/prisma/client'
import { Role, TournamentStatus } from '~/generated/prisma/enums'

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

async function createRound(
  context: Route.ActionArgs['context'],
  tournamentId: number,
): Promise<Round> {
  let lastRound = await context.prisma.round.findFirst({
    where: { tournamentId: Number(tournamentId) },
    orderBy: { roundNumber: 'desc' },
  })

  const newRound = await context.prisma.round.create({
    data: {
      tournamentId: Number(tournamentId),
      roundNumber: (lastRound?.roundNumber ?? 0) + 1,
    },
  })

  return newRound
}

interface TournamentPoints {
  [key: number | string]: number
}

async function calculateTournamentPoints(
  context: Route.ActionArgs['context'],
  tournamentPlayersIds: number[],
): Promise<TournamentPoints> {
  const tournamentMatchResults = await context.prisma.matchResult.findMany({
    where: {
      playerId: {
        in: tournamentPlayersIds,
      },
    },
  })

  const totalPoints = Object.fromEntries(
    tournamentPlayersIds.map((playerId) => [playerId, 0]),
  )

  tournamentMatchResults.forEach((matchResult) => {
    totalPoints[matchResult.playerId] += matchResult.points
  })

  return totalPoints
}

function calculateTournamentRank(
  tournamentPlayersIds: number[],
  tournamentPoints: TournamentPoints,
): number[] {
  let rank: number[] = []

  let shuffledPlayerIds = shuffle(tournamentPlayersIds)

  shuffledPlayerIds.forEach((playerId) => {
    if (rank.length == 0) {
      rank[0] = playerId
    } else {
      let i = 0
      let inserted = false
      while (i < rank.length && !inserted) {
        if (tournamentPoints[playerId] > tournamentPoints[rank[i]]) {
          rank.splice(i, 0, playerId)
          inserted = true
        }
        i++
      }
      if (!inserted) {
        rank.push(playerId)
      }
    }
  })

  return rank
}

function calculateNumberOfPlayersPerTable(
  numberOfTables: number,
  numberOfPlayers: number,
): number[] {
  let numberOfPlayersPerTable: number[] = Array.from(
    { length: numberOfTables },
    () => 0,
  )

  for (var i = 0; i < numberOfPlayers; i++) {
    numberOfPlayersPerTable[i % numberOfTables] += 1
  }

  return numberOfPlayersPerTable
}

async function createRoundMatches(
  context: Route.ActionArgs['context'],
  playersPerTable: number[],
  roundId: number,
  tournamentRank: number[],
) {
  let cumulativeIndex = 0

  let headPlayerOfNextTableIndexes = playersPerTable.map((num) => {
    cumulativeIndex += num
    return cumulativeIndex
  })

  for (var i = 0; i < headPlayerOfNextTableIndexes.length; i++) {
    let headPlayerIndex

    if (i == 0) {
      headPlayerIndex = 0
    } else {
      headPlayerIndex = headPlayerOfNextTableIndexes[i - 1]
    }

    await context.prisma.match.create({
      data: {
        roundId: roundId,
        players: {
          connect: tournamentRank
            .slice(headPlayerIndex, headPlayerOfNextTableIndexes[i])
            .map((playerId) => ({ id: playerId })),
        },
      },
    })
  }
}

async function calculateAndCreateRoundMatches(
  context: Route.ActionArgs['context'],
  currentRound: Round,
  tournamentId: Number,
) {
  let tournament = await context.prisma.tournament.findUniqueOrThrow({
    where: { id: Number(tournamentId) },
    include: {
      players: { select: { id: true } },
    },
  })

  const tournamentPlayersIds = tournament.players.map((player) => player.id)

  const totalPoints = await calculateTournamentPoints(
    context,
    tournamentPlayersIds,
  )

  const tournamentRank = calculateTournamentRank(
    tournamentPlayersIds,
    totalPoints,
  )

  const numberOfTables = Math.ceil(
    tournamentPlayersIds.length / tournament.desiredTableSize,
  )

  const numberOfPlayersPerTable = calculateNumberOfPlayersPerTable(
    numberOfTables,
    tournamentPlayersIds.length,
  )

  await createRoundMatches(
    context,
    numberOfPlayersPerTable,
    currentRound.id,
    tournamentRank,
  )
}

export async function action({ context, params }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  await context.prisma.tournament.update({
    where: { id: Number(params.tournamentId) },
    data: {
      status: TournamentStatus.OPEN_ROUND,
    },
  })

  const newRound = await createRound(context, Number(params.tournamentId))

  await calculateAndCreateRoundMatches(
    context,
    newRound,
    Number(params.tournamentId),
  )

  return data({ success: true })
}

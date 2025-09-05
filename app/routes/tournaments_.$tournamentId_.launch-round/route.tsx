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

  console.log('criei_round_novo')

  return newRound
}

async function createRoundMatches(
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

  console.log('busquei_torneio')

  const tournamentPlayersIds = tournament.players.map((player) => player.id)

  const tournamentMatchResults = await context.prisma.matchResult.findMany({
    where: {
      playerId: {
        in: tournamentPlayersIds,
      },
    },
  })

  console.log('busquei_resultados')

  const totalPoints = Object.fromEntries(
    tournamentPlayersIds.map((playerId) => [playerId, 0]),
  )

  tournamentMatchResults.forEach((matchResult) => {
    totalPoints[matchResult.playerId] += matchResult.points
  })

  console.log('calculei_resultado')

  let rank: number[] = []

  let shuffledPlayerIds = shuffle(tournamentPlayersIds)

  console.log('embaralhei_players')

  shuffledPlayerIds.forEach((playerId) => {
    if (rank.length == 0) {
      rank[0] = playerId
      console.log(rank)
    } else {
      let i = 0
      let inserted = false
      while (i < rank.length && !inserted) {
        if (totalPoints[playerId] > totalPoints[rank[i]]) {
          rank.splice(i, 0, playerId)
          inserted = true
        }
        console.log(rank)
        i++
      }
      if (!inserted) {
        rank.push(playerId)
      }
    }
  })

  console.log(rank)

  const numberOfTables = Math.ceil(
    tournamentPlayersIds.length / tournament.desiredTableSize,
  )

  let playersPerTable: number[] = Array.from(
    { length: numberOfTables },
    () => 0,
  )

  for (var i = 0; i < tournamentPlayersIds.length; i++) {
    playersPerTable[i % numberOfTables] += 1
  }

  let aux = 0

  for (const numberOfPlayers of playersPerTable) {
    await context.prisma.match.create({
      data: {
        roundId: currentRound.id,
        players: {
          connect: rank
            .slice(aux, aux + numberOfPlayers)
            .map((playerId) => ({ id: playerId })),
        },
      },
    })
    aux += numberOfPlayers
  }
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

  await createRoundMatches(context, newRound, Number(params.tournamentId))

  return data({ success: true })
}

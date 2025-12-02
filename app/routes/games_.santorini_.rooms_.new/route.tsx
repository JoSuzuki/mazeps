import { redirect } from 'react-router'
import type { Route } from './+types/route'
import type { Board } from '~/lib/santorini'
import { generateRandomCode } from '~/lib/utils'

export async function action({ context }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')

  await context.prisma.santoriniRoom.create({
    data: {
      roomCode: generateRandomCode(),
      creatorId: context.currentUser.id,
      gameState: {
        phase: 'placement',
        currentTurn: {
          playerId: 0,
          actions: [],
        },
        workers: [],
        board: Array(5).fill(Array(5).fill({ height: 0 })) as Board,
        history: [],
      },
      players: {
        create: {
          userId: context.currentUser.id,
        },
      },
    },
  })

  context.io.emit('room_created')
  return redirect(`/games/santorini/rooms/index`)
}

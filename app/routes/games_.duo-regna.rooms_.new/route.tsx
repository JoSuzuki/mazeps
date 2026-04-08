import { redirect } from 'react-router'
import type { Route } from './+types/route'
import { generateRandomCode } from '~/lib/utils'

export async function action({ context }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')

  await context.prisma.duoRegnaRoom.create({
    data: {
      roomCode: generateRandomCode(),
      creatorId: context.currentUser.id,
      gameState: {},
      players: {
        create: {
          userId: context.currentUser.id,
          seat: 0,
        },
      },
    },
  })

  context.io.emit('room_created')
  return redirect('/games/duo-regna/rooms/index')
}

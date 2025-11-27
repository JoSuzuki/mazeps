import { redirect } from 'react-router'
import type { Route } from './+types/route'
import { generateRandomCode } from '~/lib/utils'

export async function action({ context }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')

  await context.prisma.santoriniRoom.create({
    data: {
      roomCode: generateRandomCode(),
      creatorId: context.currentUser.id,
      gameState: {},
    },
  })

  return redirect(`/games/santorini/rooms/index`)
}

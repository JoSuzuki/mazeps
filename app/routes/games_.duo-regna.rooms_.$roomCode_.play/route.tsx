import { redirect } from 'react-router'
import type { Route } from './+types/route'
import DuoRegnaPlay from '~/components/duo-regna-play/duo-regna-play.component'
import { DuoRegnaRoomStatus } from '~/generated/prisma/enums'
import type { DuoRegnaGameState } from '~/lib/duo-regna'
import { toClientState } from '~/lib/duo-regna'

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  if (!context.currentUser) return redirect('/login')
  const currentUser = context.currentUser

  const room = await context.prisma.duoRegnaRoom.findUniqueOrThrow({
    where: { roomCode: params.roomCode },
    include: {
      players: {
        include: { user: { select: { id: true, nickname: true, isSupporter: true } } },
      },
    },
  })

  if (!room.players.some((a) => a.userId === currentUser.id)) {
    return redirect('/games/duo-regna/rooms/index')
  }

  if (room.status === DuoRegnaRoomStatus.FINISHED) {
    return redirect(`/games/duo-regna/rooms/${params.roomCode}`)
  }

  if (room.status === DuoRegnaRoomStatus.WAITING) {
    return redirect(`/games/duo-regna/rooms/${params.roomCode}`)
  }

  const gs = room.gameState as unknown as DuoRegnaGameState
  if (!gs?.hands?.[0] || !gs?.hands?.[1]) {
    return redirect(`/games/duo-regna/rooms/${params.roomCode}`)
  }

  const player = room.players.find((a) => a.userId === currentUser.id)!
  const seat = player.seat as 0 | 1
  const initialClientState = toClientState(gs, seat, room.status)

  return {
    roomCode: room.roomCode,
    seat,
    initialClientState,
    finishedFromLoader: false,
  }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  return (
    <DuoRegnaPlay
      roomCode={loaderData.roomCode}
      initialSeat={loaderData.seat}
      initialClientState={loaderData.initialClientState}
      finishedFromLoader={loaderData.finishedFromLoader}
    />
  )
}

import { redirect } from 'react-router'
import type { Route } from './+types/route'
import DuoRegnaPlay from '~/components/duo-regna-play/duo-regna-play.component'
import { DuoRegnaRoomStatus } from '~/generated/prisma/enums'
import type { DuoRegnaGameState } from '~/lib/duo-regna'
import { normalizeDuoRegnaState, toClientState } from '~/lib/duo-regna'
import { duoRegnaLeavePlayer } from '~/lib/duo-regna-room.server'

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

  if (room.status === DuoRegnaRoomStatus.WAITING) {
    return redirect(`/games/duo-regna/rooms/${params.roomCode}`)
  }

  const gs = normalizeDuoRegnaState(room.gameState as unknown as DuoRegnaGameState)
  if (
    room.status === DuoRegnaRoomStatus.PLAYING &&
    (!gs?.hands?.[0] || !gs?.hands?.[1])
  ) {
    return redirect(`/games/duo-regna/rooms/${params.roomCode}`)
  }

  const player = room.players.find((a) => a.userId === currentUser.id)!
  const seat = player.seat as 0 | 1
  const initialClientState = toClientState(gs, seat, room.status)

  const players = room.players.map((p) => ({
    seat: p.seat as 0 | 1,
    nickname: p.user.nickname,
    isSupporter: p.user.isSupporter,
  }))

  return {
    roomCode: room.roomCode,
    roomId: room.id,
    seat,
    initialClientState,
    finishedFromLoader: room.status === DuoRegnaRoomStatus.FINISHED,
    players,
  }
}

export const action = async ({ context, request, params }: Route.ActionArgs) => {
  if (!context.currentUser) return redirect('/login')

  const formData = await request.formData()
  if (formData.get('intent') !== 'leave') return null

  const result = await duoRegnaLeavePlayer(
    context.io,
    context.currentUser.id,
    String(params.roomCode),
  )

  if (result === 'not_found') {
    return redirect('/games/duo-regna/rooms/index')
  }

  return redirect('/games/duo-regna/rooms/index')
}

export default function Route({ loaderData }: Route.ComponentProps) {
  return (
    <DuoRegnaPlay
      roomCode={loaderData.roomCode}
      roomId={loaderData.roomId}
      initialSeat={loaderData.seat}
      initialClientState={loaderData.initialClientState}
      finishedFromLoader={loaderData.finishedFromLoader}
      players={loaderData.players}
    />
  )
}

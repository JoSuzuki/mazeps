import type { Server } from 'socket.io'
import { DuoRegnaRoomStatus } from '~/generated/prisma/enums'
import prisma from '~/lib/prisma'

/** Inatividade máxima antes de cancelar a partida (5 min). */
export const DUO_REGNA_AFK_TIMEOUT_MS = 5 * 60 * 1000

const afkTimers = new Map<string, ReturnType<typeof setTimeout>>()

export function clearDuoRegnaAfkTimer(roomCode: string) {
  const t = afkTimers.get(roomCode)
  if (t) {
    clearTimeout(t)
    afkTimers.delete(roomCode)
  }
}

export function scheduleDuoRegnaAfkCheck(
  io: Server,
  roomCode: string,
  lastActivityAt: number,
  onAfk: (roomCode: string) => Promise<void>,
) {
  clearDuoRegnaAfkTimer(roomCode)
  const delay = Math.max(0, lastActivityAt + DUO_REGNA_AFK_TIMEOUT_MS - Date.now())
  afkTimers.set(
    roomCode,
    setTimeout(() => {
      void onAfk(roomCode)
    }, delay),
  )
}

export async function resetDuoRegnaRoomToLobby(
  io: Server,
  roomCode: string,
  roomId: number,
) {
  await prisma.duoRegnaRoomPlayer.updateMany({
    where: { roomId },
    data: { winner: false },
  })
  await prisma.duoRegnaRoom.update({
    where: { id: roomId },
    data: {
      status: DuoRegnaRoomStatus.WAITING,
      gameState: {},
    },
  })
  clearDuoRegnaAfkTimer(roomCode)
  io.to(roomCode).emit('duo_regna_lobby_updated')
}

export async function duoRegnaLeavePlayer(
  io: Server,
  userId: number,
  roomCode: string,
): Promise<'deleted' | 'lobby' | 'not_found'> {
  const player = await prisma.duoRegnaRoomPlayer.findFirst({
    where: {
      userId,
      room: { roomCode },
    },
    include: { room: { include: { players: true } } },
  })

  if (!player) return 'not_found'

  const { room } = player
  await prisma.duoRegnaRoomPlayer.delete({
    where: { roomId_userId: { roomId: room.id, userId } },
  })

  const remaining = room.players.filter((p) => p.userId !== userId)

  if (remaining.length === 0) {
    clearDuoRegnaAfkTimer(roomCode)
    await prisma.duoRegnaRoom.delete({ where: { id: room.id } })
    io.emit('room_left')
    return 'deleted'
  }

  await resetDuoRegnaRoomToLobby(io, roomCode, room.id)
  io.to(roomCode).emit('duo_regna_player_left')
  io.emit('room_left')
  return 'lobby'
}

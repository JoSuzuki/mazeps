import type { Server, Socket } from 'socket.io'
import { DuoRegnaRoomStatus } from '~/generated/prisma/enums'
import {
  type DuoRegnaGameState,
  parseCardFromClient,
  toClientState,
  tryPlayCard,
} from '~/lib/duo-regna'
import prisma from '~/lib/prisma'
import { deepClone } from '~/lib/utils'

async function emitDuoRegnaState(
  io: Server,
  roomCode: string,
  room: {
    status: DuoRegnaRoomStatus
    gameState: unknown
    players: { userId: number; seat: number }[]
  },
) {
  const gs = room.gameState as DuoRegnaGameState
  const sockets = await io.in(roomCode).fetchSockets()
  for (const s of sockets) {
    const uid = s.data.currentUser.id as number
    const p = room.players.find((x) => x.userId === uid)
    if (p == null) continue
    const seat = p.seat as 0 | 1
    s.emit(
      'duo_regna_state',
      toClientState(gs, seat, room.status),
    )
  }
}

export const registerDuoRegnaHandlers = (io: Server, socket: Socket) => {
  socket.on('duo_regna_play_card', async (roomCode: string, rawCard: unknown) => {
    try {
      const card = parseCardFromClient(rawCard)
      if (card == null) {
        socket.emit('duo_regna_error', 'Carta inválida.')
        return
      }

      const room = await prisma.duoRegnaRoom.findFirst({
        where: {
          roomCode: String(roomCode),
          status: DuoRegnaRoomStatus.PLAYING,
          players: { some: { userId: socket.data.currentUser.id } },
        },
        include: { players: true },
      })

      if (!room) {
        socket.emit('duo_regna_error', 'Sala não encontrada ou jogo não iniciado.')
        return
      }

      const player = room.players.find((p) => p.userId === socket.data.currentUser.id)
      if (!player) return

      const seat = player.seat as 0 | 1
      const state = deepClone(room.gameState) as DuoRegnaGameState
      const err = tryPlayCard(state, seat, card)
      if (err) {
        socket.emit('duo_regna_error', err)
        return
      }

      let status = room.status
      const winnerSeat = state.winnerSeat

      if (winnerSeat !== null) {
        status = DuoRegnaRoomStatus.FINISHED
        const winnerPlayer = room.players.find((p) => p.seat === winnerSeat)
        if (winnerPlayer) {
          await prisma.duoRegnaRoomPlayer.update({
            where: { id: winnerPlayer.id },
            data: { winner: true },
          })
        }
      }

      await prisma.duoRegnaRoom.update({
        where: { id: room.id },
        data: {
          status,
          gameState: state as object,
        },
      })

      const updated = await prisma.duoRegnaRoom.findUniqueOrThrow({
        where: { id: room.id },
        include: { players: true },
      })

      await emitDuoRegnaState(io, roomCode, updated)
      if (status === DuoRegnaRoomStatus.FINISHED) {
        io.to(roomCode).emit('duo_regna_finished')
      }
    } catch (e) {
      console.error('duo_regna_play_card', e)
      socket.emit('duo_regna_error', 'Erro no servidor.')
    }
  })
}

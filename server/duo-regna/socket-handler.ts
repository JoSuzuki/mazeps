import type { Server, Socket } from 'socket.io'
import { DuoRegnaRoomStatus } from '~/generated/prisma/enums'
import {
  clearDuoRegnaAfkTimer,
  resetDuoRegnaRoomToLobby,
  scheduleDuoRegnaAfkCheck,
} from '~/lib/duo-regna-room.server'
import {
  type DuoRegnaGameState,
  createInitialDuoRegnaState,
  isDuoRegnaGameOver,
  normalizeDuoRegnaState,
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
  const gs = normalizeDuoRegnaState(room.gameState as DuoRegnaGameState)
  const sockets = await io.in(roomCode).fetchSockets()
  for (const s of sockets) {
    const uid = s.data.currentUser.id as number
    const p = room.players.find((x) => x.userId === uid)
    if (p == null) continue
    const seat = p.seat as 0 | 1
    s.emit('duo_regna_state', toClientState(gs, seat, room.status))
  }
}

async function cancelGameDueToAfk(io: Server, roomCode: string) {
  const room = await prisma.duoRegnaRoom.findFirst({
    where: { roomCode, status: DuoRegnaRoomStatus.PLAYING },
    include: { players: true },
  })
  if (!room) return

  await resetDuoRegnaRoomToLobby(io, roomCode, room.id)
  io.to(roomCode).emit('duo_regna_afk_cancel')
}

async function finishGameIfNeeded(
  io: Server,
  roomCode: string,
  state: DuoRegnaGameState,
  players: { id: number; seat: number }[],
) {
  if (!isDuoRegnaGameOver(state)) return DuoRegnaRoomStatus.PLAYING

  const winnerSeat = state.winnerSeat
  if (winnerSeat !== null) {
    const winnerPlayer = players.find((p) => p.seat === winnerSeat)
    if (winnerPlayer) {
      await prisma.duoRegnaRoomPlayer.update({
        where: { id: winnerPlayer.id },
        data: { winner: true },
      })
    }
  }

  clearDuoRegnaAfkTimer(roomCode)
  return DuoRegnaRoomStatus.FINISHED
}

async function startRematch(io: Server, roomCode: string, roomId: number) {
  await prisma.duoRegnaRoomPlayer.updateMany({
    where: { roomId },
    data: { winner: false },
  })
  const gameState = createInitialDuoRegnaState()
  await prisma.duoRegnaRoom.update({
    where: { id: roomId },
    data: {
      status: DuoRegnaRoomStatus.PLAYING,
      gameState: gameState as object,
    },
  })

  const updated = await prisma.duoRegnaRoom.findUniqueOrThrow({
    where: { id: roomId },
    include: { players: true },
  })

  scheduleDuoRegnaAfkCheck(io, roomCode, gameState.lastActivityAt, cancelGameDueToAfk)
  await emitDuoRegnaState(io, roomCode, updated)
  io.to(roomCode).emit('duo_regna_rematch_started')
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
      const state = normalizeDuoRegnaState(deepClone(room.gameState) as DuoRegnaGameState)
      const err = tryPlayCard(state, seat, card)
      if (err) {
        socket.emit('duo_regna_error', err)
        return
      }

      const status = await finishGameIfNeeded(
        io,
        String(roomCode),
        state,
        room.players,
      )

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

      if (status === DuoRegnaRoomStatus.PLAYING) {
        scheduleDuoRegnaAfkCheck(
          io,
          String(roomCode),
          state.lastActivityAt,
          cancelGameDueToAfk,
        )
      }

      await emitDuoRegnaState(io, roomCode, updated)
      if (status === DuoRegnaRoomStatus.FINISHED) {
        io.to(roomCode).emit('duo_regna_finished')
      }
    } catch (e) {
      console.error('duo_regna_play_card', e)
      socket.emit('duo_regna_error', 'Erro no servidor.')
    }
  })

  socket.on('duo_regna_rematch_vote', async (roomCode: string) => {
    try {
      const room = await prisma.duoRegnaRoom.findFirst({
        where: {
          roomCode: String(roomCode),
          status: DuoRegnaRoomStatus.FINISHED,
          players: { some: { userId: socket.data.currentUser.id } },
        },
        include: { players: true },
      })

      if (!room) {
        socket.emit('duo_regna_error', 'Partida não encontrada ou ainda em curso.')
        return
      }

      const player = room.players.find((p) => p.userId === socket.data.currentUser.id)
      if (!player) return

      const seat = player.seat as 0 | 1
      const state = normalizeDuoRegnaState(deepClone(room.gameState) as DuoRegnaGameState)
      state.rematchReady[seat] = true

      await prisma.duoRegnaRoom.update({
        where: { id: room.id },
        data: { gameState: state as object },
      })

      const updated = await prisma.duoRegnaRoom.findUniqueOrThrow({
        where: { id: room.id },
        include: { players: true },
      })

      await emitDuoRegnaState(io, roomCode, updated)

      if (state.rematchReady[0] && state.rematchReady[1]) {
        await startRematch(io, String(roomCode), room.id)
      }
    } catch (e) {
      console.error('duo_regna_rematch_vote', e)
      socket.emit('duo_regna_error', 'Erro ao pedir revanche.')
    }
  })

  socket.on('duo_regna_join_play', async (roomCode: string) => {
    try {
      const room = await prisma.duoRegnaRoom.findFirst({
        where: {
          roomCode: String(roomCode),
          status: DuoRegnaRoomStatus.PLAYING,
          players: { some: { userId: socket.data.currentUser.id } },
        },
      })
      if (!room?.gameState) return
      const gs = normalizeDuoRegnaState(room.gameState as DuoRegnaGameState)
      scheduleDuoRegnaAfkCheck(io, String(roomCode), gs.lastActivityAt, cancelGameDueToAfk)
    } catch (e) {
      console.error('duo_regna_join_play', e)
    }
  })
}

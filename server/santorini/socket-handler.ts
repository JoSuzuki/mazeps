import type { Server, Socket } from 'socket.io'
import type { SantoriniRoomPlayer } from '~/generated/prisma/client'
import { SantoriniRoomStatus } from '~/generated/prisma/enums'
import prisma from '~/lib/prisma'
import {
  applyActionsToGameState,
  canExecuteAction,
  getNextActionType,
  verifyCurrentPlayerCanAct,
  verifyWinningMove,
} from '~/lib/santorini'
import type { Action, GameState } from '~/lib/santorini'
import { deepClone } from '~/lib/utils'

export const registerSantoriniHandlers = (io: Server, socket: Socket) => {
  socket.on('join_room', async (roomCode) => {
    await socket.join(roomCode)
    io.to(roomCode).emit('room_joined', socket.id)
  })

  socket.on('leave_room', async (roomCode) => {
    await socket.leave(roomCode)
    io.to(roomCode).emit('room_left', socket.id)
  })

  socket.on(
    'add_action',
    async (
      roomCode,
      actionType: Action['type'],
      data: { x: number; y: number },
    ) => {
      const updatedRoom = await addActionToRoom(
        roomCode,
        socket.data.currentUser.id,
        {
          type: actionType,
          tile: data,
        },
      )

      io.to(roomCode).emit('game_state_updated', updatedRoom.gameState)

      if (verifyWinningMove(updatedRoom.gameState)) {
        await finishGame(
          roomCode,
          socket.data.currentUser.id,
          updatedRoom.gameState.currentTurn.playerId,
        )
        io.to(roomCode).emit('game_finished')
      }
    },
  )

  socket.on('commit_actions', async (roomCode) => {
    const updatedRoom = await commitActionsToRoom(
      roomCode,
      socket.data.currentUser.id,
    )
    io.to(roomCode).emit('game_state_updated', updatedRoom.gameState)

    if (!verifyCurrentPlayerCanAct(updatedRoom.gameState)) {
      await finishGame(
        roomCode,
        socket.data.currentUser.id,
        getOtherPlayerId(
          updatedRoom.players,
          updatedRoom.gameState.currentTurn.playerId,
        ),
      )

      io.to(roomCode).emit('game_finished')
    }
  })

  socket.on('finish_game', async (roomCode) => {
    await finishGame(roomCode, socket.data.currentUser.id)
    io.to(roomCode).emit('game_finished')
  })

  socket.on('undo_actions', async (roomCode) => {
    const updatedRoom = await undoActionsToRoom(
      roomCode,
      socket.data.currentUser.id,
    )
    io.to(roomCode).emit('game_state_updated', updatedRoom.gameState)
  })
}

const loadRoom = async (roomCode: string, userId: number) => {
  const room = await prisma.santoriniRoom.findUniqueOrThrow({
    where: {
      roomCode,
      players: {
        some: {
          userId,
        },
      },
    },
    include: {
      players: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  })
  return room
}

const finishGame = async (
  roomCode: string,
  userId: number,
  winnerPlayerId?: number,
) => {
  const room = await loadRoom(roomCode, userId)
  const actions = room.gameState.currentTurn.actions
  const currentPlayerId = room.players.find((p) => p.userId === userId)?.id!

  const appliedGameState = applyActionsToGameState(room.gameState)

  const updatedRoom = await prisma.santoriniRoom.update({
    where: {
      roomCode,
      players: {
        some: {
          userId,
        },
      },
    },
    data: {
      status: SantoriniRoomStatus.FINISHED,
      gameState: {
        ...appliedGameState,
        currentTurn: {
          ...appliedGameState.currentTurn,
          actions: [],
        },
        history: [...appliedGameState.history, ...actions],
      },
      players: {
        update: {
          where: {
            id:
              winnerPlayerId ?? getOtherPlayerId(room.players, currentPlayerId),
          },
          data: {
            winner: true,
          },
        },
      },
    },
  })

  return updatedRoom
}

const addActionToRoom = async (
  roomCode: string,
  userId: number,
  action: Pick<Action, 'type' | 'tile'>,
) => {
  const room = await loadRoom(roomCode, userId)

  if (room.status !== SantoriniRoomStatus.PLAYING) {
    console.error('Jogo finalizado')
    return room
  }

  const playerId = room.players.find((a) => a.userId === userId)?.id!
  const fullAction = { ...action, playerId }

  const appliedGameState = applyActionsToGameState(deepClone(room.gameState))
  const nextActionType = getNextActionType(room.gameState, playerId)

  if (!canExecuteAction(appliedGameState, fullAction, nextActionType)) {
    console.error(`Ação inválida: ${action.type} ${action.tile}`)
    return room
  }

  const updatedRoom = await prisma.santoriniRoom.update({
    where: {
      roomCode,
      players: {
        some: {
          userId,
        },
      },
    },
    data: {
      gameState: {
        ...room.gameState,
        currentTurn: {
          ...room.gameState.currentTurn,
          actions: [...room.gameState.currentTurn.actions, fullAction],
        },
      },
    },
    include: {
      players: {
        include: {
          user: {
            select: { id: true, nickname: true },
          },
        },
      },
    },
  })

  return updatedRoom
}

const getNextPhase = (gameState: GameState) => {
  return gameState.workers.length === 4 ? 'move_and_build' : 'placement'
}

const commitActionsToRoom = async (roomCode: string, userId: number) => {
  const room = await loadRoom(roomCode, userId)

  if (room.status !== SantoriniRoomStatus.PLAYING) {
    console.error('Jogo finalizado')
    return room
  }

  const actions = room.gameState.currentTurn.actions
  const appliedGameState = applyActionsToGameState(room.gameState)

  const nextPhase = getNextPhase(appliedGameState)
  const updatedRoom = await prisma.santoriniRoom.update({
    where: {
      roomCode,
      players: {
        some: {
          userId,
        },
      },
    },
    data: {
      gameState: {
        ...appliedGameState,
        phase: nextPhase,
        currentTurn: {
          playerId: getOtherPlayerId(
            room.players,
            room.gameState.currentTurn.playerId,
          ),
          actions: [],
        },
        history: [...room.gameState.history, ...actions],
      },
    },
    include: {
      players: {
        include: {
          user: {
            select: { id: true, nickname: true },
          },
        },
      },
    },
  })

  return updatedRoom
}

const getOtherPlayerId = (
  players: Pick<SantoriniRoomPlayer, 'id'>[],
  playerId: number,
) => {
  return players.find((player) => player.id !== playerId)?.id!
}

const undoActionsToRoom = async (roomCode: string, userId: number) => {
  const room = await loadRoom(roomCode, userId)

  if (room.status !== SantoriniRoomStatus.PLAYING) {
    console.error('Jogo finalizado')
    return room
  }
  const playerId = room.players.find((a) => a.userId === userId)?.id!

  if (room.gameState.currentTurn.playerId !== playerId) {
    console.error('Não é possível realizar ações fora do seu turno')
    return room
  }

  const updatedRoom = await prisma.santoriniRoom.update({
    where: {
      roomCode,
      players: {
        some: {
          userId,
        },
      },
    },
    data: {
      gameState: {
        ...room.gameState,
        currentTurn: {
          ...room.gameState.currentTurn,
          actions: [],
        },
      },
    },
    include: {
      players: {
        include: {
          user: {
            select: { id: true, nickname: true },
          },
        },
      },
    },
  })

  return updatedRoom
}

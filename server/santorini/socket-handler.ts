import type { Server, Socket } from 'socket.io'
import { SantoriniRoomStatus } from '~/generated/prisma/enums'
import prisma from '~/lib/prisma'
import {
  applyActionsToGameState,
  canExecuteAction,
  getNextActionType,
} from '~/lib/santorini'
import type { Action, GameState } from '~/lib/santorini'
import { deepClone } from '~/lib/utils'

export const registerSantoriniHandlers = (io: Server, socket: Socket) => {
  socket.on('join_room', async (roomCode) => {
    console.log('room_joined', socket.data.currentUser.nickname)
    await socket.join(roomCode)
    io.to(roomCode).emit('room_joined', socket.id)
  })

  socket.on('leave_room', async (roomCode) => {
    console.log('room_left', socket.data.currentUser.nickname)
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
    },
  )

  socket.on('commit_actions', async (roomCode) => {
    const updatedRoom = await commitActionsToRoom(
      roomCode,
      socket.data.currentUser.id,
    )
    io.to(roomCode).emit('game_state_updated', updatedRoom.gameState)
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

const finishGame = async (roomCode: string, userId: number) => {
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
  const playerId = room.players.find((a) => a.userId === userId)?.id!
  const fullAction = { ...action, playerId }

  const appliedGameState = applyActionsToGameState(deepClone(room.gameState))
  const nextActionType = getNextActionType(room.gameState, playerId)

  if (!canExecuteAction(appliedGameState, fullAction, nextActionType)) {
    throw new Error(`Ação inválida: ${action.type} ${action.tile}`)
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
          playerId:
            room.gameState.currentTurn.playerId === room.players[0].id
              ? room.players[1].id
              : room.players[0].id,
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

const undoActionsToRoom = async (roomCode: string, userId: number) => {
  const room = await loadRoom(roomCode, userId)
  const playerId = room.players.find((a) => a.userId === userId)?.id!

  if (room.gameState.currentTurn.playerId !== playerId) {
    throw new Error('You are not the current player')
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

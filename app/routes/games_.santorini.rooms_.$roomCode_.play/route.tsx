import { useEffect, useState } from 'react'
import { redirect, useRevalidator } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Santorini from '~/components/santorini/santorini.component'
import { SantoriniRoomStatus } from '~/generated/prisma/enums'
import { applyActionsToGameState, getNextActionType } from '~/lib/santorini'
import type { GameState, Worker } from '~/lib/santorini'
import { deepClone } from '~/lib/utils'
import { useSocket } from '~/services/socket-context'

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  if (!context.currentUser) return redirect('/login')

  const currentUser = context.currentUser
  const room = await context.prisma.santoriniRoom.findUniqueOrThrow({
    where: {
      roomCode: params.roomCode,
    },
    include: {
      players: { include: { user: { select: { id: true, nickname: true } } } },
    },
  })

  if (!room.players.some((a) => a.userId === currentUser.id)) {
    return redirect('/games/santorini/rooms/index')
  }

  if (
    room.status !== SantoriniRoomStatus.PLAYING &&
    room.status !== SantoriniRoomStatus.FINISHED
  ) {
    return redirect(`/games/santorini/rooms/${params.roomCode}`)
  }

  return { player: room.players.find((a) => a.userId === currentUser.id), room }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const socket = useSocket()
  const revalidator = useRevalidator()
  const [gameState, setGameState] = useState(
    loaderData.room.gameState as unknown as GameState,
  )
  const gameFinished = loaderData.room.status === SantoriniRoomStatus.FINISHED
  const canPerformActions = !gameFinished
  let player = loaderData.player!
  let roomCode = loaderData.room.roomCode
  let nextActionType = getNextActionType(gameState, player.id)

  useEffect(() => {
    if (!socket) return

    socket.emit('join_room', roomCode)

    socket.on('room_joined', async (socketId: string) => {
      if (socket.id !== socketId) {
        await revalidator.revalidate()
      }
    })

    socket.on('room_left', async (socketId: string) => {
      if (socket.id !== socketId) {
        await revalidator.revalidate()
      }
    })

    socket.on('game_state_updated', (gameState: GameState) => {
      setGameState(gameState)
    })

    socket.on('game_finished', async () => {
      await revalidator.revalidate()
    })

    return () => {
      socket.off('room_joined')
      socket.off('room_left')
      socket.off('game_state_updated')
      socket.off('game_finished')
      socket.emit('leave_room', roomCode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!socket) return null

  const handleTileClick = (rowIndex: number, colIndex: number) => {
    if (!nextActionType) return

    socket.emit('add_action', roomCode, nextActionType, {
      x: colIndex,
      y: rowIndex,
    })
  }

  const handleWorkerClick = (worker: Worker) => {
    if (!nextActionType) return
    if (worker.playerId !== player.id) return

    socket.emit('add_action', roomCode, nextActionType, {
      x: worker.position.x,
      y: worker.position.y,
    })
  }

  const mapPlayerIdToNickname = loaderData.room.players.reduce(
    (acc, player) => {
      acc[player.id] = player.user.nickname
      return acc
    },
    {} as Record<number, string>,
  )

  const computedGameState = applyActionsToGameState(deepClone(gameState))

  return (
    <div className="flex h-full flex-col">
      {gameFinished && (
        <h2 className="text-2xl font-bold">
          Vencedor:{' '}
          {
            mapPlayerIdToNickname[
              loaderData.room.players.find((player) => player.winner)?.id!
            ]
          }
        </h2>
      )}
      <div className="flex w-full flex-1 flex-col px-4 pb-4">
        <div
          className="mt-4 w-full flex-1 overflow-hidden rounded-lg"
          id="canvas-container"
        >
          <Santorini
            gameState={computedGameState}
            nextActionType={nextActionType}
            onTileClick={handleTileClick}
            onWorkerClick={handleWorkerClick}
            canPerformActions={canPerformActions}
            playerId={player.id}
          />
        </div>
      </div>
      {canPerformActions && (
        <div className="absolute top-0 right-0 p-8">
          <Button
            styleType="secondary"
            onClick={() => socket.emit('finish_game', roomCode)}
          >
            Desistir
          </Button>
        </div>
      )}
      <div className="absolute right-0 bottom-0 flex flex-col gap-4 p-8">
        {canPerformActions &&
          gameState.currentTurn.actions.length > 0 &&
          gameState.currentTurn.playerId === player.id && (
            <Button
              styleType="secondary"
              onClick={() => socket.emit('undo_actions', roomCode)}
            >
              Undo turn actions
            </Button>
          )}
        {canPerformActions && nextActionType === 'commit_actions' && (
          <Button onClick={() => socket.emit('commit_actions', roomCode)}>
            Commit turn actions
          </Button>
        )}
      </div>
    </div>
  )
}

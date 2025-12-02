import { useEffect, useState } from 'react'
import { redirect, useRevalidator } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Spacer from '~/components/spacer/spacer.component'
import { SantoriniRoomStatus } from '~/generated/prisma/enums'
import {
  applyActionsToGameState,
  canExecuteAction,
  getNextActionType,
} from '~/lib/santorini'
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
    <>
      {canPerformActions && (
        <div className="flex justify-end">
          <Button
            styleType="secondary"
            onClick={() => socket.emit('finish_game', roomCode)}
          >
            Desistir
          </Button>
        </div>
      )}
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
      {computedGameState.board.map((row, rowIndex) => (
        <div className="flex" key={rowIndex}>
          {row.map((tile, colIndex) => {
            const worker = computedGameState.workers.find(
              (worker) =>
                worker.position.x === colIndex &&
                worker.position.y === rowIndex,
            )

            const canPlaceWorker = canExecuteAction(
              computedGameState,
              {
                type: 'place_worker',
                tile: { x: colIndex, y: rowIndex },
                playerId: player.id,
              },
              nextActionType,
            )

            const canSelectWorker = canExecuteAction(
              computedGameState,
              {
                type: 'select_worker',
                tile: { x: colIndex, y: rowIndex },
                playerId: player.id,
              },
              nextActionType,
            )

            const canMoveWorker = canExecuteAction(
              computedGameState,
              {
                type: 'move_worker',
                tile: { x: colIndex, y: rowIndex },
                playerId: player.id,
              },
              nextActionType,
            )

            const canBuildFromWorker = canExecuteAction(
              computedGameState,
              {
                type: 'build_from_worker',
                tile: { x: colIndex, y: rowIndex },
                playerId: player.id,
              },
              nextActionType,
            )

            const canClickTile =
              canPlaceWorker || canMoveWorker || canBuildFromWorker

            const tileClasses = [
              canPerformActions &&
                canPlaceWorker &&
                'bg-primary text-on-primary',
              canPerformActions &&
                canMoveWorker &&
                'bg-primary text-on-primary',
              canPerformActions &&
                canBuildFromWorker &&
                'bg-primary text-on-primary',
              canPerformActions && canClickTile && 'cursor-pointer',
            ]
              .filter(Boolean)
              .join(' ')

            const workerClasses = [
              canPerformActions &&
                canSelectWorker &&
                'bg-primary text-on-primary',
              canPerformActions && canSelectWorker && 'cursor-pointer',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <>
                <div
                  className={`h-12 w-12 border ${tileClasses}`}
                  key={colIndex}
                  onClick={() =>
                    canPerformActions &&
                    canClickTile &&
                    handleTileClick(rowIndex, colIndex)
                  }
                >
                  {tile.height}
                  {worker && (
                    <div
                      className={`border ${workerClasses}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        canPerformActions &&
                          canSelectWorker &&
                          handleWorkerClick(worker)
                      }}
                    >
                      {mapPlayerIdToNickname[worker.playerId]}
                    </div>
                  )}
                </div>
              </>
            )
          })}
        </div>
      ))}
      {canPerformActions &&
        gameState.currentTurn.actions.length > 0 &&
        gameState.currentTurn.playerId === player.id && (
          <>
            <Spacer size="md" />
            <Button
              styleType="secondary"
              onClick={() => socket.emit('undo_actions', roomCode)}
            >
              Undo turn actions
            </Button>
          </>
        )}
      {canPerformActions && nextActionType === 'commit_actions' && (
        <>
          <Spacer size="md" />
          <Button onClick={() => socket.emit('commit_actions', roomCode)}>
            Commit turn actions
          </Button>
        </>
      )}
    </>
  )
}

export interface Action {
  type:
    | 'place_worker'
    | 'select_worker'
    | 'move_worker'
    | 'build_from_worker'
    | 'commit_actions'
  tile: { x: number; y: number }
  playerId: number
}

export interface Tile {
  height: number
}

export interface Worker {
  playerId: number
  position: { x: number; y: number }
}

export type Board = [
  [Tile, Tile, Tile, Tile, Tile],
  [Tile, Tile, Tile, Tile, Tile],
  [Tile, Tile, Tile, Tile, Tile],
  [Tile, Tile, Tile, Tile, Tile],
  [Tile, Tile, Tile, Tile, Tile],
]

export interface GameState {
  phase: 'placement' | 'move_and_build'
  currentTurn: {
    playerId: number
    actions: Action[]
  }
  workers:
    | []
    | [Worker]
    | [Worker, Worker]
    | [Worker, Worker, Worker]
    | [Worker, Worker, Worker, Worker]
  board: Board
  history: Action[]
}

export const getNextActionType = (gameState: GameState, playerId: number) => {
  if (gameState.currentTurn.playerId !== playerId) return null
  console.log(
    'getNextActionType',
    gameState.currentTurn.playerId,
    playerId,
    gameState.phase,
    gameState.currentTurn.actions,
  )

  if (
    gameState.phase === 'move_and_build' &&
    gameState.currentTurn.actions.filter((a) => a.type === 'select_worker')
      .length === 1 &&
    gameState.currentTurn.actions.filter((a) => a.type === 'move_worker')
      .length === 1 &&
    gameState.currentTurn.actions.filter((a) => a.type === 'build_from_worker')
      .length === 1
  ) {
    return 'commit_actions' as const
  } else if (
    gameState.phase === 'placement' &&
    gameState.currentTurn.actions.filter((a) => a.type === 'place_worker')
      .length === 2
  ) {
    return 'commit_actions' as const
  } else if (
    gameState.phase === 'move_and_build' &&
    gameState.currentTurn.actions.filter((a) => a.type === 'select_worker')
      .length === 1 &&
    gameState.currentTurn.actions.filter((a) => a.type === 'move_worker')
      .length === 1
  ) {
    return 'build_from_worker' as const
  } else if (
    gameState.phase === 'move_and_build' &&
    gameState.currentTurn.actions.filter((a) => a.type === 'select_worker')
      .length === 1
  ) {
    return 'move_worker' as const
  } else if (
    gameState.phase === 'move_and_build' &&
    gameState.currentTurn.actions.filter((a) => a.type === 'select_worker')
      .length === 0
  ) {
    return 'select_worker' as const
  } else if (
    gameState.phase === 'placement' &&
    gameState.currentTurn.actions.filter((a) => a.type === 'place_worker')
      .length < 2
  ) {
    return 'place_worker' as const
  }

  return null
}

export const canExecuteAction = (
  gameState: GameState,
  action: Action,
  nextActionType: Action['type'] | null,
) => {
  if (gameState.currentTurn.playerId !== action.playerId) return false

  switch (action.type) {
    case 'place_worker': {
      return (
        nextActionType === 'place_worker' &&
        gameState.workers.every(
          (worker) =>
            !(
              worker.position.x === action.tile.x &&
              worker.position.y === action.tile.y
            ),
        )
      )
    }
    case 'select_worker': {
      return (
        nextActionType === 'select_worker' &&
        gameState.workers.some(
          (worker) =>
            worker.playerId === action.playerId &&
            worker.position.x === action.tile.x &&
            worker.position.y === action.tile.y,
        )
      )
    }
    case 'move_worker': {
      if (nextActionType !== 'move_worker') return false
      const workerPosition = gameState.currentTurn.actions.find(
        (a) => a.type === 'select_worker',
      )?.tile!
      const withinX = action.tile.x >= 0 && action.tile.x <= 4
      const withinY = action.tile.y >= 0 && action.tile.y <= 4
      const withinBounds = withinX && withinY
      const closeToWorker =
        Math.abs(action.tile.x - workerPosition.x) <= 1 &&
        Math.abs(action.tile.y - workerPosition.y) <= 1
      const notSamePosition = !(
        workerPosition.x === action.tile.x && workerPosition.y === action.tile.y
      )
      const workerHeight =
        gameState.board[workerPosition.y][workerPosition.x].height
      const targetHeight = gameState.board[action.tile.y][action.tile.x].height
      const notTooHigh = targetHeight - workerHeight <= 1
      const notAboveOtherWorker = gameState.workers.every(
        (worker) =>
          !(
            worker.position.x === action.tile.x &&
            worker.position.y === action.tile.y
          ),
      )
      return (
        withinBounds &&
        closeToWorker &&
        notSamePosition &&
        notTooHigh &&
        notAboveOtherWorker
      )
    }
    case 'build_from_worker': {
      if (nextActionType !== 'build_from_worker') return false
      const workerPosition = gameState.currentTurn.actions.find(
        (a) => a.type === 'move_worker',
      )?.tile!
      console.log('build_from_worker', workerPosition)
      const withinX = action.tile.x >= 0 && action.tile.x <= 4
      const withinY = action.tile.y >= 0 && action.tile.y <= 4
      const withinBounds = withinX && withinY
      const closeToWorker =
        Math.abs(action.tile.x - workerPosition.x) <= 1 &&
        Math.abs(action.tile.y - workerPosition.y) <= 1
      const notSamePosition = !(
        workerPosition.x === action.tile.x && workerPosition.y === action.tile.y
      )
      const targetHeight = gameState.board[action.tile.y][action.tile.x].height
      const notFullyBuilt = targetHeight < 4
      const notAboveOtherWorker = gameState.workers.every(
        (worker) =>
          !(
            worker.position.x === action.tile.x &&
            worker.position.y === action.tile.y
          ),
      )
      return (
        withinBounds &&
        closeToWorker &&
        notSamePosition &&
        notFullyBuilt &&
        notAboveOtherWorker
      )
    }
    case 'commit_actions': {
      return nextActionType === 'commit_actions'
    }
  }
}

const applyActionToGameState = (gameState: GameState, action: Action) => {
  switch (action.type) {
    case 'place_worker':
      gameState.workers = [
        ...gameState.workers,
        {
          playerId: action.playerId,
          position: action.tile,
        },
      ] as GameState['workers']
      break
    case 'select_worker':
      break
    case 'move_worker':
      const selectWorkerAction = gameState.currentTurn.actions.find(
        (action) => action.type === 'select_worker',
      )!
      const workerIndex = gameState.workers.findIndex(
        (worker) =>
          worker.playerId === selectWorkerAction.playerId &&
          worker.position.x === selectWorkerAction.tile.x &&
          worker.position.y === selectWorkerAction.tile.y,
      )
      console.log(
        'move_worker',
        selectWorkerAction,
        workerIndex,
        gameState.workers,
      )
      gameState.workers[workerIndex].position = action.tile
      break
    case 'build_from_worker':
      gameState.board[action.tile.y][action.tile.x].height += 1
      break
    default:
      break
  }
  return gameState
}

export const applyActionsToGameState = (gameState: GameState) => {
  let updatedGameState = gameState
  gameState.currentTurn.actions.forEach((action) => {
    updatedGameState = applyActionToGameState(gameState, action)
  })

  return updatedGameState
}

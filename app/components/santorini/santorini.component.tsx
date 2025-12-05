import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Scanline, EffectComposer } from '@react-three/postprocessing'
import { useState } from 'react'
import { BoxGeometry, Color } from 'three'
import { canExecuteAction } from '~/lib/santorini'
import type { Action, GameState, Worker } from '~/lib/santorini'

interface SantoriniProps {
  gameState: GameState
  nextActionType: Action['type'] | null
  playerId: number
  onTileClick: (rowIndex: number, colIndex: number) => void
  onWorkerClick: (worker: Worker) => void
  canPerformActions: boolean
}

const TILE_SIZE = 3
const BUILDING_SIZE = 2.5
const BUILDING_HEIGHT = 2

const boxGeometry = new BoxGeometry(TILE_SIZE, 0, TILE_SIZE, 1, 2, 1)

const GridTile = ({
  x,
  y,
  worker,
  playerId,
  height,
  tileHovered,
  onTileClick,
  onTileHover,
  onWorkerClick,
  selectedWorker,
  canPlaceWorker,
  canSelectWorker,
  canMoveWorker,
  canBuildFromWorker,
  canPerformActions,
}: {
  x: number
  y: number
  worker: Worker | undefined
  playerId: number
  height: number
  tileHovered: boolean
  canPlaceWorker: boolean
  canSelectWorker: boolean
  canMoveWorker: boolean
  canBuildFromWorker: boolean
  canPerformActions: boolean
  onTileClick: (rowIndex: number, colIndex: number) => void
  onTileHover: (position: { x: number; y: number } | null) => void
  onWorkerClick: (worker: Worker) => void
  selectedWorker: boolean
}) => {
  const currentPlayer = playerId === worker?.playerId
  const color = currentPlayer ? 0xff0000 : 0x0000ff
  const canClickTile = canPlaceWorker || canMoveWorker || canBuildFromWorker
  return (
    <group
      position={[
        x * TILE_SIZE - TILE_SIZE * 2,
        0.03,
        y * TILE_SIZE - TILE_SIZE * 2,
      ]}
    >
      <lineSegments>
        <edgesGeometry args={[boxGeometry]} />
        <lineBasicMaterial color="white" />
      </lineSegments>
      <Tile
        x={x}
        y={y}
        tileHovered={tileHovered}
        onTileHover={onTileHover}
        canHover={canPerformActions && canClickTile}
        onClick={() => canPerformActions && canClickTile && onTileClick(y, x)}
        height={height}
      />
      <Building height={height} />
      {worker && (
        <Worker
          selectedWorker={selectedWorker}
          onWorkerClick={() => onWorkerClick(worker)}
          canPerformActions={canPerformActions}
          canSelectWorker={canSelectWorker}
          color={color}
          height={height}
        />
      )}
    </group>
  )
}

const Tile = ({
  x,
  y,
  height,
  onClick,
  canHover,
  tileHovered,
  onTileHover,
}: {
  x: number
  y: number
  canHover: boolean
  onClick: () => void
  height: number
  tileHovered: boolean
  onTileHover: (position: { x: number; y: number } | null) => void
}) => {
  const groundLevel = height === 0
  const meshSize = groundLevel ? TILE_SIZE : BUILDING_SIZE + 0.1
  return (
    <mesh
      position={[0, height * BUILDING_HEIGHT + 0.01, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={onClick}
      onPointerEnter={() => canHover && onTileHover({ x, y })}
      onPointerLeave={() => canHover && onTileHover(null)}
    >
      <planeGeometry args={[meshSize, meshSize]} />
      <meshStandardMaterial
        color={tileHovered ? 0xffff00 : 0xffffff}
        transparent
        opacity={canHover ? 0.5 : 0}
      />
    </mesh>
  )
}

const Worker = ({
  canPerformActions,
  canSelectWorker,
  color,
  height,
  onWorkerClick,
  selectedWorker,
}: {
  canPerformActions: boolean
  canSelectWorker: boolean
  color: number
  height: number
  onWorkerClick: () => void
  selectedWorker: boolean
}) => {
  const [hover, setHover] = useState(false)

  return (
    <group
      position={[0, 0.75 + height * BUILDING_HEIGHT + 0.02, 0]}
      rotation={[0, Math.PI / 4, 0]}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onClick={() => canPerformActions && canSelectWorker && onWorkerClick()}
    >
      <mesh>
        <coneGeometry args={[0.5, 1.5, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {((canPerformActions && canSelectWorker) || selectedWorker) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]}>
          <circleGeometry args={[0.6, 24]} />
          <meshStandardMaterial
            color={hover || selectedWorker ? 0xff69b4 : 0xffff00}
            emissive={hover || selectedWorker ? 0xff69b4 : 0xffff00}
            emissiveIntensity={1}
          />
        </mesh>
      )}
    </group>
  )
}

const Building = ({ height }: { height: number }) => {
  if (height === 0) return null

  const phiStart = 0
  const phiLength = Math.PI * 2
  const thetaStart = 0
  const thetaLength = Math.PI / 2

  const buildingHeight = Math.min(height, 3)
  return (
    <>
      <mesh position={[0, (buildingHeight * BUILDING_HEIGHT) / 2, 0]}>
        <boxGeometry
          args={[
            BUILDING_SIZE,
            buildingHeight * BUILDING_HEIGHT,
            BUILDING_SIZE,
          ]}
        />
        <meshStandardMaterial
          color={0xffffff}
          emissive={0xffffff}
          emissiveIntensity={0.5}
        />
      </mesh>
      {height === 4 && (
        <mesh position={[0, buildingHeight * BUILDING_HEIGHT, 0]}>
          <sphereGeometry
            args={[1.1, 24, 24, phiStart, phiLength, thetaStart, thetaLength]}
          />
          <meshStandardMaterial color={0x0000ff} />
        </mesh>
      )}
    </>
  )
}

const Plane = () => {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color={0xffffff} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[14.75, 14.75]} />
        <meshStandardMaterial color={0x50ff50} />
      </mesh>
    </>
  )
}

const Base = () => {
  let radiusTop = 12
  let radiusBottom = 17
  let height = 3
  let radialSegments = 10

  return (
    <mesh position={[0, -1.5, 0]}>
      <cylinderGeometry
        args={[radiusTop, radiusBottom, height, radialSegments]}
      />
      <meshStandardMaterial color={0x9a6d38} />
    </mesh>
  )
}

const Santorini = ({
  gameState,
  nextActionType,
  playerId,
  canPerformActions,
  onTileClick,
  onWorkerClick,
}: SantoriniProps): React.ReactElement => {
  const [hoveredTile, setHoveredTile] = useState<{
    x: number
    y: number
  } | null>(null)

  const selectedWorkerTile = gameState.currentTurn.actions.find(
    (action) => action.type === 'select_worker',
  )?.tile

  return (
    <>
      {gameState.board.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
          const worker = gameState.workers.find(
            (worker) =>
              worker.position.x === colIndex && worker.position.y === rowIndex,
          )

          const selectedWorker =
            worker?.position.x === selectedWorkerTile?.x &&
            worker?.position.y === selectedWorkerTile?.y

          const tileHovered =
            hoveredTile?.x === colIndex && hoveredTile?.y === rowIndex

          const canPlaceWorker = canExecuteAction(
            gameState,
            {
              type: 'place_worker',
              tile: { x: colIndex, y: rowIndex },
              playerId,
            },
            nextActionType,
          )

          const canSelectWorker = canExecuteAction(
            gameState,
            {
              type: 'select_worker',
              tile: { x: colIndex, y: rowIndex },
              playerId,
            },
            nextActionType,
          )

          const canMoveWorker = canExecuteAction(
            gameState,
            {
              type: 'move_worker',
              tile: { x: colIndex, y: rowIndex },
              playerId,
            },
            nextActionType,
          )

          const canBuildFromWorker = canExecuteAction(
            gameState,
            {
              type: 'build_from_worker',
              tile: { x: colIndex, y: rowIndex },
              playerId,
            },
            nextActionType,
          )

          return (
            <GridTile
              key={`${rowIndex}-${colIndex}`}
              x={colIndex}
              y={rowIndex}
              tileHovered={tileHovered}
              onTileHover={setHoveredTile}
              canPlaceWorker={canPlaceWorker}
              canSelectWorker={canSelectWorker}
              canMoveWorker={canMoveWorker}
              canBuildFromWorker={canBuildFromWorker}
              selectedWorker={selectedWorker}
              worker={worker}
              playerId={playerId}
              height={tile.height}
              canPerformActions={canPerformActions}
              onTileClick={onTileClick}
              onWorkerClick={onWorkerClick}
            />
          )
        }),
      )}
      <Plane />
      <Base />
      <EffectComposer>
        <Scanline density={2} />
      </EffectComposer>
      <hemisphereLight intensity={2} groundColor={0x9a6d38} color={0xffffff} />
      <OrbitControls />
    </>
  )
}

const color = new Color(0x7fc8f8)

const SantoriniCanvas = (props: SantoriniProps) => {
  return (
    <Canvas
      id="santorini-canvas"
      camera={{ position: [0, 30, 0], zoom: 1 }}
      scene={{ background: color }}
    >
      <Santorini {...props} />
    </Canvas>
  )
}

export default SantoriniCanvas

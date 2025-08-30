import Flamingo from './flamingo.component'
import Pegasus from './pegasus.component'

const Tile = () => (
  <svg
    width="100px"
    id="tile"
    data-name="tile"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 142.95 67.67"
  >
    <path
      fill="var(--color-tile-step)"
      d="M.01,27.64v13.34l34.9,26.7h72.78s35.26-27.65,35.26-27.65v-12.39H.01s0-.01,0,0Z"
    />
    <polygon
      fill="var(--color-tile-surface)"
      points="58.28 0 58.28 0 34.74 0 .01 27.64 35.27 55.27 107.69 55.27 142.95 27.64 107.67 0 88.59 0 88.6 0 58.28 0"
    />
  </svg>
)

interface ButtonTileProps {
  id: string
  top: number
  left: number
  selectedId: string
  onClick: React.MouseEventHandler<HTMLButtonElement>
  children: (show: boolean) => React.ReactNode
  'data-theme'?: string
}

export const ButtonTile = ({
  id,
  top,
  left,
  selectedId,
  onClick,
  children,
  'data-theme': dataTheme,
}: ButtonTileProps) => {
  return (
    <div
      style={{ top, left }}
      className="absolute"
      {...(dataTheme && { 'data-theme': dataTheme })}
    >
      <div className="pointer-events-none absolute z-[1]">
        {children(selectedId === id)}
      </div>
      <button
        id={id}
        onClick={onClick}
        type="button"
        className="active:pressed absolute top-35 left-1 cursor-pointer"
      >
        <Tile />
      </button>
    </div>
  )
}

export const FlamingoTile = (
  props: Omit<ButtonTileProps, 'children' | 'data-theme'>,
) => <ButtonTile {...props}>{(show) => <Flamingo show={show} />}</ButtonTile>

export const PegasusTile = (
  props: Omit<ButtonTileProps, 'children' | 'data-theme'>,
) => (
  <ButtonTile {...props} data-theme="pegasus">
    {(show) => (
      <div className="relative -top-1 -left-21">
        <Pegasus show={show} />
      </div>
    )}
  </ButtonTile>
)

export default Tile

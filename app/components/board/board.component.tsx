import { useLayoutEffect, useState } from 'react'
import {
  isUiTheme,
  persistUiTheme,
  themeFromTileId,
  tileIdFromTheme,
} from '~/lib/theme-preference'
import { FlamingoTile, GoldenMascotTile, PegasusTile } from './tile.component'

const VERTICAL_STEP = 60
const HORIZONTAL_STEP = 120

export type BoardProps = {
  /** Vem do cookie no SSR para o mascote certo no primeiro HTML. */
  initialSelectedTileId?: '1' | '2' | '3'
}

const Board = ({
  initialSelectedTileId = '1',
}: BoardProps) => {
  const [selectedId, setSelectedId] = useState<'1' | '2' | '3'>(
    initialSelectedTileId,
  )

  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (isUiTheme(stored)) {
        const id = tileIdFromTheme(stored)
        setSelectedId(id)
        persistUiTheme(stored)
        return
      }
      persistUiTheme(themeFromTileId(initialSelectedTileId))
    } catch {
      /* ignore */
    }
  }, [initialSelectedTileId])

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const id = event.currentTarget.id as '1' | '2' | '3'
    setSelectedId(id)
    persistUiTheme(themeFromTileId(id))
  }

  return (
    <div className="relative left-[50%] h-[250px] w-[345px] translate-x-[-50%]">
      <FlamingoTile
        id="1"
        selectedId={selectedId}
        onClick={handleClick}
        top={0}
        left={0}
      />
      <PegasusTile
        id="2"
        selectedId={selectedId}
        onClick={handleClick}
        top={1 * VERTICAL_STEP}
        left={1 * HORIZONTAL_STEP}
      />
      <GoldenMascotTile
        id="3"
        selectedId={selectedId}
        onClick={handleClick}
        top={0 * VERTICAL_STEP}
        left={2 * HORIZONTAL_STEP}
      />
    </div>
  )
}

export default Board

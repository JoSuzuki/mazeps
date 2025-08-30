import { useState } from 'react'
import { FlamingoTile, PegasusTile } from './tile.component'

const VERTICAL_STEP = 60
const HORIZONTAL_STEP = 120

const Board = () => {
  const [selectedId, setSelectedId] = useState('1')
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setSelectedId(event.currentTarget.id)
    let dataTheme = event.currentTarget.id === '2' ? 'pegasus' : 'flamingo'
    document.documentElement.setAttribute('data-theme', dataTheme)
    localStorage.setItem('theme', dataTheme)
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
      <FlamingoTile
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

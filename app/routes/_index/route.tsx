import type { Route } from './+types/route'
import Board from '~/components/board/board.component'
import Title from '~/components/title/title.component'

export default function Route({}: Route.ComponentProps) {
  return (
    <>
      <div className="mb-2 flex justify-center">
        <Title />
      </div>
      <Board />
    </>
  )
}

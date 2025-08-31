import type { Route } from './+types/route'
import Title from './title.component'
import Board from '~/components/board/board.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import { Role } from '~/generated/prisma/enums'

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: 'Mazeps' },
    { name: 'description', content: 'Bem vindo ao Mazeps!' },
  ]
}

export const loader = async ({ context }: Route.LoaderArgs) => {
  return { currentUser: context.currentUser }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <nav className="flex items-center justify-end gap-4 p-4">
        <Link to="/tournaments">Torneios</Link>
        {loaderData.currentUser?.role === Role.ADMIN && (
          <Link to="/users">Usuários</Link>
        )}
        {loaderData.currentUser ? (
          <div className="ml-auto">
            Bem vindo,{' '}
            <Link
              to="/profile"
              className="bg-primary text-on-primary rounded-md p-0.5"
            >
              {loaderData.currentUser.nickname}
            </Link>
          </div>
        ) : (
          <LinkButton to="/login">Login</LinkButton>
        )}
      </nav>
      <main>
        <div className="mb-2 flex justify-center">
          <Title />
        </div>
        <Board />
      </main>
    </>
  )
}

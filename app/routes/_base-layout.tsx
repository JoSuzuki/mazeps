import { Outlet } from 'react-router'
import type { Route } from './+types/_base-layout'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import Title from '~/components/title/title.component'
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

export default function Route({ loaderData, matches }: Route.ComponentProps) {
  let isInHome = matches.find((match) => match?.id === 'routes/_index')
  return (
    <>
      <nav className="flex items-center justify-end gap-4 p-4">
        {!isInHome && (
          <Link to="/" className="mx-2" viewTransition>
            <Title size="navbar" />
          </Link>
        )}
        <Link
          to="/tournaments"
          className="[view-transition-name:nav-tournaments]"
          viewTransition
        >
          Torneios
        </Link>
        {loaderData.currentUser?.role === Role.ADMIN && (
          <Link
            to="/users"
            className="[view-transition-name:nav-users]"
            viewTransition
          >
            Usuários
          </Link>
        )}
        {loaderData.currentUser ? (
          <div className="ml-auto">
            Bem vindo,{' '}
            <Link to="/profile" styleType="solid" viewTransition>
              {loaderData.currentUser.nickname}
            </Link>
          </div>
        ) : (
          <LinkButton className="ml-auto" to="/login">
            Login
          </LinkButton>
        )}
      </nav>
      <main className="h-full">
        <Outlet />
      </main>
    </>
  )
}

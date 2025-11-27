import { Outlet } from 'react-router'
import type { Route } from './+types/_base-layout'
import { BackButtonPortalContainer } from '~/components/back-button-portal/back-button-portal.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import MenuNavigation from '~/components/menu-navigation/menu-navigation.component'
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
      <nav
        id="main-nav"
        className="relative flex items-center justify-end gap-4 p-4"
      >
        <BackButtonPortalContainer />
        {!isInHome && (
          <Link to="/" className="mx-2" viewTransition>
            <Title size="navbar" />
          </Link>
        )}
        <Link
          to="/tournaments"
          className="[view-transition-name:nav-tournaments] max-sm:hidden"
          viewTransition
        >
          Torneios
        </Link>
        <Link
          to="/games"
          className="[view-transition-name:nav-games] max-sm:hidden"
          viewTransition
        >
          Jogos
        </Link>
        {loaderData.currentUser?.role === Role.ADMIN && (
          <Link
            to="/users"
            className="[view-transition-name:nav-users] max-sm:hidden"
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
            <LinkButton className="ml-auto" to="/login" viewTransition>
            Login
          </LinkButton>
        )}
        <MenuNavigation className="sm:hidden">
          {(closeMenu) => (
            <>
              <Link
                to="/tournaments"
                className="px-4 py-2"
                onClick={closeMenu}
                viewTransition
              >
                Torneios
              </Link>
              <Link
                to="/games"
                className="px-4 py-2"
                onClick={closeMenu}
                viewTransition
              >
                Jogos
              </Link>
              {loaderData.currentUser?.role === Role.ADMIN && (
                <Link
                  to="/users"
                  className="px-4 py-2"
                  onClick={closeMenu}
                  viewTransition
                >
                  Usuários
                </Link>
              )}
              {loaderData.currentUser ? (
                <Link
                  to="/profile"
                  className="px-4 py-2"
                  onClick={closeMenu}
                  viewTransition
                >
                  Perfil
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2"
                  onClick={closeMenu}
                  viewTransition
                >
                  Login
                </Link>
              )}
            </>
          )}
        </MenuNavigation>
      </nav>
      <main className="h-full">
        <Outlet />
      </main>
    </>
  )
}

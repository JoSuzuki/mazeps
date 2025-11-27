import { redirect } from 'react-router'
import type { Route } from './+types/route'
import { authenticator, mapPrismaToCurrentUser, sessionStorage, type CurrentUser } from '~/services/session'

export async function loader({ request }: Route.LoaderArgs) {
  let session = await sessionStorage.getSession(request.headers.get('cookie'))
  let user = session.get('user')
  if (user) return redirect('/')

  let prismaUser = await authenticator.authenticate('google', request)
  session.set('user', mapPrismaToCurrentUser(prismaUser))
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  })
}

export async function action({ request }: Route.ActionArgs) {
  let session = await sessionStorage.getSession(request.headers.get('cookie'))
  let user = session.get('user')
  if (user) return redirect('/')

  await authenticator.authenticate('google', request)
}

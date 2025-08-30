import { redirect } from 'react-router'
import type { Route } from './+types/route'
import { sessionStorage } from '~/services/session'

export async function action({ request }: Route.ActionArgs) {
  let session = await sessionStorage.getSession(request.headers.get('cookie'))

  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  })
}

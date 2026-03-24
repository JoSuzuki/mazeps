import { redirect } from 'react-router'
import type { Route } from './+types/route'
import { ProfilePage } from '~/components/profile-page/profile-page.component'
import { loadProfilePageData } from '~/lib/profile-page-data'

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  const data = await loadProfilePageData(
    context.prisma,
    context.currentUser.id,
  )
  if (!data) return redirect('/login')

  return data
}

export default function Route({ loaderData }: Route.ComponentProps) {
  return <ProfilePage loaderData={loaderData} />
}

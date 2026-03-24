import { redirect } from 'react-router'
import type { Route } from './+types/route'
import { ProfilePage } from '~/components/profile-page/profile-page.component'
import { Role } from '~/generated/prisma/enums'
import { loadProfilePageData } from '~/lib/profile-page-data'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  const userId = Number(params.userId)
  if (!Number.isFinite(userId)) return redirect('/users')

  const data = await loadProfilePageData(context.prisma, userId)
  if (!data) return redirect('/users')

  return {
    ...data,
    adminPreview: { backTo: `/users/${userId}/edit` },
  }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  return <ProfilePage loaderData={loaderData} />
}

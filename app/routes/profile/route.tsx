import { data, redirect } from 'react-router'
import type { Route } from './+types/route'
import { ProfilePage } from '~/components/profile-page/profile-page.component'
import { loadProfilePageData } from '~/lib/profile-page-data'

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  const profileData = await loadProfilePageData(
    context.prisma,
    context.currentUser.id,
  )
  if (!profileData) return redirect('/login')

  return profileData
}

export async function action({ request, context }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')

  const formData = await request.formData()
  if (formData.get('_action') !== 'updateNewsEmails') {
    return data({ error: 'Ação inválida' }, { status: 400 })
  }

  const newsletterSubscribed = formData.get('newsletterSubscribed') === 'on'

  // Só o utilizador da sessão altera o próprio registo (não há userId no form).
  await context.prisma.user.update({
    where: { id: context.currentUser.id },
    data: { newsletterSubscribed },
  })

  return { ok: true as const }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  return <ProfilePage loaderData={loaderData} />
}

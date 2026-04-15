import { redirect } from 'react-router'
import type { Route } from './+types/route'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) {
    throw new Response('Forbidden', { status: 403 })
  }

  const users = await context.prisma.user.findMany({
    where: { newsletterSubscribed: true },
    select: { email: true },
    orderBy: { email: 'asc' },
  })

  const body = users.map((u) => u.email).join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="emails-newsletter.txt"',
    },
  })
}

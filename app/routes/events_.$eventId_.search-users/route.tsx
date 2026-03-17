import { data, redirect } from 'react-router'
import type { Route } from './+types/route'
import { EventStatus } from '~/lib/event-status'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context, params, request }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  const eventId = Number(params.eventId)
  const event = await context.prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    select: { status: true },
  })

  const canAdd =
    context.currentUser.role === Role.ADMIN ||
    (context.currentUser.role === Role.STAFF &&
      event.status === EventStatus.ABERTO)

  if (!canAdd) {
    return data({ users: [] })
  }

  const url = new URL(request.url)
  const q = (url.searchParams.get('q') ?? '').trim()

  if (q.length < 2) {
    return data({ users: [] })
  }

  const participants = await context.prisma.eventParticipant.findMany({
    where: { eventId },
    select: { userId: true },
  })
  const participantUserIds = participants.map((p) => p.userId)

  const users = await context.prisma.user.findMany({
    where: {
      id: { notIn: participantUserIds },
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { nickname: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, name: true, nickname: true, email: true },
    orderBy: { nickname: 'asc' },
    take: 10,
  })

  return data({ users })
}

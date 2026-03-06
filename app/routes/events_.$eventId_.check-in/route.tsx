import { data, redirect } from 'react-router'
import type { Route } from './+types/route'

export async function action({ params, context }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')

  const eventId = Number(params.eventId)

  const event = await context.prisma.event.findUniqueOrThrow({
    where: { id: eventId },
  })

  // Tournament participation is handled by the tournament enrollment flow
  if (event.type === 'TOURNAMENT') {
    return redirect(`/events/${eventId}`)
  }

  await context.prisma.eventParticipant.upsert({
    where: {
      eventId_userId: {
        eventId,
        userId: context.currentUser.id,
      },
    },
    update: {},
    create: {
      eventId,
      userId: context.currentUser.id,
    },
  })

  return data({ success: true })
}

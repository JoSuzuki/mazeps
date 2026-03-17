import { data, redirect } from 'react-router'
import type { Route } from './+types/route'
import { sessionStorage } from '~/services/session'
import { EventStatus } from '~/lib/event-status'

export async function action({ params, context, request }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')

  const eventId = Number(params.eventId)
  const userId = Number(context.currentUser.id)

  if (!Number.isInteger(userId) || userId <= 0) {
    const session = await sessionStorage.getSession(request.headers.get('cookie'))
    return redirect('/login', {
      headers: {
        'Set-Cookie': await sessionStorage.destroySession(session),
      },
    })
  }

  // Verifica se o usuário existe no banco (sessão pode estar desatualizada)
  const userExists = await context.prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })
  if (!userExists) {
    const session = await sessionStorage.getSession(request.headers.get('cookie'))
    return redirect('/login', {
      headers: {
        'Set-Cookie': await sessionStorage.destroySession(session),
      },
    })
  }

  const event = await context.prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    select: {
      type: true,
      status: true,
      tournament: { select: { id: true } },
    },
  })

  if (event.status !== EventStatus.ABERTO) {
    return data({ error: 'Este evento está encerrado.' }, { status: 403 })
  }

  await context.prisma.eventParticipant.upsert({
    where: { eventId_userId: { eventId, userId } },
    update: {},
    create: { eventId, userId },
  })

  if (event.type === 'TOURNAMENT' && event.tournament) {
    await context.prisma.tournamentPlayer.upsert({
      where: { tournamentId_userId: { tournamentId: event.tournament.id, userId } },
      update: {},
      create: { tournamentId: event.tournament.id, userId },
    })
  }

  return data({ success: true })
}

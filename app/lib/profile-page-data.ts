import type { PrismaClient } from '~/generated/prisma/client'
import { getAvatarUrl } from '~/lib/avatar'
import { EventType } from '~/generated/prisma/enums'

export async function loadProfilePageData(
  prisma: PrismaClient,
  userId: number,
) {
  const [user, eventParticipants] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        nickname: true,
        email: true,
        role: true,
        instagram: true,
        avatarUrl: true,
        ludopediaUrl: true,
        birthday: true,
        favoriteGame: true,
        favoriteEvent: true,
        isSupporter: true,
        newsletterSubscribed: true,
      },
    }),
    prisma.eventParticipant.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            badgeFile: true,
            type: true,
          },
        },
      },
      orderBy: { checkedInAt: 'desc' },
    }),
  ])

  if (!user) return null

  const championTrophies = eventParticipants
    .filter(
      (ep) => ep.isChampion && ep.event.type === EventType.GENERAL,
    )
    .map((ep) => ({
      key: ep.id,
      event: {
        id: ep.event.id,
        name: ep.event.name,
        date: ep.event.date,
      },
    }))

  const tournamentTrophies = eventParticipants
    .filter(
      (ep) =>
        ep.event.type === EventType.TOURNAMENT &&
        ep.tournamentPlace != null &&
        ep.tournamentPlace >= 1 &&
        ep.tournamentPlace <= 3,
    )
    .map((ep) => ({
      key: `podium-${ep.id}`,
      place: ep.tournamentPlace as 1 | 2 | 3,
      event: {
        id: ep.event.id,
        name: ep.event.name,
        date: ep.event.date,
      },
    }))
    .sort((a, b) => {
      if (a.place !== b.place) return a.place - b.place
      const da = a.event.date ? new Date(a.event.date).getTime() : 0
      const db = b.event.date ? new Date(b.event.date).getTime() : 0
      return db - da
    })

  return {
    currentUser: {
      ...user,
      avatarUrl: getAvatarUrl(user.avatarUrl, user.email, 96),
    },
    eventParticipants,
    championTrophies,
    tournamentTrophies,
  }
}

export type ProfilePageData = NonNullable<
  Awaited<ReturnType<typeof loadProfilePageData>>
>

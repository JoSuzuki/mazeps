import { useEffect, useRef, useState } from 'react'
import { data, useFetcher, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import { formatEventDateLong } from '~/lib/date'
import { EventStatus } from '~/lib/event-status'
import { EventType, Role } from '~/generated/prisma/enums'
import { getAvatarUrl } from '~/lib/avatar'
import SupporterNameDisplay from '~/components/supporter-name-display/supporter-name-display.component'

export async function loader({ context, params }: Route.LoaderArgs) {
  const eventId = Number(params.eventId)
  const canSeeSecretEvents =
    context.currentUser?.role === Role.ADMIN ||
    context.currentUser?.role === Role.STAFF
  const isAdmin = context.currentUser?.role === Role.ADMIN

  const event = await context.prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    include: {
      tournament: { select: { id: true } },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              nickname: true,
              email: true,
              avatarUrl: true,
              isSupporter: true,
            },
          },
        },
      },
    },
  })

  // SECRETO: só ADMIN e STAFF podem ver
  if (event.status === EventStatus.SECRETO && !canSeeSecretEvents) {
    return redirect('/events')
  }

  // Non-admin users are redirected to the tournament page for tournament events
  if (
    event.type === EventType.TOURNAMENT &&
    event.tournament &&
    context.currentUser?.role !== Role.ADMIN
  ) {
    return redirect(`/tournaments/${event.tournament.id}`)
  }

  const currentParticipant = context.currentUser
    ? event.participants.find((p) => p.userId === context.currentUser!.id)
    : null

  // ADMIN pode adicionar em qualquer evento; STAFF só em eventos abertos
  const canAddParticipants =
    isAdmin ||
    (context.currentUser?.role === Role.STAFF &&
      event.status === EventStatus.ABERTO)

  const withAvatars = event.participants.map((p) => ({
    ...p,
    user: {
      ...p.user,
      avatarUrl: getAvatarUrl(p.user.avatarUrl, p.user.email, 40),
    },
  }))
  if (event.type === EventType.TOURNAMENT) {
    withAvatars.sort((a, b) => {
      const ap = a.tournamentPlace ?? 999
      const bp = b.tournamentPlace ?? 999
      if (ap !== bp) return ap - bp
      return a.user.name.localeCompare(b.user.name, 'pt-BR')
    })
  } else {
    withAvatars.sort((a, b) => Number(b.isChampion) - Number(a.isChampion))
  }

  const eventWithAvatars = {
    ...event,
    participants: withAvatars,
  }

  return {
    event: eventWithAvatars,
    currentParticipant,
    currentUser: context.currentUser,
    isAdmin,
    canAddParticipants,
  }
}

export async function action({ request, context, params }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent') as string

  if (intent === 'add-participant') {
    const eventId = Number(params.eventId)
    const event = await context.prisma.event.findUniqueOrThrow({
      where: { id: eventId },
      select: { type: true, status: true, tournament: { select: { id: true } } },
    })

    const canAdd =
      context.currentUser?.role === Role.ADMIN ||
      (context.currentUser?.role === Role.STAFF &&
        event.status === EventStatus.ABERTO)
    if (!canAdd) {
      return data({ error: 'Não autorizado' })
    }

    const userId = Number(formData.get('userId'))

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

  if (intent === 'remove-participant') {
    const participantId = Number(formData.get('participantId'))
    const eventId = Number(params.eventId)

    const participant = await context.prisma.eventParticipant.findUniqueOrThrow({
      where: { id: participantId },
      select: {
        userId: true,
        event: {
          select: {
            type: true,
            status: true,
            tournament: { select: { id: true } },
          },
        },
      },
    })

    const canRemove =
      context.currentUser?.role === Role.ADMIN ||
      (context.currentUser?.role === Role.STAFF &&
        participant.event.status === EventStatus.ABERTO)
    if (!canRemove) {
      return data({ error: 'Não autorizado' })
    }

    await context.prisma.eventParticipant.delete({ where: { id: participantId } })

    if (
      participant.event.type === 'TOURNAMENT' &&
      participant.event.tournament
    ) {
      await context.prisma.tournamentPlayer.deleteMany({
        where: {
          tournamentId: participant.event.tournament.id,
          userId: participant.userId,
        },
      })
    }

    return data({ success: true })
  }

  if (intent === 'toggle-champion') {
    if (context.currentUser?.role !== Role.ADMIN) {
      return data({ error: 'Não autorizado' })
    }
    const eventId = Number(params.eventId)
    const participantId = Number(formData.get('participantId'))

    const event = await context.prisma.event.findUniqueOrThrow({
      where: { id: eventId },
      select: { type: true },
    })
    if (event.type !== EventType.GENERAL) {
      return data({ error: 'Só em eventos do tipo Evento' })
    }

    const p = await context.prisma.eventParticipant.findUniqueOrThrow({
      where: { id: participantId },
      select: { eventId: true, isChampion: true },
    })
    if (p.eventId !== eventId) {
      return data({ error: 'Inválido' })
    }

    await context.prisma.eventParticipant.update({
      where: { id: participantId },
      data: { isChampion: !p.isChampion },
    })

    return data({ success: true })
  }

  if (intent === 'set-tournament-place') {
    if (context.currentUser?.role !== Role.ADMIN) {
      return data({ error: 'Não autorizado' })
    }
    const eventId = Number(params.eventId)
    const participantId = Number(formData.get('participantId'))
    const rawPlace = (formData.get('place') as string) || ''

    const event = await context.prisma.event.findUniqueOrThrow({
      where: { id: eventId },
      select: { type: true },
    })
    if (event.type !== EventType.TOURNAMENT) {
      return data({ error: 'Só em eventos do tipo Torneio' })
    }

    const p = await context.prisma.eventParticipant.findUniqueOrThrow({
      where: { id: participantId },
      select: { eventId: true },
    })
    if (p.eventId !== eventId) {
      return data({ error: 'Inválido' })
    }

    if (rawPlace === '') {
      await context.prisma.eventParticipant.update({
        where: { id: participantId },
        data: { tournamentPlace: null },
      })
      return data({ success: true })
    }

    const place = Number(rawPlace)
    if (![1, 2, 3].includes(place)) {
      return data({ error: 'Colocação inválida' })
    }

    await context.prisma.$transaction([
      context.prisma.eventParticipant.updateMany({
        where: { eventId, tournamentPlace: place },
        data: { tournamentPlace: null },
      }),
      context.prisma.eventParticipant.update({
        where: { id: participantId },
        data: { tournamentPlace: place },
      }),
    ])

    return data({ success: true })
  }

  return data({ error: 'Ação inválida' })
}

const STATUS_STYLES = {
  [EventStatus.SECRETO]: 'bg-amber-100 text-amber-800 border-amber-200',
  [EventStatus.ABERTO]: 'bg-green-100 text-green-800 border-green-200',
  [EventStatus.ENCERRADO]: 'bg-red-100 text-red-800 border-red-200',
} as const

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

const PODIUM_LABELS: Record<number, string> = {
  1: '1º Lugar',
  2: '2º Lugar',
  3: '3º Lugar',
}

function ParticipantRow({
  participant,
  canAddParticipants,
  canToggleChampion,
  canSetTournamentPlace,
  fetcher,
  championFetcher,
  placeFetcher,
}: {
  participant: {
    id: number
    isChampion: boolean
    tournamentPlace: number | null
    user: { name: string; avatarUrl?: string | null; isSupporter: boolean }
    userId: number
  }
  canAddParticipants: boolean
  canToggleChampion: boolean
  canSetTournamentPlace: boolean
  fetcher: ReturnType<typeof useFetcher>
  championFetcher: ReturnType<typeof useFetcher>
  placeFetcher: ReturnType<typeof useFetcher>
}) {
  const [avatarError, setAvatarError] = useState(false)
  const avatarUrl = participant.user.avatarUrl
  const showImg = avatarUrl && !avatarError
  const isChampion = participant.isChampion
  const place = participant.tournamentPlace
  const isPodium = place === 1 || place === 2 || place === 3

  const podiumRowClass =
    place === 1
      ? 'border-2 border-amber-500/80 bg-gradient-to-br from-amber-400/25 via-yellow-300/15 to-amber-600/20 shadow-[0_0_28px_-4px_rgba(234,179,8,0.5)] ring-1 ring-amber-400/50 dark:from-amber-500/30 dark:via-amber-600/15 dark:border-amber-400/70'
      : place === 2
        ? 'border-2 border-slate-400/70 bg-gradient-to-br from-slate-200/40 via-zinc-100/30 to-slate-300/25 shadow-[0_0_24px_-4px_rgba(148,163,184,0.45)] ring-1 ring-slate-300/50 dark:from-slate-600/25 dark:via-zinc-700/20 dark:border-slate-400/50'
        : place === 3
          ? 'border-2 border-orange-700/50 bg-gradient-to-br from-orange-300/30 via-amber-800/15 to-orange-900/20 shadow-[0_0_24px_-4px_rgba(194,65,12,0.35)] ring-1 ring-orange-600/40 dark:from-orange-900/30 dark:via-amber-950/25 dark:border-orange-600/50'
          : ''

  return (
    <li
      className={`relative flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors ${
        isChampion
          ? 'border-2 border-amber-400/70 bg-gradient-to-br from-amber-500/15 via-yellow-400/10 to-amber-600/10 shadow-[0_0_24px_-4px_rgba(245,158,11,0.45)] ring-1 ring-amber-300/40 dark:border-amber-500/50 dark:from-amber-500/20 dark:via-amber-600/10 dark:shadow-[0_0_28px_-4px_rgba(251,191,36,0.35)] dark:ring-amber-400/30'
          : isPodium
            ? podiumRowClass
            : 'rounded-lg hover:bg-foreground/5'
      }`}
    >
      {isChampion && (
        <span
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-30 motion-reduce:hidden"
          aria-hidden
        >
          <span className="absolute -left-full top-0 h-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent motion-reduce:animate-none [animation:champion-shimmer_2.5s_ease-in-out_infinite]" />
        </span>
      )}
      <div className="relative z-[1] flex min-w-0 flex-1 items-center gap-3">
        {showImg ? (
          <img
            src={avatarUrl}
            alt=""
            width={isChampion || isPodium ? 40 : 32}
            height={isChampion || isPodium ? 40 : 32}
            className={`shrink-0 rounded-full object-cover ring-2 ring-offset-2 ring-offset-background ${
              isChampion
                ? 'h-10 w-10 ring-amber-400 dark:ring-amber-500'
                : isPodium
                  ? place === 1
                    ? 'h-10 w-10 ring-amber-500 dark:ring-amber-400'
                    : place === 2
                      ? 'h-10 w-10 ring-slate-400 dark:ring-slate-300'
                      : 'h-10 w-10 ring-orange-700 dark:ring-orange-500'
                  : 'h-8 w-8'
            }`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div
            className={`flex shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-semibold ${
              isChampion
                ? 'h-10 w-10 ring-2 ring-amber-400 ring-offset-2 ring-offset-background dark:ring-amber-500'
                : isPodium
                  ? place === 1
                    ? 'h-10 w-10 ring-2 ring-amber-500 ring-offset-2 ring-offset-background dark:ring-amber-400'
                    : place === 2
                      ? 'h-10 w-10 ring-2 ring-slate-400 ring-offset-2 ring-offset-background dark:ring-slate-300'
                      : 'h-10 w-10 ring-2 ring-orange-700 ring-offset-2 ring-offset-background dark:ring-orange-500'
                  : 'h-8 w-8'
            }`}
          >
            {getInitials(participant.user.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SupporterNameDisplay
              name={participant.user.name}
              isSupporter={participant.user.isSupporter}
              nameClassName={`line-clamp-2 font-medium ${
                isChampion
                  ? 'font-brand text-lg tracking-wide text-amber-950 dark:text-amber-100'
                  : isPodium
                    ? 'font-brand text-lg tracking-wide text-zinc-950 dark:text-zinc-50'
                    : ''
              }`}
            />
            {isChampion && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/50 bg-amber-500/25 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-950 shadow-sm dark:border-amber-400/40 dark:bg-amber-500/30 dark:text-amber-50">
                <TrophyIcon className="h-3.5 w-3.5" />
                Campeão
              </span>
            )}
            {place != null && place >= 1 && place <= 3 && (
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider shadow-sm ${
                  place === 1
                    ? 'border-amber-600/50 bg-amber-500/35 text-amber-950 dark:border-amber-400/50 dark:bg-amber-500/40 dark:text-amber-50'
                    : place === 2
                      ? 'border-slate-500/50 bg-slate-300/50 text-slate-900 dark:border-slate-400/50 dark:bg-slate-600/40 dark:text-slate-100'
                      : 'border-orange-800/40 bg-orange-700/30 text-orange-950 dark:border-orange-600/50 dark:bg-orange-900/50 dark:text-orange-100'
                }`}
              >
                <TrophyIcon className="h-3.5 w-3.5" />
                {PODIUM_LABELS[place]}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="relative z-[1] flex shrink-0 flex-wrap items-center gap-2">
        {canSetTournamentPlace && (
          <placeFetcher.Form method="post" className="flex flex-col">
            <input type="hidden" name="intent" value="set-tournament-place" />
            <input type="hidden" name="participantId" value={participant.id} />
            <label className="sr-only" htmlFor={`podium-place-${participant.id}`}>
              Colocação no pódio
            </label>
            <select
              id={`podium-place-${participant.id}`}
              name="place"
              defaultValue={place ?? ''}
              onChange={(e) => {
                e.currentTarget.form?.requestSubmit()
              }}
              className="max-w-[11rem] rounded-lg border border-foreground/20 bg-background px-2 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Sem colocação</option>
              <option value="1">1º lugar</option>
              <option value="2">2º lugar</option>
              <option value="3">3º lugar</option>
            </select>
          </placeFetcher.Form>
        )}
        {canToggleChampion && (
          <championFetcher.Form method="post">
            <input type="hidden" name="intent" value="toggle-champion" />
            <input type="hidden" name="participantId" value={participant.id} />
            <button
              type="submit"
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                isChampion
                  ? 'border-amber-600/40 bg-amber-100/80 text-amber-900 hover:bg-amber-200/80 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-100 dark:hover:bg-amber-900/50'
                  : 'border-foreground/20 bg-foreground/5 text-foreground/80 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-900 dark:hover:text-amber-100'
              }`}
            >
              {isChampion ? 'Remover campeão' : 'Marcar campeão'}
            </button>
          </championFetcher.Form>
        )}
        {canAddParticipants && (
          <fetcher.Form method="post" className="shrink-0">
            <input type="hidden" name="intent" value="remove-participant" />
            <input type="hidden" name="participantId" value={participant.id} />
            <button
              type="submit"
              className="text-sm text-red-600 transition-colors hover:text-red-700 hover:underline"
              onClick={(e) => {
                if (!confirm(`Remover ${participant.user.name}?`)) e.preventDefault()
              }}
            >
              Remover
            </button>
          </fetcher.Form>
        )}
      </div>
    </li>
  )
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  const fetcher = useFetcher()
  const championFetcher = useFetcher()
  const placeFetcher = useFetcher()
  const addParticipantFetcher = useFetcher()
  const {
    event,
    currentParticipant,
    currentUser,
    isAdmin,
    canAddParticipants,
  } = loaderData

  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const searchFetcher = useFetcher()
  const searchResults =
    (searchFetcher.data as
      | {
          users?: Array<{
            id: number
            name: string
            nickname: string
            email: string
            isSupporter: boolean
          }>
        }
      | undefined)?.users ?? []
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchQuery.length < 2) return
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      searchFetcher.load(`/events/${params.eventId}/search-users?q=${encodeURIComponent(searchQuery)}`)
    }, 300)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery, params.eventId])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const data = addParticipantFetcher.data as { success?: boolean } | undefined
    if (data?.success) {
      setSearchQuery('')
      setShowResults(false)
    }
  }, [addParticipantFetcher.data])

  const checkedIn =
    !!currentParticipant ||
    event.participants.some((p) => p.userId === currentUser?.id)

  return (
    <>
      <BackButtonPortal to="/events" />
      <Center>
        <div className="mx-auto max-w-xl px-6 py-10">
          {/* Header: badge + nome + ações */}
          <header className="mb-10 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
            {event.badgeFile && (
              <img
                src={event.badgeFile}
                alt={`Badge de ${event.name}`}
                className="h-32 w-32 shrink-0 rounded-2xl border border-foreground/10 object-contain shadow-md"
              />
            )}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className="font-brand text-3xl tracking-wide">{event.name}</h1>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <span
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                    STATUS_STYLES[event.status] ?? STATUS_STYLES[EventStatus.ABERTO]
                  }`}
                >
                  {event.status === EventStatus.SECRETO
                    ? 'Secreto'
                    : event.status === EventStatus.ABERTO
                      ? 'Aberto'
                      : 'Encerrado'}
                </span>
                {event.type === EventType.TOURNAMENT && (
                  <span className="rounded-full border border-foreground/20 bg-foreground/5 px-4 py-1.5 text-sm font-medium uppercase tracking-wider">
                    Torneio
                  </span>
                )}
              </div>
              {((currentUser?.role === Role.ADMIN) ||
                (currentUser?.role === Role.STAFF && event.status === EventStatus.ABERTO)) && (
                <div className="mt-4">
                  <LinkButton
                    styleType="secondary"
                    to={`/events/${params.eventId}/edit`}
                    viewTransition
                  >
                    Editar evento
                  </LinkButton>
                </div>
              )}
            </div>
          </header>

          {/* Link para torneio */}
          {event.type === EventType.TOURNAMENT && event.tournament && (
            <section className="mb-8">
              <Link
                to={`/tournaments/${event.tournament.id}`}
                viewTransition
                className="flex items-center justify-center gap-3 rounded-2xl border-2 border-primary bg-primary/10 px-4 py-4 text-base font-semibold text-primary transition-colors hover:bg-primary/20 sm:px-8 sm:py-5 sm:text-lg sm:justify-center"
              >
                <span className="text-center">Ir para tabela e mesas</span>
                <span className="shrink-0 text-primary/80">→</span>
              </Link>
            </section>
          )}

          {/* Data */}
          {event.date && (
            <section className="mb-8 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Data
              </h2>
              <p className="text-lg">
                {formatEventDateLong(event.date)}
              </p>
            </section>
          )}

          {/* Descrição */}
          {event.description && (
            <section className="mb-8 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Descrição
              </h2>
              <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                {event.description}
              </p>
            </section>
          )}

          {/* Participação (check-in) */}
          {currentUser && !isAdmin && (
            <section className="mb-8 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Participação
              </h2>
              {checkedIn ? (
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                    ✓
                  </span>
                  <p className="font-medium">Você está participando deste evento.</p>
                </div>
              ) : event.status === EventStatus.ABERTO ? (
                <fetcher.Form method="post" action={`/events/${params.eventId}/check-in`}>
                  <Button type="submit">Fazer check-in</Button>
                </fetcher.Form>
              ) : (
                <p className="text-foreground/60">
                  As inscrições para este evento estão encerradas.
                </p>
              )}
            </section>
          )}

          {/* Lista de participantes */}
          <section className="mb-8 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
            <style>{`
              @keyframes champion-shimmer {
                0% { transform: translateX(0); }
                100% { transform: translateX(350%); }
              }
            `}</style>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Participantes ({event.participants.length})
            </h2>
            {event.type === EventType.GENERAL && isAdmin && event.participants.length > 0 && (
              <p className="mb-3 text-sm text-foreground/55">
                Você pode destacar <strong className="text-foreground/80">um ou mais participantes</strong> como{' '}
                <strong className="text-foreground/80">campeões</strong> na página pública.
              </p>
            )}
            {event.participants.length === 0 ? (
              <p className="text-foreground/50">Nenhum participante ainda.</p>
            ) : (
              <ul className="space-y-2">
                {event.participants.map((p) => (
                  <ParticipantRow
                    key={p.id}
                    participant={p}
                    canAddParticipants={canAddParticipants}
                    canToggleChampion={isAdmin && event.type === EventType.GENERAL}
                    canSetTournamentPlace={isAdmin && event.type === EventType.TOURNAMENT}
                    fetcher={fetcher}
                    championFetcher={championFetcher}
                    placeFetcher={placeFetcher}
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Adicionar participante (ADMIN em qualquer evento, STAFF em eventos abertos) */}
          {canAddParticipants && (
            <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Adicionar participante
              </h2>
              <p className="mb-3 text-sm text-foreground/60">
                Pesquise por nome, email ou apelido para adicionar.
              </p>
              <div ref={containerRef} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowResults(true)
                  }}
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                  placeholder="Digite para buscar..."
                  className="w-full rounded-xl border border-foreground/20 bg-background px-4 py-3 text-base transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {showResults && searchQuery.length >= 2 && (
                  <ul className="absolute top-full left-0 right-0 z-10 mt-1 max-h-60 overflow-auto rounded-xl border border-foreground/10 bg-background shadow-lg">
                    {searchFetcher.state === 'loading' ? (
                      <li className="px-4 py-3 text-foreground/50">Buscando...</li>
                    ) : searchResults.length === 0 ? (
                      <li className="px-4 py-3 text-foreground/50">
                        Nenhum usuário encontrado.
                      </li>
                    ) : (
                      searchResults.map((user) => (
                        <li key={user.id}>
                          <addParticipantFetcher.Form method="post">
                            <input type="hidden" name="intent" value="add-participant" />
                            <input type="hidden" name="userId" value={user.id} />
                            <button
                              type="submit"
                              className="flex w-full min-w-0 flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-foreground/5 sm:flex-row sm:items-center sm:gap-2"
                            >
                              <span className="min-w-0 line-clamp-2 font-medium" title={user.name}>
                                <SupporterNameDisplay
                                  name={user.name}
                                  isSupporter={user.isSupporter}
                                  nameClassName="font-medium"
                                />
                              </span>
                              <span className="min-w-0 truncate text-sm text-foreground/50" title={`@${user.nickname}`}>
                                <SupporterNameDisplay
                                  name={`@${user.nickname}`}
                                  isSupporter={user.isSupporter}
                                  nameClassName="text-sm text-foreground/50"
                                />
                              </span>
                              <span className="min-w-0 truncate text-sm text-foreground/40 sm:ml-auto" title={user.email}>
                                {user.email}
                              </span>
                            </button>
                          </addParticipantFetcher.Form>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            </section>
          )}
        </div>
      </Center>
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import { data, useFetcher, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import { EventStatus } from '~/lib/event-status'
import { EventType, Role } from '~/generated/prisma/enums'
import { getAvatarUrl } from '~/lib/avatar'

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
            select: { id: true, name: true, nickname: true, email: true, avatarUrl: true },
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

  const eventWithAvatars = {
    ...event,
    participants: event.participants.map((p) => ({
      ...p,
      user: {
        ...p.user,
        avatarUrl: getAvatarUrl(p.user.avatarUrl, p.user.email, 40),
      },
    })),
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

function ParticipantRow({
  participant,
  canAddParticipants,
  fetcher,
}: {
  participant: {
    id: number
    user: { name: string; avatarUrl?: string | null }
    userId: number
  }
  canAddParticipants: boolean
  fetcher: ReturnType<typeof useFetcher>
}) {
  const [avatarError, setAvatarError] = useState(false)
  const avatarUrl = participant.user.avatarUrl
  const showImg = avatarUrl && !avatarError

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-foreground/5">
      <div className="flex min-w-0 items-center gap-3">
        {showImg ? (
          <img
            src={avatarUrl}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-semibold">
            {getInitials(participant.user.name)}
          </div>
        )}
        <span className="truncate font-medium">{participant.user.name}</span>
      </div>
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
    </li>
  )
}

export default function Route({ loaderData, params }: Route.ComponentProps) {
  const fetcher = useFetcher()
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
    (searchFetcher.data as { users?: Array<{ id: number; name: string; nickname: string; email: string }> } | undefined)
      ?.users ?? []
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
                className="flex items-center justify-center gap-2 rounded-xl border border-foreground/10 bg-background/60 px-6 py-4 transition-colors hover:bg-foreground/5 sm:justify-start"
              >
                <span className="font-medium">Ver torneio</span>
                <span className="text-foreground/50">→</span>
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
                {new Date(event.date).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
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
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Participantes ({event.participants.length})
            </h2>
            {event.participants.length === 0 ? (
              <p className="text-foreground/50">Nenhum participante ainda.</p>
            ) : (
              <ul className="space-y-2">
                {event.participants.map((p) => (
                  <ParticipantRow
                    key={p.id}
                    participant={p}
                    canAddParticipants={canAddParticipants}
                    fetcher={fetcher}
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
                              className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-foreground/5"
                            >
                              <span className="font-medium">{user.name}</span>
                              <span className="text-foreground/50">@{user.nickname}</span>
                              <span className="ml-auto truncate text-sm text-foreground/40">
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

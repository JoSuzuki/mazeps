import { useState } from 'react'
import { redirect } from 'react-router'
import type { Route } from './+types/route'
import { formatEventDate } from '~/lib/date'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import { Role } from '~/generated/prisma/enums'
import { getAvatarUrl } from '~/lib/avatar'
import SupporterNameDisplay from '~/components/supporter-name-display/supporter-name-display.component'
import { isPrismaMissingDbColumnError } from '~/lib/prisma-missing-column.server'

const ICON_CLASS = 'h-5 w-5 shrink-0 text-foreground/50'

function MailIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function GamepadIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <path d="M17.91 5H6.09a2 2 0 0 0-1.82 2.7l1.82 4.36A2 2 0 0 0 6.91 12H8" />
      <path d="M17.91 5h1.18a2 2 0 0 1 1.82 2.7l-1.82 4.36A2 2 0 0 1 17.09 12H16" />
    </svg>
  )
}

function EventIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="h-4 w-4 text-foreground/40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  const userId = Number(params.userId)

  const userPromise = (async () => {
    try {
      return await context.prisma.user.findUniqueOrThrow({
        where: { id: userId },
      })
    } catch (e) {
      if (!isPrismaMissingDbColumnError(e)) throw e
      const u = await context.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        omit: { isSupporter: true, isWriter: true },
      })
      return { ...u, isSupporter: false, isWriter: false }
    }
  })()

  const [user, eventParticipants] = await Promise.all([
    userPromise,
    context.prisma.eventParticipant.findMany({
      where: { userId },
      include: {
        event: { select: { id: true, name: true, date: true, badgeFile: true } },
      },
      orderBy: { checkedInAt: 'desc' },
    }),
  ])

  const userWithAvatar = {
    ...user,
    avatarUrl: getAvatarUrl(user.avatarUrl, user.email, 96),
  }

  return { user: userWithAvatar, eventParticipants }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const ROLE_LABELS: Record<Role, string> = {
  [Role.USER]: 'Usuário',
  [Role.STAFF]: 'Staff',
  [Role.ADMIN]: 'Admin',
}

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  href?: string
}) {
  const content = (
    <div className="flex items-start gap-3">
      <span className="mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/50">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-foreground/90">{value}</p>
      </div>
    </div>
  )
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg p-3 transition-colors hover:bg-foreground/5"
      >
        {content}
      </a>
    )
  }
  return <div className="rounded-lg p-3">{content}</div>
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const { user, eventParticipants } = loaderData
  const [avatarError, setAvatarError] = useState(false)
  const showAvatar = user.avatarUrl && !avatarError

  return (
    <>
      <BackButtonPortal to="/users" />
      <Center>
        <div className="mx-auto max-w-2xl px-6 py-10">
          {/* Barra Admin */}
          <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-200/60 bg-amber-50/80 px-4 py-2.5 dark:border-amber-800/50 dark:bg-amber-950/30">
            <span className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
              <UserIcon />
              Visualização administrativa
            </span>
            <Link
              to="/users"
              viewTransition
              className="text-sm font-medium text-amber-700 underline-offset-2 hover:underline dark:text-amber-300"
            >
              ← Voltar à lista
            </Link>
          </div>

          {/* Header: avatar + nome + editar */}
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              {showAvatar ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-foreground/10"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-foreground/10 text-2xl font-semibold">
                  {getInitials(user.name)}
                </div>
              )}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-semibold tracking-tight">
                  <SupporterNameDisplay
                    name={user.name}
                    isSupporter={user.isSupporter}
                    nameClassName="font-semibold tracking-tight"
                  />
                </h1>
                <p className="mt-1 text-foreground/60">
                  <SupporterNameDisplay
                    name={`@${user.nickname}`}
                    isSupporter={user.isSupporter}
                    nameClassName="text-foreground/60"
                  />
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-medium">
                    {ROLE_LABELS[user.role]}
                  </span>
                  {user.isWriter && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      Escritor
                    </span>
                  )}
                  {user.isSupporter && (
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      Apoiador
                    </span>
                  )}
                  <span className="text-foreground/40">#{user.id}</span>
                </div>
              </div>
            </div>
            <LinkButton
              styleType="primary"
              to={`/users/${user.id}/edit`}
              viewTransition
              className="flex shrink-0 items-center justify-center gap-2 self-center sm:ml-auto"
            >
              <PencilIcon />
              Editar usuário
            </LinkButton>
          </div>

          {/* Dados do usuário */}
          <section className="mb-8 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              <UserIcon />
              Informações
            </h2>
            <div className="space-y-1">
              <InfoRow
                icon={<MailIcon />}
                label="E-mail"
                value={user.email}
              />
              <InfoRow
                icon={<CalendarIcon />}
                label="Cadastro"
                value={new Date(user.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              />
              {user.birthday && (
                <InfoRow
                  icon={<CalendarIcon />}
                  label="Aniversário"
                  value={new Date(user.birthday).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                  })}
                />
              )}
              {user.instagram && (
                <InfoRow
                  icon={<LinkIcon />}
                  label="Instagram"
                  value={`@${user.instagram.replace(/^@/, '')}`}
                  href={`https://instagram.com/${user.instagram.replace(/^@/, '')}`}
                />
              )}
              {user.ludopediaUrl && (
                <InfoRow
                  icon={<LinkIcon />}
                  label="Ludopedia"
                  value={user.ludopediaUrl}
                  href={user.ludopediaUrl.startsWith('http') ? user.ludopediaUrl : `https://${user.ludopediaUrl}`}
                />
              )}
              {user.favoriteGame && (
                <InfoRow
                  icon={<GamepadIcon />}
                  label="Jogo favorito"
                  value={user.favoriteGame}
                />
              )}
              {user.favoriteEvent && (
                <InfoRow
                  icon={<EventIcon />}
                  label="Evento favorito"
                  value={user.favoriteEvent}
                />
              )}
            </div>
          </section>

          {/* Eventos participados */}
          <section className="overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 shadow-sm">
            <div className="flex items-center gap-2 border-b border-foreground/10 bg-foreground/5 px-6 py-4">
              <EventIcon />
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Eventos participados ({eventParticipants.length})
              </h2>
            </div>
            <div>
              {eventParticipants.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-foreground/50">
                  Nenhum evento ainda.
                </p>
              ) : (
                <ul className="divide-y divide-foreground/10">
                  {eventParticipants.map((ep) => (
                    <li key={ep.id}>
                      <Link
                        to={`/events/${ep.event.id}`}
                        viewTransition
                        className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-foreground/5"
                      >
                        {ep.event.badgeFile ? (
                          <img
                            src={ep.event.badgeFile}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-foreground/10">
                            <EventIcon />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{ep.event.name}</p>
                          {ep.event.date && (
                            <p className="text-sm text-foreground/50">
                              {formatEventDate(ep.event.date)}
                            </p>
                          )}
                        </div>
                        <ChevronRightIcon />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </Center>
    </>
  )
}

import { useState } from 'react'
import { Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import { formatEventDate } from '~/lib/date'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import { getAvatarUrl } from '~/lib/avatar'

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

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
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

function TrophyIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  const [user, eventParticipants] = await Promise.all([
    context.prisma.user.findUnique({
      where: { id: context.currentUser.id },
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
      },
    }),
    context.prisma.eventParticipant.findMany({
      where: { userId: context.currentUser.id },
      include: {
        event: { select: { id: true, name: true, date: true, badgeFile: true } },
      },
      orderBy: { checkedInAt: 'desc' },
    }),
  ])

  if (!user) return redirect('/login')

  return {
    currentUser: {
      ...user,
      avatarUrl: getAvatarUrl(user.avatarUrl, user.email, 96),
    },
    eventParticipants,
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** Formata data de aniversário sem deslocamento de timezone. */
function formatBirthday(date: Date | string): string {
  const d =
    date instanceof Date
      ? new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
      : new Date(date + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
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
        <p
          className={`mt-0.5 text-sm ${href ? 'text-primary hover:underline' : 'text-foreground/90'}`}
        >
          {value}
        </p>
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
  const [avatarError, setAvatarError] = useState(false)
  const { currentUser, eventParticipants } = loaderData
  const showAvatar = currentUser.avatarUrl && !avatarError

  return (
    <>
      <BackButtonPortal to="/" />
      <Center>
        <div className="mx-auto max-w-2xl px-6 py-10">
          {/* Header: avatar + nome + editar */}
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              {showAvatar ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={`Avatar de ${currentUser.name}`}
                  className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-foreground/10"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-foreground/10 text-2xl font-semibold">
                  {getInitials(currentUser.name)}
                </div>
              )}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {currentUser.name}
                </h1>
                <p className="mt-1 text-foreground/60">@{currentUser.nickname}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-medium uppercase">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>
            <LinkButton
              styleType="primary"
              to="/profile/edit"
              viewTransition
              className="flex shrink-0 items-center justify-center gap-2 self-center sm:ml-auto"
            >
              <PencilIcon />
              Editar perfil
            </LinkButton>
          </div>

          {/* Dados pessoais */}
          <section className="mb-8 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              <UserIcon />
              Informações
            </h2>
            <div className="space-y-1">
              <InfoRow
                icon={<MailIcon />}
                label="E-mail"
                value={currentUser.email}
              />
              {currentUser.instagram && (
                <InfoRow
                  icon={<LinkIcon />}
                  label="Instagram"
                  value={
                    currentUser.instagram.startsWith('@')
                      ? currentUser.instagram
                      : `@${currentUser.instagram}`
                  }
                  href={`https://instagram.com/${currentUser.instagram.replace(/^@/, '')}`}
                />
              )}
              {currentUser.ludopediaUrl && (
                <InfoRow
                  icon={<LinkIcon />}
                  label="Ludopedia"
                  value="Ver perfil na Ludopedia"
                  href={
                    currentUser.ludopediaUrl.startsWith('http')
                      ? currentUser.ludopediaUrl
                      : `https://${currentUser.ludopediaUrl}`
                  }
                />
              )}
              {currentUser.birthday && (
                <InfoRow
                  icon={<CalendarIcon />}
                  label="Aniversário"
                  value={formatBirthday(currentUser.birthday)}
                />
              )}
              {currentUser.favoriteGame && (
                <InfoRow
                  icon={<GamepadIcon />}
                  label="Jogo favorito"
                  value={currentUser.favoriteGame}
                />
              )}
              {currentUser.favoriteEvent && (
                <InfoRow
                  icon={<EventIcon />}
                  label="Evento favorito"
                  value={currentUser.favoriteEvent}
                />
              )}
            </div>
          </section>

          {/* Ações */}
          <div className="mb-8 flex flex-col gap-3">
            <Form method="post" action="/logout">
              <Button
                type="submit"
                className="flex w-full items-center justify-center gap-2"
              >
                <LogoutIcon />
                Sair
              </Button>
            </Form>
          </div>

          {/* Participações / Eventos */}
          <section className="mb-8 overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 shadow-sm">
            <div className="flex items-center gap-2 border-b border-foreground/10 bg-foreground/5 px-6 py-4">
              <EventIcon />
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Participações ({eventParticipants.length})
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

          {/* Prateleira de Troféus */}
          <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              <TrophyIcon />
              Prateleira de Troféus
            </h2>
            <p className="text-sm text-foreground/50">
              Sua coleção de troféus aparecerá aqui.
            </p>
          </section>
        </div>
      </Center>
    </>
  )
}

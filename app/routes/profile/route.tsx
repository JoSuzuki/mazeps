import { useState } from 'react'
import { Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import { getAvatarUrl } from '~/lib/avatar'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'

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
    currentUser: { ...user, avatarUrl: getAvatarUrl(user.avatarUrl, user.email) },
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

export default function Route({ loaderData }: Route.ComponentProps) {
  const [avatarError, setAvatarError] = useState(false)
  const avatarUrl = loaderData.currentUser.avatarUrl
  const badges = loaderData.eventParticipants.filter(
    (ep) => ep.event.badgeFile,
  )

  return (
    <>
      <BackButtonPortal to="/" />
      <Center>
        <div className="mx-auto max-w-xl px-6 py-10">
          {/* Header com avatar e nome */}
          <header className="mb-10 flex items-center gap-6">
            {avatarError ? (
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-2 border-foreground/20 bg-foreground/5 text-4xl font-semibold">
                {getInitials(loaderData.currentUser.name)}
              </div>
            ) : (
              <img
                src={avatarUrl}
                alt={`Avatar de ${loaderData.currentUser.name}`}
                className="h-28 w-28 shrink-0 rounded-full border-2 border-foreground/20 object-cover"
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
              />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="font-brand mb-1 text-3xl tracking-wide">
                {loaderData.currentUser.nickname}
              </h1>
              <p className="text-foreground/70 text-lg">{loaderData.currentUser.name}</p>
              <span className="mt-2 inline-block rounded-full border border-foreground/20 bg-foreground/5 px-4 py-1.5 text-sm font-medium uppercase tracking-wider">
                {loaderData.currentUser.role}
              </span>
            </div>
          </header>

          {/* Dados pessoais */}
          <section className="mb-6 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Dados
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-foreground/50">Email</dt>
                <dd className="mt-0.5 text-base">{loaderData.currentUser.email}</dd>
              </div>
              {loaderData.currentUser.instagram && (
                <div>
                  <dt className="text-foreground/50">Instagram</dt>
                  <dd className="mt-0.5 text-base">
                    <a
                      href={`https://instagram.com/${loaderData.currentUser.instagram.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {loaderData.currentUser.instagram.startsWith('@')
                        ? loaderData.currentUser.instagram
                        : `@${loaderData.currentUser.instagram}`}
                    </a>
                  </dd>
                </div>
              )}
              {loaderData.currentUser.birthday && (
                <div>
                  <dt className="text-foreground/50">Aniversário</dt>
                  <dd className="mt-0.5 text-base">
                    {new Date(loaderData.currentUser.birthday).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </dd>
                </div>
              )}
              {loaderData.currentUser.favoriteGame && (
                <div>
                  <dt className="text-foreground/50">Jogo favorito</dt>
                  <dd className="mt-0.5 text-base">{loaderData.currentUser.favoriteGame}</dd>
                </div>
              )}
              {loaderData.currentUser.favoriteEvent && (
                <div>
                  <dt className="text-foreground/50">Evento favorito</dt>
                  <dd className="mt-0.5 text-base">{loaderData.currentUser.favoriteEvent}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Ações */}
          <div className="mb-10 flex flex-col gap-3">
            <LinkButton
              to="/profile/edit"
              styleType="secondary"
              className="w-full justify-center"
            >
              Editar perfil
            </LinkButton>
            <Form method="post" action="/logout">
              <Button className="w-full" type="submit">
                Sair
              </Button>
            </Form>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Participações
              </h2>
              <div className="flex flex-wrap justify-center gap-6">
                {badges.map((ep) => (
                  <Link
                    key={ep.id}
                    to={`/events/${ep.event.id}`}
                    viewTransition
                    className="group block"
                  >
                    <img
                      src={ep.event.badgeFile!}
                      alt={`Badge de ${ep.event.name}`}
                      title={ep.event.name}
                      className="h-44 w-44 object-contain transition-transform group-hover:scale-105"
                    />
                    <p className="mt-2 text-center text-base font-medium text-foreground/70">
                      {ep.event.name}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Prateleira de Troféus */}
          <section className="rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Prateleira de Troféus
            </h2>
            <p className="text-foreground/50 text-sm">
              Sua coleção de troféus aparecerá aqui.
            </p>
          </section>
        </div>
      </Center>
    </>
  )
}

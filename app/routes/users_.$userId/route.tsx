import { redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  const userId = Number(params.userId)

  const [user, eventParticipants] = await Promise.all([
    context.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    }),
    context.prisma.eventParticipant.findMany({
      where: { userId },
      include: {
        event: { select: { id: true, name: true, date: true, badgeFile: true } },
      },
      orderBy: { checkedInAt: 'desc' },
    }),
  ])

  return { user, eventParticipants }
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

export default function Route({ loaderData }: Route.ComponentProps) {
  const { user, eventParticipants } = loaderData

  return (
    <>
      <BackButtonPortal to="/users" />
      <Center>
        <div className="mx-auto max-w-3xl px-6 py-10">
          {/* Barra Admin */}
          <div className="mb-4 flex items-center justify-between rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-2 dark:border-amber-400 dark:bg-amber-950/30">
            <span className="text-sm font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-200">
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

          <div className="mb-8">
            <LinkButton
              styleType="primary"
              to={`/users/${user.id}/edit`}
              viewTransition
              className="w-full py-4 text-lg font-semibold"
            >
              Editar usuário
            </LinkButton>
          </div>

          {/* Resumo do usuário (compacto, horizontal) */}
          <div className="mb-8 flex flex-wrap items-center gap-6 rounded-lg border border-foreground/10 bg-foreground/5 px-6 py-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-foreground/10 text-lg font-semibold">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold">{user.name}</h1>
                <span className="text-foreground/50">@{user.nickname}</span>
                <span className="rounded bg-foreground/10 px-2 py-0.5 text-xs font-medium">
                  #{user.id}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{ROLE_LABELS[user.role]}</span>
                {user.isWriter && (
                  <span className="text-foreground/60">• Escritor</span>
                )}
              </div>
            </div>
          </div>

          {/* Dados em tabela */}
          <div className="mb-8 overflow-hidden rounded-lg border border-foreground/10">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-foreground/10">
                <tr className="bg-foreground/5">
                  <td className="w-32 px-4 py-3 font-medium text-foreground/60">
                    Email
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-foreground/60">
                    Cadastro
                  </td>
                  <td className="px-4 py-3">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Eventos */}
          <div className="overflow-hidden rounded-lg border border-foreground/10">
            <div className="border-b border-foreground/10 bg-foreground/5 px-4 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/60">
                Eventos ({eventParticipants.length})
              </h2>
            </div>
            <div>
              {eventParticipants.length === 0 ? (
                <p className="p-6 text-sm text-foreground/50">
                  Nenhum evento ainda.
                </p>
              ) : (
                <ul className="divide-y divide-foreground/10">
                  {eventParticipants.map((ep) => (
                    <li key={ep.id}>
                      <Link
                        to={`/events/${ep.event.id}`}
                        viewTransition
                        className="block px-4 py-3 text-sm transition-colors hover:bg-foreground/5"
                      >
                        <span className="font-medium">{ep.event.name}</span>
                        {ep.event.date && (
                          <span className="ml-2 text-foreground/50">
                            {new Date(ep.event.date).toLocaleDateString(
                              'pt-BR',
                            )}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </Center>
    </>
  )
}

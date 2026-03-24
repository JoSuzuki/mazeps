import { useState } from 'react'
import { Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import Pagination from '~/components/pagination/pagination.component'
import { Role } from '~/generated/prisma/enums'
import { getAvatarUrl } from '~/lib/avatar'
import SupporterNameDisplay from '~/components/supporter-name-display/supporter-name-display.component'

export async function loader({ context, request }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  const url = new URL(request.url)
  const rawPage = Number(url.searchParams.get('page') || 1)
  const page =
    Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1
  const search = (url.searchParams.get('search') || '').trim()
  const limit = 12
  const skip = (page - 1) * limit

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { nickname: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [users, totalCount] = await Promise.all([
    context.prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      // Só o necessário para a lista: evita vazar password e reduz risco de falha na
      // serialização do loader (ex.: datas inválidas em campos não usados na UI).
      select: {
        id: true,
        name: true,
        nickname: true,
        email: true,
        role: true,
        isSupporter: true,
        avatarUrl: true,
      },
    }),
    context.prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  const usersWithAvatar = users.map((u) => ({
    ...u,
    avatarUrl: getAvatarUrl(u.avatarUrl, u.email, 48),
  }))

  return {
    users: usersWithAvatar,
    search,
    pagination: { currentPage: page, totalPages, totalCount },
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function UserAvatar({
  user,
  size = 'md',
}: {
  user: { name: string; avatarUrl: string }
  size?: 'sm' | 'md'
}) {
  const [error, setError] = useState(false)
  const sizeClass = size === 'sm' ? 'h-10 w-10' : 'h-12 w-12'

  if (error) {
    return (
      <div
        className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-foreground/10 text-sm font-semibold`}
      >
        {getInitials(user.name)}
      </div>
    )
  }

  return (
    <img
      src={user.avatarUrl}
      alt=""
      className={`${sizeClass} shrink-0 rounded-full object-cover`}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  )
}

export default function Route({ loaderData }: Route.ComponentProps) {
  return (
    <Center>
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="font-brand mb-2 text-4xl tracking-wide">Usuários</h1>
          <p className="text-foreground/60 text-sm uppercase tracking-[0.2em]">
            Busque e gerencie os membros do Mazeps
          </p>
        </header>

        {/* Barra de pesquisa */}
        <section className="mb-8 rounded-2xl border border-foreground/10 bg-background/60 p-5 shadow-sm">
          <Form method="get" className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <input type="hidden" name="page" value="1" />
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50">
                <SearchIcon />
              </span>
              <input
                type="search"
                name="search"
                placeholder="Buscar por nome, apelido ou e-mail..."
                defaultValue={loaderData.search}
                className="border-foreground/20 focus:border-foreground/50 w-full rounded-xl border bg-transparent py-3 pl-12 pr-4 text-sm outline-none transition-colors placeholder:text-foreground/40"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-primary text-on-primary hover:opacity-90 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-opacity"
              >
                <SearchIcon className="opacity-90" />
                Buscar
              </button>
              {loaderData.search && (
                <Link
                  to="/users"
                  className="border-foreground/20 hover:bg-foreground/5 flex items-center rounded-xl border px-5 py-3 text-sm transition-colors"
                >
                  Limpar
                </Link>
              )}
            </div>
          </Form>
        </section>

        {/* Resultados */}
        <section className="rounded-2xl border border-foreground/10 bg-background/60 shadow-sm overflow-hidden">
          <div className="border-foreground/10 flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-foreground/60 text-sm">
              {loaderData.search ? (
                <>
                  <span className="font-semibold text-foreground/80">
                    {loaderData.pagination.totalCount}
                  </span>{' '}
                  {loaderData.pagination.totalCount === 1
                    ? 'resultado'
                    : 'resultados'}
                </>
              ) : (
                <>
                  <span className="font-semibold text-foreground/80">
                    {loaderData.pagination.totalCount}
                  </span>{' '}
                  {loaderData.pagination.totalCount === 1 ? 'usuário' : 'usuários'}
                </>
              )}
            </p>
          </div>

          {loaderData.users.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-foreground/10 text-2xl">
                <SearchIcon className="text-foreground/40" />
              </div>
              <p className="text-foreground/60 mb-1 text-base font-medium">
                {loaderData.search
                  ? 'Nenhum usuário encontrado'
                  : 'Nenhum usuário cadastrado'}
              </p>
              <p className="text-foreground/50 mb-6 text-sm">
                {loaderData.search
                  ? 'Tente outros termos de busca.'
                  : 'Os usuários aparecerão aqui quando se cadastrarem.'}
              </p>
              {loaderData.search && (
                <Link
                  to="/users"
                  className="text-primary text-sm font-medium underline underline-offset-2"
                >
                  Limpar busca
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Tabela desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-foreground/10 border-b bg-foreground/5">
                      <th className="text-foreground/60 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="text-foreground/60 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        E-mail
                      </th>
                      <th className="text-foreground/60 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-foreground/60 px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/10">
                    {loaderData.users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-foreground/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            to={`/users/${user.id}`}
                            viewTransition
                            className="group flex items-center gap-3"
                          >
                            <UserAvatar user={user} size="sm" />
                            <div>
                              <SupporterNameDisplay
                                name={user.name}
                                isSupporter={user.isSupporter}
                                nameClassName="font-medium group-hover:underline"
                              />
                              <p className="text-foreground/50 text-xs">
                                <SupporterNameDisplay
                                  name={`@${user.nickname}`}
                                  isSupporter={user.isSupporter}
                                  nameClassName="text-foreground/50 text-xs"
                                />
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="text-foreground/80 px-6 py-4 text-sm">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full border border-foreground/20 bg-foreground/5 px-2.5 py-1 text-xs font-medium uppercase tracking-wider">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <LinkButton
                            styleType="secondary"
                            to={`/users/${user.id}/edit`}
                            className="text-xs"
                          >
                            Editar
                          </LinkButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards mobile */}
              <div className="divide-y divide-foreground/10 md:hidden">
                {loaderData.users.map((user) => (
                  <div
                    key={user.id}
                    className="hover:bg-foreground/5 flex gap-3 px-6 py-4 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Link to={`/users/${user.id}`} viewTransition>
                        <UserAvatar user={user} size="md" />
                      </Link>
                      <span className="rounded-full border border-foreground/20 bg-foreground/5 px-2 py-0.5 text-xs font-medium uppercase">
                        {user.role}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                      <Link
                        to={`/users/${user.id}`}
                        viewTransition
                        className="group flex min-w-0 flex-col gap-0.5"
                      >
                        <SupporterNameDisplay
                          name={user.name}
                          isSupporter={user.isSupporter}
                          className="line-clamp-2"
                          nameClassName="font-medium group-hover:underline"
                        />
                        <p className="text-foreground/50 line-clamp-1 text-sm">
                          <SupporterNameDisplay
                            name={`@${user.nickname}`}
                            isSupporter={user.isSupporter}
                            className="min-w-0 max-w-full"
                            nameClassName="text-foreground/50 text-sm"
                          />
                        </p>
                      </Link>
                      <div className="flex justify-end">
                        <LinkButton
                          styleType="secondary"
                          to={`/users/${user.id}/edit`}
                          className="shrink-0 text-xs"
                        >
                          Editar
                        </LinkButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Paginação */}
        {loaderData.pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={loaderData.pagination.currentPage}
              totalPages={loaderData.pagination.totalPages}
              baseUrl="/users"
            />
          </div>
        )}
      </div>
    </Center>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message =
    error && error instanceof Error ? error.message : 'Erro ao carregar usuários'
  const stack = error && error instanceof Error ? error.stack : undefined

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="mb-4 text-xl font-semibold">Erro na página de Usuários</h1>
      <p className="mb-4 text-red-600">{message}</p>
      {import.meta.env.DEV && stack && (
        <pre className="overflow-x-auto rounded bg-gray-100 p-4 text-xs">
          <code>{stack}</code>
        </pre>
      )}
      <p className="mt-4 text-sm text-gray-600">
        Se o erro mencionar &quot;column does not exist&quot;, &quot;isWriter&quot; ou &quot;isSupporter&quot;, execute:{' '}
        <code className="rounded bg-gray-100 px-1">npx prisma migrate dev</code>
      </p>
    </div>
  )
}

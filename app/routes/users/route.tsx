import { redirect, useNavigate } from 'react-router'
import type { Route } from './+types/route'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import Pagination from '~/components/pagination/pagination.component'
import Spacer from '~/components/spacer/spacer.component'
import Table from '~/components/table/table.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context, request }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') || 1)
  const search = url.searchParams.get('search') || ''
  const limit = 10
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
    context.prisma.user.findMany({ where, skip, take: limit }),
    context.prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return {
    users,
    search,
    pagination: { currentPage: page, totalPages, totalCount },
  }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate()

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams()
    if (e.target.value) params.set('search', e.target.value)
    navigate(`/users?${params.toString()}`, { replace: true })
  }

  return (
    <Center>
      <h1 className="flex justify-center text-lg">Usuários</h1>
      <Spacer size="md" />
      <input
        type="search"
        placeholder="Buscar por nome, apelido ou e-mail..."
        defaultValue={loaderData.search}
        onChange={handleSearch}
        className="border-foreground/20 focus:border-foreground/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-colors"
      />
      <Spacer size="sm" />
      <Table
        emptyState={'Não existem usuários'}
        data={loaderData.users}
        columns={[
          { key: 'id', title: 'Id', value: (user) => user.id },
          {
            key: 'name',
            title: 'Nome',
            value: (user) => <Link to={`/users/${user.id}`}>{user.name}</Link>,
          },
          { key: 'nickname', title: 'Apelido', value: (user) => user.nickname },
          { key: 'email', title: 'E-mail', value: (user) => user.email },
          { key: 'role', title: 'Role', value: (user) => user.role },
          {
            key: 'edit',
            title: 'Ações',
            value: (user) => (
              <LinkButton styleType="secondary" to={`/users/${user.id}/edit`}>
                Editar
              </LinkButton>
            ),
          },
        ]}
      />
      <Pagination
        currentPage={loaderData.pagination.currentPage}
        totalPages={loaderData.pagination.totalPages}
        baseUrl="/users"
      />
    </Center>
  )
}

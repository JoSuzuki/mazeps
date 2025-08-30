import { redirect } from 'react-router'
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
  const limit = 10
  const skip = (page - 1) * limit

  const [users, totalCount] = await Promise.all([
    context.prisma.user.findMany({
      skip,
      take: limit,
    }),
    context.prisma.user.count(),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return {
    users,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
    },
  }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  return (
    <Center>
      <Link to="/" className="absolute top-2 left-2">
        ← Voltar
      </Link>
      <h1 className="flex justify-center text-lg">Usuários</h1>
      <Spacer size="md" />
      <Table
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

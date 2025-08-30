import { data, Link, redirect } from 'react-router'
import type { Route } from './+types/route'
import Center from '~/components/center/center.component'
import LinkButton from '~/components/link-button/link-button.component'
import Pagination from '~/components/pagination/pagination.component'
import Table from '~/components/table/table.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context, request }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') || 1)
  const limit = 10
  const skip = (page - 1) * limit

  const [tournaments, totalCount] = await Promise.all([
    context.prisma.tournament.findMany({
      skip,
      take: limit,
    }),
    context.prisma.tournament.count(),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return {
    tournaments,
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
      <h1 className="flex justify-center text-lg">Torneios</h1>
      <Table
        data={loaderData.tournaments}
        columns={[
          { key: 'id', title: 'Id', value: (tournament) => tournament.id },
          {
            key: 'name',
            title: 'Nome',
            value: (tournament) => (
              <Link to={`/tournaments/${tournament.id}`}>
                {tournament.name}
              </Link>
            ),
          },
          {
            key: 'edit',
            title: 'Ações',
            value: (tournament) => (
              <LinkButton
                styleType="secondary"
                to={`/tournament/${tournament.id}/tournament-players/new`}
              >
                Inscrever-se
              </LinkButton>
            ),
          },
        ]}
      />
      <Pagination
        currentPage={loaderData.pagination.currentPage}
        totalPages={loaderData.pagination.totalPages}
        baseUrl="/tournaments"
      />
    </Center>
  )
}

export async function action({ request, context }: Route.ActionArgs) {
  if (context.currentUser?.role !== Role.ADMIN) {
    return data({ error: 'Apenas admins podem criar torneios' })
  }
  const formData = await request.formData()
  const name = formData.get('name') as string
  const desiredTableSize = formData.get('desiredTableSize') as string

  const tournament = await context.prisma.tournament.create({
    data: {
      name: name,
      desiredTableSize: Number(desiredTableSize),
    },
  })

  return redirect(`/tournaments/${tournament.id}`)
}

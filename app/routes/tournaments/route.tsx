import { data, redirect, useFetcher } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import Pagination from '~/components/pagination/pagination.component'
import Table from '~/components/table/table.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') || 1)
  const limit = 10
  const skip = (page - 1) * limit

  const [tournaments, totalCount] = await Promise.all([
    context.prisma.tournament.findMany({
      skip,
      take: limit,
      include: {
        players: {
          where: { userId: context.currentUser?.id },
        },
      },
    }),
    context.prisma.tournament.count(),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return {
    tournaments,
    currentUser: context.currentUser,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
    },
  }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  let fetcher = useFetcher()

  return (
    <Center>
      <Link to="/" className="absolute top-2 left-2">
        ← Voltar
      </Link>
      {loaderData.currentUser?.role === Role.ADMIN && (
        <LinkButton
          className="absolute top-2 right-2"
          styleType="secondary"
          to="/tournaments/new"
        >
          Criar torneio
        </LinkButton>
      )}
      <h1 className="flex justify-center text-lg">Torneios</h1>
      <Table
        emptyState={'Não há torneios cadastrados ainda'}
        data={loaderData.tournaments}
        columns={[
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
            value: (tournament) => {
              const player = tournament.players[0]
              return player ? (
                <div>Inscrito</div>
              ) : (
                <fetcher.Form
                  method="post"
                  action={`/tournaments/${tournament.id}/tournament-players/new`}
                >
                  <Button styleType="secondary" type="submit">
                    Inscrever-se
                  </Button>
                </fetcher.Form>
              )
            },
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

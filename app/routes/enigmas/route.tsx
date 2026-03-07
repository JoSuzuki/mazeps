import type { Route } from './+types/route'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import Spacer from '~/components/spacer/spacer.component'
import Table from '~/components/table/table.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context }: Route.LoaderArgs) {
  const enigmas = await context.prisma.enigma.findMany({
    include: { _count: { select: { phases: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return { enigmas, currentUser: context.currentUser }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  return (
    <>
      {loaderData.currentUser?.role === Role.ADMIN && (
        <div className="flex justify-end px-6 py-2">
          <LinkButton styleType="secondary" to="/enigmas/new">
            Criar enigma
          </LinkButton>
        </div>
      )}
      <Center>
        <h1 className="flex justify-center text-lg">Enigmas</h1>
        <Spacer size="lg" />
        <Table
          emptyState="Nenhum enigma cadastrado ainda."
          data={loaderData.enigmas}
          columns={[
            {
              key: 'name',
              title: 'Nome',
              value: (enigma) => (
                <Link to={`/enigmas/${enigma.slug}/comecar`} viewTransition>
                  {enigma.name}
                </Link>
              ),
            },
            {
              key: 'phases',
              title: 'Fases',
              value: (enigma) => enigma._count.phases,
            },
            {
              key: 'actions',
              title: 'Ações',
              value: (enigma) =>
                loaderData.currentUser?.role === Role.ADMIN ? (
                  <Link to={`/enigmas/${enigma.slug}/edit`} viewTransition>
                    Gerenciar
                  </Link>
                ) : null,
            },
          ]}
        />
      </Center>
    </>
  )
}

import { redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Center from '~/components/center/center.component'
import LinkButton from '~/components/link-button/link-button.component'
import Spacer from '~/components/spacer/spacer.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context, params }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  const user = await context.prisma.user.findUniqueOrThrow({
    where: { id: Number(params.userId) },
  })

  return { user }
}

interface FieldProps {
  label: string
  value: string | null
}

const Field = ({ label, value }: FieldProps) => (
  <div className="flex align-baseline whitespace-pre-wrap">
    <h2>{label}: </h2>
    <span>{value}</span>
  </div>
)

export default function Route({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <BackButtonPortal to="/users" />
      <Center>
        <h1 className="flex justify-center text-lg">{loaderData.user.name}</h1>
        <Spacer size="md" />
        <Field label="Nome" value={loaderData.user.name} />
        <Spacer size="sm" />
        <Field label="Nickname" value={loaderData.user.nickname} />
        <Spacer size="sm" />
        <Field label="Email" value={loaderData.user.email} />
        <Spacer size="sm" />
        <Field label="Role" value={loaderData.user.role} />
        <Spacer size="md" />
        <LinkButton
          to={`/users/${loaderData.user.id}/edit`}
          styleType="secondary"
          className="block w-full"
        >
          Editar
        </LinkButton>
      </Center>
    </>
  )
}

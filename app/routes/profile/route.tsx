import { Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import Spacer from '~/components/spacer/spacer.component'

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  const [tournamentPlayers, eventParticipants] = await Promise.all([
    context.prisma.tournamentPlayer.findMany({
      where: { userId: context.currentUser.id },
      include: { tournament: { select: { id: true, name: true } } },
      orderBy: { tournament: { createdAt: 'desc' } },
    }),
    context.prisma.eventParticipant.findMany({
      where: { userId: context.currentUser.id },
      include: {
        event: { select: { id: true, name: true, date: true, badgeFile: true } },
      },
      orderBy: { checkedInAt: 'desc' },
    }),
  ])

  return {
    currentUser: context.currentUser,
    tournamentPlayers,
    eventParticipants,
  }
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
  const badges = loaderData.eventParticipants.filter(
    (ep) => ep.event.badgeFile,
  )

  return (
    <>
      <BackButtonPortal to="/" />
      <Center>
        <h1 className="flex justify-center text-lg">Perfil</h1>
        <Spacer size="md" />
        <Field label="Nome" value={loaderData.currentUser.name} />
        <Spacer size="sm" />
        <Field label="Nickname" value={loaderData.currentUser.nickname} />
        <Spacer size="sm" />
        <Field label="Email" value={loaderData.currentUser.email} />
        <Spacer size="sm" />
        <Field label="Role" value={loaderData.currentUser.role} />
        <Spacer size="md" />
        <LinkButton
          to="/profile/edit"
          styleType="secondary"
          className="block w-full"
        >
          Editar
        </LinkButton>
        <Spacer size="sm" />
        <Form method="post" action="/logout">
          <Button className="w-full" type="submit">
            Logout
          </Button>
        </Form>

        {badges.length > 0 && (
          <>
            <Spacer size="lg" />
            <h2 className="text-base font-semibold">Badges</h2>
            <Spacer size="sm" />
            <div className="flex flex-wrap gap-3">
              {badges.map((ep) => (
                <Link key={ep.id} to={`/events/${ep.event.id}`} viewTransition>
                  <img
                    src={ep.event.badgeFile!}
                    alt={`Badge de ${ep.event.name}`}
                    title={ep.event.name}
                    className="h-48 w-48 object-contain"
                  />
                </Link>
              ))}
            </div>
          </>
        )}

        <Spacer size="lg" />

        <h2 className="text-base font-semibold">Torneios</h2>
        <Spacer size="sm" />
        {loaderData.tournamentPlayers.length === 0 ? (
          <p className="text-sm opacity-60">Nenhum torneio ainda.</p>
        ) : (
          <ol className="list-inside list-decimal text-sm">
            {loaderData.tournamentPlayers.map((tp) => (
              <li key={tp.id}>
                <Link to={`/tournaments/${tp.tournament.id}`} viewTransition>
                  {tp.tournament.name}
                </Link>
              </li>
            ))}
          </ol>
        )}

        <Spacer size="lg" />

        <h2 className="text-base font-semibold">Eventos</h2>
        <Spacer size="sm" />
        {loaderData.eventParticipants.length === 0 ? (
          <p className="text-sm opacity-60">Nenhum evento ainda.</p>
        ) : (
          <ol className="list-inside list-decimal text-sm">
            {loaderData.eventParticipants.map((ep) => (
              <li key={ep.id}>
                <Link to={`/events/${ep.event.id}`} viewTransition>
                  {ep.event.name}
                </Link>
                {ep.event.date && (
                  <span className="opacity-60">
                    {' '}
                    —{' '}
                    {new Date(ep.event.date).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </Center>
    </>
  )
}

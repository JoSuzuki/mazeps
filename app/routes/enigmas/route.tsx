import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context }: Route.LoaderArgs) {
  const enigmas =
    context.currentUser?.role === Role.ADMIN
      ? await context.prisma.enigma.findMany({
          include: { _count: { select: { phases: true } } },
          orderBy: { createdAt: 'desc' },
        })
      : []

  return { enigmas, currentUser: context.currentUser }
}

function EmBrevePage() {
  return (
    <>
      <BackButtonPortal to="/" />
      <Center>
        <div className="relative mx-auto max-w-2xl px-6 py-20">
          {/* Efeito de névoa/overlay */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-foreground/5 via-transparent to-foreground/10"
            aria-hidden
          />

          {/* Símbolo enigmático */}
          <div className="mb-12 flex justify-center">
            <div className="relative">
              <span
                className="text-8xl opacity-20"
                aria-hidden
              >
                ?
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full border-2 border-dashed border-foreground/30" />
              </div>
            </div>
          </div>

          {/* Título misterioso */}
          <h1 className="mb-4 text-center font-mono text-2xl font-light uppercase tracking-[0.4em] text-foreground/60">
            Enigmas
          </h1>

          {/* EM BREVE com efeito */}
          <div className="mb-8 text-center">
            <span
              className="inline-block animate-pulse font-mono text-4xl font-bold tracking-[0.5em] text-foreground/90 drop-shadow-sm sm:text-5xl"
              style={{
                textShadow: '0 0 20px rgba(0,0,0,0.1)',
              }}
            >
              EM BREVE
            </span>
          </div>

          {/* Mensagem enigmática */}
          <p className="text-center font-mono text-sm tracking-widest text-foreground/40">
            Os mistérios aguardam...
          </p>
          <p className="mt-2 text-center font-mono text-xs tracking-[0.3em] text-foreground/30">
            Em breve, novos desafios serão revelados
          </p>
        </div>
      </Center>
    </>
  )
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const isAdmin = loaderData.currentUser?.role === Role.ADMIN

  if (!isAdmin) {
    return <EmBrevePage />
  }

  return (
    <>
      <BackButtonPortal to="/" />
      <div className="flex justify-end px-6 py-2">
        <LinkButton styleType="secondary" to="/enigmas/new">
          Criar enigma
        </LinkButton>
      </div>
      <Center>
        <h1 className="flex justify-center text-lg">Enigmas</h1>
        <div className="mt-8 overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 shadow-sm">
          {loaderData.enigmas.length === 0 ? (
            <div className="px-6 py-16 text-center text-foreground/50">
              Nenhum enigma cadastrado ainda.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-foreground/10 bg-foreground/5">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                    Fases
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-foreground/60">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {loaderData.enigmas.map((enigma) => (
                  <tr
                    key={enigma.id}
                    className="transition-colors hover:bg-foreground/5"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/enigmas/${enigma.slug}/comecar`}
                        viewTransition
                        className="font-medium hover:underline"
                      >
                        {enigma.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-foreground/80">
                      {enigma._count.phases}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/enigmas/${enigma.slug}/edit`}
                        viewTransition
                        className="text-sm font-medium hover:underline"
                      >
                        Gerenciar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Center>
    </>
  )
}

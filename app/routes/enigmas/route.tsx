import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import { Role } from '~/generated/prisma/enums'

export async function loader({ context }: Route.LoaderArgs) {
  const isAdmin = context.currentUser?.role === Role.ADMIN

  const enigmas = await context.prisma.enigma.findMany({
    include: { _count: { select: { phases: true } } },
    orderBy: { createdAt: 'desc' },
  })

  // Enigma "publicado" = published=true E tem pelo menos uma fase (jogável)
  const publishedEnigmas = enigmas.filter(
    (e) => e.published && e._count.phases > 0,
  )

  return {
    enigmas: isAdmin ? enigmas : publishedEnigmas,
    hasPublishedEnigmas: publishedEnigmas.length > 0,
    currentUser: context.currentUser,
  }
}

function DoorIcon() {
  return (
    <svg
      className="h-16 w-16 text-foreground/40"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M14 9v6" />
    </svg>
  )
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

function EnigmaDoorCard({
  enigma,
  isAdmin,
}: {
  enigma: { id: number; name: string; slug: string; _count: { phases: number } }
  isAdmin: boolean
}) {
  const phaseCount = enigma._count.phases
  const isPlayable = phaseCount > 0

  return (
    <Link
      to={isPlayable ? `/enigmas/${enigma.slug}/comecar` : '#'}
      viewTransition
      className={`group block ${!isPlayable ? 'pointer-events-none opacity-60' : ''}`}
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-foreground/20 bg-gradient-to-b from-foreground/5 to-foreground/10 p-10 shadow-lg transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 md:p-14">
        {/* Moldura da porta */}
        <div className="absolute inset-3 rounded-xl border border-foreground/10" aria-hidden />

        {/* Maçaneta / elemento central */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-foreground/20 bg-foreground/5 transition-transform duration-300 group-hover:scale-110 group-hover:border-primary/30">
            <DoorIcon />
          </div>
        </div>

        {/* Nome do enigma */}
        <h2 className="mb-6 text-center font-brand text-2xl font-semibold tracking-wide text-foreground/90 group-hover:text-primary md:text-3xl">
          {enigma.name}
        </h2>

        {/* CTA */}
        {isPlayable && (
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-on-primary">
              Entrar
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </div>
        )}

        {!isPlayable && (
          <p className="text-center text-xs text-foreground/40">Em breve</p>
        )}
      </div>
    </Link>
  )
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const isAdmin = loaderData.currentUser?.role === Role.ADMIN
  const isLoggedIn = !!loaderData.currentUser

  // Mostra EM BREVE apenas quando não há enigmas publicados (com fases)
  if (!isAdmin && !loaderData.hasPublishedEnigmas) {
    return <EmBrevePage />
  }

  return (
    <>
      <BackButtonPortal to="/" />
      <Center>
        <div className="relative mx-auto max-w-4xl px-6 py-10">
          {/* Overlay para usuários não logados */}
          {!isLoggedIn && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-foreground/10 backdrop-blur-sm"
              aria-hidden={false}
              role="status"
              aria-live="polite"
            >
              <div className="mx-4 max-w-md rounded-2xl border-2 border-foreground/20 bg-background p-8 text-center shadow-xl">
                <p className="text-lg font-medium text-foreground/90">
                  Para enfrentar o desafio do labirinto favor criar uma conta!
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <LinkButton
                    styleType="primary"
                    to="/sign-up"
                    viewTransition
                    className="py-3"
                  >
                    Criar conta
                  </LinkButton>
                  <Link
                    to="/login"
                    viewTransition
                    className="rounded-lg border border-foreground/20 px-3 py-3 font-medium transition-colors hover:bg-foreground/5"
                  >
                    Já tenho conta
                  </Link>
                </div>
              </div>
            </div>
          )}
          {/* Header */}
          <header className="mb-10 text-center">
            <h1 className="font-brand text-3xl tracking-wide">Enigmas</h1>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-foreground/50">
              ESCOLHA UMA PORTA E SEJA BEM VINDO
            </p>
          </header>

          {isAdmin && (
            <div className="mb-8 flex justify-center">
              <LinkButton
                styleType="primary"
                to="/enigmas/new"
                className="w-full max-w-sm py-4 text-lg font-semibold"
              >
                Criar enigma
              </LinkButton>
            </div>
          )}

          {loaderData.enigmas.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-foreground/20 bg-foreground/5 px-6 py-20 text-center">
              <DoorIcon />
              <p className="mt-4 text-foreground/60">
                {isAdmin
                  ? 'Nenhum enigma cadastrado ainda.'
                  : 'Nenhum enigma disponível.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {loaderData.enigmas.map((enigma) => (
                <div key={enigma.id} className="w-full max-w-md">
                  <EnigmaDoorCard
                    enigma={enigma}
                    isAdmin={isAdmin}
                  />
                </div>
              ))}
            </div>
          )}

          {isAdmin && loaderData.enigmas.length > 0 && (
            <div className="mt-8 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
              <div className="flex flex-wrap justify-center gap-4">
                {loaderData.enigmas.map((enigma) => (
                  <Link
                    key={enigma.id}
                    to={`/enigmas/${enigma.slug}/edit`}
                    viewTransition
                    className="text-base font-semibold text-foreground/60 underline-offset-2 hover:text-foreground/90 hover:underline"
                  >
                    Gerenciar: {enigma.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </Center>
    </>
  )
}

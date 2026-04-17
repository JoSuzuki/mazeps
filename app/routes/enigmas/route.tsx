import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Center from '~/components/center/center.component'
import EnigmasDetectiveFlamingo from '~/components/enigmas-detective-flamingo/enigmas-detective-flamingo.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import {
  EnigmaCardSymbolIcon,
  parseEnigmaCardSymbol,
} from '~/components/enigma-card-symbol/enigma-card-symbol.component'
import { countPublicPlayablePhases } from '~/lib/enigma-public-phases.server'
import { enigmaRobotsMeta } from '~/lib/enigma-robots-meta'
import type { EnigmaCardSymbol } from '~/generated/prisma/enums'
import { Role } from '~/generated/prisma/enums'

export function meta() {
  return [...enigmaRobotsMeta(), { title: 'Enigmas | Mazeps' }]
}

export async function loader({ context }: Route.LoaderArgs) {
  const isAdmin = context.currentUser?.role === Role.ADMIN

  if (!context.currentUser) {
    const publishedCandidates = await context.prisma.enigma.findMany({
      where: { published: true },
      select: {
        published: true,
        publicPhaseOrderFrom: true,
        publicPhaseOrderTo: true,
        phases: { select: { order: true } },
      },
    })
    const hasPublishedEnigmas = publishedCandidates.some(
      (e) =>
        countPublicPlayablePhases(
          e,
          e.phases.map((p) => p.order),
        ) > 0,
    )
    return {
      enigmas: [],
      hasPublishedEnigmas,
      currentUser: null,
      guestGate: true as const,
    }
  }

  const enigmas = await context.prisma.enigma.findMany({
    include: {
      _count: { select: { phases: true } },
      phases: { select: { order: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const publishedEnigmas = enigmas.filter(
    (e) =>
      e.published &&
      countPublicPlayablePhases(
        e,
        e.phases.map((p) => p.order),
      ) > 0,
  )

  return {
    enigmas: isAdmin ? enigmas : publishedEnigmas,
    hasPublishedEnigmas: publishedEnigmas.length > 0,
    currentUser: context.currentUser,
    guestGate: false as const,
  }
}

const ENIGMAS_WHATSAPP_GROUP_URL =
  'https://chat.whatsapp.com/Gybjbjr4RvZEqvh7HO78ec'

const ENIGMAS_INTRO_YOUTUBE_EMBED_ID = 'CRXr48uHaz4'

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

/** Mobile: bloco no fim da página, centrado. Desktop (sm+): fixo no canto inferior direito. */
function EnigmasWhatsAppFloatingInvite() {
  return (
    <a
      href={ENIGMAS_WHATSAPP_GROUP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="relative z-[60] mx-auto mt-10 flex w-full max-w-md flex-row items-center gap-3 rounded-2xl border border-foreground/15 bg-background/95 p-2.5 shadow-xl backdrop-blur-md transition-transform active:scale-[0.99] sm:fixed sm:bottom-6 sm:right-6 sm:mt-0 sm:w-auto sm:max-w-[min(calc(100vw-3rem),17rem)] sm:flex-col sm:items-end sm:gap-2 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none sm:active:scale-100"
      aria-label="Entre no nosso grupo de dicas no WhatsApp (abre numa nova aba)"
    >
      <span className="order-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-md ring-2 ring-on-primary/30 sm:order-2 sm:h-14 sm:w-14 sm:shadow-lg sm:ring-on-primary/35 sm:transition-transform sm:hover:scale-105 sm:active:scale-95">
        <WhatsAppGlyph className="h-7 w-7 sm:h-8 sm:w-8" />
      </span>
      <span className="order-2 min-w-0 flex-1 text-center text-[0.8125rem] font-medium leading-snug text-foreground sm:order-1 sm:w-full sm:rounded-xl sm:border sm:border-foreground/15 sm:bg-background/95 sm:px-3 sm:py-2 sm:text-right sm:text-xs sm:shadow-lg sm:backdrop-blur-md md:text-sm">
        Entre no nosso grupo de dicas!
      </span>
    </a>
  )
}

function DoorIcon({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  const dim =
    size === 'sm' ? 'h-9 w-9 text-foreground/45' : 'h-16 w-16 text-foreground/40'
  return (
    <svg
      className={dim}
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

function EnigmasFlamingoBackdrop() {
  return (
    <EnigmasDetectiveFlamingo className="fixed bottom-3 left-0 z-0 w-[min(24vw,96px)] max-w-[96px] -translate-x-[14%] opacity-75 drop-shadow-[0_6px_16px_rgba(0,0,0,0.12)] sm:bottom-auto sm:top-24 sm:w-[min(92vw,420px)] sm:max-w-[420px] sm:-translate-x-[54%] sm:opacity-[0.94] sm:drop-shadow-[0_12px_32px_rgba(0,0,0,0.16)] md:top-28 md:w-[440px] md:max-w-[440px] md:-translate-x-[52%] lg:w-[480px] lg:max-w-[480px] lg:-translate-x-[50%]" />
  )
}

/** Visitante sem login: decoração atrás do overlay, sem nomes/slugs dos enigmas. */
function GuestMysteryDoorsBackdrop() {
  return (
    <div
      className="flex flex-col items-center gap-8 opacity-[0.38]"
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-full max-w-md rounded-2xl border-2 border-foreground/18 bg-background/85 p-10 shadow-inner md:p-14"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-foreground/20 bg-[color-mix(in_srgb,var(--color-on-background)_10%,var(--color-background))]">
            <span className="text-3xl font-light text-foreground/35">?</span>
          </div>
          <div className="mx-auto h-7 w-4/5 rounded-md bg-foreground/10" />
          <div className="mx-auto mt-3 h-4 w-1/2 rounded bg-foreground/8" />
        </div>
      ))}
    </div>
  )
}

function EmBrevePage() {
  return (
    <>
      <BackButtonPortal to="/" />
      <div className="relative overflow-x-hidden">
        <EnigmasFlamingoBackdrop />
        <Center className="relative z-[1]">
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

          {/* Título */}
          <h1 className="mb-4 text-center font-brand text-4xl font-semibold uppercase tracking-[0.12em] text-foreground drop-shadow-sm sm:text-5xl md:text-6xl">
            Enigmazeps
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

          <EnigmasWhatsAppFloatingInvite />
        </div>
        </Center>
      </div>
    </>
  )
}

function EnigmaDoorCard({
  enigma,
  isAdmin,
}: {
  enigma: {
    id: number
    name: string
    slug: string
    cardSymbol: EnigmaCardSymbol
    _count: { phases: number }
  }
  isAdmin: boolean
}) {
  const phaseCount = enigma._count.phases
  const isPlayable = phaseCount > 0
  const symbol = parseEnigmaCardSymbol(enigma.cardSymbol)

  return (
    <Link
      to={isPlayable ? `/enigmas/${enigma.slug}/entrada` : '#'}
      viewTransition
      className={`group relative z-[2] block ${!isPlayable ? 'pointer-events-none opacity-60' : ''}`}
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-foreground/20 bg-background p-10 shadow-lg transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 md:p-14 md:shadow-xl">
        {/* Moldura da porta */}
        <div className="absolute inset-3 rounded-xl border border-foreground/15" aria-hidden />

        {/* Maçaneta / elemento central */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-foreground/25 bg-[color-mix(in_srgb,var(--color-on-background)_12%,var(--color-background))] transition-transform duration-300 group-hover:scale-110 group-hover:border-primary/30">
            <EnigmaCardSymbolIcon symbol={symbol} />
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

function AdminEnigmaManageList({
  enigmas,
}: {
  enigmas: Array<{
    id: number
    name: string
    slug: string
    published: boolean
    cardSymbol: EnigmaCardSymbol
    _count: { phases: number }
  }>
}) {
  return (
    <section
      className="relative z-[2] mx-auto mt-10 w-full max-w-md"
      aria-labelledby="admin-enigmas-manage-heading"
    >
      <h2
        id="admin-enigmas-manage-heading"
        className="mb-5 text-center font-brand text-xl font-semibold uppercase tracking-[0.16em] text-foreground/60 sm:text-2xl sm:tracking-[0.14em] md:text-3xl"
      >
        Editar enigmas
      </h2>
      <ul className="flex flex-col gap-3">
        {enigmas.map((enigma) => {
          const phases = enigma._count.phases
          const phaseLabel =
            phases === 0
              ? 'Sem fases'
              : phases === 1
                ? '1 fase'
                : `${phases} fases`

          return (
            <li key={enigma.id}>
              <Link
                to={`/enigmas/${enigma.slug}/edit`}
                viewTransition
                className="flex items-stretch gap-3 rounded-2xl border-2 border-foreground/20 bg-background p-3 shadow-md transition-colors hover:border-primary/45 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <div
                  className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-foreground/15 bg-[color-mix(in_srgb,var(--color-on-background)_10%,var(--color-background))]"
                  aria-hidden
                >
                  <EnigmaCardSymbolIcon
                    symbol={parseEnigmaCardSymbol(enigma.cardSymbol)}
                    size="sm"
                  />
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <div className="flex flex-wrap items-center gap-2 gap-y-1">
                    <span className="font-brand text-lg font-semibold leading-tight text-foreground">
                      {enigma.name}
                    </span>
                    {enigma.published ? (
                      <span className="shrink-0 rounded-md border border-foreground/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                        Publicado
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-md border border-foreground/25 bg-[color-mix(in_srgb,var(--color-on-background)_8%,var(--color-background))] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground/75">
                        Rascunho
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-foreground/40">{phaseLabel}</p>
                </div>
                <div className="flex shrink-0 items-center">
                  <span className="rounded-lg bg-primary px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-on-primary sm:px-4 sm:text-sm">
                    Editar
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
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
      <div className="relative overflow-x-hidden">
        <EnigmasFlamingoBackdrop />
        <Center className="relative z-[1]">
        <div className="relative mx-auto max-w-4xl px-6 py-10 md:max-w-5xl lg:max-w-6xl">
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
          <header className="mb-12 text-center sm:mb-14">
            <h1 className="font-brand text-4xl font-semibold uppercase tracking-[0.1em] text-foreground drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl">
              Enigmazeps
            </h1>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.28em] text-foreground/55 sm:text-sm sm:tracking-[0.22em]">
              Escolha uma porta e seja bem-vindo
            </p>
            <p className="mx-auto mt-2.5 max-w-xl text-balance px-2 text-[0.5625rem] font-medium uppercase leading-relaxed tracking-[0.2em] text-foreground/45 sm:text-[0.625rem] sm:tracking-[0.17em] md:text-[0.6875rem] md:tracking-[0.15em]">
              Recomendamos que jogue em um computador para que tenha a melhor experiência
            </p>
          </header>

          <div className="mx-auto mb-10 w-full max-w-3xl">
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-foreground/15 bg-foreground/5 shadow-md">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${ENIGMAS_INTRO_YOUTUBE_EMBED_ID}`}
                title="Vídeo de apresentação — Enigmazeps"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

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

          {loaderData.guestGate ? (
            <GuestMysteryDoorsBackdrop />
          ) : loaderData.enigmas.length === 0 ? (
            <div className="relative z-[2] rounded-2xl border-2 border-dashed border-foreground/20 bg-background px-6 py-20 text-center shadow-lg">
              <DoorIcon />
              <p className="mt-4 text-foreground/60">
                {isAdmin
                  ? 'Nenhum enigma cadastrado ainda.'
                  : 'Nenhum enigma disponível.'}
              </p>
            </div>
          ) : (
            <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-8 md:max-w-none md:grid-cols-2 md:gap-x-6 md:gap-y-8 lg:gap-x-8">
              {loaderData.enigmas.map((enigma, index) => {
                const isLastOdd =
                  index === loaderData.enigmas.length - 1 &&
                  loaderData.enigmas.length % 2 === 1
                return (
                  <div
                    key={enigma.id}
                    className={
                      isLastOdd
                        ? 'min-w-0 md:col-span-2 md:flex md:justify-center'
                        : 'min-w-0'
                    }
                  >
                    <div className={isLastOdd ? 'w-full md:max-w-md' : 'w-full'}>
                      <EnigmaDoorCard
                        enigma={enigma}
                        isAdmin={isAdmin}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {isAdmin && loaderData.enigmas.length > 0 && (
            <AdminEnigmaManageList enigmas={loaderData.enigmas} />
          )}

          <EnigmasWhatsAppFloatingInvite />
        </div>
        </Center>
      </div>
    </>
  )
}

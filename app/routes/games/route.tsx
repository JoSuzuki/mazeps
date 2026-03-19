import type { Route } from './+types/route'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'

const GAMES = [
  {
    slug: 'santorini',
    name: 'Santorini',
    description: 'Jogo de estratégia abstrata inspirado na mitologia grega. Construa e suba em torres para alcançar o terceiro nível.',
    players: '2 jogadores',
    duration: '~15 min',
    href: '/games/santorini/rooms/index',
    icon: (
      <svg
        className="h-10 w-10 text-foreground/70"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
      </svg>
    ),
  },
]

export default function Route({}: Route.ComponentProps) {
  return (
    <>
      <Center>
        <div className="mx-auto max-w-4xl px-6 py-10">
          <header className="mb-8 text-center">
            <h1 className="font-brand text-3xl tracking-wide">Jogos</h1>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-foreground/50">
              Jogue online com a comunidade Mazeps
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GAMES.map((game) => (
              <Link
                key={game.slug}
                to={game.href}
                viewTransition
                className="group flex flex-col rounded-xl border border-foreground/10 bg-background/60 p-5 shadow-sm transition-all hover:border-foreground/20 hover:bg-foreground/5 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-foreground/10 transition-colors group-hover:bg-foreground/15">
                    {game.icon}
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    Online
                  </span>
                </div>
                <h2 className="font-semibold text-foreground/90">{game.name}</h2>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-foreground/60">
                  {game.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-foreground/50">
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-3.5 w-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {game.players}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-3.5 w-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {game.duration}
                  </span>
                </div>
                <span className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-base font-semibold text-on-primary shadow-sm transition-all group-hover:bg-primary/90 group-hover:shadow-md">
                  Jogar
                  <svg
                    className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
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
              </Link>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-foreground/40">
            Mais jogos em breve.
          </p>
        </div>
      </Center>
    </>
  )
}

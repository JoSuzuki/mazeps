import { useEffect, useLayoutEffect } from 'react'
import { Link } from 'react-router'
import type { Route } from './+types/route'
import Board from '~/components/board/board.component'
import HomeThemeHint from '~/components/home-theme-hint/home-theme-hint.component'
import Calendar from '~/components/calendar/calendar.component'
import LinkButton from '~/components/link-button/link-button.component'
import Title from '~/components/title/title.component'
import {
  parseThemeFromCookie,
  tileIdFromTheme,
} from '~/lib/theme-preference'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const theme = parseThemeFromCookie(request.headers.get('Cookie'))
  return {
    initialSelectedTileId: tileIdFromTheme(theme),
  }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  // Home sempre abre no topo (reload, link, etc.) — evita restaurar scroll no meio da página
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      window.scrollTo(0, 0)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <>
      <div className="relative w-full sm:pb-20">
        <HomeThemeHint />
        <div className="mb-4 flex justify-center px-4 sm:mb-6">
          <Title />
        </div>
        <div className="px-2 sm:px-4 md:px-6">
          <Board initialSelectedTileId={loaderData.initialSelectedTileId} />
        </div>
      </div>
      {/* Bloco de frases mais compacto e lado a lado para o calendário aparecer sem scroll */}
      <div className="mt-6 px-4 sm:mt-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 md:grid md:grid-cols-3">
        {/* Frase 1: Instagram */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-lg font-medium">
            Nos acompanhe e fique por dentro dos nossos próximos eventos.
          </p>
          <a
            href="https://www.instagram.com/mazeps.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="border-foreground/15 hover:border-foreground/40 hover:bg-foreground/5 inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            Seguir no Instagram
          </a>
        </div>

        {/* Frase 2: Enigmas */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-lg font-medium">
            Venha se aventurar nos nossos enigmas!
          </p>
          <Link
            to="/enigmas"
            aria-label="Ir para a página de enigmas"
            className="border-foreground/15 hover:border-foreground/40 hover:bg-foreground/5 inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Enigmas
          </Link>
        </div>

          {/* Frase 4: Em breve + YouTube */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2 text-lg text-foreground/70">
              <span aria-hidden="true">⏳</span>
              <span>Em breve...</span>
            </div>
            <a
              href="https://www.youtube.com/@Mazeps-g5s"
              target="_blank"
              rel="noopener noreferrer"
              className="border-foreground/15 hover:border-foreground/40 hover:bg-foreground/5 inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Nosso canal no YouTube
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-5xl px-4 py-6 sm:mt-10 md:py-10">
        <div className="relative">
          <div className="border-foreground/10 bg-foreground/[0.02] relative z-0 overflow-visible rounded-2xl border px-4 py-3 sm:px-6 md:py-2.5 md:pl-8 md:pr-[11.5rem] lg:pr-[12rem]">
            <p className="text-center text-lg font-medium leading-snug sm:text-xl md:max-w-xl md:text-left">
              Gosta do nosso trabalho? Considere nos apoiar!
            </p>
          </div>
          {/* Cobre a borda da caixa na região do círculo (fica atrás do botão, na cor do fundo) */}
          <div
            aria-hidden
            className="bg-background pointer-events-none absolute z-20 hidden rounded-full md:block md:right-4 md:top-1/2 md:h-[10.95rem] md:w-[10.95rem] md:-translate-y-1/2 lg:right-5 lg:h-[11.7rem] lg:w-[11.7rem]"
          />
          <a
            href="https://apoia.se/mazeps"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Apoiar o Mazeps no Apoia.se"
            className="border-primary/45 from-primary/15 to-accent/10 text-foreground ring-background relative z-30 mx-auto mt-4 flex h-32 w-32 flex-col items-center justify-center gap-0.5 rounded-full border-2 bg-gradient-to-br text-center shadow-lg ring-[5px] ring-offset-0 transition-[transform,box-shadow] hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] sm:mt-5 sm:h-36 sm:w-36 md:absolute md:right-4 md:top-1/2 md:mx-0 md:mt-0 md:h-[10.25rem] md:w-[10.25rem] md:-translate-y-1/2 lg:right-5 lg:h-44 lg:w-44"
          >
            <span className="font-brand text-xl tracking-wide sm:text-2xl md:text-[1.5rem] lg:text-[1.65rem]">
              Apoie
            </span>
            <span className="text-foreground/65 text-[0.6rem] font-semibold uppercase tracking-[0.2em] sm:text-[0.65rem]">
              Apoia.se
            </span>
          </a>
        </div>
      </div>

      <Calendar />
      <div className="mt-8 flex justify-center px-4 sm:mt-10">
        <LinkButton to="/mazeps" className="font-brand w-full max-w-xs py-3 text-xl tracking-wide sm:w-96 sm:text-2xl">
          Sobre Nós
        </LinkButton>
      </div>
      <div className="mx-auto mt-10 max-w-2xl px-4 pb-6 sm:mt-12 sm:px-6">
        {/* Frase 3: acima do Spotify */}
        <p className="mb-4 text-center text-lg text-foreground/80">
          Ouça nossos podcasts e faça parte dessa comunidade.
        </p>
        <iframe
          src="https://open.spotify.com/embed/show/4F5XP0krLmZIWJWxO2hftL?utm_source=generator&theme=0"
          width="100%"
          height="232"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl"
        />
        <p className="mt-8 text-center text-xs text-foreground/50">
          Mazeps® - Seu Labirinto Lúdico - 2026
        </p>
      </div>
    </>
  )
}

import { useEffect, useLayoutEffect } from 'react'
import type { Route } from './+types/route'
import Board from '~/components/board/board.component'
import Calendar from '~/components/calendar/calendar.component'
import LinkButton from '~/components/link-button/link-button.component'
import Title from '~/components/title/title.component'

export default function Route({}: Route.ComponentProps) {
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
      <div className="mb-4 flex justify-center px-4 sm:mb-6">
        <Title />
      </div>
      <div className="px-2 sm:px-4 md:px-6">
        <Board />
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

        {/* Frase 2: WhatsApp (texto atual reaproveitado) */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-foreground/70 text-lg">
            Fique sabendo dos nossos eventos e novidades!
          </p>
          <a
            href="https://chat.whatsapp.com/KEZlqLuSiYwAPMYDWYL7g3"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Entrar no grupo do WhatsApp"
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
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
            Grupo no WhatsApp
          </a>
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

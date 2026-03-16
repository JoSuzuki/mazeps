import type { Route } from './+types/route'
import Board from '~/components/board/board.component'
import Calendar from '~/components/calendar/calendar.component'
import LinkButton from '~/components/link-button/link-button.component'
import Title from '~/components/title/title.component'

export default function Route({}: Route.ComponentProps) {
  return (
    <>
      <div className="mb-2 flex justify-center">
        <Title />
      </div>
      <Board />
      {/* Bloco de frases mais compacto e lado a lado para o calendário aparecer sem scroll */}
      <div className="mt-8 px-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 md:grid md:grid-cols-3">
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
      <Calendar />
      <div className="mt-8 flex justify-center">
        <LinkButton to="/mazeps" className="font-brand w-96 py-3 text-2xl tracking-wide">
          Sobre Nós
        </LinkButton>
      </div>
      <div className="mx-auto mt-12 max-w-2xl px-6 pb-12">
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
      </div>
    </>
  )
}

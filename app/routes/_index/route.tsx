import type { Route } from './+types/route'
import Board from '~/components/board/board.component'
import Calendar from '~/components/calendar/calendar.component'
import LinkButton from '~/components/link-button/link-button.component'
import PhotoScroller from '~/components/photo-scroller/photo-scroller.component'
import Title from '~/components/title/title.component'

export default function Route({}: Route.ComponentProps) {
  return (
    <>
      <div className="mb-2 flex justify-center">
        <Title />
      </div>
      <Board />
      <PhotoScroller />
      <Calendar />
      <div className="mt-6 flex items-center justify-center gap-3">
        <p className="text-foreground/70 text-sm">Fique sabendo dos nossos eventos e novidades!</p>
        <a
          href="https://chat.whatsapp.com/KEZlqLuSiYwAPMYDWYL7g3"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Entrar no grupo do WhatsApp"
          className="text-foreground/70 hover:text-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
        </a>
      </div>
      <div className="mt-8 flex justify-center">
        <LinkButton to="/mazeps" className="font-brand w-96 py-3 text-2xl tracking-wide">
          Sobre Nós
        </LinkButton>
      </div>
      <div className="mx-auto mt-12 max-w-2xl px-6 pb-12">
        <iframe
          src="https://open.spotify.com/embed/show/4F5XP0krLmZIWJWxO2hftL?utm_source=generator&theme=0"
          width="100%"
          height="232"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl"
        />
        <div className="mt-6 flex justify-center gap-4 pb-12">
          <a
            href="https://www.instagram.com/mazeps.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="border-foreground/15 hover:border-foreground/40 hover:bg-foreground/5 flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            Instagram
          </a>
          <a
            href="https://www.youtube.com/@Mazeps-g5s"
            target="_blank"
            rel="noopener noreferrer"
            className="border-foreground/15 hover:border-foreground/40 hover:bg-foreground/5 flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube
          </a>
          <a
            href="https://open.spotify.com/show/4F5XP0krLmZIWJWxO2hftL"
            target="_blank"
            rel="noopener noreferrer"
            className="border-foreground/15 hover:border-foreground/40 hover:bg-foreground/5 flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 1 1-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 0 1 .207.857zm1.223-2.722a.78.78 0 0 1-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 0 1-.434-1.494c3.632-1.057 8.147-.545 11.215 1.331a.78.78 0 0 1 .256 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 1 1-.543-1.794c3.527-1.07 9.386-.863 13.088 1.329a.937.937 0 0 1-.928 1.622z" />
            </svg>
            Spotify
          </a>
        </div>
      </div>
    </>
  )
}

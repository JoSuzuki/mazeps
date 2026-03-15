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

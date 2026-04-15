import { useEffect } from 'react'
import EnigmasDetectiveFlamingo from '~/components/enigmas-detective-flamingo/enigmas-detective-flamingo.component'
import Link from '~/components/link/link.component'

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Página não encontrada | Mazeps'
  }, [])

  return (
    <main className="min-h-[min(100dvh,900px)] w-full px-6 py-8 sm:px-10 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-8">
        <div className="max-w-xl shrink-0 text-left">
          <h1 className="font-brand text-4xl font-semibold tracking-wide text-foreground sm:text-5xl">
            ERRO 404
          </h1>
          <p className="mt-3 text-lg font-medium text-foreground/85 sm:text-xl">
            Essa página não existe!
          </p>
          <div className="mt-5 min-w-0 w-full overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
            <p className="whitespace-nowrap text-base text-foreground/70 sm:text-[1.05rem]">
              Você não estava tentando chutar os enigmas né?
            </p>
          </div>
          <div className="mt-8 w-full max-w-sm rounded-2xl border-2 border-primary bg-primary/10 p-4 shadow-lg shadow-primary/25 ring-2 ring-primary/30 dark:bg-primary/[0.14] dark:ring-primary/40">
            <Link
              to="/"
              className="flex w-full items-center justify-center rounded-xl bg-primary py-4 font-brand text-xl font-bold uppercase tracking-[0.2em] text-on-primary shadow-md transition sm:text-2xl hover:!no-underline hover:brightness-105 active:scale-[0.99] active:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              VOLTAR
            </Link>
          </div>
        </div>

        <div
          className="relative mx-auto flex w-full max-w-[min(100%,340px)] shrink-0 justify-center md:mx-0 md:ml-auto md:max-w-[400px] md:justify-end"
          aria-hidden
        >
          <div className="relative w-full">
            <div className="pointer-events-none absolute -top-1 left-[62%] z-10 flex items-start gap-1 sm:left-[64%] sm:gap-1.5">
              <span className="not-found-q-mark font-brand text-[4rem] font-bold leading-none text-primary/90 drop-shadow-sm sm:text-[4.75rem] md:text-[5.25rem]">
                ?
              </span>
              <span className="not-found-q-mark not-found-q-mark--delay-1 mt-5 font-brand text-[3.25rem] font-bold leading-none text-primary/78 drop-shadow-sm sm:mt-6 sm:text-[3.85rem] md:text-[4.25rem]">
                ?
              </span>
              <span className="not-found-q-mark not-found-q-mark--delay-2 mt-2 font-brand text-[2.85rem] font-bold leading-none text-primary/68 drop-shadow-sm sm:text-[3.35rem] md:text-[3.75rem]">
                ?
              </span>
            </div>
            <EnigmasDetectiveFlamingo
              variant="plain"
              className="w-full scale-x-[-1] opacity-[0.92] drop-shadow-lg"
            />
          </div>
        </div>
      </div>
    </main>
  )
}

import { useState } from 'react'
import { redirect } from 'react-router'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Center from '~/components/center/center.component'
import EnigmasDetectiveFlamingo from '~/components/enigmas-detective-flamingo/enigmas-detective-flamingo.component'
import HallDaFamaNovoCaminhoGrid from '~/components/hall-da-fama-novo-caminho-grid/hall-da-fama-novo-caminho-grid.component'
import { HALL_DA_FAMA_NOVO_CAMINHO } from '~/lib/hall-da-fama-novo-caminho'
import { enigmaRobotsMeta } from '~/lib/enigma-robots-meta'

export function meta() {
  return [...enigmaRobotsMeta(), { title: 'Hall da Fama | Enigmazeps | Mazeps' }]
}

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')
  return null
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function Route() {
  const [novoCaminhoOpen, setNovoCaminhoOpen] = useState(false)

  return (
    <>
      <BackButtonPortal to="/enigmas" />
      <div className="relative overflow-x-hidden">
        <EnigmasDetectiveFlamingo className="fixed bottom-3 left-0 z-0 w-[min(24vw,96px)] max-w-[96px] -translate-x-[14%] opacity-75 drop-shadow-[0_6px_16px_rgba(0,0,0,0.12)] sm:bottom-auto sm:top-24 sm:w-[min(92vw,420px)] sm:max-w-[420px] sm:-translate-x-[54%] sm:opacity-[0.94] sm:drop-shadow-[0_12px_32px_rgba(0,0,0,0.16)] md:top-28 md:w-[440px] md:max-w-[440px] md:-translate-x-[52%] lg:w-[480px] lg:max-w-[480px] lg:-translate-x-[50%]" />
        <Center className="relative z-[1]">
          <div className="relative mx-auto max-w-3xl px-6 py-10 md:max-w-4xl">
            <header className="mb-6 text-center sm:mb-8">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 text-primary sm:h-24 sm:w-24">
                  <TrophyIcon className="h-10 w-10 sm:h-12 sm:w-12" />
                </div>
              </div>
              <h1 className="font-brand text-5xl font-semibold uppercase tracking-[0.08em] text-foreground drop-shadow-sm sm:text-6xl md:text-7xl lg:text-8xl">
                Hall da Fama
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-sm font-medium uppercase leading-relaxed tracking-[0.18em] text-foreground/55 sm:text-base sm:tracking-[0.14em] md:text-lg">
                Veja aqui os Investigadores vitoriosos do Enigmazeps
              </p>
            </header>

            <div className="relative z-[2] mt-6 sm:mt-8">
              <div className="flex items-center justify-center gap-3">
                <span className="font-brand text-xl font-semibold uppercase tracking-[0.12em] text-foreground sm:text-2xl">
                  Um Novo Caminho
                </span>
                <button
                  type="button"
                  onClick={() => setNovoCaminhoOpen((open) => !open)}
                  aria-expanded={novoCaminhoOpen}
                  aria-controls="hall-da-fama-novo-caminho-panel"
                  aria-label={
                    novoCaminhoOpen
                      ? 'Recolher menu Um Novo Caminho'
                      : 'Expandir menu Um Novo Caminho'
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground/20 bg-background text-foreground shadow-md transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95"
                >
                  <ChevronDownIcon
                    className={`h-5 w-5 transition-transform duration-300 ${novoCaminhoOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>

              <div
                id="hall-da-fama-novo-caminho-panel"
                hidden={!novoCaminhoOpen}
              >
                <div className="mt-6 rounded-2xl border-2 border-foreground/20 bg-background px-6 pb-6 pt-12 shadow-lg sm:px-8 sm:pb-8 sm:pt-14">
                  <HallDaFamaNovoCaminhoGrid entries={HALL_DA_FAMA_NOVO_CAMINHO} />
                </div>
              </div>
            </div>
          </div>
        </Center>
      </div>
    </>
  )
}

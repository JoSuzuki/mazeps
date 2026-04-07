import { useId } from 'react'

/**
 * Decoração só visual na home: seta tracejada com laço, apontando para o tabuleiro de temas.
 */
export default function HomeThemeHint() {
  const markerId = useId().replace(/:/g, '')

  return (
    <div
      className="text-primary pointer-events-none absolute top-[6.25rem] right-[max(0.5rem,calc(50%-17rem))] z-10 hidden w-[min(13.5rem,calc(100%-1.25rem))] flex-col items-end sm:flex sm:top-28 sm:right-[max(0.75rem,calc(50%-21rem))] sm:w-[14rem] md:top-32 md:right-[max(0.5rem,calc(50%-25rem))]"
      aria-hidden="true"
    >
      <div className="border-foreground/10 mb-0.5 max-w-[13rem] rounded-xl border bg-white px-2.5 py-2 text-center text-[0.65rem] leading-snug font-normal tracking-normal text-neutral-900 shadow-sm sm:max-w-none sm:px-3 sm:text-xs">
        Escolha seu visual favorito!
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 160 200"
        className="text-primary h-[12.5rem] w-full shrink-0 sm:h-[14rem]"
        fill="none"
      >
        <defs>
          <marker
            id={`home-theme-arrow-${markerId}`}
            markerUnits="userSpaceOnUse"
            markerWidth="11"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
          >
            <path d="M0 0 L9 5 L0 10 Z" fill="currentColor" />
          </marker>
        </defs>
        {/* Termina em segmento horizontal para a esquerda (ponta mais “deitada”) */}
        <path
          d="M 118 6
             C 128 38 142 58 132 80
             C 122 102 96 104 86 86
             C 76 68 96 54 108 70
             C 120 86 112 112 88 128
             C 64 144 42 156 26 162
             L 4 162"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="5.5 9"
          markerEnd={`url(#home-theme-arrow-${markerId})`}
        />
      </svg>
    </div>
  )
}

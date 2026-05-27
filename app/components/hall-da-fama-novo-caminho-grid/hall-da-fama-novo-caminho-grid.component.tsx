import type { HallDaFamaNovoCaminhoEntry } from '~/lib/hall-da-fama-novo-caminho'

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M2 19h20v2H2v-2zm1.2-9.2 2.3 1.4L8 4.5 12 10l4-5.5 2.5 6.7 2.3-1.4L19 19H5L3.2 9.8zM7.4 17h9.2l.8-4.2-2.4 1.5L12 11.8l-3 2.5-2.4-1.5.8 4.2z" />
    </svg>
  )
}

function NovoCaminhoPortrait({ entry }: { entry: HallDaFamaNovoCaminhoEntry }) {
  const frame = entry.frame ?? 'default'

  const photoClassName = [
    'h-full w-full object-cover',
    entry.photoPosition ?? '',
    entry.photoScale ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  const portraitSize = 'h-32 w-32 sm:h-40 sm:w-40'

  const photo = (
    <img
      src={entry.photo}
      alt={entry.name}
      className={photoClassName}
      loading="lazy"
    />
  )

  let portraitFrame: React.ReactNode

  if (frame === 'champion') {
    portraitFrame = (
      <div
        className={`hall-da-fama-champion-ring ${portraitSize} rounded-full p-[3px] shadow-[0_0_18px_rgba(242,142,122,0.45)]`}
      >
        <div className="h-full w-full overflow-hidden rounded-full bg-background">
          {photo}
        </div>
      </div>
    )
  } else if (frame === 'flamingo') {
    portraitFrame = (
      <div
        className={`hall-da-fama-flamingo-ring ${portraitSize} rounded-full p-[3px]`}
      >
        <div className="h-full w-full overflow-hidden rounded-full bg-background">
          {photo}
        </div>
      </div>
    )
  } else {
    portraitFrame = (
      <div
        className={`ring-foreground/10 ${portraitSize} overflow-hidden rounded-full ring-2`}
      >
        {photo}
      </div>
    )
  }

  return (
    <li className="flex w-[9.5rem] shrink-0 flex-col items-center text-center sm:w-[11rem]">
      <div className="relative mb-3 inline-flex flex-col items-center">
        {frame === 'champion' ? (
          <CrownIcon className="hall-da-fama-champion-crown pointer-events-none absolute bottom-full left-1/2 mb-1.5 h-7 w-7 -translate-x-1/2 sm:h-8 sm:w-8" />
        ) : null}
        {portraitFrame}
      </div>

      <p className="max-w-full text-base font-semibold leading-snug">{entry.name}</p>
    </li>
  )
}

export default function HallDaFamaNovoCaminhoGrid({
  entries,
}: {
  entries: HallDaFamaNovoCaminhoEntry[]
}) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-sm text-foreground/50">
        Nenhum investigador cadastrado ainda.
      </p>
    )
  }

  return (
    <ul className="flex flex-wrap items-start justify-center gap-x-8 gap-y-10 sm:gap-x-10">
      {entries.map((entry) => (
        <NovoCaminhoPortrait key={`${entry.name}-${entry.photo}`} entry={entry} />
      ))}
    </ul>
  )
}

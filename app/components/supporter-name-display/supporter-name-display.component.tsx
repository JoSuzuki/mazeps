/**
 * Nome do usuário com destaque quando for Apoiador: brilho suave no texto + estrela.
 */
function SupporterStarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

export default function SupporterNameDisplay({
  name,
  isSupporter,
  className,
  nameClassName,
  title,
}: {
  name: string
  isSupporter: boolean
  /** Classes no wrapper (ex.: alinhamento, line-clamp no flex pai) */
  className?: string
  /** Classes só no texto do nome */
  nameClassName?: string
  title?: string
}) {
  const t = title ?? name

  if (!isSupporter) {
    return (
      <span className={className} title={t}>
        <span className={nameClassName}>{name}</span>
      </span>
    )
  }

  return (
    <span
      className={`inline-flex min-w-0 max-w-full items-center gap-1 ${className ?? ''}`}
      title={t}
    >
      <span className={`supporter-name-glow min-w-0 ${nameClassName ?? ''}`}>
        {name}
      </span>
      <SupporterStarIcon className="supporter-star-icon h-[1em] min-h-3.5 w-[1em] min-w-3.5 shrink-0" />
      <span className="sr-only">(Apoiador)</span>
    </span>
  )
}

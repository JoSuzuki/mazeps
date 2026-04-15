import { useEffect, useRef } from 'react'

function AlertOctagonIcon({ className }: { className?: string }) {
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
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}

/** Aviso de erro no editor de fase: destaque forte e scroll até ficar visível no topo. */
export default function EnigmaPhaseEditorErrorBanner({
  message,
}: {
  message: string | undefined
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(() => {
      const el = ref.current
      if (!el) return
      el.focus({ preventScroll: true })
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
    return () => window.clearTimeout(t)
  }, [message])

  if (!message) return null

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className="mb-6 scroll-mt-6 outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex gap-4 rounded-xl border-2 border-red-600 bg-red-50 px-5 py-4 shadow-[0_0_0_1px_rgba(220,38,38,0.15),0_12px_40px_-12px_rgba(185,28,28,0.45)] dark:border-red-500 dark:bg-red-950/90 dark:shadow-[0_0_0_1px_rgba(248,113,113,0.2),0_12px_40px_-12px_rgba(0,0,0,0.5)]">
        <AlertOctagonIcon className="mt-0.5 h-7 w-7 shrink-0 text-red-600 dark:text-red-400" />
        <p className="min-w-0 text-base leading-snug font-semibold text-red-900 dark:text-red-50">
          {message}
        </p>
      </div>
    </div>
  )
}

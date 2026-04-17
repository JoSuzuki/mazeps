import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import Spacer from '~/components/spacer/spacer.component'

const BALLOON_COLORS = [
  '#ff6b6b',
  '#4ecdc4',
  '#ffe66d',
  '#95e1d3',
  '#f38181',
  '#aa96da',
  '#fcbad3',
]

function Balloon({ delay, left, color }: { delay: number; left: number; color: string }) {
  return (
    <div
      className="absolute bottom-0 opacity-80"
      style={{
        left: `${left}%`,
        animation: `balloon-rise 8s ease-in-out ${delay}s infinite`,
      }}
    >
      <div
        className="relative h-12 w-10 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}dd, ${color})`,
          boxShadow: 'inset -3px -3px 6px rgba(0,0,0,0.1)',
        }}
      >
        <div
          className="absolute -bottom-2 left-1/2 h-4 w-0.5 -translate-x-1/2 rotate-45"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

export default function ParabensCelebration({
  enigmaName,
  customBody,
}: {
  enigmaName: string
  /** Se definido, substitui o parágrafo padrão abaixo do título (várias linhas). */
  customBody?: string | null
}) {
  const hasFired = useRef(false)
  const [showAnimations, setShowAnimations] = useState<boolean | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setShowAnimations(!mq.matches)
  }, [])

  useEffect(() => {
    if (hasFired.current) return
    hasFired.current = true

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da'],
    })

    const bursts = [
      { delay: 200, origin: { x: 0.2, y: 0.8 }, angle: 60 },
      { delay: 400, origin: { x: 0.8, y: 0.8 }, angle: 120 },
      { delay: 600, origin: { x: 0.5, y: 0.7 }, angle: 90 },
    ]

    const timers = bursts.map(({ delay, origin, angle }) =>
      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 55,
          angle,
          origin,
          colors: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181'],
        })
      }, delay),
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <>
      <BackButtonPortal to="/enigmas" />
      <div className="relative min-h-[60vh] overflow-hidden">
      <style>{`
        @keyframes balloon-rise {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.8;
          }
          10% {
            opacity: 0.9;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) translateX(20px) rotate(10deg);
            opacity: 0;
          }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {showAnimations &&
        BALLOON_COLORS.map((color, i) => (
          <Balloon
            key={i}
            color={color}
            delay={i * 1.2}
            left={10 + i * 14}
          />
        ))}

      <Center>
        <div className="relative z-10 text-center">
          <div className="animate-[fade-in_0.6s_ease-out]">
            <h1 className="font-brand text-4xl font-bold tracking-wide text-foreground/95 sm:text-5xl">
              Parabéns! 🎉
            </h1>
          </div>
          <Spacer size="lg" />
          <p
            className="animate-[fade-in_0.6s_ease-out_0.2s_both] whitespace-pre-line text-lg text-foreground/80 sm:text-xl"
            style={{ animationFillMode: 'both' }}
          >
            {customBody?.trim() ? (
              customBody.trim()
            ) : (
              <>
                Você completou o enigma{' '}
                <strong className="font-semibold text-foreground/95">
                  {enigmaName}
                </strong>
                !
              </>
            )}
          </p>
          <Spacer size="lg" />
          <Link
            to="/enigmas"
            viewTransition
            className="animate-[fade-in_0.6s_ease-out_0.4s_both] inline-flex items-center gap-2 rounded-xl border-2 border-primary bg-primary/10 px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary/20"
            style={{ animationFillMode: 'both' }}
          >
            ← Ver todos os enigmas
          </Link>
        </div>
      </Center>
    </div>
    </>
  )
}

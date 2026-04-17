import goldenMascotImg from '~/assets/images/golden-mascot.png'

interface GoldenMascotProps {
  show: boolean
}

/**
 * Peão-fénix — PNG completo após trim/redimensionar (sem cortar o desenho).
 * Arte: `golden-mascot.source.png` · `npm run assets:golden-mascot`
 */
export default function GoldenMascot({ show }: GoldenMascotProps) {
  if (!show) return null

  return (
    <img
      src={goldenMascotImg}
      alt=""
      width={100}
      height={200}
      aria-hidden
      className="pointer-events-none block h-auto w-[100px] max-w-none origin-bottom scale-[1.25] bg-transparent object-contain object-center select-none"
      decoding="async"
    />
  )
}

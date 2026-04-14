import type { EnigmaCardSymbol } from '~/generated/prisma/enums'
import { EnigmaCardSymbol as EnigmaCardSymbolValues } from '~/generated/prisma/enums'

const ALL_SYMBOLS = Object.values(EnigmaCardSymbolValues)

export function parseEnigmaCardSymbol(raw: string | null | undefined): EnigmaCardSymbol {
  if (raw != null && ALL_SYMBOLS.includes(raw as EnigmaCardSymbol)) {
    return raw as EnigmaCardSymbol
  }
  return EnigmaCardSymbolValues.DOOR
}

export const ENIGMA_CARD_SYMBOL_OPTIONS: ReadonlyArray<{
  value: EnigmaCardSymbol
  label: string
}> = [
  { value: EnigmaCardSymbolValues.DOOR, label: 'Porta' },
  { value: EnigmaCardSymbolValues.KEY, label: 'Chave' },
  { value: EnigmaCardSymbolValues.LOCK, label: 'Cadeado' },
  { value: EnigmaCardSymbolValues.EYE, label: 'Olho' },
  { value: EnigmaCardSymbolValues.MOON, label: 'Lua' },
  { value: EnigmaCardSymbolValues.SCROLL, label: 'Pergaminho' },
  { value: EnigmaCardSymbolValues.MAGNIFYING_GLASS, label: 'Lupa' },
  { value: EnigmaCardSymbolValues.QUESTION_MARK, label: 'Interrogação' },
  { value: EnigmaCardSymbolValues.COMPASS, label: 'Bússola' },
  { value: EnigmaCardSymbolValues.CRYSTAL_BALL, label: 'Bola de cristal' },
]

function dimClass(size: 'lg' | 'sm') {
  return size === 'sm' ? 'h-9 w-9 text-foreground/45' : 'h-16 w-16 text-foreground/40'
}

export function EnigmaCardSymbolIcon({
  symbol,
  size = 'lg',
}: {
  symbol: EnigmaCardSymbol
  size?: 'lg' | 'sm'
}) {
  const c = dimClass(size)
  const stroke = size === 'sm' ? '1.75' : '1.5'

  switch (symbol) {
    case EnigmaCardSymbolValues.KEY:
      return (
        <svg
          className={c}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="7.5" cy="15.5" r="5.5" />
          <path d="m21 2-9.6 9.6" />
          <path d="m15.5 7.5 3 3L22 7l-3-3" />
        </svg>
      )
    case EnigmaCardSymbolValues.LOCK:
      return (
        <svg
          className={c}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    case EnigmaCardSymbolValues.EYE:
      return (
        <svg
          className={c}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case EnigmaCardSymbolValues.MOON:
      return (
        <svg
          className={c}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 3a6.5 6.5 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )
    case EnigmaCardSymbolValues.SCROLL:
      return (
        <svg
          className={c}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M8 21h8a2 2 0 0 0 2-2v-9H8v11Z" />
          <path d="M6 3h12v7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2" />
          <path d="M10 7h4" />
          <path d="M10 11h4" />
        </svg>
      )
    case EnigmaCardSymbolValues.MAGNIFYING_GLASS:
      return (
        <svg
          className={c}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      )
    case EnigmaCardSymbolValues.QUESTION_MARK:
      return (
        <svg
          className={c}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 2-3 4" />
          <path d="M12 17h.01" />
        </svg>
      )
    case EnigmaCardSymbolValues.COMPASS:
      return (
        <svg
          className={c}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m16.2 7.8-2.3 6.1a2 2 0 0 1-1.1 1.1l-6.1 2.3 2.3-6.1a2 2 0 0 1 1.1-1.1z" />
        </svg>
      )
    case EnigmaCardSymbolValues.CRYSTAL_BALL:
      return (
        <svg
          className={c}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 3a7 7 0 1 0 0 12 7 7 0 0 0 0-12Z" />
          <path d="M12 15v6" />
          <path d="M8 21h8" />
          <path d="M10 7h.01M14 7h.01M12 11h.01" />
        </svg>
      )
    case EnigmaCardSymbolValues.DOOR:
    default:
      return (
        <svg
          className={c}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 21h18" />
          <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
          <path d="M14 9v6" />
        </svg>
      )
  }
}

import type { ReactNode } from 'react'

import type { EnigmaCardSymbol } from '~/generated/prisma/enums'

import {
  ENIGMA_CARD_SYMBOL_OPTIONS,
  EnigmaCardSymbolIcon,
} from './enigma-card-symbol.component'

export function EnigmaCardSymbolFormField({
  defaultSymbol,
  helperText,
}: {
  defaultSymbol: EnigmaCardSymbol
  helperText?: ReactNode
}) {
  return (
    <fieldset
      id="enigma-card-symbol-fieldset"
      className="rounded-xl border-2 border-foreground/20 bg-foreground/[0.02] p-4 shadow-sm"
    >
      <legend className="px-1 font-brand text-sm font-semibold uppercase tracking-[0.12em] text-foreground/70 sm:text-base">
        Símbolo do cartão
      </legend>
      {helperText ? (
        <p className="mb-4 mt-2 text-sm text-foreground/55">{helperText}</p>
      ) : null}
      <div
        className={`grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5${helperText ? '' : ' mt-2'}`}
      >
        {ENIGMA_CARD_SYMBOL_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-foreground/20 bg-background px-2 py-3 text-center transition-colors hover:border-foreground/30 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-within]:ring-2 has-[:focus-within]:ring-primary/40"
          >
            <input
              type="radio"
              name="cardSymbol"
              value={opt.value}
              defaultChecked={opt.value === defaultSymbol}
              className="sr-only"
            />
            <EnigmaCardSymbolIcon symbol={opt.value} size="sm" />
            <span className="text-[11px] font-medium leading-tight text-foreground/80 sm:text-xs">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

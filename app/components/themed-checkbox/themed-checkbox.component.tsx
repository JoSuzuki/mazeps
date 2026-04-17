import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

const VISUAL = {
  sm: {
    wrap: 'h-4 w-4',
    input: 'h-4 w-4',
    icon: 'left-0.5 top-0.5 h-3 w-3',
    stroke: 3.2,
  },
  md: {
    wrap: 'h-5 w-5',
    input: 'h-5 w-5',
    icon: 'left-[3px] top-[3px] h-3.5 w-3.5',
    stroke: 3,
  },
  lg: {
    wrap: 'h-6 w-6',
    input: 'h-6 w-6',
    icon: 'left-1 top-1 h-4 w-4',
    stroke: 2.8,
  },
} as const

export type ThemedCheckboxVisualSize = keyof typeof VISUAL

export type ThemedCheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'className' | 'size'
> & {
  /** Tamanho da caixa (não confundir com o atributo HTML `size`). */
  visualSize?: ThemedCheckboxVisualSize
  /** Classes no wrapper externo (ex.: `mt-0.5`). */
  wrapperClassName?: string
}

/**
 * Checkbox nativo com aparência alinhada às skins (tokens `primary` / `on-primary`),
 * igual à newsletter no perfil.
 */
const ThemedCheckbox = forwardRef<HTMLInputElement, ThemedCheckboxProps>(
  function ThemedCheckbox(
    { visualSize = 'sm', wrapperClassName, disabled, ...rest },
    ref,
  ) {
    const v = VISUAL[visualSize]
    return (
      <span
        className={`relative inline-flex shrink-0 ${v.wrap} ${wrapperClassName ?? ''}`}
      >
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className={`peer ${v.input} cursor-pointer appearance-none rounded border-2 border-primary/55 bg-primary/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] transition-colors checked:border-primary checked:bg-primary hover:border-primary/70 hover:bg-primary/25 checked:hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          {...rest}
        />
        <svg
          className={`pointer-events-none absolute text-on-primary opacity-0 transition-opacity peer-checked:opacity-100 ${v.icon}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={v.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>
    )
  },
)

export default ThemedCheckbox

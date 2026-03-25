interface RadioGroupProps {
  name: string
  label: string
  required: boolean
  defaultValue?: string
  options: {
    id: string
    label: string
    value: string
  }[]
  onValueChange?: (value: string) => void
}

const chipLabelClass =
  'flex min-h-[3rem] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-primary/25 bg-primary/[0.07] px-3 py-3 text-center text-sm font-medium text-on-background/85 shadow-none transition-all hover:border-primary/50 hover:bg-primary/12 has-[:checked]:border-primary has-[:checked]:bg-primary/25 has-[:checked]:text-primary has-[:checked]:shadow-[0_1px_12px_-4px_var(--color-primary)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background'

/** Classes para botões (ex.: picker de tipo em mídias adicionais), espelhando o RadioGroup. */
export function mediaTypeChipClassName(selected: boolean): string {
  const base =
    'flex min-h-[3rem] flex-col items-center justify-center rounded-xl border-2 px-3 py-3 text-center text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
  return selected
    ? `${base} border-primary bg-primary/25 text-primary shadow-[0_1px_12px_-4px_var(--color-primary)]`
    : `${base} border-primary/25 bg-primary/[0.07] text-on-background/85 hover:border-primary/50 hover:bg-primary/12`
}

const RadioGroup = ({
  label,
  name,
  required,
  defaultValue,
  options,
  onValueChange,
}: RadioGroupProps): React.ReactElement => {
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
        {label}
        {required ? (
          <span className="ml-0.5 text-error" aria-hidden>
            *
          </span>
        ) : null}
      </legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((option, index) => {
          const id = `${name}-${option.id}`
          return (
            <label key={id} htmlFor={id} className={chipLabelClass}>
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                className="sr-only"
                defaultChecked={defaultValue === option.value}
                required={required && index === 0}
                onChange={() => onValueChange?.(option.value)}
              />
              {option.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export default RadioGroup

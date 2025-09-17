interface NumberInputProps {
  id: string
  name: string
  label: string
  required: boolean
  defaultValue?: number | string | null
  step: number
  min: number
}

const NumberInput = ({
  id,
  label,
  name,
  required,
  defaultValue,
  step,
  min,
}: NumberInputProps): React.ReactElement => {
  return (
    <>
      <label className="block" htmlFor={id}>
        {label}
      </label>
      <input
        className="w-full rounded-md border-1 p-1"
        id={id}
        type="number"
        min={min}
        step={step}
        name={name}
        required={required}
        defaultValue={defaultValue ?? undefined}
      />
    </>
  )
}

export default NumberInput

interface TextInputProps {
  id: string
  name: string
  label: string
  type: React.HTMLInputTypeAttribute
  required: boolean
  defaultValue?: string | null
  placeholder?: string
  autoComplete?: 'current-password' | 'new-password'
}

const TextInput = ({
  id,
  label,
  name,
  type,
  required,
  autoComplete,
  defaultValue,
  placeholder,
}: TextInputProps): React.ReactElement => {
  return (
    <>
      <label className="block" htmlFor={id}>
        {label}
      </label>
      <input
        className="w-full rounded-md border-1 p-1"
        id={id}
        type={type}
        name={name}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
      />
    </>
  )
}

export default TextInput

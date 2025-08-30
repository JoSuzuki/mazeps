interface TextInputProps {
  id: string;
  name: string;
  label: string;
  type: React.HTMLInputTypeAttribute;
  required: boolean;
  defaultValue?: string | null;
  autoComplete?: "current-password";
}

const TextInput = ({ id, label, name, type, required, autoComplete, defaultValue }: TextInputProps): React.ReactElement => {
  return <>
    <label className="block" htmlFor={id}>{label}</label>
    <input className="border-1 w-full rounded-md p-1" id={id} type={type} name={name} required={required} autoComplete={autoComplete} defaultValue={defaultValue ?? undefined} />
  </>
}

export default TextInput;
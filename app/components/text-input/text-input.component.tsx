interface TextInputProps {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  autoComplete?: "current-password";
}

const TextInput = ({ id, label, name, type, required, autoComplete }: TextInputProps): React.ReactElement => {
  return <>
    <label className="block" htmlFor={id}>{label}</label>
    <input className="border-1 w-full rounded-md p-1" id={id} type={type} name={name} required={required} autoComplete={autoComplete} />
  </>
}

export default TextInput;
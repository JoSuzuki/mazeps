const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>): React.ReactElement => {
  return <button {...props} className={`bg-primary text-on-primary p-2 rounded-md ${props.className}`} />
}

export default Button
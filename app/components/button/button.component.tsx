interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  styleType?: keyof typeof MAP_CLASSES
}

const MAP_CLASSES = {
  primary: 'bg-primary text-on-primary',
  secondary: 'bg-secondary text-on-secondary border border-on-secondary',
}

const Button = (props: ButtonProps): React.ReactElement => {
  const { styleType = 'primary', ...buttonProps } = props
  return (
    <button
      {...buttonProps}
      className={`${MAP_CLASSES[styleType]} active:pressed rounded-md p-2 hover:cursor-pointer ${props.className ?? ''}`}
    />
  )
}

export default Button

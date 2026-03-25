import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  styleType?: keyof typeof MAP_CLASSES
}

const MAP_CLASSES = {
  primary: 'bg-primary text-on-primary',
  secondary: 'bg-secondary text-on-secondary border border-on-secondary',
  invisible: '',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { styleType = 'primary', type = 'button', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${MAP_CLASSES[styleType]} rounded-md p-2 hover:cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] motion-reduce:transform-none ${className ?? ''}`}
      {...rest}
    />
  )
})

export default Button

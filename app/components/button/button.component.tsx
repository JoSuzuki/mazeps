import { motion } from 'motion/react'
import type { HTMLMotionProps } from 'motion/react'

interface ButtonProps extends HTMLMotionProps<'button'> {
  styleType?: keyof typeof MAP_CLASSES
}

const MAP_CLASSES = {
  primary: 'bg-primary text-on-primary',
  secondary: 'bg-secondary text-on-secondary border border-on-secondary',
  invisible: '',
}

const Button = (props: ButtonProps): React.ReactElement => {
  const { styleType = 'primary', ...buttonProps } = props
  return (
    <motion.button
      {...buttonProps}
      className={`${MAP_CLASSES[styleType]} rounded-md p-2 hover:cursor-pointer ${props.className ?? ''}`}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
    />
  )
}

export default Button

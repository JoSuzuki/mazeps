import { motion } from 'motion/react'
import { Link as ReactRouterLink } from 'react-router'
import type { LinkProps as ReactRouterLinkProps } from 'react-router'

interface LinkProps extends ReactRouterLinkProps {
  styleType?: 'default' | 'solid'
}

const MAP_CLASSES = {
  default: '',
  solid: 'bg-primary text-on-primary rounded-md p-0.5',
}

const BaseLink = (props: LinkProps): React.ReactElement => {
  const { styleType = 'default', ...linkProps } = props
  return (
    <ReactRouterLink
      {...linkProps}
      className={`active:pressed hover:underline ${MAP_CLASSES[styleType]} ${props.className ?? ''}`}
    />
  )
}

const Link = motion.create(BaseLink);

export default Link

import { forwardRef } from 'react'
import { Link as ReactRouterLink } from 'react-router'
import type { LinkProps as ReactRouterLinkProps } from 'react-router'

interface LinkProps extends ReactRouterLinkProps {
  styleType?: 'default' | 'solid'
}

const MAP_CLASSES = {
  default: '',
  solid: 'bg-primary text-on-primary rounded-md p-0.5',
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  props,
  ref,
) {
  const { styleType = 'default', className, ...linkProps } = props
  return (
    <ReactRouterLink
      ref={ref}
      {...linkProps}
      className={`active:pressed hover:underline ${MAP_CLASSES[styleType]} ${className ?? ''}`}
    />
  )
})

export default Link

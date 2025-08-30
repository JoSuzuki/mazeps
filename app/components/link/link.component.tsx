import { Link as ReactRouterLink } from 'react-router'
import type { LinkProps } from 'react-router'

const Link = (props: LinkProps): React.ReactElement => {
  return (
    <ReactRouterLink
      {...props}
      className={`active:pressed hover:underline ${props.className}`}
    />
  )
}

export default Link

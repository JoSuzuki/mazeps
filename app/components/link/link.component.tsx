import { Link as ReactRouterLink, type LinkProps } from "react-router"

const Link = (props: LinkProps): React.ReactElement => {
  return <ReactRouterLink {...props} className={`hover:underline active:pressed ${props.className}`} />
}

export default Link
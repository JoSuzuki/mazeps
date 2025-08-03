import { Link as ReactRouterLink, type LinkProps } from "react-router"

const Link = (props: LinkProps): React.ReactElement => {
  return <ReactRouterLink {...props} className={`hover:underline ${props.className}`} />
}

export default Link
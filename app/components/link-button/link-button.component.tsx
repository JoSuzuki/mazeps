import { Link, type LinkProps as ReactLinkProps } from "react-router"

interface LinkProps extends ReactLinkProps {
  type?: "primary" | "secondary"
}

const MAP_CLASSES = {
  "primary": "bg-primary text-on-primary",
  "secondary": "bg-secondary text-on-secondary border border-on-secondary"
}

const LinkButton = (props: LinkProps): React.ReactElement => {
  const { type = "primary", ...linkProps } = props;

  return <Link {...linkProps} className={`${MAP_CLASSES[type]} p-2 rounded-md text-center active:pressed ${linkProps.className}`} />
}

export default LinkButton
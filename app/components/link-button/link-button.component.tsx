import { Link } from 'react-router'
import type { LinkProps as ReactLinkProps } from 'react-router'

interface LinkProps extends ReactLinkProps {
	styleType?: 'primary' | 'secondary'
}

const MAP_CLASSES = {
	primary: 'bg-primary text-on-primary',
	secondary: 'bg-secondary text-on-secondary border border-on-secondary',
}

const LinkButton = (props: LinkProps): React.ReactElement => {
	const { styleType = 'primary', ...linkProps } = props

	return (
		<Link
			{...linkProps}
			className={`${MAP_CLASSES[styleType]} active:pressed rounded-md p-2 text-center ${linkProps.className}`}
		/>
	)
}

export default LinkButton

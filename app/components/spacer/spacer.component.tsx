interface SpacerProps {
	size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	type?: 'vertical' | 'horizontal'
}

const MAP_TYPE_SIZE = {
	vertical: {
		xs: 'h-1',
		sm: 'h-2',
		md: 'h-4',
		lg: 'h-8',
		xl: 'h-16',
	},
	horizontal: {
		xs: 'w-1',
		sm: 'w-2',
		md: 'w-4',
		lg: 'w-8',
		xl: 'w-16',
	},
}

const Spacer = ({
	size = 'md',
	type = 'vertical',
}: SpacerProps): React.ReactElement => {
	return <div className={MAP_TYPE_SIZE[type][size]} />
}

export default Spacer

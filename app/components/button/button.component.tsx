const Button = (
	props: React.ButtonHTMLAttributes<HTMLButtonElement>,
): React.ReactElement => {
	return (
		<button
			{...props}
			className={`bg-primary text-on-primary active:pressed rounded-md p-2 hover:cursor-pointer ${props.className}`}
		/>
	)
}

export default Button

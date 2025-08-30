interface TextInputProps {
	name: string
	label: string
	required: boolean
	defaultValue?: string
	options: {
		id: string
		label: string
		value: string
	}[]
}

const RadioGroup = ({
	label,
	name,
	required,
	defaultValue,
	options,
}: TextInputProps): React.ReactElement => {
	return (
		<fieldset>
			<legend>{label}</legend>
			{options.map((option) => {
				const id = `${name}-${option.id}`
				return (
					<div key={id}>
						<input
							type="radio"
							id={id}
							name={name}
							value={option.value}
							defaultChecked={defaultValue === option.value}
							required={required}
						/>
						<label htmlFor={id}>{option.label}</label>
					</div>
				)
			})}
		</fieldset>
	)
}

export default RadioGroup

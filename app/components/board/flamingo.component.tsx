import { AnimatePresence, motion } from 'motion/react'
import type { Variants } from 'motion/react'

const draw: Variants = {
	hidden: {
		pathLength: 0,
		opacity: 0,
		stroke: 'var(--item-color)',
		fill: 'rgba(0,0,0,0)',
	},
	visible: (i: number) => {
		const delay = i * 0.1125
		return {
			pathLength: 1,
			opacity: 1,
			fill: 'var(--item-color)',
			transition: {
				pathLength: { delay, type: 'spring', duration: 0.5, bounce: 0 },
				opacity: { delay, duration: 0.01 },
				fill: { delay: delay + 0.5, duration: 1 },
			},
		}
	},
	hide: {
		pathLength: 0,
		opacity: 1,
		fill: 'rgba(0,0,0,0)',
		transition: {
			pathLength: { delay: 0.5, type: 'spring', duration: 0.5, bounce: 0 },
			fill: { duration: 0.5 },
		},
	},
}

interface FlamingoProps {
	show: boolean
}

const Flamingo = ({ show }: FlamingoProps) => {
	return (
		<AnimatePresence>
			{show && (
				<motion.svg
					width="100px"
					id="flamingo"
					data-name="flamingo"
					viewBox="-1 -1 334.56 546.5"
					initial="hidden"
					animate="visible"
					exit="hide"
				>
					<motion.path
						custom={2}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={2}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-flamingo-body)',
							} as React.CSSProperties
						}
						d="M330.23,83c-3.38-30.48-52.47-49.12-52.47-49.12C277.76,33.88,267.61.01,230.36,0c-37.25-.01-62.66,32.15-62.67,66.01-.01,33.86,20.3,52.5,44,69.44,23.7,16.94,49.09,30.49,49.08,57.58,0,22.01-10.17,23.7-16.94,23.7-6.77,0-16.93-10.16-25.39-23.71-8.46-13.55-31.31-39.8-77.03-39.82-33.86-.01-60.96,6.75-104.99,49.07C3.46,233.95,0,269.14,0,269.14c0,0,5.08-10.16,28.79-15.23,0,0-11.86,16.93-11.86,35.55,0,0,22.02-23.7,40.64-23.69,18.63,0,20.32,6.78,45.71,15.25,18.49,6.17,39.69,18.61,71.42,17.09,1.51,3.27,4.5,8.48,8.99,10.73l-.05,142.23s-16.94,28.78-37.26,44.01c-11.86,10.16-11.86,13.54-11.86,18.62,0,4.96,8.08,27.67,54.17,28.75v.05c.58,0,1.13-.02,1.69-.03.57,0,1.11.03,1.69.03v-.05c46.09-1.05,54.19-23.76,54.19-28.71,0-5.08,0-8.47-11.85-18.63-20.31-15.25-37.24-44.04-37.24-44.04l.05-142.23c4.9-2.45,11.57-12.78,14.88-18.31.96-.33,1.92-.65,2.9-1,55.88-20.3,71.13-35.53,79.6-54.16,8.47-18.62,7.64-55.03-5.9-75.35-13.54-20.32-42.32-42.34-59.24-52.51-16.93-10.16-25.39-25.41-21.15-43.18,0,0,6.77,10.16,18.62,11.86,10.16,1.7,18.63-1.69,23.71-1.69s11.85,0,16.93,1.7c5.08,1.69,42.32,18.64,42.31,50.81,0,0,23.71-13.54,20.33-44.02Z"
					/>
					<motion.path
						custom={3}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={2}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-flamingo-body-shadow)',
							} as React.CSSProperties
						}
						d="M234.43,495.11c-.74-.56-1.48-1.14-2.21-1.73-26.74,40.31-75.93,29.11-97.56,21.63,1.2,6.76,11.21,26.43,54.03,27.44v.05c.58,0,1.13-.02,1.69-.03.57,0,1.11.03,1.69.03v-.05c46.09-1.05,54.19-23.76,54.19-28.71,0-5.08,0-8.47-11.85-18.63Z"
					/>
					<motion.path
						custom={3}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={2}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-flamingo-body-shadow)',
							} as React.CSSProperties
						}
						d="M294.63,235.37c4.61-10.13,6.45-25.52,5.01-40.72-1.78,5.02-4.24,11.24-7.63,18.86-12.33,27.72-33.91,43.12-63.18,52.36-29.27,9.23-54.13,32.24-54.13,32.24,1.51,3.27,4.5,8.48,8.99,10.73v15.43c.07.06.14.13.21.19,4.84,3.83,11.17,1.36,13.33.33v-15.95c4.9-2.45,11.57-12.78,14.89-18.31.96-.33,1.92-.65,2.9-1,55.88-20.3,71.13-35.53,79.6-54.16Z"
					/>
					<motion.path
						custom={3}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={2}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-flamingo-body-shadow)',
							} as React.CSSProperties
						}
						d="M28.79,253.91s-11.86,16.93-11.86,35.55c0,0,22.02-23.7,40.64-23.69,18.63,0,20.32,6.78,45.71,15.25,5.74,1.92,11.74,4.43,18.23,6.95,91.67-42.71,76.53-80.66,76.53-80.66-43.16,80.09-107.85,50.8-107.85,50.8-1.54-12.32,13.87-23.1,13.87-23.1-27.73-4.63-57,9.22-57,9.22-6.16-10.79,18.5-30.8,18.5-30.8C20.88,221.13,0,269.14,0,269.14c0,0,5.08-10.16,28.79-15.23Z"
					/>
					<motion.path
						custom={3}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={2}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-flamingo-body-shadow)',
							} as React.CSSProperties
						}
						d="M208.33,64.33s-5.62-6.44-7.16-15.68c0,0-24.14,36.91,28.46,58.96-.05-.03-.1-.06-.15-.09-16.93-10.16-25.39-25.41-21.15-43.18Z"
					/>
					<motion.path
						custom={0}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={2}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-flamingo-beak-tip)',
							} as React.CSSProperties
						}
						d="M330.23,83c-.89-8.07-5-15.31-10.54-21.6-.09-.09-.14-.14-.14-.14-9.75,4.66-18.07,14.98-18.07,14.98l6.25,37.7c1.36,4.04,2.17,8.39,2.17,13.07,0,0,23.71-13.54,20.33-44.02Z"
					/>
					<motion.path
						custom={0}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={2}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-flamingo-beak-tip-dark)',
							} as React.CSSProperties
						}
						d="M301.48,76.24h0s0,0,0,0c-5.57,7.95-8.67,14.42-9.14,15.42,9.3,8.4,17.59,20.19,17.59,35.38,7.3-38.26-8.45-50.8-8.45-50.8Z"
					/>
					<motion.path
						custom={1}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={2}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-flamingo-beak)',
							} as React.CSSProperties
						}
						d="M260.85,54.22c23.7,5.09,40.63,22.02,40.63,22.02,7.75-8.91,15.66-13.84,18.07-14.98-15.42-17.34-41.76-27.36-41.76-27.36-10.16,3.38-16.94,20.31-16.94,20.31Z"
					/>
					<motion.path
						custom={1}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={2}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-flamingo-beak-dark)',
							} as React.CSSProperties
						}
						d="M260.85,54.22h0s-4.38,10.4-5.67,20.43c4.61.04,8.21.29,12.42,1.7,2.68.89,14.31,6.03,24.7,15.41.29-.62,3.41-7.27,9.18-15.51h0s-16.93-16.94-40.63-22.02Z"
					/>
					<motion.circle
						custom={3}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={2}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-flamingo-eye)',
							} as React.CSSProperties
						}
						cx="239.46"
						cy="38.96"
						r="8.16"
					/>
				</motion.svg>
			)}
		</AnimatePresence>
	)
}

export default Flamingo

import { AnimatePresence, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import type React from 'react'

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

interface PegasusProps {
	show: boolean
}

const Pegasus = ({ show }: PegasusProps) => {
	return (
		<AnimatePresence>
			{show && (
				<motion.svg
					width="200px"
					id="pegasus"
					data-name="pegasus"
					viewBox="0 0 227.05 220.8"
					initial="hidden"
					animate="visible"
					exit="hide"
				>
					<motion.path
						custom={0}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={1}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-pegasus-body)',
							} as React.CSSProperties
						}
						d="M 0 0 s 48.8 32.98 93.72 17.68 c 0 0 0 52.57 41.1 51.61 c 0 0 -7.21 -17.86 1.91 -31.54 c 3.82 -5.73 5.73 -9.56 19.12 -19.12 c 13.38 -9.56 22.94 -7.65 30.59 -3.82 c 0 0 -5.73 0.96 -9.56 4.78 c 0 0 8.6 1.91 14.34 14.34 s 4.78 12.43 13.38 17.2 c 8.6 4.78 6.69 10.51 2.87 16.25 c -3.82 5.73 -9.56 6.69 -13.38 4.78 c -3.82 -1.91 -3.82 -3.82 -7.65 -5.73 c -3.82 -1.91 -9.56 -3.82 -16.25 -5.73 c -6.69 -1.91 -14.34 -10.51 -11.47 -20.07 c 0 0 -8.12 8.12 5.26 21.51 c 0 0 0.48 6.21 3.35 10.04 c 2.87 3.82 9.56 15.29 11.47 20.07 c 3.82 9.56 8.6 24.85 8.6 36.32 c 0 9.61 -4.86 20.07 -14.86 24.37 h -30.39 s -12.09 -7.17 -13.05 -11.95 c 0 0 12.43 -16.25 11.47 -31.54 c -0.96 -15.29 -2.87 -25.81 -2.87 -25.81 c 0 0 -7.65 19.12 -29.63 19.12 s -25.81 -5.73 -25.81 -5.73 c 0 0 4.78 0.96 15.29 -3.82 c 0 0 -25.81 -2.87 -36.32 -11.47 c 0 0 7.65 0.96 18.16 -3.82 c 0 0 -32.5 -4.78 -41.1 -17.2 c 0 0 13.38 4.78 26.76 -0.96 c 0 0 -39.19 -6.69 -50.66 -25.81 c 0 0 22.94 9.56 43.97 7.65 C 58.35 41.58 5.79 25.33 0 0 Z"
					/>
					<motion.circle
						custom={1}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={1}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-pegasus-eye)',
							} as React.CSSProperties
						}
						cx="179.74"
						cy="37.75"
						r="4.3"
					/>
					<motion.path
						custom={1}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={1}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-pegasus-hair)',
							} as React.CSSProperties
						}
						d="M119.05,106.09s7.65-2.87,12.43-7.65c0,0-.48,17.68-11.95,30.11,0,0,7.17,2.39,13.86-7.17,0,0,.96,4.78-7.65,14.34,0,0-4.78,4.78-12.9,4.3,0,0,1.91-.96,3.82-7.65,0,0-4.78,1.91-9.56,0,0,0,9.08-4.3,11.95-26.28"
					/>
					<motion.path
						custom={1}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={1}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-pegasus-hair)',
							} as React.CSSProperties
						}
						d="M117.14,61.17l.48-5.26h-5.01s5.97-6.69,5.97-9.56c0,0-4.78,3.82-7.65,1.91,0,0,4.78-1.91,9.56-12.43,4.78-10.51,12.43-15.29,16.25-15.29,0,0-1.91-2.87-6.69-1.91,0,0,6.69-7.65,18.16-7.65,8.6,0,11.47.96,11.47.96,0,0-14.34,4.78-20.07,9.56h4.78s-8.6,4.78-13.38,10.51-8.6,10.51-10.51,11.47c0,0,6.69-1.91,8.6-1.91,0,0-5.73,8.6-8.6,10.51,0,0,3.82,0,5.73-1.91,0,0-2.39,5.26,1.43,14.81,0,0-4.78,0-10.51-3.82Z"
					/>
					<motion.path
						custom={1}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={1}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-pegasus-ear)',
							} as React.CSSProperties
						}
						d="M165.52,18.01s4.89-4.04,11.84-3.67c0,0-2.73.61-5.82,4.26,0,0-2.08-.51-6.02-.59Z"
					/>
					<motion.path
						custom={2}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={1}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-pegasus-wing-shadow)',
							} as React.CSSProperties
						}
						d="M38.28,23.42s24.85,11.47,44.92,6.69c0,0-4.78,23.9,43.01,46.83,0,0-42.06-8.6-49.7-39.19,0,0-28.67-5.73-38.23-14.34Z"
					/>
					<motion.path
						custom={2}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={1}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-pegasus-feet)',
							} as React.CSSProperties
						}
						d="M151.07,111.35s7.65,11.47,8.6,34.41c0,0,11.47-18.16,1.91-53.52,0,0,16.25,22.94,8.6,62.13,0,0,3.82,2.87,8.6,8.6,0,0-20.07,16.25-45.88,1.91,0,0,3.82-6.69,14.34-14.34,0,0,7.65-10.51,3.82-39.19Z"
					/>
					<motion.path
						custom={2}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={1}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-pegasus-feet)',
							} as React.CSSProperties
						}
						d="M121.44,176.35s3.82-5.73,6.69-7.65c0,0,29.63,14.34,55.44-1.91,0,0,2.28,1.91,3.53,4.78,0,0-22.64,33.45-65.66,4.78Z"
					/>
					<motion.path
						custom={2}
						initial="hidden"
						animate="visible"
						exit="hide"
						strokeWidth={1}
						variants={draw}
						style={
							{
								'--item-color': 'var(--color-pegasus-feet)',
							} as React.CSSProperties
						}
						d="M124.38,187.96s14.27,7.5,34.34,5.59c20.07-1.91,33.45-12.43,33.45-12.43,0,0-6.62,19.31-33.9,20.17-27.28.86-33.9-13.33-33.9-13.33Z"
					/>
				</motion.svg>
			)}
		</AnimatePresence>
	)
}

export default Pegasus

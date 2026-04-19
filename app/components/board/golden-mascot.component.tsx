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

interface GoldenMascotProps {
  show: boolean
}

/**
 * Peão-fénix — SVG com animação de traço ao selecionar (mesmo padrão flamingo/pegasus).
 * Arte fonte: `app/assets/svgs/fenix.svg`
 */
export default function GoldenMascot({ show }: GoldenMascotProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.svg
          width="100px"
          id="fenix"
          data-name="fenix"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 453.79 759"
          aria-hidden
          className="pointer-events-none block h-auto max-w-none origin-bottom scale-[1.2] select-none"
          initial="hidden"
          animate="visible"
          exit="hide"
        >
          <motion.path
            custom={0}
            initial="hidden"
            animate="visible"
            exit="hide"
            strokeWidth={2}
            variants={draw}
            style={
              {
                '--item-color': 'var(--color-fenix-dark)',
              } as React.CSSProperties
            }
            d="M447,332s11-5,5-39-35-33-35-33c0,0,2-29-33-44s-64-13-70-54c0,0-17,5.85,0,51.93,0,0-9,4.07-20-25.93,0,0-11,10,7,40,0,0-17,14-16,33s7,41,29,57,24,27,22,29-6,7-18,3-17-9-40-8-47,18-53,21-29,11-29-10v-94s3-17,17-17,19,20,21,39c0,0,22-9,22-33s-25-37-30-49-51-89,2-199c0,0-57,42-62,112,0,0-24-20-28-46,0,0-17,45-5,84,0,0-39-30-47-60,0,0-11,75,23,107,0,0-38,14-83-36,0,0,1,55,55,92,0,0-47,8-81-21,0,0,18,60,83,82,0,0-32,10-69-8,0,0,91,112,171,114,0,0,60,55-61,135,0,0,44-7,87-31,0,0-34,46-60,58,0,0,69-21,139-69l.5,126.5s1.5,13.5-20.5,34.5-37,33-37,45,25,40,69,40,65.5-29.5,65.5-38.5c0-8.06-6-16-16.5-26.5-8.63-8.63-39.5-34.5-39.5-54.5,0-11.18.5-144.5.5-144.5,0,0,73.5-60.5,78.5-104.5,3.98-35-5.5-67.5-45.5-95.5,0,0,23,4,56-4,0,0,34,1,46,41Z"
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
                '--item-color': 'var(--color-fenix-mid)',
              } as React.CSSProperties
            }
            d="M151,582c105.5-36.5,132.5-97.5,132.5-97.5-37,20-52,21-52,21,20-24,27-45,27-45-32,40-134.5,94.5-134.5,94.5,0,0,44-7,87-31,0,0-34,46-60,58Z"
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
                '--item-color': 'var(--color-fenix-mid)',
              } as React.CSSProperties
            }
            d="M367.5,720.5c0-8.06-6-16-16.5-26.5-8.63-8.63-39.5-34.5-39.5-54.5,0-11.18.5-144.5.5-144.5l-22,18,.5,126.5s1.5,13.5-20.5,34.5-37,33-37,45,25,40,69,40,65.5-29.5,65.5-38.5Z"
          />
          <motion.path
            custom={2}
            initial="hidden"
            animate="visible"
            exit="hide"
            strokeWidth={2}
            variants={draw}
            style={
              {
                '--item-color': 'var(--color-fenix-dark)',
              } as React.CSSProperties
            }
            d="M302,759c44,0,65.5-29.5,65.5-38.5,0-5.01-2.32-9.97-6.59-15.52-32.4,46.22-112.05,36.3-112.94,36.19,11.72,9.51,30.04,17.83,54.03,17.83Z"
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
                '--item-color': 'var(--color-fenix-accent)',
              } as React.CSSProperties
            }
            d="M151,582c50.5-23.5,72.5-67.5,72.5-67.5-29,15-99.5,40.5-99.5,40.5,0,0,44-7,87-31,0,0-34,46-60,58Z"
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
                '--item-color': 'var(--color-fenix-mid)',
              } as React.CSSProperties
            }
            d="M166,112s-24-20-28-46c0,0-17,45-5,84,0,0-39-30-47-60,0,0-11,75,23,107,0,0-38,14-83-36,0,0,1,55,55,92,0,0-47,8-81-21,0,0,18,60,83,82,0,0-32,10-69-8,0,0,91,112,171,114-56.5-25.5-69.5-56.5-69.5-56.5,36,11,53-11,53-11-34-4-64-39-64-39,12-2,44-29,44-29-29,2-42-27-42-27,28,4,51-11,51-11-32-11-33-38-33-38,16,12,37,1,37,1-13-13-17-41-17-41,12,19,40,21,40,21-10-23-9-37-9-37,12,22,32,30,32,30C157.5,79.5,228,0,228,0c0,0-57,42-62,112Z"
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
                '--item-color': 'var(--color-fenix-accent)',
              } as React.CSSProperties
            }
            d="M166,112s-24-20-28-46c0,0-17,45-5,84,0,0-39-30-47-60,0,0-11,75,23,107,0,0-38,14-83-36,0,0,1,55,55,92,0,0-47,8-81-21,0,0,18,60,83,82,0,0-32,10-69-8,0,0,91,112,171,114-96.5-37.5-141.5-95.5-141.5-95.5,39,2,49-11,49-11-54-33-63-54-63-54,42,9,64-5,64-5-33-32-48-61-48-61,51,23,71,5,71,5-23-38-23-74-23-74,8,25,48,36,48,36-11-35-2-64-2-64,23,36,32,42,32,42C175.5,53.5,228,0,228,0c0,0-57,42-62,112Z"
          />
          <motion.path
            custom={2}
            initial="hidden"
            animate="visible"
            exit="hide"
            strokeWidth={2}
            variants={draw}
            style={
              {
                '--item-color': 'var(--color-fenix-mid)',
              } as React.CSSProperties
            }
            d="M314,213.93s-9,4.07-20-25.93c7.5,57.5,51.5,65.5,41.5,57.5s-15-25-15-25c10,12,19,9,19,9-25-25-25.5-67.5-25.5-67.5,0,0-17,5.85,0,51.93Z"
          />
          <motion.path
            custom={2}
            initial="hidden"
            animate="visible"
            exit="hide"
            strokeWidth={2}
            variants={draw}
            style={
              {
                '--item-color': 'var(--color-fenix-mid)',
              } as React.CSSProperties
            }
            d="M447,332s11-5,5-39-35-33-35-33c0,0-17.5,15.5-16,31,0,0,34,1,46,41Z"
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
                '--item-color': 'var(--color-fenix-accent)',
              } as React.CSSProperties
            }
            d="M405.85,273.62c.14.04,50.64,13.94,41.15,58.38,0,0,11-5,5-39s-35-33-35-33c0,0-6.42,5.69-11.15,13.62Z"
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
                '--item-color': 'var(--color-fenix-accent)',
              } as React.CSSProperties
            }
            cx={369}
            cy={247}
            r={9.5}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  )
}

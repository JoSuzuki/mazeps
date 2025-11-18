import { AnimatePresence, motion } from 'motion/react'
import { type ReactNode, useRef, useState } from 'react'
import Button from '~/components/button/button.component'
import CloseIcon from '~/components/icons/close-icon.component'
import MenuIcon from '~/components/icons/menu-icon.component'
import useOutsideClick from '~/services/use-outside-click'
import useTrapFocus from '~/services/use-trap-focus'

interface MenuNavigationProps {
  className?: string;
  children: (closeMenu: () => void) => ReactNode
}

export default function MenuNavigation({ children, className }: MenuNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const openMenu = () => {
    setIsMenuOpen(true)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    menuButtonRef.current?.focus()
  }

  useTrapFocus(dialogRef, isMenuOpen)
  useOutsideClick(dialogRef, closeMenu, isMenuOpen)

  return (
    <>
      <Button
        ref={menuButtonRef}
        layoutId="menu-morph"
        styleType="secondary"
        aria-label="Menu"
        onClick={openMenu}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        className={className}
      >
        <MenuIcon />
      </Button>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.dialog
            ref={dialogRef}
            open
            layoutId="menu-morph"
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
            exit={{
              opacity: 0,
              filter: 'blur(8px)',
            }}
            className="border-on-secondary bg-background text-on-background absolute top-4 right-4 left-auto flex flex-col rounded-md border py-2 z-1"
          >
            <Button
              styleType="invisible"
              className="ml-auto w-fit sr-only"
              onClick={closeMenu}
            >
              <CloseIcon />
            </Button>
            {children(closeMenu)}
          </motion.dialog>
        )}
      </AnimatePresence>
    </>
  )
}

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import ChevronLeftIcon from '~/components/icons/chevron-left-icon.component'
import Link from '~/components/link/link.component'
export const BACK_PORTAL_CONTAINER_ID = 'back-portal-container'

export const BackButtonPortalContainer = () => {
  return <div id={BACK_PORTAL_CONTAINER_ID} className="empty:hidden" />
}

const BackButtonPortal = ({
  to,
  viewTransition = true,
}: {
  to: string
  viewTransition?: boolean
}) => {
  let [container, setContainer] = useState<HTMLElement | null>(null)
  useEffect(() => {
    setContainer(
      window.document.getElementById(BACK_PORTAL_CONTAINER_ID) as HTMLElement,
    )
  }, [])

  if (!container) {
    return null
  }

  return createPortal(
    <Link
      to={to}
      className="flex hover:shadow-[inset_0px_-1px_0px_0px_currentColor]"
      {...(viewTransition && { viewTransition })}
    >
      <ChevronLeftIcon />
    </Link>,
    container,
  )
}

export default BackButtonPortal

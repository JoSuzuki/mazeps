import { type RefObject, useEffect, useRef } from 'react'

const useOutsideClick = <T extends Element>(
  ref: RefObject<T | null>,
  callback: () => void,
  isActive: boolean = true
) => {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!isActive) return

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callbackRef.current()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, isActive])
}

export default useOutsideClick

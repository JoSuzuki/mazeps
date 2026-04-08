import { useEffect, useState } from 'react'
import { Outlet, redirect } from 'react-router'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Center from '~/components/center/center.component'
import Spacer from '~/components/spacer/spacer.component'
import { SocketContext } from '~/services/socket-context'

export const loader = async ({ context }: Route.LoaderArgs) => {
  if (!context.currentUser) return redirect('/login')
  return { currentUser: context.currentUser }
}

export default function Route({}: Route.ComponentProps) {
  const [contextSocket, setSocket] = useState<Socket | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const socket = io()
    setSocket(socket)
    socket.on('connect', () => setError(null))
    socket.on('connect_error', (err) => setError(err.message))
    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <>
      <BackButtonPortal to="/games" />
      <Center className="flex flex-col items-center pb-8">
        <h1 className="flex justify-center text-lg">Duo Regna</h1>
        <Spacer size="lg" />
        <div className="relative w-full max-w-2xl rounded-md border p-3">
          {error && <div className="p-4 text-center text-sm text-red-600">{error}</div>}
          {!error && !contextSocket && (
            <div className="py-10 text-center text-sm text-foreground/60">Carregando…</div>
          )}
          {!error && contextSocket && (
            <SocketContext value={contextSocket}>
              <Outlet />
            </SocketContext>
          )}
        </div>
      </Center>
    </>
  )
}

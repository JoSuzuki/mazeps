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

    socket.on('connect', () => {
      console.log('Connected to server')
    })

    socket.on('connect_error', (error) => {
      setError(error.message)
    })

    socket.on('disconnect', (reason, description) => {
      console.log('Disconnected from server', reason, description)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  console.log('contextSocket', contextSocket)
  return (
    <>
      <BackButtonPortal to="/games" />
      <Center className="flex flex-col pb-8">
        <h1 className="flex justify-center text-lg">Santorini</h1>
        <Spacer size="lg" />
        <div className="h-full rounded-md border">
          {error && <div>{error}</div>}
          {!error && !contextSocket && <div>Carregando...</div>}
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

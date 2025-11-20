import { redirect } from 'react-router'
import type { Route } from './+types/route'
import Center from '~/components/center/center.component'
import Spacer from '~/components/spacer/spacer.component'
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import Button from '~/components/button/button.component'

export const loader = async ({ context }: Route.LoaderArgs) => {
  if (!context.currentUser) { return redirect('/login') }

  return { currentUser: context.currentUser }
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  useEffect(() => {
    const socket = io();
    setSocket(socket)

    socket.on('connect', () => {
      console.log('Connected to server')
    })

    socket.on('connect_error', (error) => {
      console.log('Error', error)
    })

    socket.on('disconnect', (reason, description) => {
      console.log('Disconnected from server', reason, description)
    })

    return () => {
      socket.disconnect()
    }
  }, [])


  if (!socket) {
    return null
  }

  return (
    <>
      <Center>
        <h1 className="flex justify-center text-lg">Santorini</h1>
        <Spacer size="lg" />
        <Button onClick={() => socket.emit('test')}>Send event</Button>
      </Center>
    </>
  )
}

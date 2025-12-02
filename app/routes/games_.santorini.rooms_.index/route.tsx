import { useEffect } from 'react'
import { data, Form, redirect, useFetcher, useRevalidator } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Table from '~/components/table/table.component'
import { SantoriniRoomStatus } from '~/generated/prisma/enums'
import { useSocket } from '~/services/socket-context'

export const loader = async ({ context }: Route.LoaderArgs) => {
  if (!context.currentUser) return redirect('/login')

  const playingRooms = await context.prisma.santoriniRoom.findFirst({
    where: {
      status: {
        in: [SantoriniRoomStatus.WAITING, SantoriniRoomStatus.PLAYING],
      },
      players: {
        some: {
          userId: context.currentUser.id,
        },
      },
    },
  })

  if (playingRooms) {
    const playing = playingRooms.status === SantoriniRoomStatus.PLAYING
    return redirect(
      `/games/santorini/rooms/${playingRooms.roomCode}${playing ? '/play' : ''}`,
    )
  }

  const rooms = await context.prisma.santoriniRoom.findMany({
    where: {
      status: SantoriniRoomStatus.WAITING,
    },
    include: {
      creator: { select: { nickname: true } },
      players: { select: { id: true } },
    },
  })

  return { currentUser: context.currentUser, rooms }
}

export default function Route({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const fetcher = useFetcher()
  const socket = useSocket()
  const revalidator = useRevalidator()

  useEffect(() => {
    if (!socket) return

    socket.on('room_created', async () => {
      await revalidator.revalidate()
    })

    socket.on('room_joined', async () => {
      await revalidator.revalidate()
    })

    socket.on('room_left', async () => {
      await revalidator.revalidate()
    })

    return () => {
      socket.off('room_created')
      socket.off('room_joined')
      socket.off('room_left')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-4">
      <div className="align-center flex justify-center">
        <h2 className="text-lg">Salas</h2>
        <fetcher.Form
          className="ml-auto"
          method="post"
          action={`/games/santorini/rooms/new`}
        >
          <Button styleType="secondary" type="submit">
            Criar sala
          </Button>
        </fetcher.Form>
      </div>
      {actionData?.error && (
        <div className="text-error">{actionData.error}</div>
      )}
      <Table
        emptyState="Nenhuma sala criada"
        data={loaderData.rooms}
        columns={[
          {
            key: 'roomCode',
            title: 'Code',
            value: (room) => room.roomCode,
          },
          {
            key: 'creator',
            title: 'Criador',
            value: (room) => room.creator.nickname,
          },
          {
            key: 'players',
            title: 'Jogadores',
            value: (room) => `${room.players.length}/2`,
          },
          {
            key: 'action',
            title: 'Ações',
            value: (room) => (
              <Form method="post">
                <input type="hidden" name="roomCode" value={room.roomCode} />
                <Button styleType="secondary" type="submit">
                  Entrar
                </Button>
              </Form>
            ),
          },
        ]}
      />
    </div>
  )
}

export const action = async ({ context, request }: Route.ActionArgs) => {
  if (!context.currentUser) return redirect('/login')
  const currentUser = context.currentUser

  const formData = await request.formData()
  const roomCode = formData.get('roomCode')

  if (!roomCode) {
    return data({ error: 'Sala não encontrada' })
  }

  const room = await context.prisma.santoriniRoom.findUniqueOrThrow({
    where: {
      roomCode: String(roomCode),
    },
    include: {
      players: true,
    },
  })

  if (room.players.some((a) => a.userId === currentUser.id)) {
    return redirect(`/games/santorini/rooms/${roomCode}`)
  }

  if (room.status !== 'WAITING') {
    return data({ error: 'Sala não disponível' })
  }

  if (room.players.length >= 2) {
    return data({ error: 'Sala cheia' })
  }

  await context.prisma.santoriniRoomPlayer.create({
    data: {
      userId: context.currentUser.id,
      roomId: room.id,
    },
  })

  context.io.emit('room_joined')

  return redirect(`/games/santorini/rooms/${roomCode}`)
}

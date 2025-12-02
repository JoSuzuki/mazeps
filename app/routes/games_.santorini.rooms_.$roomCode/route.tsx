import { useEffect } from 'react'
import { data, Form, redirect, useNavigate, useRevalidator } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Spacer from '~/components/spacer/spacer.component'
import Table from '~/components/table/table.component'
import { SantoriniRoomStatus } from '~/generated/prisma/enums'
import type { Board } from '~/lib/santorini'
import { useSocket } from '~/services/socket-context'

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  if (!context.currentUser) return redirect('/login')

  const currentUser = context.currentUser
  const room = await context.prisma.santoriniRoom.findUniqueOrThrow({
    where: {
      roomCode: params.roomCode,
      status: {
        in: [SantoriniRoomStatus.WAITING, SantoriniRoomStatus.PLAYING],
      },
    },
    include: {
      players: { include: { user: { select: { id: true, nickname: true } } } },
    },
  })

  if (!room.players.some((a) => a.userId === currentUser.id)) {
    return redirect('/games/santorini/rooms/index')
  }

  if (room.status === SantoriniRoomStatus.PLAYING) {
    return redirect(`/games/santorini/rooms/${params.roomCode}/play`)
  }

  return { currentUser: context.currentUser, room }
}

export default function Route({
  loaderData,
  actionData,
  params,
}: Route.ComponentProps) {
  const socket = useSocket()
  const navigate = useNavigate()
  const revalidator = useRevalidator()

  useEffect(() => {
    if (!socket) return

    socket.emit('join_room', loaderData.room.roomCode)

    socket.on('room_joined', async (socketId: string) => {
      if (socket.id !== socketId) {
        await revalidator.revalidate()
      }
    })

    socket.on('room_left', async (socketId: string) => {
      if (socket.id !== socketId) {
        await revalidator.revalidate()
      }
    })

    socket.on('game_started', async () => {
      await navigate(`/games/santorini/rooms/${params.roomCode}/play`)
    })

    return () => {
      socket.off('room_joined')
      socket.off('room_left')
      socket.emit('leave_room', loaderData.room.roomCode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="p-4">
        <h2 className="flex justify-center text-lg">Jogadores</h2>
        <Spacer size="md" />
        {actionData?.error && (
          <div className="text-error">{actionData.error}</div>
        )}
        <Table
          emptyState="Nenhum jogador na sala"
          data={loaderData.room.players}
          columns={[
            {
              key: 'nickname',
              title: 'Nickname',
              value: (player) => player.user.nickname,
            },
            {
              key: 'actions',
              title: 'Ações',
              value: (player) =>
                player.user.id === loaderData.currentUser.id && (
                  <Form method="post">
                    <input type="hidden" name="roomId" value={player.roomId} />
                    <input type="hidden" name="intent" value="leave" />
                    <Button styleType="secondary" type="submit">
                      Sair
                    </Button>
                  </Form>
                ),
            },
          ]}
        />
        {loaderData.room.players.length === 2 &&
          loaderData.room.status === SantoriniRoomStatus.WAITING && (
            <>
              <Spacer size="md" />
              <Form className="flex justify-center" method="post">
                <input type="hidden" name="intent" value="start" />
                <input type="hidden" name="roomId" value={loaderData.room.id} />
                <Button type="submit">Iniciar</Button>
              </Form>
            </>
          )}
      </div>
    </>
  )
}

const emptyPiece = () => {
  return {
    height: 0,
  }
}

export const action = async ({
  context,
  request,
  params,
}: Route.ActionArgs) => {
  if (!context.currentUser) return redirect('/login')

  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'leave') {
    const roomId = formData.get('roomId')

    const player = await context.prisma.santoriniRoomPlayer.delete({
      where: {
        roomId_userId: {
          roomId: Number(roomId),
          userId: Number(context.currentUser.id),
        },
      },
      include: {
        room: {
          include: {
            players: true,
          },
        },
      },
    })

    if (player.room.players.length <= 1) {
      await context.prisma.santoriniRoom.delete({
        where: {
          roomCode: String(player.room.roomCode),
        },
      })
    }

    context.io.emit('room_left')

    return redirect(`/games/santorini/rooms/index`)
  }

  if (intent === 'start') {
    const room = await context.prisma.santoriniRoom.findUniqueOrThrow({
      where: {
        roomCode: String(params.roomCode),
      },
      include: {
        players: true,
      },
    })

    if (room.status !== SantoriniRoomStatus.WAITING) {
      return data({
        error: `Não é possível iniciar partida no status: ${room.status}`,
      })
    }

    if (room.players.length !== 2) {
      return data({ error: 'A partida deve ter exatamente 2 jogadores' })
    }

    await context.prisma.santoriniRoom.update({
      where: {
        roomCode: String(params.roomCode),
        players: {
          some: {
            userId: Number(context.currentUser.id),
          },
        },
      },
      data: {
        status: SantoriniRoomStatus.PLAYING,
        gameState: {
          phase: 'placement',
          currentTurn: {
            playerId: room.players[0].id,
            actions: [],
          },
          workers: [],
          board: Array(5).fill(Array(5).fill(emptyPiece())) as Board,
          history: [],
        },
      },
    })

    context.io.to(params.roomCode).emit('game_started')
    return redirect(`/games/santorini/rooms/${params.roomCode}/play`)
  }
}

import { useEffect } from 'react'
import { data, Form, redirect, useNavigate, useRevalidator } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import Spacer from '~/components/spacer/spacer.component'
import SupporterNameDisplay from '~/components/supporter-name-display/supporter-name-display.component'
import Table from '~/components/table/table.component'
import { DuoRegnaRoomStatus } from '~/generated/prisma/enums'
import { createInitialDuoRegnaState } from '~/lib/duo-regna'
import { useSocket } from '~/services/socket-context'

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  if (!context.currentUser) return redirect('/login')
  const currentUser = context.currentUser

  const room = await context.prisma.duoRegnaRoom.findFirst({
    where: {
      roomCode: params.roomCode,
      players: { some: { userId: currentUser.id } },
    },
    include: {
      players: {
        include: { user: { select: { id: true, nickname: true, isSupporter: true } } },
      },
    },
  })

  if (!room) {
    return redirect('/games/duo-regna/rooms/index')
  }

  if (
    room.status === DuoRegnaRoomStatus.PLAYING ||
    room.status === DuoRegnaRoomStatus.FINISHED
  ) {
    return redirect(`/games/duo-regna/rooms/${params.roomCode}/play`)
  }

  return { currentUser, room }
}

export default function Route({ loaderData, actionData, params }: Route.ComponentProps) {
  const socket = useSocket()
  const navigate = useNavigate()
  const revalidator = useRevalidator()

  useEffect(() => {
    if (!socket) return
    socket.emit('join_room', loaderData.room.roomCode)
    const onJoin = async (socketId: string) => {
      if (socket.id !== socketId) await revalidator.revalidate()
    }
    const onLeft = async (socketId: string) => {
      if (socket.id !== socketId) await revalidator.revalidate()
    }
    const onStart = async () => {
      await navigate(`/games/duo-regna/rooms/${params.roomCode}/play`)
    }
    socket.on('room_joined', onJoin)
    socket.on('room_left', onLeft)
    socket.on('duo_regna_game_started', onStart)
    return () => {
      socket.off('room_joined', onJoin)
      socket.off('room_left', onLeft)
      socket.off('duo_regna_game_started', onStart)
      socket.emit('leave_room', loaderData.room.roomCode)
    }
  }, [socket, loaderData.room.roomCode, navigate, params.roomCode, revalidator])

  return (
    <div className="p-4">
      <h2 className="flex justify-center text-lg">Jogadores</h2>
      <p className="mt-1 text-center text-xs text-foreground/50">
        Verde (criador) · Vermelho (convidado)
      </p>
      <Spacer size="md" />
      {actionData?.error && <div className="mb-2 text-center text-sm text-red-600">{actionData.error}</div>}
      <Table<(typeof loaderData.room.players)[number]>
        emptyState="Nenhum jogador"
        data={loaderData.room.players}
        columns={[
          {
            key: 'seat',
            title: 'Reino',
            value: (p) => (p.seat === 0 ? 'Verde' : 'Vermelho'),
          },
          {
            key: 'nickname',
            title: 'Jogador',
            value: (p) => (
              <SupporterNameDisplay
                name={p.user.nickname}
                isSupporter={p.user.isSupporter}
              />
            ),
          },
          {
            key: 'actions',
            title: 'Ações',
            value: (p) =>
              p.user.id === loaderData.currentUser.id && (
                <Form method="post">
                  <input type="hidden" name="roomId" value={p.roomId} />
                  <input type="hidden" name="intent" value="leave" />
                  <Button styleType="secondary" type="submit">
                    Sair
                  </Button>
                </Form>
              ),
          },
        ]}
      />
      {loaderData.room.players.length === 2 && loaderData.room.status === DuoRegnaRoomStatus.WAITING && (
        <>
          <Spacer size="md" />
          <Form className="flex justify-center" method="post">
            <input type="hidden" name="intent" value="start" />
            <input type="hidden" name="roomId" value={loaderData.room.id} />
            <Button type="submit">Iniciar partida</Button>
          </Form>
        </>
      )}
      {loaderData.room.players.length === 1 && (
        <p className="mt-4 text-center text-sm text-foreground/50">
          Aguardando outro jogador entrar na sala…
        </p>
      )}
    </div>
  )
}

export const action = async ({ context, request, params }: Route.ActionArgs) => {
  if (!context.currentUser) return redirect('/login')
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'leave') {
    const roomId = Number(formData.get('roomId'))
    const player = await context.prisma.duoRegnaRoomPlayer.delete({
      where: { roomId_userId: { roomId, userId: context.currentUser.id } },
      include: { room: { include: { players: true } } },
    })
    if (player.room.players.length <= 1) {
      await context.prisma.duoRegnaRoom.delete({
        where: { roomCode: player.room.roomCode },
      })
    }
    context.io.emit('room_left')
    return redirect('/games/duo-regna/rooms/index')
  }

  if (intent === 'start') {
    const room = await context.prisma.duoRegnaRoom.findUniqueOrThrow({
      where: { roomCode: String(params.roomCode) },
      include: { players: true },
    })
    if (room.status !== DuoRegnaRoomStatus.WAITING) {
      return data({ error: 'Partida já iniciada ou encerrada.' })
    }
    if (room.players.length !== 2) {
      return data({ error: 'São necessários 2 jogadores.' })
    }

    await context.prisma.duoRegnaRoom.update({
      where: {
        roomCode: String(params.roomCode),
        players: { some: { userId: context.currentUser.id } },
      },
      data: {
        status: DuoRegnaRoomStatus.PLAYING,
        gameState: createInitialDuoRegnaState() as object,
      },
    })

    context.io.to(params.roomCode).emit('duo_regna_game_started')
    return redirect(`/games/duo-regna/rooms/${params.roomCode}/play`)
  }

  return null
}

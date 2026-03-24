import { useEffect } from 'react'
import { data, Form, redirect, useFetcher, useRevalidator } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import SupporterNameDisplay from '~/components/supporter-name-display/supporter-name-display.component'
import Center from '~/components/center/center.component'
import { SantoriniRoomStatus } from '~/generated/prisma/enums'
import { useSocket } from '~/services/socket-context'

const ICON_CLASS = 'h-5 w-5 shrink-0 text-foreground/50'

function UsersIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

function HashIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9h16" />
      <path d="M4 15h16" />
      <path d="M10 3 8 21" />
      <path d="M16 3 14 21" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

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
      creator: { select: { nickname: true, isSupporter: true } },
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

  const { rooms } = loaderData

  return (
    <Center>
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="font-brand text-2xl tracking-wide">Salas</h1>
          <p className="mt-1 text-sm uppercase tracking-[0.2em] text-foreground/50">
            Crie uma sala ou entre em uma existente
          </p>
        </header>

        {/* Criar sala */}
        <fetcher.Form
          method="post"
          action="/games/santorini/rooms/new"
          className="mb-8"
        >
          <Button
            type="submit"
            disabled={fetcher.state !== 'idle'}
            className="flex w-full items-center justify-center gap-2 py-3.5 text-base font-semibold"
          >
            <PlusIcon />
            Criar nova sala
          </Button>
        </fetcher.Form>

        {/* Erro */}
        {actionData?.error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            {actionData.error}
          </div>
        )}

        {/* Lista de salas */}
        <section className="overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 shadow-sm">
          <div className="flex items-center gap-2 border-b border-foreground/10 bg-foreground/5 px-6 py-4">
            <UsersIcon />
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Salas disponíveis ({rooms.length})
            </h2>
          </div>
          <div>
            {rooms.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <UsersIcon className="mx-auto mb-3 opacity-40" />
                <p className="text-sm text-foreground/50">
                  Nenhuma sala criada ainda.
                </p>
                <p className="mt-1 text-sm text-foreground/40">
                  Crie a primeira sala acima.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-foreground/10">
                {rooms.map((room) => (
                  <li key={room.id}>
                    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <HashIcon />
                          <span className="font-mono text-sm font-semibold">
                            {room.roomCode}
                          </span>
                          <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-medium">
                            {room.players.length}/2
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pl-7">
                          <UserIcon />
                          <span className="text-sm text-foreground/60">
                            <SupporterNameDisplay
                              name={`@${room.creator.nickname}`}
                              isSupporter={room.creator.isSupporter}
                              nameClassName="text-sm text-foreground/60"
                            />
                          </span>
                        </div>
                      </div>
                      <Form method="post" className="shrink-0">
                        <input type="hidden" name="roomCode" value={room.roomCode} />
                        <Button
                          type="submit"
                          className="flex w-full items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary sm:w-auto"
                        >
                          Entrar
                          <ChevronRightIcon />
                        </Button>
                      </Form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </Center>
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

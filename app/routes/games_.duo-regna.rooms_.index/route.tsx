import { useEffect } from 'react'
import { data, Form, redirect, useFetcher, useRevalidator } from 'react-router'
import type { Route } from './+types/route'
import Button from '~/components/button/button.component'
import SupporterNameDisplay from '~/components/supporter-name-display/supporter-name-display.component'
import { DuoRegnaRoomStatus } from '~/generated/prisma/enums'
import { useSocket } from '~/services/socket-context'

const ICON_CLASS = 'h-5 w-5 shrink-0 text-foreground/50'

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? ICON_CLASS}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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

function HashIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9h16" />
      <path d="M4 15h16" />
      <path d="M10 3 8 21" />
      <path d="M16 3 14 21" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  const playingRooms = await context.prisma.duoRegnaRoom.findFirst({
    where: {
      status: {
        in: [
          DuoRegnaRoomStatus.WAITING,
          DuoRegnaRoomStatus.PLAYING,
          DuoRegnaRoomStatus.FINISHED,
        ],
      },
      players: { some: { userId: context.currentUser.id } },
    },
  })

  if (playingRooms) {
    const inLobby = playingRooms.status === DuoRegnaRoomStatus.WAITING
    return redirect(
      `/games/duo-regna/rooms/${playingRooms.roomCode}${inLobby ? '' : '/play'}`,
    )
  }

  const rooms = await context.prisma.duoRegnaRoom.findMany({
    where: { status: DuoRegnaRoomStatus.WAITING },
    include: {
      creator: { select: { nickname: true, isSupporter: true } },
      players: { select: { id: true } },
    },
  })

  return { currentUser: context.currentUser, rooms }
}

export default function Route({ loaderData, actionData }: Route.ComponentProps) {
  const fetcher = useFetcher()
  const socket = useSocket()
  const revalidator = useRevalidator()

  useEffect(() => {
    if (!socket) return
    const rev = () => {
      void revalidator.revalidate()
    }
    socket.on('room_created', rev)
    socket.on('room_joined', rev)
    socket.on('room_left', rev)
    return () => {
      socket.off('room_created', rev)
      socket.off('room_joined', rev)
      socket.off('room_left', rev)
    }
  }, [socket, revalidator])

  const { rooms } = loaderData

  return (
    <div className="mx-auto w-full max-w-sm py-1">
        <header className="mb-5">
          <h1 className="font-brand text-xl tracking-wide">Salas — Duo Regna</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-foreground/50">
            Crie uma sala ou entre em uma existente
          </p>
        </header>

        <fetcher.Form method="post" action="/games/duo-regna/rooms/new" className="mb-5">
          <Button
            type="submit"
            disabled={fetcher.state !== 'idle'}
            className="flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold"
          >
            <PlusIcon />
            Criar nova sala
          </Button>
        </fetcher.Form>

        {actionData?.error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            {actionData.error}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-foreground/10 bg-background/60 shadow-sm">
          <div className="flex items-center gap-2 border-b border-foreground/10 bg-foreground/5 px-3 py-2.5">
            <UsersIcon className="h-4 w-4" />
            <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-foreground/60">
              Salas disponíveis ({rooms.length})
            </h2>
          </div>
          <div>
            {rooms.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <UsersIcon className="mx-auto mb-2 h-8 w-8 opacity-40" />
                <p className="text-xs text-foreground/50">Nenhuma sala criada ainda.</p>
              </div>
            ) : (
              <ul className="divide-y divide-foreground/10">
                {rooms.map((room) => (
                  <li key={room.id}>
                    <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <HashIcon className="h-4 w-4 shrink-0" />
                          <span className="font-mono text-xs font-semibold">{room.roomCode}</span>
                          <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[0.65rem] font-medium">
                            {room.players.length}/2
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 pl-5">
                          <UserIcon className="h-4 w-4 shrink-0 text-foreground/50" />
                          <SupporterNameDisplay
                            name={`@${room.creator.nickname}`}
                            isSupporter={room.creator.isSupporter}
                            nameClassName="text-xs text-foreground/60"
                          />
                        </div>
                      </div>
                      <Form method="post" className="shrink-0">
                        <input type="hidden" name="roomCode" value={room.roomCode} />
                        <Button
                          type="submit"
                          className="flex w-full items-center justify-center gap-1.5 bg-primary px-3 py-2 text-xs font-semibold text-on-primary sm:w-auto"
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
  )
}

export const action = async ({ context, request }: Route.ActionArgs) => {
  if (!context.currentUser) return redirect('/login')
  const currentUser = context.currentUser
  const formData = await request.formData()
  const roomCode = formData.get('roomCode')
  if (!roomCode) return data({ error: 'Sala não encontrada' })

  const room = await context.prisma.duoRegnaRoom.findUniqueOrThrow({
    where: { roomCode: String(roomCode) },
    include: { players: true },
  })

  if (room.players.some((a) => a.userId === currentUser.id)) {
    return redirect(`/games/duo-regna/rooms/${roomCode}`)
  }
  if (room.status !== 'WAITING') return data({ error: 'Sala não disponível' })
  if (room.players.length >= 2) return data({ error: 'Sala cheia' })

  await context.prisma.duoRegnaRoomPlayer.create({
    data: {
      userId: currentUser.id,
      roomId: room.id,
      seat: 1,
    },
  })
  context.io.emit('room_joined')
  return redirect(`/games/duo-regna/rooms/${roomCode}`)
}

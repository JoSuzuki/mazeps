import { useEffect, useState } from 'react'
import { useFetcher, useNavigate, useRevalidator } from 'react-router'
import Button from '~/components/button/button.component'
import LinkButton from '~/components/link-button/link-button.component'
import SupporterNameDisplay from '~/components/supporter-name-display/supporter-name-display.component'
import type { DuoRegnaCardValue, DuoRegnaClientState } from '~/lib/duo-regna'
import { useSocket } from '~/services/socket-context'

const CARD_ORDER: DuoRegnaCardValue[] = ['X', 0, 1, 2, 3, 4, 5, 6]

const LABELS: Record<string, string> = {
  X: 'Escudo',
  '0': 'Bufão',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': 'Bispo',
  '5': '5',
  '6': 'Rei',
}

const DRAGON_SLOT_LEFT: Record<'p0' | 'center' | 'p1', string> = {
  p0: '16.666%',
  center: '50%',
  p1: '83.333%',
}

function cardKey(c: DuoRegnaCardValue): string {
  return c === 'X' ? 'X' : String(c)
}

type PlayerInfo = {
  seat: 0 | 1
  nickname: string
  isSupporter: boolean
}

export default function DuoRegnaPlay({
  roomCode,
  initialSeat,
  initialClientState,
  finishedFromLoader,
  players,
}: {
  roomCode: string
  roomId: number
  initialSeat: 0 | 1
  initialClientState: DuoRegnaClientState | null
  finishedFromLoader: boolean
  players: PlayerInfo[]
}) {
  const socket = useSocket()
  const navigate = useNavigate()
  const revalidator = useRevalidator()
  const leaveFetcher = useFetcher()
  const [state, setState] = useState<DuoRegnaClientState | null>(initialClientState)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const finished = finishedFromLoader || state?.status === 'finished'
  const isLeaving = leaveFetcher.state !== 'idle'

  useEffect(() => {
    if (!socket) return
    socket.emit('join_room', roomCode)
    socket.emit('duo_regna_join_play', roomCode)

    const onState = (payload: DuoRegnaClientState) => {
      setState(payload)
      setError(null)
    }
    const onErr = (msg: string) => setError(msg)
    const onFin = () => {
      void revalidator.revalidate()
    }
    const onPlayerLeft = () => {
      setNotice('O oponente saiu da partida.')
      void navigate(`/games/duo-regna/rooms/${roomCode}`)
    }
    const onAfk = () => {
      setNotice('Partida cancelada por inatividade.')
      void navigate(`/games/duo-regna/rooms/${roomCode}`)
    }
    const onRematch = () => {
      setNotice(null)
      void revalidator.revalidate()
    }

    socket.on('duo_regna_state', onState)
    socket.on('duo_regna_error', onErr)
    socket.on('duo_regna_finished', onFin)
    socket.on('duo_regna_player_left', onPlayerLeft)
    socket.on('duo_regna_afk_cancel', onAfk)
    socket.on('duo_regna_rematch_started', onRematch)

    return () => {
      socket.off('duo_regna_state', onState)
      socket.off('duo_regna_error', onErr)
      socket.off('duo_regna_finished', onFin)
      socket.off('duo_regna_player_left', onPlayerLeft)
      socket.off('duo_regna_afk_cancel', onAfk)
      socket.off('duo_regna_rematch_started', onRematch)
      socket.emit('leave_room', roomCode)
    }
  }, [socket, roomCode, navigate, revalidator])

  useEffect(() => {
    if (initialClientState) setState(initialClientState)
  }, [initialClientState])

  if (!socket) return <p className="p-4 text-center text-sm">Conectando…</p>

  const myColor = initialSeat === 0 ? 'Verde' : 'Vermelho'
  const oppColor = initialSeat === 0 ? 'Vermelho' : 'Verde'
  const oppSeat = (1 - initialSeat) as 0 | 1
  const myRematchReady = state?.rematchReady[initialSeat] ?? false
  const oppRematchReady = state?.rematchReady[oppSeat] ?? false

  const winnerLabel = (() => {
    if (!state || state.winnerSeat === null) {
      return 'Empate — ninguém venceu desta vez.'
    }
    const winner = players.find((p) => p.seat === state.winnerSeat)
    const realm = state.winnerSeat === 0 ? 'Verde' : 'Vermelho'
    if (state.winnerSeat === initialSeat) {
      return 'Você venceu!'
    }
    return winner
      ? `${winner.nickname} (${realm}) venceu a partida.`
      : `Reino ${realm} venceu a partida.`
  })()

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-2 py-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-foreground/60">
          Você: <strong className="text-foreground">{myColor}</strong> · Oponente: {oppColor}
        </p>
        {!finished && (
          <leaveFetcher.Form method="post">
            <input type="hidden" name="intent" value="leave" />
            <Button
              type="submit"
              styleType="secondary"
              disabled={isLeaving}
              className="px-3 py-1.5 text-xs"
            >
              {isLeaving ? 'Saindo…' : 'Sair da partida'}
            </Button>
          </leaveFetcher.Form>
        )}
      </div>

      {notice && (
        <div className="rounded-lg border border-foreground/15 bg-foreground/[0.04] px-3 py-2 text-center text-sm text-foreground/75">
          {notice}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-center text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {state && (
        <>
          <div className="rounded-xl border border-foreground/15 bg-foreground/[0.03] p-4">
            <p className="text-center text-xs uppercase tracking-wider text-foreground/45">
              Dragão no panorama
            </p>
            <div className="mt-3 flex items-center justify-between gap-2 text-sm">
              <span
                className={
                  state.dragonPosition === 'p0'
                    ? 'font-semibold text-primary'
                    : 'text-foreground/40'
                }
              >
                Verde
              </span>
              <span
                className={
                  state.dragonPosition === 'center'
                    ? 'font-semibold text-primary'
                    : 'text-foreground/40'
                }
              >
                Centro
              </span>
              <span
                className={
                  state.dragonPosition === 'p1'
                    ? 'font-semibold text-primary'
                    : 'text-foreground/40'
                }
              >
                Vermelho
              </span>
            </div>

            <div className="relative mt-4 h-14">
              {state.currentDragon ? (
                <div
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-center transition-[left] duration-500 ease-in-out"
                  style={{ left: DRAGON_SLOT_LEFT[state.dragonPosition] }}
                >
                  <span className="text-2xl leading-none">
                    {state.currentDragon.dragons === 2 ? '🐉🐉' : '🐉'}
                  </span>
                  <p className="mt-0.5 text-[0.65rem] font-medium text-foreground/55">
                    {state.currentDragon.dragons} cabeça
                    {state.currentDragon.dragons > 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <p className="absolute inset-0 flex items-center justify-center text-sm text-foreground/50">
                  Sem dragão em jogo
                </p>
              )}
            </div>

            <p className="mt-1 text-center text-xs text-foreground/40">
              Baralho: {state.dragonDeckRemaining} cartas
            </p>
          </div>

          <div className="flex justify-between gap-4 text-sm">
            <div>
              <span className="text-foreground/50">Suas cabeças: </span>
              <strong>{state.capturedDragons[initialSeat]}</strong>
            </div>
            <div>
              <span className="text-foreground/50">Oponente: </span>
              <strong>{state.capturedDragons[initialSeat === 0 ? 1 : 0]}</strong>
            </div>
          </div>

          {state.lastRound && (
            <LastRoundPanel lastRound={state.lastRound} mySeat={initialSeat} />
          )}
          {state.opponentHasLocked && state.myPending === null && !finished && (
            <p className="text-center text-sm italic text-foreground/50">
              O oponente já escolheu. Escolha a sua carta.
            </p>
          )}
          {state.myPending !== null && !finished && (
            <p className="text-center text-sm text-foreground/60">
              Carta escolhida: <strong>{formatCard(state.myPending)}</strong> — aguardando o
              oponente…
            </p>
          )}

          {!finished && state.myPending === null && (
            <div>
              <p className="mb-2 text-center text-sm font-medium">
                Sua mão ({state.opponentHandCount} cartas no oponente)
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {CARD_ORDER.map((c) => {
                  const k = cardKey(c)
                  const n = state.myHand[k] ?? 0
                  if (n <= 0) return null
                  return (
                    <Button
                      key={k}
                      type="button"
                      styleType="secondary"
                      className="min-w-[3.25rem] flex-col gap-0 py-2 text-xs"
                      onClick={() => socket.emit('duo_regna_play_card', roomCode, c)}
                    >
                      <span className="text-base font-bold">{k === 'X' ? 'X' : k}</span>
                      <span className="text-[0.65rem] opacity-70">{LABELS[k]}</span>
                      {n > 1 && <span className="text-[0.6rem]">×{n}</span>}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {finished && (
            <div className="rounded-2xl border-2 border-primary/25 bg-primary/[0.06] p-6 text-center shadow-sm">
              <p className="font-brand text-xl font-semibold uppercase tracking-wide text-foreground">
                Fim de jogo
              </p>
              <p className="mt-3 text-lg font-medium text-foreground/90">{winnerLabel}</p>
              {state.winnerSeat !== null && state.winnerSeat !== initialSeat && (
                <p className="mt-2 text-sm text-foreground/60">
                  Vencedor:{' '}
                  <SupporterNameDisplay
                    name={
                      players.find((p) => p.seat === state.winnerSeat)?.nickname ?? 'Oponente'
                    }
                    isSupporter={
                      players.find((p) => p.seat === state.winnerSeat)?.isSupporter ?? false
                    }
                    className="inline font-semibold text-foreground"
                  />
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  type="button"
                  disabled={myRematchReady}
                  onClick={() => socket.emit('duo_regna_rematch_vote', roomCode)}
                  className="px-4 py-2.5"
                >
                  {myRematchReady ? 'Aguardando o oponente…' : 'Jogar novamente'}
                </Button>
                <LinkButton
                  styleType="secondary"
                  to={`/games/duo-regna/rooms/${roomCode}`}
                  viewTransition
                  className="px-4 py-2.5"
                >
                  Voltar ao lobby
                </LinkButton>
              </div>

              {myRematchReady && !oppRematchReady && (
                <p className="mt-3 text-xs text-foreground/50">
                  Você aceitou revanche. Falta o oponente confirmar.
                </p>
              )}
              {myRematchReady && oppRematchReady && (
                <p className="mt-3 text-xs text-foreground/50">Iniciando nova partida…</p>
              )}
            </div>
          )}
        </>
      )}

      {!state && !finished && (
        <p className="text-center text-sm text-foreground/50">A carregar estado…</p>
      )}
    </div>
  )
}

function formatCard(c: DuoRegnaCardValue): string {
  const k = cardKey(c)
  return `${k} (${LABELS[k]})`
}

function LastRoundPanel({
  lastRound,
  mySeat,
}: {
  lastRound: NonNullable<DuoRegnaClientState['lastRound']>
  mySeat: 0 | 1
}) {
  const { card0, card1, result } = lastRound
  const p0Won = result === 'p0'
  const p1Won = result === 'p1'
  const isTie = result === 'nothing'

  const outcomeLabel = isTie
    ? 'Empate — ninguém venceu a rodada'
    : p0Won
      ? 'Verde venceu a comparação'
      : 'Vermelho venceu a comparação'

  const outcomeClass = isTie
    ? 'border-foreground/20 bg-foreground/[0.06] text-foreground/75'
    : p0Won
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
      : 'border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-200'

  return (
    <div className="rounded-xl border border-foreground/15 bg-background/90 p-4 shadow-sm">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">
        Última rodada
      </p>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
        <RoundCardTile
          realm="Verde"
          card={card0}
          seat={0}
          mySeat={mySeat}
          isWinner={p0Won}
          isLoser={p1Won}
          isTie={isTie}
        />

        <div className="flex flex-col items-center justify-center px-1">
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-foreground/35">
            vs
          </span>
        </div>

        <RoundCardTile
          realm="Vermelho"
          card={card1}
          seat={1}
          mySeat={mySeat}
          isWinner={p1Won}
          isLoser={p0Won}
          isTie={isTie}
        />
      </div>

      <p
        className={`mt-4 rounded-lg border px-3 py-2 text-center text-sm font-semibold ${outcomeClass}`}
      >
        {outcomeLabel}
        {!isTie && (
          <span className="mt-0.5 block text-xs font-medium opacity-80">
            {p0Won
              ? mySeat === 0
                ? 'Foi a sua carta!'
                : 'Carta do oponente (Verde)'
              : mySeat === 1
                ? 'Foi a sua carta!'
                : 'Carta do oponente (Vermelho)'}
          </span>
        )}
      </p>

      {lastRound.summary && (
        <p className="mt-3 text-center text-xs leading-relaxed text-foreground/55">
          {lastRound.summary}
        </p>
      )}
    </div>
  )
}

function RoundCardTile({
  realm,
  card,
  seat,
  mySeat,
  isWinner,
  isLoser,
  isTie,
}: {
  realm: 'Verde' | 'Vermelho'
  card: DuoRegnaCardValue
  seat: 0 | 1
  mySeat: 0 | 1
  isWinner: boolean
  isLoser: boolean
  isTie: boolean
}) {
  const isGreen = seat === 0
  const k = cardKey(card)
  const isMine = seat === mySeat

  const baseTone = isGreen
    ? 'border-emerald-500/35 bg-emerald-500/[0.08]'
    : 'border-red-500/35 bg-red-500/[0.08]'

  const stateTone = isWinner
    ? isGreen
      ? 'border-emerald-500 ring-2 ring-emerald-500/45 bg-emerald-500/15 shadow-[0_0_14px_-4px_rgba(16,185,129,0.55)]'
      : 'border-red-500 ring-2 ring-red-500/45 bg-red-500/15 shadow-[0_0_14px_-4px_rgba(239,68,68,0.55)]'
    : isLoser
      ? `${baseTone} opacity-55 saturate-50`
      : isTie
        ? baseTone
        : baseTone

  return (
    <div className={`flex flex-col items-center rounded-xl border-2 px-2 py-3 transition-all ${stateTone}`}>
      <span
        className={`text-[0.625rem] font-bold uppercase tracking-[0.14em] ${
          isGreen ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
        }`}
      >
        {realm}
      </span>
      {isMine && (
        <span className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-wide text-foreground/45">
          Você
        </span>
      )}

      <div
        className={`mt-2 flex h-14 w-14 flex-col items-center justify-center rounded-lg border ${
          isGreen
            ? 'border-emerald-500/30 bg-background/80'
            : 'border-red-500/30 bg-background/80'
        }`}
      >
        <span className="font-brand text-2xl font-bold leading-none text-foreground">
          {k === 'X' ? 'X' : k}
        </span>
        <span className="mt-0.5 text-[0.6rem] font-medium text-foreground/55">{LABELS[k]}</span>
      </div>

      {isWinner && (
        <WinnerBadge isGreen={isGreen} />
      )}
      {isTie && (
        <span className="mt-2 text-[0.625rem] font-semibold uppercase tracking-wide text-foreground/45">
          Empate
        </span>
      )}
    </div>
  )
}

function WinnerBadge({ isGreen }: { isGreen: boolean }) {
  return (
    <span
      className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide ${
        isGreen
          ? 'bg-emerald-600 text-white dark:bg-emerald-500'
          : 'bg-red-600 text-white dark:bg-red-500'
      }`}
    >
      <TrophyIcon className="h-3 w-3" />
      Venceu
    </span>
  )
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
import { useEffect, useState } from 'react'
import { useNavigate, useRevalidator } from 'react-router'
import Button from '~/components/button/button.component'
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

function cardKey(c: DuoRegnaCardValue): string {
  return c === 'X' ? 'X' : String(c)
}

export default function DuoRegnaPlay({
  roomCode,
  initialSeat,
  initialClientState,
  finishedFromLoader,
}: {
  roomCode: string
  initialSeat: 0 | 1
  initialClientState: DuoRegnaClientState | null
  finishedFromLoader: boolean
}) {
  const socket = useSocket()
  const navigate = useNavigate()
  const revalidator = useRevalidator()
  const [state, setState] = useState<DuoRegnaClientState | null>(initialClientState)
  const [error, setError] = useState<string | null>(null)
  const finished = finishedFromLoader || state?.status === 'finished'

  useEffect(() => {
    if (!finished) return
    void navigate(`/games/duo-regna/rooms/${roomCode}`)
  }, [finished, navigate, roomCode])

  useEffect(() => {
    if (!socket) return
    socket.emit('join_room', roomCode)

    const onState = (payload: DuoRegnaClientState) => {
      setState(payload)
      setError(null)
    }
    const onErr = (msg: string) => setError(msg)
    const onFin = () => {
      void revalidator.revalidate()
    }

    socket.on('duo_regna_state', onState)
    socket.on('duo_regna_error', onErr)
    socket.on('duo_regna_finished', onFin)

    return () => {
      socket.off('duo_regna_state', onState)
      socket.off('duo_regna_error', onErr)
      socket.off('duo_regna_finished', onFin)
      socket.emit('leave_room', roomCode)
    }
  }, [socket, roomCode, navigate, revalidator])

  useEffect(() => {
    if (initialClientState) setState(initialClientState)
  }, [initialClientState])

  if (!socket) return <p className="p-4 text-center text-sm">Conectando…</p>

  const myColor = initialSeat === 0 ? 'Verde' : 'Vermelho'
  const oppColor = initialSeat === 0 ? 'Vermelho' : 'Verde'

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-2 py-4">
      <p className="text-center text-sm text-foreground/60">
        Você é o reino <strong className="text-foreground">{myColor}</strong> · Adversário:{' '}
        {oppColor}
      </p>

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
              <span className={state.dragonPosition === 'p0' ? 'font-semibold text-primary' : 'text-foreground/40'}>
                Verde
              </span>
              <span className={state.dragonPosition === 'center' ? 'font-semibold text-primary' : 'text-foreground/40'}>
                Centro
              </span>
              <span className={state.dragonPosition === 'p1' ? 'font-semibold text-primary' : 'text-foreground/40'}>
                Vermelho
              </span>
            </div>
            {state.currentDragon && (
              <p className="mt-2 text-center text-lg font-semibold">
                {state.currentDragon.dragons === 2 ? '🐉🐉' : '🐉'} ({state.currentDragon.dragons}{' '}
                cabeça{state.currentDragon.dragons > 1 ? 's' : ''})
              </p>
            )}
            {!state.currentDragon && (
              <p className="mt-2 text-center text-sm text-foreground/50">Sem dragão em jogo</p>
            )}
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
            <div className="rounded-lg border border-foreground/10 bg-background/80 p-3 text-sm">
              <p className="font-medium">Última rodada</p>
              <p className="mt-1 text-foreground/75">
                Verde: <strong>{formatCard(state.lastRound.card0)}</strong> · Vermelho:{' '}
                <strong>{formatCard(state.lastRound.card1)}</strong>
              </p>
              <p className="mt-1 text-foreground/60">{state.lastRound.summary}</p>
            </div>
          )}

          {state.opponentHasLocked && state.myPending === null && (
            <p className="text-center text-sm italic text-foreground/50">
              O oponente já escolheu. Escolha a sua carta.
            </p>
          )}
          {state.myPending !== null && (
            <p className="text-center text-sm text-foreground/60">
              Carta escolhida: <strong>{formatCard(state.myPending)}</strong> — aguardando o
              oponente…
            </p>
          )}

          {!finished && state.myPending === null && (
            <div>
              <p className="mb-2 text-center text-sm font-medium">Sua mão ({state.opponentHandCount} cartas no oponente)</p>
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
            <p className="text-center text-lg font-semibold">
              {state.winnerSeat === initialSeat
                ? 'Você venceu!'
                : state.winnerSeat === null
                  ? 'Empate ou fim do baralho.'
                  : 'O oponente venceu.'}
            </p>
          )}
        </>
      )}

      {!state && !finished && <p className="text-center text-sm text-foreground/50">A carregar estado…</p>}
    </div>
  )
}

function formatCard(c: DuoRegnaCardValue): string {
  const k = cardKey(c)
  return `${k} (${LABELS[k]})`
}

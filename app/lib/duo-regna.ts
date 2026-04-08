/**
 * Lógica do Duo Regna (Knizia) — dois reinos, cartas simultâneas, dragão no panorama.
 */

export type DuoRegnaCardValue = 'X' | 0 | 1 | 2 | 3 | 4 | 5 | 6

export type DragonCard = { dragons: 1 | 2 }

export type DragonPosition = 'p0' | 'center' | 'p1'

/** Estado persistido no Prisma (Json). */
export type DuoRegnaGameState = {
  hands: [Record<string, number>, Record<string, number>]
  discards: [DuoRegnaCardValue[], DuoRegnaCardValue[]]
  dragonDeck: DragonCard[]
  currentDragon: DragonCard | null
  dragonPosition: DragonPosition
  /** Escolhas da rodada atual (null = ainda não jogou). */
  pending: [DuoRegnaCardValue | null, DuoRegnaCardValue | null]
  /** Total de cabeças de dragão capturadas por jogador. */
  capturedDragons: [number, number]
  lastRound: {
    card0: DuoRegnaCardValue
    card1: DuoRegnaCardValue
    result: 'p0' | 'p1' | 'nothing'
    summary: string
  } | null
  winnerSeat: 0 | 1 | null
}

const HAND_TEMPLATE: Record<string, number> = {
  X: 1,
  '0': 1,
  '1': 1,
  '2': 1,
  '3': 1,
  '4': 1,
  '5': 1,
  '6': 2,
}

export function cloneHandTemplate(): Record<string, number> {
  return { ...HAND_TEMPLATE }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildDragonDeck(): DragonCard[] {
  return shuffle([
    ...Array.from({ length: 10 }, () => ({ dragons: 1 as const })),
    ...Array.from({ length: 6 }, () => ({ dragons: 2 as const })),
  ])
}

function totalHand(h: Record<string, number>): number {
  return Object.values(h).reduce((s, n) => s + n, 0)
}

function countsFromCards(cards: DuoRegnaCardValue[]): Record<string, number> {
  const m: Record<string, number> = {}
  for (const c of cards) {
    const k = c === 'X' ? 'X' : String(c)
    m[k] = (m[k] ?? 0) + 1
  }
  return m
}

function takeFromHand(
  hand: Record<string, number>,
  card: DuoRegnaCardValue,
): boolean {
  const k = card === 'X' ? 'X' : String(card)
  if ((hand[k] ?? 0) < 1) return false
  hand[k] -= 1
  if (hand[k] === 0) delete hand[k]
  return true
}

function toNum(c: DuoRegnaCardValue): number {
  if (c === 'X') return -1
  return c
}

/**
 * Compara duas cartas; retorna quem vence a rodada ou 'nothing'.
 * P0 jogou `a`, P1 jogou `b`.
 */
export function resolveRound(
  a: DuoRegnaCardValue,
  b: DuoRegnaCardValue,
): 'p0' | 'p1' | 'nothing' {
  if (a === 'X' || b === 'X') return 'nothing'

  if (a === 4 && b === 4) return 'nothing'

  if (a === 4 || b === 4) {
    const na = toNum(a)
    const nb = toNum(b)
    if (a === 4) {
      return nb < 4 ? 'p1' : 'p0'
    }
    return na < 4 ? 'p0' : 'p1'
  }

  if (a === 0 || b === 0) {
    // Bispo (4) já foi resolvido acima; aqui só Rei/Rainha (6) aplica à regra do Bufão.
    if (a === 0 && b === 6) return 'p0'
    if (b === 0 && a === 6) return 'p1'
    if (a === 0) return 'p1'
    if (b === 0) return 'p0'
  }

  const na = toNum(a)
  const nb = toNum(b)
  if (na === nb) return 'nothing'
  return na > nb ? 'p0' : 'p1'
}

function roundSummary(
  a: DuoRegnaCardValue,
  b: DuoRegnaCardValue,
  result: 'p0' | 'p1' | 'nothing',
): string {
  if (result === 'nothing') {
    if (a === 'X' || b === 'X') return 'Escudo: nada acontece.'
    if (a === 4 && b === 4) return 'Dois bispos: nada acontece.'
    if (toNum(a) === toNum(b)) return 'Empate: nada acontece.'
    return 'Nada acontece nesta rodada.'
  }
  const w = result === 'p0' ? 'Verde' : 'Vermelho'
  return `${w} vence a rodada.`
}

/** Move o dragão quando `winner` ganha a rodada. */
export function applyDragonStep(
  state: DuoRegnaGameState,
  winner: 'p0' | 'p1',
): { captured: boolean; summary: string } {
  const d = state.currentDragon
  if (!d) return { captured: false, summary: '' }

  const pos = state.dragonPosition
  let captured = false
  let summary = ''

  if (winner === 'p0') {
    if (pos === 'p1') {
      state.dragonPosition = 'center'
      summary = 'Dragão vai para o centro.'
    } else if (pos === 'center') {
      state.dragonPosition = 'p0'
      summary = 'Dragão avança para o lado verde.'
    } else {
      state.capturedDragons[0] += d.dragons
      captured = true
      summary = `Verde captura o dragão (+${d.dragons}).`
      const next = state.dragonDeck.shift() ?? null
      state.currentDragon = next
      state.dragonPosition = 'center'
      if (next) summary += ' Novo dragão no centro.'
      else summary += ' Não há mais dragões no baralho.'
    }
  } else {
    if (pos === 'p0') {
      state.dragonPosition = 'center'
      summary = 'Dragão vai para o centro.'
    } else if (pos === 'center') {
      state.dragonPosition = 'p1'
      summary = 'Dragão avança para o lado vermelho.'
    } else {
      state.capturedDragons[1] += d.dragons
      captured = true
      summary = `Vermelho captura o dragão (+${d.dragons}).`
      const next = state.dragonDeck.shift() ?? null
      state.currentDragon = next
      state.dragonPosition = 'center'
      if (next) summary += ' Novo dragão no centro.'
      else summary += ' Não há mais dragões no baralho.'
    }
  }

  return { captured, summary }
}

function refillHandsFromDiscards(state: DuoRegnaGameState) {
  if (totalHand(state.hands[0]) > 0 || totalHand(state.hands[1]) > 0) return
  state.hands[0] = countsFromCards(shuffle(state.discards[0]))
  state.hands[1] = countsFromCards(shuffle(state.discards[1]))
  state.discards = [[], []]
}

export function createInitialDuoRegnaState(): DuoRegnaGameState {
  const deck = buildDragonDeck()
  const first = deck.shift() ?? { dragons: 1 as const }
  return {
    hands: [cloneHandTemplate(), cloneHandTemplate()],
    discards: [[], []],
    dragonDeck: deck,
    currentDragon: first,
    dragonPosition: 'center',
    pending: [null, null],
    capturedDragons: [0, 0],
    lastRound: null,
    winnerSeat: null,
  }
}

export function parseCardFromClient(raw: unknown): DuoRegnaCardValue | null {
  if (raw === 'X' || raw === 'x') return 'X'
  if (typeof raw === 'number' && [0, 1, 2, 3, 4, 5, 6].includes(raw)) {
    return raw as DuoRegnaCardValue
  }
  if (typeof raw === 'string') {
    const n = Number(raw)
    if ([0, 1, 2, 3, 4, 5, 6].includes(n)) return n as DuoRegnaCardValue
  }
  return null
}

/** Aplica uma jogada: define pending ou resolve rodada se ambos prontos. Retorna erro ou null. */
export function tryPlayCard(
  state: DuoRegnaGameState,
  seat: 0 | 1,
  card: DuoRegnaCardValue,
): string | null {
  if (state.winnerSeat !== null) return 'Partida já terminou.'

  if (state.pending[seat] !== null) return 'Você já escolheu uma carta nesta rodada.'

  const hand = state.hands[seat]
  if (!takeFromHand(hand, card)) return 'Carta inválida ou indisponível na mão.'

  state.pending[seat] = card

  if (state.pending[0] === null || state.pending[1] === null) {
    return null
  }

  const c0 = state.pending[0]!
  const c1 = state.pending[1]!
  const result = resolveRound(c0, c1)
  const baseSummary = roundSummary(c0, c1, result)

  state.discards[0].push(c0)
  state.discards[1].push(c1)
  state.pending = [null, null]

  state.lastRound = {
    card0: c0,
    card1: c1,
    result,
    summary: baseSummary,
  }

  if (result !== 'nothing') {
    const { summary: dragSummary } = applyDragonStep(state, result)
    if (dragSummary) {
      state.lastRound.summary += ' ' + dragSummary
    }
  }

  if (state.capturedDragons[0] >= 4) state.winnerSeat = 0
  else if (state.capturedDragons[1] >= 4) state.winnerSeat = 1
  else if (!state.currentDragon && state.dragonDeck.length === 0) {
    if (state.capturedDragons[0] > state.capturedDragons[1]) state.winnerSeat = 0
    else if (state.capturedDragons[1] > state.capturedDragons[0]) state.winnerSeat = 1
    else state.winnerSeat = null
  }

  refillHandsFromDiscards(state)

  return null
}

/** Payload enviado por socket (sem ver a mão do adversário). */
export type DuoRegnaClientState = {
  mySeat: 0 | 1
  myHand: Record<string, number>
  opponentHandCount: number
  dragonPosition: DragonPosition
  currentDragon: DragonCard | null
  dragonDeckRemaining: number
  capturedDragons: [number, number]
  myPending: DuoRegnaCardValue | null
  opponentHasLocked: boolean
  lastRound: DuoRegnaGameState['lastRound']
  winnerSeat: 0 | 1 | null
  status: 'playing' | 'finished'
}

export function toClientState(
  state: DuoRegnaGameState,
  seat: 0 | 1,
  roomStatus: 'WAITING' | 'PLAYING' | 'FINISHED',
): DuoRegnaClientState {
  const opp = (1 - seat) as 0 | 1
  return {
    mySeat: seat,
    myHand: { ...state.hands[seat] },
    opponentHandCount: totalHand(state.hands[opp]),
    dragonPosition: state.dragonPosition,
    currentDragon: state.currentDragon,
    dragonDeckRemaining: state.dragonDeck.length,
    capturedDragons: [...state.capturedDragons] as [number, number],
    myPending: state.pending[seat],
    opponentHasLocked: state.pending[opp] !== null,
    lastRound: state.lastRound,
    winnerSeat: state.winnerSeat,
    status: roomStatus === 'FINISHED' ? 'finished' : 'playing',
  }
}

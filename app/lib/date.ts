/**
 * Converte string YYYY-MM-DD (do input date) para Date em UTC.
 * Evita deslocamento de timezone ao salvar no banco.
 */
export function parseEventDate(dateStr: string): Date {
  return new Date(dateStr + 'T12:00:00.000Z')
}

/**
 * Retorna YYYY-MM-DD para input type="date" a partir de Date/string.
 */
export function toEventDateInputValue(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().slice(0, 10)
}

/**
 * Formata data de evento/torneio (armazenada como date-only em UTC).
 * Usa timeZone: 'UTC' para evitar deslocamento de um dia em fusos como Brasil (UTC-3).
 */
export function formatEventDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Formata data de evento com dia da semana (ex: "sábado, 15 de março de 2025").
 */
export function formatEventDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

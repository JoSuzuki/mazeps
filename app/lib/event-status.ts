/** EventStatus - alinhado com o enum do Prisma schema */
export const EventStatus = {
  SECRETO: 'SECRETO',
  ABERTO: 'ABERTO',
  ENCERRADO: 'ENCERRADO',
} as const

export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus]

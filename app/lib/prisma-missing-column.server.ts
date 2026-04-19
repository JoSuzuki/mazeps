/**
 * Postgres/Prisma quando a tabela ainda não tem uma coluna que o schema espera.
 * Usado para degradar queries até `migrate deploy` correr na base certa.
 */
export function isPrismaMissingDbColumnError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const m = error.message.toLowerCase()
  return m.includes('does not exist') && m.includes('column')
}

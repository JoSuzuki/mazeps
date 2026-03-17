import crypto from 'crypto'

/**
 * Retorna a URL do avatar do usuário.
 * Se tiver avatarUrl customizado, usa. Senão, usa Gravatar baseado no email.
 * Gravatar não armazena nada no servidor - a imagem vem de gravatar.com.
 * @param size - Tamanho em px para Gravatar (padrão 256). Use valores menores (ex: 40) em listas.
 */
export function getAvatarUrl(
  avatarUrl: string | null,
  email: string,
  size = 256,
): string {
  if (avatarUrl?.trim()) {
    return avatarUrl.trim()
  }
  const hash = crypto
    .createHash('md5')
    .update(email.toLowerCase().trim())
    .digest('hex')
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`
}

/** URL de ficheiro guardado no servidor (sem Node — seguro para o bundle do cliente). */
export function isEnigmaServerUploadUrl(url: string | null | undefined): boolean {
  return typeof url === 'string' && url.startsWith('/uploads/')
}

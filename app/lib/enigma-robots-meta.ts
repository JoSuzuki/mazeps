/** Meta + política alinhada: páginas de enigmas não devem ser indexadas. */
export function enigmaRobotsMeta() {
  return [{ name: 'robots', content: 'noindex, nofollow' }] as const
}

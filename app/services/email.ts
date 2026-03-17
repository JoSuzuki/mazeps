import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Mazeps <onboarding@resend.dev>'

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📧 [DEV] Link de redefinição (email não configurado):')
      console.log(`   Para: ${to}`)
      console.log(`   Link: ${resetUrl}\n`)
      return { success: true }
    }
    return {
      success: false,
      error: 'Email não configurado. Configure RESEND_API_KEY no servidor.',
    }
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Redefinir senha - Mazeps',
    html: `
      <p>Olá!</p>
      <p>Você solicitou a redefinição de senha. Clique no link abaixo para criar uma nova senha:</p>
      <p><a href="${resetUrl}" style="color: #6366f1; text-decoration: underline;">Redefinir senha</a></p>
      <p>O link expira em 1 hora. Se você não solicitou isso, ignore este email.</p>
      <p>— Equipe Mazeps</p>
    `,
  })

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Resend error:', error)
      console.log('\n📧 [DEV] Link de redefinição (Resend falhou):')
      console.log(`   Para: ${to}`)
      console.log(`   Link: ${resetUrl}\n`)
      return { success: true }
    }
    const errMsg = String(
      (error as { message?: string })?.message ?? (error as { error?: string })?.error ?? '',
    )
    const msg =
      /domain|verified|recipient|sandbox/i.test(errMsg)
        ? 'Domínio de email não verificado. Adicione e verifique seu domínio no Resend (resend.com/domains) para enviar a qualquer destinatário.'
        : 'Falha ao enviar email. Tente novamente.'
    return { success: false, error: msg }
  }

  return { success: true }
}

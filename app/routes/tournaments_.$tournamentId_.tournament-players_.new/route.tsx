import { data, redirect } from 'react-router'
import type { Route } from './+types/route'

export async function action({ params, context }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')

  console.log('tournament player new count')

  const tournamentPlayer = await context.prisma.tournamentPlayer.create({
    data: {
      userId: context.currentUser.id,
      tournamentId: Number(params.tournamentId),
    },
  })

  console.log('executed', tournamentPlayer)

  return data({ success: true })
}

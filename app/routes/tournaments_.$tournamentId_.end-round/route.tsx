import { data, redirect } from 'react-router'
import type { Route } from '../+types/_base-layout'
import { Role, TournamentStatus } from '~/generated/prisma/enums'

export async function action({ context, request, params }: Route.ActionArgs) {
  if (!context.currentUser) return redirect('/login')
  if (context.currentUser.role !== Role.ADMIN) return redirect('/')

  let formData = await request.formData()
  let lastRoundId = formData.get('lastRoundId') as string

  let round = await context.prisma.round.findFirstOrThrow({
    where: { id: Number(lastRoundId) },
    include: { matches: { include: { matchResults: true } } },
  })

  let everyRoundHasResults = round.matches.every(
    (match) => match.matchResults.length > 0,
  )

  if (everyRoundHasResults) {
    await context.prisma.tournament.update({
      where: { id: Number(params.tournamentId) },
      data: { status: TournamentStatus.FINISHED_ROUND },
    })

    return data({ success: true })
  } else {
    return data({ error: 'Nem todas rodadas tem resultados reportados!' })
  }
}

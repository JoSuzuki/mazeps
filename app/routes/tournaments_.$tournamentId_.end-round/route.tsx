import { data, redirect } from 'react-router'
import type { Route } from '../+types/_base-layout'
import { Role, TournamentStatus } from '~/generated/prisma/enums'

export async function action({ context, params }: Route.ActionArgs) {
    if (!context.currentUser) return redirect('/login')
    if (context.currentUser.role !== Role.ADMIN) return redirect('/')

    //TODO: validate if round can be finished
    
    await context.prisma.tournament.update({
        where:{id: Number(params.tournamentId)},
        data:{status: TournamentStatus.FINISHED_ROUND}
    })

    return data({ success: true })

}
import { data, redirect } from "react-router"
import type { Route } from "../+types/_base-layout"
import { Role, TournamentStatus } from "~/generated/prisma/enums"



export async function action({context,  params}: Route.ActionArgs) {
    if (!context.currentUser) return redirect('/login')
    if (context.currentUser.role !== Role.ADMIN) return redirect('/')
   

    // Get the tournament to check current status and players
    let tournament = await context.prisma.tournament.findUniqueOrThrow({
        where: { id: Number(params.tournamentId) },
        include: {
          players: { include: { user: { select: { nickname: true } } } },
        },
      })

    await context.prisma.tournament.update({
      where: { id: Number(params.tournamentId) },
      data: { 
        status: TournamentStatus.OPEN_ROUND 
      }
    })

    return data({ success: true })
  }
  
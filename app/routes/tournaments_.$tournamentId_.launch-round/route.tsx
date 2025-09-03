import { data, redirect } from "react-router"
import type { Route } from "../+types/_base-layout"
import { Role, TournamentStatus } from "~/generated/prisma/enums"
import type { ContextType } from "react"


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

    let lastRound = await context.prisma.round.findFirst({
      where: { tournamentId: Number(params.tournamentId)},
      orderBy: { roundNumber: "desc"}
    })

    let lastRoundNumber = 0

    if (lastRound) {
      lastRoundNumber = lastRound.roundNumber
    }

    await context.prisma.round.create({
      data: {
        tournamentId: Number(params.tournamentId),
        roundNumber: lastRoundNumber +1 
      },
    })

    return data({ success: true })
  }
  
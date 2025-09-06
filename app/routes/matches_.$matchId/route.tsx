import { redirect } from "react-router";
import type { Route } from "../+types/_base-layout";
import Center from "~/components/center/center.component";

export async function loader({ context, params }: Route.LoaderArgs) {
    if (!context.currentUser) return redirect('/login')
    
    let match = await context.prisma.match.findUniqueOrThrow(
        {
            where: {id: Number(params.matchId)},
            include: {players: {include: {user: {select: {nickname: true}}}}}
        }
    )
    
    return {match}
}

// export async function loader({ context, params }: Route.LoaderArgs) {
//     if (!context.currentUser) return redirect('/login')
  
//     let tournamentPlayer =
//       await context.prisma.tournamentPlayer.findUniqueOrThrow({
//         where: { id: Number(params.tournamentPlayerId) },
//         include: {
//           user: true,
//           matches: {
//             include: {
//               matchResults: { include: { player: { include: { user: true } } } },
//             },
//           },
//         },
//       })
  
//     return {
//       tournamentPlayer,
//     }
//   }

  export default function Route({ loaderData, params }: Route.ComponentProps) {
    return(
        <Center>
            <h2>Jogadores</h2>
            <ul className="list-outside list-disc">
                {loaderData.match.players.map((player) => (
                    <li key={player.id}>
                        {player.user.nickname}
                    </li>
                ))}
            </ul>
        </Center>
    )
}
import { EventStatus, Role, TournamentStatus } from '~/generated/prisma/enums'

/** Inscrição espontânea (usuário logado). Admin pode mesmo com torneio/evento encerrados. */
export function canUserSelfEnrollInTournament(args: {
  role: Role
  tournamentStatus: TournamentStatus
  eventStatus: EventStatus | null | undefined
}) {
  if (args.role === Role.ADMIN) return true
  if (args.tournamentStatus !== TournamentStatus.REGISTRATION_OPEN) return false
  if (args.eventStatus != null && args.eventStatus !== EventStatus.ABERTO) return false
  return true
}

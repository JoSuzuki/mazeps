-- AlterTable
ALTER TABLE "public"."EventParticipant" ADD COLUMN "tournamentPlace" INTEGER;

-- CreateIndex (uma pessoa por posição 1/2/3 por evento; NULLs não conflitam no Postgres)
CREATE UNIQUE INDEX "EventParticipant_eventId_tournamentPlace_key" ON "public"."EventParticipant"("eventId", "tournamentPlace");

/*
  Warnings:

  - You are about to drop the column `name` on the `TournamentPlayer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tournamentId,userId]` on the table `TournamentPlayer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."TournamentPlayer" DROP COLUMN "name";

-- CreateIndex
CREATE INDEX "TournamentPlayer_tournamentId_userId_idx" ON "public"."TournamentPlayer"("tournamentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentPlayer_tournamentId_userId_key" ON "public"."TournamentPlayer"("tournamentId", "userId");

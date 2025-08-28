/*
  Warnings:

  - The `status` column on the `Round` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Tournament` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `MatchResults` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Player` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MatchToPlayer` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('REGISTRATION_OPEN', 'OPEN_ROUND', 'FINISHED_ROUND', 'TOURNAMENT_FINISHED');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('ACTIVE', 'FINISHED');

-- DropForeignKey
ALTER TABLE "MatchResults" DROP CONSTRAINT "MatchResults_matchId_fkey";

-- DropForeignKey
ALTER TABLE "MatchResults" DROP CONSTRAINT "MatchResults_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "_MatchToPlayer" DROP CONSTRAINT "_MatchToPlayer_A_fkey";

-- DropForeignKey
ALTER TABLE "_MatchToPlayer" DROP CONSTRAINT "_MatchToPlayer_B_fkey";

-- AlterTable
ALTER TABLE "Round" DROP COLUMN "status",
ADD COLUMN     "status" "RoundStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "name" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "TournamentStatus" NOT NULL DEFAULT 'REGISTRATION_OPEN';

-- DropTable
DROP TABLE "MatchResults";

-- DropTable
DROP TABLE "Player";

-- DropTable
DROP TABLE "_MatchToPlayer";

-- CreateTable
CREATE TABLE "TournamentPlayer" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "tournamentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "TournamentPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchResult" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MatchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MatchToTournamentPlayer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MatchToTournamentPlayer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MatchToTournamentPlayer_B_index" ON "_MatchToTournamentPlayer"("B");

-- AddForeignKey
ALTER TABLE "TournamentPlayer" ADD CONSTRAINT "TournamentPlayer_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentPlayer" ADD CONSTRAINT "TournamentPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "TournamentPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchToTournamentPlayer" ADD CONSTRAINT "_MatchToTournamentPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchToTournamentPlayer" ADD CONSTRAINT "_MatchToTournamentPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "TournamentPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

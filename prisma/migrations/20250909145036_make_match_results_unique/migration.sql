/*
  Warnings:

  - A unique constraint covering the columns `[playerId,matchId]` on the table `MatchResult` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "MatchResult_playerId_matchId_idx" ON "public"."MatchResult"("playerId", "matchId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchResult_playerId_matchId_key" ON "public"."MatchResult"("playerId", "matchId");

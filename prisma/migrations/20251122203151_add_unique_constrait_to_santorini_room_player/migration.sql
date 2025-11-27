/*
  Warnings:

  - A unique constraint covering the columns `[roomId,userId]` on the table `SantoriniRoomPlayer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "SantoriniRoomPlayer_roomId_userId_idx" ON "public"."SantoriniRoomPlayer"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SantoriniRoomPlayer_roomId_userId_key" ON "public"."SantoriniRoomPlayer"("roomId", "userId");

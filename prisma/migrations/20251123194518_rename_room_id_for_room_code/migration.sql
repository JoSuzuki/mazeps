/*
  Warnings:

  - You are about to drop the column `roomId` on the `SantoriniRoom` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roomCode]` on the table `SantoriniRoom` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomCode` to the `SantoriniRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."SantoriniRoom_roomId_idx";

-- DropIndex
DROP INDEX "public"."SantoriniRoom_roomId_key";

-- AlterTable
ALTER TABLE "public"."SantoriniRoom" DROP COLUMN "roomId",
ADD COLUMN     "roomCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SantoriniRoom_roomCode_key" ON "public"."SantoriniRoom"("roomCode");

-- CreateIndex
CREATE INDEX "SantoriniRoom_roomCode_idx" ON "public"."SantoriniRoom"("roomCode");

-- CreateEnum
CREATE TYPE "public"."SantoriniRoomStatus" AS ENUM ('WAITING', 'PLAYING', 'FINISHED');

-- AlterTable
ALTER TABLE "public"."SantoriniRoom" ADD COLUMN     "status" "public"."SantoriniRoomStatus" NOT NULL DEFAULT 'WAITING';

-- CreateTable
CREATE TABLE "public"."SantoriniRoomPlayer" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "SantoriniRoomPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SantoriniRoom_roomId_idx" ON "public"."SantoriniRoom"("roomId");

-- AddForeignKey
ALTER TABLE "public"."SantoriniRoomPlayer" ADD CONSTRAINT "SantoriniRoomPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SantoriniRoomPlayer" ADD CONSTRAINT "SantoriniRoomPlayer_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."SantoriniRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

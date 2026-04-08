-- CreateEnum
CREATE TYPE "public"."DuoRegnaRoomStatus" AS ENUM ('WAITING', 'PLAYING', 'FINISHED');

-- CreateTable
CREATE TABLE "public"."DuoRegnaRoom" (
    "id" SERIAL NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "roomCode" TEXT NOT NULL,
    "status" "public"."DuoRegnaRoomStatus" NOT NULL DEFAULT 'WAITING',
    "gameState" JSONB NOT NULL,

    CONSTRAINT "DuoRegnaRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DuoRegnaRoomPlayer" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "seat" INTEGER NOT NULL,
    "winner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DuoRegnaRoomPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DuoRegnaRoom_roomCode_key" ON "public"."DuoRegnaRoom"("roomCode");

-- CreateIndex
CREATE INDEX "DuoRegnaRoom_roomCode_idx" ON "public"."DuoRegnaRoom"("roomCode");

-- CreateIndex
CREATE INDEX "DuoRegnaRoomPlayer_roomId_userId_idx" ON "public"."DuoRegnaRoomPlayer"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "DuoRegnaRoomPlayer_roomId_userId_key" ON "public"."DuoRegnaRoomPlayer"("roomId", "userId");

-- AddForeignKey
ALTER TABLE "public"."DuoRegnaRoom" ADD CONSTRAINT "DuoRegnaRoom_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DuoRegnaRoomPlayer" ADD CONSTRAINT "DuoRegnaRoomPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DuoRegnaRoomPlayer" ADD CONSTRAINT "DuoRegnaRoomPlayer_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."DuoRegnaRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

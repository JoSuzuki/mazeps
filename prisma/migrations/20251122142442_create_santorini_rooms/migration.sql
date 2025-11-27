-- CreateTable
CREATE TABLE "public"."SantoriniRoom" (
    "id" SERIAL NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "roomId" TEXT NOT NULL,
    "gameState" JSONB NOT NULL,

    CONSTRAINT "SantoriniRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SantoriniRoom_roomId_key" ON "public"."SantoriniRoom"("roomId");

-- AddForeignKey
ALTER TABLE "public"."SantoriniRoom" ADD CONSTRAINT "SantoriniRoom_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('NONE', 'IMAGE', 'VIDEO', 'AUDIO');

-- CreateTable
CREATE TABLE "public"."Enigma" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Enigma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EnigmaPhase" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enigmaId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "mediaType" "public"."MediaType" NOT NULL DEFAULT 'NONE',
    "mediaUrl" TEXT,
    "imageFile" TEXT,
    "imageAlt" TEXT,
    "phrase" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "tipPhrase" TEXT,

    CONSTRAINT "EnigmaPhase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enigma_slug_key" ON "public"."Enigma"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "EnigmaPhase_enigmaId_order_key" ON "public"."EnigmaPhase"("enigmaId", "order");

-- AddForeignKey
ALTER TABLE "public"."EnigmaPhase" ADD CONSTRAINT "EnigmaPhase_enigmaId_fkey" FOREIGN KEY ("enigmaId") REFERENCES "public"."Enigma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

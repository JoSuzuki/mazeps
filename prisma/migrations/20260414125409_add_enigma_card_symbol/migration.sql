-- CreateEnum
CREATE TYPE "public"."EnigmaCardSymbol" AS ENUM ('DOOR', 'KEY', 'LOCK', 'EYE', 'MOON', 'SCROLL', 'MAGNIFYING_GLASS', 'QUESTION_MARK', 'COMPASS', 'CRYSTAL_BALL');

-- AlterTable
ALTER TABLE "public"."Enigma" ADD COLUMN     "cardSymbol" "public"."EnigmaCardSymbol" NOT NULL DEFAULT 'DOOR';

-- CreateEnum
CREATE TYPE "public"."TournamentPlayerStatus" AS ENUM ('ACTIVE', 'DROPPED');

-- AlterTable
ALTER TABLE "public"."TournamentPlayer" ADD COLUMN     "status" "public"."TournamentPlayerStatus" NOT NULL DEFAULT 'ACTIVE';

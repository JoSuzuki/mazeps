-- AlterTable
ALTER TABLE "EnigmaPhase" ADD COLUMN "playPathToken" TEXT;

-- Backfill opaque tokens (32 hex chars per row; gen_random_uuid é nativo no PG 13+)
UPDATE "EnigmaPhase" SET "playPathToken" = replace(gen_random_uuid()::text, '-', '') WHERE "playPathToken" IS NULL;

-- NotNull
ALTER TABLE "EnigmaPhase" ALTER COLUMN "playPathToken" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EnigmaPhase_enigmaId_playPathToken_key" ON "EnigmaPhase"("enigmaId", "playPathToken");

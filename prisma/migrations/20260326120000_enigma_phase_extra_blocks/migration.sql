-- Blocos opcionais: mais mídias / dicas por fase (JSON arrays)

ALTER TABLE "EnigmaPhase" ADD COLUMN IF NOT EXISTS "extraMediaBlocks" JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE "EnigmaPhase" ADD COLUMN IF NOT EXISTS "extraPhrases" JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE "EnigmaPhase" ADD COLUMN IF NOT EXISTS "extraTipPhrases" JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE "EnigmaPhase" ADD COLUMN IF NOT EXISTS "extraHiddenHints" JSONB NOT NULL DEFAULT '[]'::jsonb;

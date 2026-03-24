-- Idempotente: garante hiddenHint em EnigmaPhase (corrige bases desalinhadas com o histórico de migrações).
ALTER TABLE "EnigmaPhase" ADD COLUMN IF NOT EXISTS "hiddenHint" TEXT;

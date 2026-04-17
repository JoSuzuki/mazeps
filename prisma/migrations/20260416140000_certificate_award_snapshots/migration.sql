-- Cópia no momento da conquista: o perfil usa estes campos (a fase pode ser editada depois).
ALTER TABLE "EnigmaPhaseCertificateAward" ADD COLUMN "awardTitle" TEXT;
ALTER TABLE "EnigmaPhaseCertificateAward" ADD COLUMN "awardImageUrl" TEXT;

UPDATE "EnigmaPhaseCertificateAward" AS a
SET
  "awardTitle" = COALESCE(NULLIF(TRIM(ep."certificateTitle"), ''), 'Certificado'),
  "awardImageUrl" = NULLIF(TRIM(ep."certificateImageUrl"), '')
FROM "EnigmaPhase" AS ep
WHERE ep."id" = a."enigmaPhaseId";

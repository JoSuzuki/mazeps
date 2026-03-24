-- Dica escondida por fase: copia valor antigo do enigma para a primeira fase de cada enigma, depois remove da tabela Enigma.

ALTER TABLE "EnigmaPhase" ADD COLUMN "hiddenHint" TEXT;

UPDATE "EnigmaPhase" ep
SET "hiddenHint" = e."hiddenHint"
FROM "Enigma" e
WHERE ep."enigmaId" = e.id
  AND e."hiddenHint" IS NOT NULL
  AND ep."order" = (
    SELECT MIN(ep2."order") FROM "EnigmaPhase" ep2 WHERE ep2."enigmaId" = e.id
  );

ALTER TABLE "Enigma" DROP COLUMN "hiddenHint";

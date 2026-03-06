-- Backfill: create an Event record for every existing Tournament
INSERT INTO "Event" ("createdAt", "updatedAt", "name", "type", "tournamentId")
SELECT "createdAt", "updatedAt", "name", 'TOURNAMENT'::"EventType", "id"
FROM "Tournament"
WHERE "id" NOT IN (
  SELECT "tournamentId" FROM "Event" WHERE "tournamentId" IS NOT NULL
);
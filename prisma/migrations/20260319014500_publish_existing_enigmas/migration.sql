-- Marcar como publicados os enigmas que já tinham fases (comportamento anterior)
UPDATE "public"."Enigma" e
SET published = true
WHERE (SELECT COUNT(*) FROM "public"."EnigmaPhase" ep WHERE ep."enigmaId" = e.id) > 0;

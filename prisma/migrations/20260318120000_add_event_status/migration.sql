-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('SECRETO', 'ABERTO', 'ENCERRADO');

-- Add status column
ALTER TABLE "Event" ADD COLUMN "status" "EventStatus" NOT NULL DEFAULT 'ABERTO';

-- Migrate data from isOpen
UPDATE "Event" SET "status" = CASE WHEN "isOpen" = true THEN 'ABERTO'::"EventStatus" ELSE 'ENCERRADO'::"EventStatus" END;

-- Drop isOpen
ALTER TABLE "Event" DROP COLUMN "isOpen";

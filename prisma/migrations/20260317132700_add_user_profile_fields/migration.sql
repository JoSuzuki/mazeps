-- AlterTable
ALTER TABLE "public"."BlogPost" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "birthday" TIMESTAMP(3),
ADD COLUMN     "favoriteEvent" TEXT,
ADD COLUMN     "favoriteGame" TEXT,
ADD COLUMN     "instagram" TEXT;

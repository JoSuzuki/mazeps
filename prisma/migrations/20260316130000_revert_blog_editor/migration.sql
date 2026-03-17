-- Revert blog editor: remove BlogPost table and isWriter column
DROP TABLE IF EXISTS "BlogPost" CASCADE;
ALTER TABLE "User" DROP COLUMN IF EXISTS "isWriter";

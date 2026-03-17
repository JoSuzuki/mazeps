-- AlterTable (só executa se BlogPost existir - pode ter sido dropado por revert_blog_editor)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'BlogPost') THEN
    ALTER TABLE "public"."BlogPost" ALTER COLUMN "updatedAt" DROP DEFAULT;
  END IF;
END $$;

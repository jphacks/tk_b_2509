CREATE TYPE "Mood" AS ENUM ('relax', 'focus', 'idea', 'chat');

ALTER TABLE "Post" ADD COLUMN "mood_tmp" "Mood";

UPDATE "Post"
SET "mood_tmp" = CASE
  WHEN "mood_type" IN ('relax', 'focus', 'idea', 'chat') THEN "mood_type"::"Mood"
  WHEN "mood_type" = 'happy' THEN 'relax'::"Mood"
  WHEN "mood_type" = 'calm' THEN 'relax'::"Mood"
  WHEN "mood_type" = 'excited' THEN 'idea'::"Mood"
  WHEN "mood_type" = 'thoughtful' THEN 'focus'::"Mood"
  WHEN "mood_type" = 'sad' THEN 'chat'::"Mood"
  ELSE 'relax'::"Mood"
END;

ALTER TABLE "Post" ALTER COLUMN "mood_tmp" SET NOT NULL;

ALTER TABLE "Post" DROP COLUMN "mood_type";

ALTER TABLE "Post" RENAME COLUMN "mood_tmp" TO "mood_type";

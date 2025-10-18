-- Added post random key columns and indexes to align migration history with existing schema.
ALTER TABLE "Post" ADD COLUMN "random_key_1" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Post" ADD COLUMN "random_key_2" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Post" ADD COLUMN "random_key_3" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Post" ADD COLUMN "random_key_4" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Post" ADD COLUMN "random_key_5" DOUBLE PRECISION NOT NULL DEFAULT 0;

ALTER TABLE "Post" ALTER COLUMN "random_key_1" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "random_key_2" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "random_key_3" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "random_key_4" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "random_key_5" DROP DEFAULT;

CREATE INDEX "Post_random_key_1_idx" ON "Post"("random_key_1");
CREATE INDEX "Post_random_key_2_idx" ON "Post"("random_key_2");
CREATE INDEX "Post_random_key_3_idx" ON "Post"("random_key_3");
CREATE INDEX "Post_random_key_4_idx" ON "Post"("random_key_4");
CREATE INDEX "Post_random_key_5_idx" ON "Post"("random_key_5");

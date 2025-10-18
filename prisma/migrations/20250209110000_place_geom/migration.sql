-- AlterTable
ALTER TABLE "Place" ADD COLUMN "geom" GEOGRAPHY(Point,4326);

UPDATE "Place"
SET "geom" = ST_SetSRID(ST_MakePoint("lng"::float8, "lat"::float8), 4326)
WHERE "geom" IS NULL AND "lat" IS NOT NULL AND "lng" IS NOT NULL;

ALTER TABLE "Place" ALTER COLUMN "geom" SET NOT NULL;

ALTER TABLE "Place" DROP COLUMN "lat";

ALTER TABLE "Place" DROP COLUMN "lng";

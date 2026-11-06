ALTER TABLE "public"."sails"
  DROP CONSTRAINT "sail_size_check";

ALTER TABLE "public"."sails"
  ALTER COLUMN "size" DROP DEFAULT;

ALTER TABLE "public"."sails"
  ALTER COLUMN "size" TYPE numeric(3,1) USING "size"::numeric(3,1);

ALTER TABLE "public"."sails"
  ADD CONSTRAINT "sail_size_check" CHECK ((size > (0)::numeric));

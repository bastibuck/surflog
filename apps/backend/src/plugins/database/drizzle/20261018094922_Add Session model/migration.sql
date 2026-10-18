CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(100) NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "sails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"size" integer NOT NULL,
	"alias" varchar(30),
	"brand_id" uuid NOT NULL,
	CONSTRAINT "sail_size_check" CHECK ("size" > 0)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(50) NOT NULL,
	"date" date NOT NULL,
	"rating" smallint NOT NULL,
	"notes" varchar(500),
	"spot_id" uuid NOT NULL,
	"sail_id" uuid NOT NULL,
	CONSTRAINT "sessions_name_date_unique" UNIQUE("name","date"),
	CONSTRAINT "sessions_rating_check" CHECK ("rating" between 1 and 10)
);
--> statement-breakpoint
CREATE TABLE "spots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(50) NOT NULL UNIQUE
);
--> statement-breakpoint
ALTER TABLE "sails" ADD CONSTRAINT "sails_brand_id_brands_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_spot_id_spots_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "spots"("id");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_sail_id_sails_id_fkey" FOREIGN KEY ("sail_id") REFERENCES "sails"("id");
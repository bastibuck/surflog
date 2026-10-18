CREATE TABLE "public"."brands" (
  "id"   uuid                   NOT NULL DEFAULT gen_random_uuid(),
  "name" character varying(100) NOT NULL,
  CONSTRAINT "brands_name_key" UNIQUE (name),
  CONSTRAINT "brands_pkey" PRIMARY KEY (id)
);

CREATE TABLE "public"."sails" (
  "id"       uuid                  NOT NULL DEFAULT gen_random_uuid(),
  "size"     integer               NOT NULL,
  "alias"    character varying(30),
  "brand_id" uuid                  NOT NULL,
  CONSTRAINT "sail_size_check" CHECK ((size > 0)),
  CONSTRAINT "sails_pkey" PRIMARY KEY (id)
);

CREATE TABLE "public"."sessions" (
  "id"      uuid                   NOT NULL DEFAULT gen_random_uuid(),
  "name"    character varying(50)  NOT NULL,
  "date"    date                   NOT NULL,
  "rating"  smallint               NOT NULL,
  "notes"   character varying(500),
  "spot_id" uuid                   NOT NULL,
  "sail_id" uuid                   NOT NULL,
  CONSTRAINT "sessions_name_date_unique" UNIQUE (name, date),
  CONSTRAINT "sessions_pkey" PRIMARY KEY (id),
  CONSTRAINT "sessions_rating_check" CHECK (((rating >= 1) AND (rating <= 10)))
);

CREATE TABLE "public"."spots" (
  "id"   uuid                  NOT NULL DEFAULT gen_random_uuid(),
  "name" character varying(50) NOT NULL,
  CONSTRAINT "spots_name_key" UNIQUE (name),
  CONSTRAINT "spots_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."sails"
  ADD CONSTRAINT "sails_brand_id_brands_id_fkey" FOREIGN KEY (brand_id) REFERENCES public.brands(id);

ALTER TABLE "public"."sessions"
  ADD CONSTRAINT "sessions_sail_id_sails_id_fkey" FOREIGN KEY (sail_id) REFERENCES public.sails(id);

ALTER TABLE "public"."sessions"
  ADD CONSTRAINT "sessions_spot_id_spots_id_fkey" FOREIGN KEY (spot_id) REFERENCES public.spots(id);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."brands" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."brands" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."brands" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."brands" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."sails" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."sails" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."sails" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."sails" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."sessions" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."sessions" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."sessions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."sessions" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."spots" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."spots" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."spots" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."spots" TO "service_role";

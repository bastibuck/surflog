ALTER TABLE "public"."brands"
  DROP CONSTRAINT "brands_name_key";

ALTER TABLE "public"."sessions"
  DROP CONSTRAINT "sessions_name_date_unique";

ALTER TABLE "public"."spots"
  DROP CONSTRAINT "spots_name_key";

CREATE UNIQUE INDEX brand_name_lower_unique ON public.brands USING btree (lower((name)::text));

CREATE UNIQUE INDEX sail_unique_with_alias ON public.sails USING btree (size, brand_id, lower((alias)::text));

CREATE UNIQUE INDEX sail_unique_without_alias ON public.sails USING btree (size, brand_id)
  WHERE (alias IS NULL);

CREATE UNIQUE INDEX sessions_name_date_unique ON public.sessions USING btree (lower((name)::text), date);

CREATE UNIQUE INDEX spots_name_lower_unique ON public.spots USING btree (lower((name)::text));

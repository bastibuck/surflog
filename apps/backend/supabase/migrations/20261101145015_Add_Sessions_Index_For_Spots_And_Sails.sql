CREATE INDEX sessions_sail_id_index ON public.sessions USING btree (sail_id);

CREATE INDEX sessions_spot_id_index ON public.sessions USING btree (spot_id);

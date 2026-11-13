CREATE TABLE "public"."session_shares" (
  "id"         uuid                        NOT NULL DEFAULT gen_random_uuid(),
  "expires_at" timestamp(0) with time zone NOT NULL DEFAULT (now() + '1 day'::interval),
  "session_id" uuid                        NOT NULL,
  CONSTRAINT "session_shares_pkey" PRIMARY KEY (id),
  CONSTRAINT "session_shares_session_id_key" UNIQUE (session_id)
);

ALTER TABLE "public"."session_shares"
  ADD CONSTRAINT "session_shares_session_id_sessions_id_fkey" FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."session_shares" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."session_shares" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."session_shares" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."session_shares" TO "service_role";

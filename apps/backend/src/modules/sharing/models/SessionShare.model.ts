import { sql } from "drizzle-orm";
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessionsTable } from "../../sessions/models/Session.model.ts";

export const sessionSharesTable = pgTable("session_shares", {
  id: uuid().primaryKey().defaultRandom().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, precision: 0 })
    .default(sql`now() + interval '1 day'`)
    .notNull(),

  sessionId: uuid("session_id")
    .notNull()
    .unique()
    .references(() => sessionsTable.id, {
      onDelete: "cascade",
    }),
});

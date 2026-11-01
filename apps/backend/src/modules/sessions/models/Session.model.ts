import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  pgTable,
  smallint,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sailsTable } from "../../gear/models/Sail.model.ts";
import { spotsTable } from "../../spots/models/Spot.model.ts";

export const sessionsTable = pgTable(
  "sessions",
  {
    id: uuid().primaryKey().defaultRandom().notNull(),
    name: varchar({ length: 50 }).notNull(),
    date: date({ mode: "string" }).notNull(),
    rating: smallint().notNull(),
    notes: varchar({ length: 500 }),

    // relations
    spotId: uuid("spot_id")
      .notNull()
      .references(() => spotsTable.id),

    sailId: uuid("sail_id")
      .notNull()
      .references(() => sailsTable.id),
  },
  (t) => [
    check(
      sessionsTableConstraints.sessionsRatingCheck,
      sql`${t.rating} between 1 and 10`,
    ),
    uniqueIndex("sessions_name_date_unique").on(sql`lower(${t.name})`, t.date),
    index("sessions_sail_id_index").on(t.sailId),
    index("sessions_spot_id_index").on(t.spotId),
  ],
);

export const sessionsTableConstraints = {
  sessionsRatingCheck: "sessions_rating_check",
} as const;

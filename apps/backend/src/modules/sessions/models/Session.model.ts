import { sql } from "drizzle-orm";
import {
  check,
  date,
  pgTable,
  smallint,
  unique,
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
    unique().on(t.name, t.date),
    check("rating_check", sql`${t.rating} between 1 and 10`),
  ],
);

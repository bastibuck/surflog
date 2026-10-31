import { sql } from "drizzle-orm";
import { pgTable, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const spotsTable = pgTable(
  "spots",
  {
    id: uuid().primaryKey().defaultRandom().notNull(),
    name: varchar({ length: 50 }).notNull(),
    // coordionates using PostGIS?
  },
  (t) => [uniqueIndex("spots_name_lower_unique").on(sql`lower(${t.name})`)],
);

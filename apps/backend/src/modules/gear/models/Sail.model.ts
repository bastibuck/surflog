import { check, integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { brandsTable } from "./Brand.model.ts";
import { sql } from "drizzle-orm";

export const sailsTable = pgTable(
  "sails",
  {
    id: uuid().primaryKey().defaultRandom().notNull(),
    size: integer().notNull(),
    alias: varchar({ length: 30 }),

    // relations
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brandsTable.id),
  },
  (t) => [check("sail_size_check", sql`${t.size} > 0`)],
);

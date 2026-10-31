import { sql } from "drizzle-orm";
import { pgTable, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const brandsTable = pgTable(
  "brands",
  {
    id: uuid().primaryKey().defaultRandom().notNull(),
    name: varchar({ length: 100 }).notNull(),
  },
  (t) => [uniqueIndex("brand_name_lower_unique").on(sql`lower(${t.name})`)],
);

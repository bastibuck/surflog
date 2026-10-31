import {
  check,
  integer,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
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
  (t) => [
    check(sailsTableConstraints.sailSizeCheck, sql`${t.size} > 0`),
    uniqueIndex("sail_unique_with_alias").on(
      t.size,
      t.brandId,
      sql`lower(${t.alias})`,
    ),
    uniqueIndex("sail_unique_without_alias")
      .on(t.size, t.brandId)
      .where(sql`${t.alias} is null`),
  ],
);

export const sailsTableConstraints = {
  sailSizeCheck: "sail_size_check",
} as const;

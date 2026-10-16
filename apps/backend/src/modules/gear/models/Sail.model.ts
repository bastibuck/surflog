import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { brandsTable } from "./Brand.model.ts";

export const sailsTable = pgTable("sails", {
  id: uuid().primaryKey().defaultRandom().notNull(),
  size: integer().notNull(), // TODO: enforce positive values
  alias: varchar({ length: 30 }),

  // relations
  brandId: uuid("brand_id")
    .notNull()
    .references(() => brandsTable.id),
});

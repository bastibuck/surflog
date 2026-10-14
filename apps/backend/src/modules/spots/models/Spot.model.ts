import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const spotsTable = pgTable("spots", {
  id: uuid().primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 50 }).notNull().unique(),
  // coordionates using PostGIS?
});

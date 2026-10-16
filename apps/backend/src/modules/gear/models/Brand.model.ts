import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const brandsTable = pgTable("brands", {
  id: uuid().primaryKey().defaultRandom().notNull(),
  name: varchar().notNull().unique(),
});

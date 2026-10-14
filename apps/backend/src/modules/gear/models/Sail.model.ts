import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const sailsTable = pgTable("sails", {
  id: uuid().primaryKey().defaultRandom().notNull(),
  brand: varchar({ length: 50 }), // TODO: relation?!
  size: integer().notNull(),
});

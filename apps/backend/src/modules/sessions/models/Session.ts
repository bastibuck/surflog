import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const sessionsTable = pgTable("sessions", {
  id: uuid().primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 50 }).notNull(),

  // TODO: date + unique constraint for name + date
});

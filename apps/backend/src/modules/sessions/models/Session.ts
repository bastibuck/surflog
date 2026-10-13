import { date, pgTable, unique, uuid, varchar } from "drizzle-orm/pg-core";

export const sessionsTable = pgTable(
  "sessions",
  {
    id: uuid().primaryKey().defaultRandom().notNull(),
    name: varchar({ length: 50 }).notNull(),
    date: date({ mode: "string" }).notNull(),
  },
  (t) => [unique().on(t.name, t.date)],
);

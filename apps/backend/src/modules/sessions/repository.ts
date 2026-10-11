import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { sessionsTable } from "./models/Session.ts";
import { eq } from "drizzle-orm/pg-core/expressions";
import { type InferInsertModel } from "drizzle-orm";
import { executeDbCommand, executeDbQuery } from "../../lib/database.ts";
import type { Repository } from "../../lib/types/Repository.ts";
import { failure } from "../../lib/typed-result.ts";

const createSessionsRepository = (db: PostgresJsDatabase) => {
  return {
    list: () => executeDbQuery(db.select().from(sessionsTable)),

    findById: async (id: string) => {
      const result = await executeDbQuery(
        db
          .select()
          .from(sessionsTable)
          .where(eq(sessionsTable.id, id))
          .limit(1),
      );

      if (result.success === false) {
        return result;
      }

      if (result.data.length === 0) {
        return failure("NOT_FOUND" as const);
      }

      return { success: true, data: result.data[0] };
    },

    create: (session: InferInsertModel<typeof sessionsTable>) => {
      return executeDbCommand(
        db
          .insert(sessionsTable)
          .values({ name: session.name, date: session.date }),
      );
    },

    delete: (id: string) => {
      return executeDbCommand(
        db.delete(sessionsTable).where(eq(sessionsTable.id, id)),
      );
    },
  } satisfies Repository;
};

export { createSessionsRepository };

export type SessionsRepository = ReturnType<typeof createSessionsRepository>;

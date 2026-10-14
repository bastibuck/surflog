import { type InferInsertModel } from "drizzle-orm";
import { eq } from "drizzle-orm/pg-core/expressions";
import type { FastifyInstance } from "fastify";

import { executeDbCommand, executeDbQuery } from "../../lib/database.ts";
import { failure } from "../../lib/typed-result.ts";
import type { Repository } from "../../lib/types/Repository.ts";
import { sessionsTable } from "./models/Session.model.ts";

const createSessionsRepository = (db: FastifyInstance["db"]) => {
  return {
    list: () =>
      executeDbQuery(
        db.query.sessions.findMany({
          columns: {
            id: true,
            name: true,
            date: true,
            rating: true,
          },
        }),
      ),

    findById: async (id: string) => {
      const result = await executeDbQuery(
        db.query.sessions.findFirst({
          columns: {
            id: true,
            name: true,
            date: true,
            rating: true,
          },
          where: {
            id: id,
          },
        }),
      );

      if (result.success === false) {
        return result;
      }

      if (result.data === undefined) {
        return failure("NOT_FOUND" as const);
      }

      return result;
    },

    create: (session: InferInsertModel<typeof sessionsTable>) => {
      return executeDbCommand(db.insert(sessionsTable).values(session));
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

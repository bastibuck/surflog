import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { sessionsTable } from "./models/Session.ts";
import { eq } from "drizzle-orm/pg-core/expressions";
import type { InferInsertModel } from "drizzle-orm";

export type SessionsRepository = ReturnType<typeof createSessionsRepository>;

declare module "fastify" {
  interface FastifyInstance {
    sessionsRepository: SessionsRepository;
  }
}

const createSessionsRepository = (db: PostgresJsDatabase) => {
  return {
    list: async () => await db.select().from(sessionsTable),

    findById: async (id: string) => {
      const [session] = await db
        .select()
        .from(sessionsTable)
        .where(eq(sessionsTable.id, id))
        .limit(1);

      return session ?? null;
    },

    create: async (session: InferInsertModel<typeof sessionsTable>) => {
      await db.insert(sessionsTable).values({ name: session.name });
    },

    delete: async (id: string) => {
      await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
    },
  };
};

export { createSessionsRepository };

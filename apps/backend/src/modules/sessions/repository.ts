import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export interface SessionsRepository {
  list: () => Promise<any[]>;
  details: (id: string) => Promise<any>;
}

declare module "fastify" {
  interface FastifyInstance {
    sessionsRepository: SessionsRepository;
  }
}

const createSessionsRepository = (
  _db: PostgresJsDatabase,
): SessionsRepository => {
  return {
    list: async () => {
      const sessions = [
        {
          id: "98c0dc2a-89cd-473b-bd79-f6a845a835d0",
          name: "Real session",
        },
      ] as any[];

      return sessions;
    },

    details: async (_id: string) => {
      const session = {
        id: "98c0dc2a-89cd-473b-bd79-f6a845a835d0",
        name: "Real session",
      } as any;

      return session;
    },
  };
};

export { createSessionsRepository };

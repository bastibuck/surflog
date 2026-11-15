import type { FastifyInstance } from "fastify";
import { eq, sql } from "drizzle-orm";

import { withDatabaseResult } from "../../lib/database.ts";
import type { Repository } from "../../lib/types/Repository.ts";
import { sessionSharesTable } from "../sharing/models/SessionShare.model.ts";

const createSessionSharesRepository = (db: FastifyInstance["db"]) => {
  return {
    create: (sessionId: string) =>
      withDatabaseResult(async () => {
        const [result] = await db
          .insert(sessionSharesTable)
          .values({
            sessionId,
          })
          .returning({
            id: sessionSharesTable.id,
          })
          // prolongs expiry time and rotates the ID
          .onConflictDoUpdate({
            target: sessionSharesTable.sessionId,
            set: {
              id: sql`DEFAULT`,
              expiresAt: sql`DEFAULT`,
            },
          });

        return {
          shareLink: `https://surflog.app/sharing/session/${result.id}`, // TODO! get this from config/env
        };
      }),

    delete: (sessionId: string) =>
      withDatabaseResult(async () => {
        await db
          .delete(sessionSharesTable)
          .where(eq(sessionSharesTable.sessionId, sessionId));
      }),
  } satisfies Repository;
};

export { createSessionSharesRepository };

export type SessionSharesRepository = ReturnType<
  typeof createSessionSharesRepository
>;

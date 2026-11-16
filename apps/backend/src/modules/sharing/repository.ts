import type { FastifyInstance } from "fastify";
import { eq, sql } from "drizzle-orm";

import { EntityNotFoundError, withDatabaseResult } from "../../lib/database.ts";
import type { Repository } from "../../lib/types/Repository.ts";
import { sessionSharesTable } from "../sharing/models/SessionShare.model.ts";
import { createSessionsRepository } from "../sessions/repository.ts";

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

        return result.id;
      }),

    delete: (sessionId: string) =>
      withDatabaseResult(async () => {
        await db
          .delete(sessionSharesTable)
          .where(eq(sessionSharesTable.sessionId, sessionId));
      }),

    viewSharedSession: (shareId: string) =>
      withDatabaseResult(async () => {
        const result = await db.query.session_shares.findFirst({
          columns: {
            sessionId: true,
          },
          where: {
            AND: [
              {
                id: shareId,
              },
              {
                expiresAt: { gt: new Date() },
              },
            ],
          },
        });

        if (result === undefined) {
          throw new EntityNotFoundError("session_shares", shareId);
        }

        const sessionRepository = createSessionsRepository(db);

        return sessionRepository.findById(result.sessionId);
      }),
  } satisfies Repository;
};

export { createSessionSharesRepository };

export type SessionSharesRepository = ReturnType<
  typeof createSessionSharesRepository
>;

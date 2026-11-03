import { and, count, gte, lte } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { z } from "zod";

import { withDatabaseResult } from "../../../lib/database.ts";
import type { Repository } from "../../../lib/types/Repository.ts";
import { sessionsTable } from "../../sessions/models/Session.model.ts";
import { GetSessionsCountFilterSchema } from "@surflog/shared/api-schema/stats/StatsSchema";

const createSessionsStatsRepository = (db: FastifyInstance["db"]) => {
  return {
    getCount: (filters: z.infer<typeof GetSessionsCountFilterSchema> = {}) =>
      withDatabaseResult(async () => {
        const [result] = await db
          .select({ count: count(sessionsTable.id) })
          .from(sessionsTable)
          .where(
            and(
              filters.from ? gte(sessionsTable.date, filters.from) : undefined,
              filters.to ? lte(sessionsTable.date, filters.to) : undefined,
            ),
          );

        return result.count;
      }),
  } satisfies Repository;
};

export { createSessionsStatsRepository };

export type SessionsStatsRepository = ReturnType<
  typeof createSessionsStatsRepository
>;

import { and, avg, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { z } from "zod";

import { withDatabaseResult } from "../../../lib/database.ts";
import type { Repository } from "../../../lib/types/Repository.ts";
import { sessionsTable } from "../../sessions/models/Session.model.ts";
import {
  GetBestSessionFilterSchema,
  GetSessionsAverageRatingFilterSchema,
  GetSessionsCountFilterSchema,
} from "@surflog/shared/api-schema/stats/StatsSchema";
import { spotsTable } from "../../spots/models/Spot.model.ts";

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

    getAverageRating: (
      filters: z.infer<typeof GetSessionsAverageRatingFilterSchema> = {},
    ) =>
      withDatabaseResult(async () => {
        const [result] = await db
          .select({ average: avg(sessionsTable.rating).mapWith(Number) })
          .from(sessionsTable)
          .where(
            and(
              filters.from ? gte(sessionsTable.date, filters.from) : undefined,
              filters.to ? lte(sessionsTable.date, filters.to) : undefined,
            ),
          );

        return result.average;
      }),

    getBestSession: (
      filters: z.infer<typeof GetBestSessionFilterSchema> = {},
    ) =>
      withDatabaseResult(async () => {
        const [session] = await db
          .select({
            id: sessionsTable.id,
            name: sessionsTable.name,
            date: sessionsTable.date,
            rating: sessionsTable.rating,
            spot: spotsTable.name,
          })
          .from(sessionsTable)
          .where(
            and(
              filters.from ? gte(sessionsTable.date, filters.from) : undefined,
              filters.to ? lte(sessionsTable.date, filters.to) : undefined,
            ),
          )
          .innerJoin(spotsTable, eq(sessionsTable.spotId, spotsTable.id))
          .orderBy(desc(sessionsTable.rating))
          .limit(1);

        if (session === undefined) {
          return null;
        }

        return session;
      }),

    getDaysSinceLastSession: () =>
      withDatabaseResult(async () => {
        const [result] = await db
          .select({
            daysSinceLastSession:
              sql`CURRENT_DATE - MAX(${sessionsTable.date})`.mapWith((days) => {
                return days === null ? null : Number(days);
              }),
          })
          .from(sessionsTable);

        return result.daysSinceLastSession;
      }),
  } satisfies Repository;
};

export { createSessionsStatsRepository };

export type SessionsStatsRepository = ReturnType<
  typeof createSessionsStatsRepository
>;

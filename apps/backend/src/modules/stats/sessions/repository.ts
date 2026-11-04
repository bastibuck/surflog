import { and, avg, count, gte, lte } from "drizzle-orm";
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
        const session = await db.query.sessions.findFirst({
          columns: {
            id: true,
            name: true,
            date: true,
            rating: true,
            notes: true,
          },
          where: {
            date: {
              gte: filters.from,
              lte: filters.to,
            },
          },
          orderBy: {
            rating: "desc",
          },
          with: {
            spot: {
              columns: {
                name: true,
              },
            },
            sail: {
              columns: {
                size: true,
                alias: true,
              },
              with: {
                brand: {
                  columns: {
                    name: true,
                  },
                },
              },
            },
          },
        });

        if (session === undefined) {
          return null;
        }

        return {
          ...session,
          sail: {
            ...session.sail,
            brand: session.sail.brand.name,
          },
        };
      }),
  } satisfies Repository;
};

export { createSessionsStatsRepository };

export type SessionsStatsRepository = ReturnType<
  typeof createSessionsStatsRepository
>;

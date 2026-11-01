import { and, asc, count, desc, eq, gte, lte } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type z from "zod";

import type { GetMostVisitedSpotsFiltersSchema } from "@surflog/shared/api-schema/dashboard/DashboardSchema";

import { withDatabaseResult } from "../../../lib/database.ts";
import type { Repository } from "../../../lib/types/Repository.ts";
import { sessionsTable } from "../../sessions/models/Session.model.ts";
import { spotsTable } from "../../spots/models/Spot.model.ts";

const createSpotsDashboardRepository = (db: FastifyInstance["db"]) => {
  return {
    getMostVisited: (
      filters: z.infer<typeof GetMostVisitedSpotsFiltersSchema> = {},
    ) =>
      withDatabaseResult(async () => {
        const sessionCountsBySpotIdCTE = db
          .$with("spot_ids_to_session_count")
          .as(
            db
              .select({
                spotId: sessionsTable.spotId,
                count: count(sessionsTable.spotId).as("count"),
              })
              .from(sessionsTable)
              .where(
                and(
                  filters.from
                    ? gte(sessionsTable.date, filters.from)
                    : undefined,
                  filters.to ? lte(sessionsTable.date, filters.to) : undefined,
                ),
              )
              .groupBy(sessionsTable.spotId),
          );

        return db
          .with(sessionCountsBySpotIdCTE)
          .select({
            id: spotsTable.id,
            name: spotsTable.name,
            count: sessionCountsBySpotIdCTE.count,
          })
          .from(spotsTable)
          .innerJoin(
            sessionCountsBySpotIdCTE,
            eq(sessionCountsBySpotIdCTE.spotId, spotsTable.id),
          )
          .orderBy(desc(sessionCountsBySpotIdCTE.count), asc(spotsTable.name))
          .limit(3);
      }),
  } satisfies Repository;
};

export { createSpotsDashboardRepository };

export type SpotsDashboardRepository = ReturnType<
  typeof createSpotsDashboardRepository
>;

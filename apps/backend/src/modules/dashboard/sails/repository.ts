import { and, asc, count, desc, eq, gte, lte } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type z from "zod";

import type { GetMostUsedSailsFiltersSchema } from "@surflog/shared/api-schema/dashboard/DashboardSchema";

import { withDatabaseResult } from "../../../lib/database.ts";
import type { Repository } from "../../../lib/types/Repository.ts";
import { brandsTable } from "../../gear/models/Brand.model.ts";
import { sailsTable } from "../../gear/models/Sail.model.ts";
import { sailsDisplayNameSql } from "../../gear/utils/sails.utils.ts";
import { sessionsTable } from "../../sessions/models/Session.model.ts";

const createSailsDashboardRepository = (db: FastifyInstance["db"]) => {
  return {
    getMostUsed: (
      filters: z.infer<typeof GetMostUsedSailsFiltersSchema> = {},
    ) =>
      withDatabaseResult(async () => {
        const sessionCountsBySailIdCTE = db
          .$with("sail_ids_to_session_count")
          .as(
            db
              .select({
                sailId: sessionsTable.sailId,
                count: count(sessionsTable.sailId).as("count"),
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
              .groupBy(sessionsTable.sailId),
          );

        return db
          .with(sessionCountsBySailIdCTE)
          .select({
            id: sailsTable.id,
            displayName: sailsDisplayNameSql,
            count: sessionCountsBySailIdCTE.count,
          })
          .from(sailsTable)
          .innerJoin(
            sessionCountsBySailIdCTE,
            eq(sessionCountsBySailIdCTE.sailId, sailsTable.id),
          )
          .innerJoin(brandsTable, eq(sailsTable.brandId, brandsTable.id))
          .orderBy(desc(sessionCountsBySailIdCTE.count), asc(sailsTable.size))
          .limit(3);
      }),
  } satisfies Repository;
};

export { createSailsDashboardRepository };

export type SailsDashboardRepository = ReturnType<
  typeof createSailsDashboardRepository
>;

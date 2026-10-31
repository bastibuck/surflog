import type { FastifyInstance } from "fastify";

import { withDatabaseResult } from "../../lib/database.ts";
import type { Repository } from "../../lib/types/Repository.ts";

const createSpotsRepository = (db: FastifyInstance["db"]) => {
  return {
    list: () =>
      withDatabaseResult(() =>
        db.query.spots.findMany({
          orderBy: {
            name: "asc",
          },
        }),
      ),
  } satisfies Repository;
};

export { createSpotsRepository };

export type SpotsRepository = ReturnType<typeof createSpotsRepository>;

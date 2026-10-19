import type { FastifyInstance } from "fastify";

import { withDatabaseResult } from "../../lib/database.ts";
import type { Repository } from "../../lib/types/Repository.ts";
import { spotsTable } from "./models/Spot.model.ts";
import type { CreateSpotPayload } from "@surflog/shared/api-schema/spots/SpotSchema";

const createSpotsRepository = (db: FastifyInstance["db"]) => {
  return {
    list: () => withDatabaseResult(() => db.query.spots.findMany()),

    create: (spot: CreateSpotPayload) =>
      withDatabaseResult(() =>
        db.transaction(async (tx) => {
          await tx.insert(spotsTable).values(spot);
        }),
      ),
  } satisfies Repository;
};

export { createSpotsRepository };

export type SpotsRepository = ReturnType<typeof createSpotsRepository>;

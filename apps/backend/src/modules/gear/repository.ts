import type { FastifyInstance } from "fastify";

import { withDatabaseResult } from "../../lib/database.ts";
import type { Repository } from "../../lib/types/Repository.ts";

const createGearRepository = (db: FastifyInstance["db"]) => {
  return {
    listSails: () =>
      withDatabaseResult(async () => {
        const sails = await db.query.sails.findMany({
          columns: {
            id: true,
            size: true,
            alias: true,
          },
          with: {
            brand: true,
          },
        });

        return sails.map((sail) => ({
          ...sail,
          brand: sail.brand.name,
        }));
      }),

    listBrands: () => withDatabaseResult(() => db.query.brands.findMany()),
  } satisfies Repository;
};

export { createGearRepository };

export type GearRepository = ReturnType<typeof createGearRepository>;

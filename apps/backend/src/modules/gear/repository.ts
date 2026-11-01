import { asc, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { withDatabaseResult } from "../../lib/database.ts";
import type { Repository } from "../../lib/types/Repository.ts";
import { brandsTable } from "./models/Brand.model.ts";
import { sailsTable } from "./models/Sail.model.ts";
import { sailsDisplayNameSql } from "./utils/sails.utils.ts";

const createGearRepository = (db: FastifyInstance["db"]) => {
  return {
    listSails: () =>
      withDatabaseResult(() =>
        db
          .select({
            id: sailsTable.id,
            displayName: sailsDisplayNameSql,
          })
          .from(sailsTable)
          .innerJoin(brandsTable, eq(sailsTable.brandId, brandsTable.id))
          .orderBy(asc(sailsDisplayNameSql)),
      ),

    listBrands: () =>
      withDatabaseResult(() =>
        db.query.brands.findMany({
          orderBy: {
            name: "asc",
          },
        }),
      ),
  } satisfies Repository;
};

export { createGearRepository };

export type GearRepository = ReturnType<typeof createGearRepository>;

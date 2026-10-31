import { asc, eq, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { withDatabaseResult } from "../../lib/database.ts";
import { brandsTable } from "./models/Brand.model.ts";
import { sailsTable } from "./models/Sail.model.ts";
import type { Repository } from "../../lib/types/Repository.ts";

const displayNameSql = sql<string>`
  concat_ws(
    ' | ',
    concat(${brandsTable.name}, ' ', ${sailsTable.size}),
    ${sailsTable.alias}
  )
`;

const createGearRepository = (db: FastifyInstance["db"]) => {
  return {
    listSails: () =>
      withDatabaseResult(() =>
        db
          .select({
            id: sailsTable.id,
            displayName: displayNameSql,
          })
          .from(sailsTable)
          .innerJoin(brandsTable, eq(sailsTable.brandId, brandsTable.id))
          .orderBy(asc(displayNameSql)),
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

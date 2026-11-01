import { sql } from "drizzle-orm";
import { brandsTable } from "../models/Brand.model.ts";
import { sailsTable } from "../models/Sail.model.ts";

export const sailsDisplayNameSql = sql<string>`
  concat_ws(
    ' | ',
    concat(${brandsTable.name}, ' ', ${sailsTable.size}),
    ${sailsTable.alias}
  )
`.as("display_name");

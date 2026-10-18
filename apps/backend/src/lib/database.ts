import { DrizzleQueryError } from "drizzle-orm/errors";
import postgres from "postgres";
import { failure, type TypedResult } from "./typed-result.ts";
import type { TableName } from "../plugins/database/schema.ts";

type DatabaseError =
  | "DUPLICATE_ENTRY__UNKNOWN"
  | `DUPLICATE_ENTRY__${TableName}`
  | `NOT_FOUND__${TableName}`
  | "NOT_FOUND__UNKNOWN";

class EntityNotFoundError extends Error {
  tableName: TableName;

  constructor(table: TableName, identifier: string) {
    super(`${table} > '${identifier}' not found`);

    this.tableName = table;
  }
}

const handleDbErrors = (error: unknown): TypedResult<never, DatabaseError> => {
  if (error instanceof DrizzleQueryError) {
    if (error.cause instanceof postgres.PostgresError) {
      // DUPLICATION ERROR
      if (error.cause.code === "23505") {
        if (error.cause.table_name) {
          return failure(
            `DUPLICATE_ENTRY__${error.cause.table_name as TableName}` as const,
          );
        }

        return failure("DUPLICATE_ENTRY__UNKNOWN" as const);
      }
    }
  }

  if (error instanceof EntityNotFoundError) {
    return failure(`NOT_FOUND__${error.tableName}` as const);
  }

  throw error;
};

export { EntityNotFoundError, handleDbErrors };

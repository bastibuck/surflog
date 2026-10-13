import { DrizzleQueryError } from "drizzle-orm/errors";
import postgres from "postgres";
import { failure, success, type TypedResult } from "./typed-result.ts";

// TODO: handle more cases? like
// | "CONNECTION_FAILED"
// | "QUERY_FAILED"
// | "TIMEOUT"
// | "UNKNOWN_ERROR" ...
type DatabaseError = "DUPLICATE_ENTRY";

/**
 * execute a DB query and return the result, or a DatabaseError on failure
 *
 * @param query the DB query to perform
 * @returns data on success, or a DatabaseError on failure
 */
const executeDbQuery = async <T>(
  query: Promise<T>,
): Promise<TypedResult<T, DatabaseError>> => {
  try {
    const data = await query;

    return success(data);
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof postgres.PostgresError) {
        if (error.cause.code === "23505") {
          return failure("DUPLICATE_ENTRY");
        }
      }
    }

    throw error;
  }
};

/**
 * triggers a DB command with no return value, such as an insert, update, or delete operation
 *
 * @param query the DB query to perform
 * @returns undefined data on success, or a DatabaseError on failure
 */
const executeDbCommand = async (
  query: Promise<unknown>,
): Promise<TypedResult<void, DatabaseError>> => {
  const result = await executeDbQuery(query);

  if (!result.success) {
    return result;
  }

  return success(undefined);
};

export { executeDbQuery, executeDbCommand };

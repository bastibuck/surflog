import type { TypedResult } from "../typed-result.ts";

export type Repository = Record<
  string,
  (...args: never[]) => Promise<TypedResult<unknown, unknown>>
>;

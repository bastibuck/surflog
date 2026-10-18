export type TypedResult<T, E> =
  { success: true; data: T } | { success: false; error: E };

const success = <T>(data: T): TypedResult<T, never> => {
  return { success: true, data };
};

const failure = <E>(error: E): TypedResult<never, E> => {
  return { success: false, error };
};

export { success, failure };

// Share an in-flight initialization, retain successes, and retry failures later.
// Each provider/registration task gets its own state so failures stay isolated.
export function createRetryingInitializer<T>(
  initialize: () => Promise<T>,
  reportError: (error: unknown) => void,
  retryDelayMs = 60_000,
) {
  let value: T | undefined;
  let pending: Promise<T | undefined> | undefined;
  let retryAt = 0;

  return (): Promise<T | undefined> => {
    if (value !== undefined) return Promise.resolve(value);
    if (pending) return pending;
    if (Date.now() < retryAt) return Promise.resolve(undefined);

    pending = Promise.resolve()
      .then(initialize)
      .then((result) => {
        value = result;
        return result;
      })
      .catch((error: unknown) => {
        retryAt = Date.now() + retryDelayMs;
        reportError(error);
        return undefined;
      })
      .finally(() => {
        pending = undefined;
      });

    return pending;
  };
}

// Share an in-flight initialization, retain successes, and retry failures later.
// Each provider/registration task gets its own state so failures stay isolated.
// An optional refresh interval also supports periodic background reconciliation.
export function createRetryingInitializer<T>(
  initialize: () => Promise<T>,
  reportError: (error: unknown) => void,
  retryDelayMs = 60_000,
  refreshAfterMs = Infinity,
) {
  let value: T | undefined;
  let pending: Promise<T | undefined> | undefined;
  let retryAt = 0;
  let refreshAt = 0;

  return (): Promise<T | undefined> => {
    if (value !== undefined && Date.now() < refreshAt)
      return Promise.resolve(value);
    if (pending) return pending;
    if (Date.now() < retryAt) return Promise.resolve(undefined);

    pending = Promise.resolve()
      .then(initialize)
      .then((result) => {
        value = result;
        refreshAt = Date.now() + refreshAfterMs;
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

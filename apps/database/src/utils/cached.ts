const cached = <T extends object>(factory: () => T, key: string) => {
  // Use globalThis for caching in development to avoid hot reloading issues
  const cache = (process.env.NODE_ENV === "production" ? {} : globalThis) as {
    [key]: T;
  };

  const lazy = () => {
    cache[key] ??= factory();
    return cache[key];
  };

  // Use a Proxy to allow lazy initialization of the factory
  return new Proxy(
    {},
    {
      get: (_, prop: string) => Reflect.get(lazy(), prop),
    },
  ) as T;
};

export default cached;

import { Redis as UpstashRedis } from "@upstash/redis";
import IORedis from "ioredis";

import { env } from "@/env";

type RedisGetOptions = { delete: boolean };
type RedisSetOptions = { expiry?: number; overwrite?: boolean };

export interface RedisCache {
  get<T>(key: string, options: RedisGetOptions): Promise<T | null>;
  set(key: string, value: unknown, options: RedisSetOptions): Promise<void>;
}

export class RedisValueAlreadyExistsError extends Error {
  constructor(key: string) {
    super(`Redis value already exists for key: ${key}`);
    this.name = "RedisValueAlreadyExistsError";
  }
}

function parseRedisJson<T>(value: string | null) {
  if (value === null) {
    return null;
  }

  return JSON.parse(value) as T;
}

export class UpstashRedisCache implements RedisCache {
  readonly client: UpstashRedis;

  constructor() {
    this.client = new UpstashRedis({
      token: env.UPSTASH_REDIS_REST_TOKEN!,
      url: env.UPSTASH_REDIS_REST_URL!,
    });
  }

  async get<T>(key: string, options: RedisGetOptions) {
    const value = options.delete
      ? ((await this.client.getdel<string>(key)) ?? null)
      : ((await this.client.get<string>(key)) ?? null);

    return parseRedisJson<T>(value);
  }

  async set(key: string, value: unknown, options: RedisSetOptions) {
    const payload = JSON.stringify(value);
    const result =
      options.expiry && options.overwrite === false
        ? await this.client.set(key, payload, {
            ex: options.expiry,
            nx: true as const,
          })
        : options.expiry
          ? await this.client.set(key, payload, { ex: options.expiry })
          : options.overwrite === false
            ? await this.client.set(key, payload, { nx: true as const })
            : await this.client.set(key, payload);

    if (options.overwrite === false && result !== "OK") {
      throw new RedisValueAlreadyExistsError(key);
    }
  }
}

export class IORedisCache implements RedisCache {
  readonly client: IORedis;

  constructor(redisUrl: string) {
    this.client = new IORedis(redisUrl);
  }

  async get<T>(key: string, options: RedisGetOptions) {
    const value = options.delete
      ? await this.client.call("GETDEL", key)
      : await this.client.get(key);

    return parseRedisJson<T>(value === null ? null : String(value));
  }

  async set(key: string, value: unknown, options: RedisSetOptions) {
    const payload = JSON.stringify(value);
    const result =
      options.expiry && options.overwrite === false
        ? await this.client.set(key, payload, "EX", options.expiry, "NX")
        : options.expiry
          ? await this.client.set(key, payload, "EX", options.expiry)
          : options.overwrite === false
            ? await this.client.set(key, payload, "NX")
            : await this.client.set(key, payload);

    if (options.overwrite === false && result !== "OK") {
      throw new RedisValueAlreadyExistsError(key);
    }
  }
}

function createRedisCache(): RedisCache {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return new UpstashRedisCache();
  }

  if (env.REDIS_URL) {
    return new IORedisCache(env.REDIS_URL);
  }

  throw new Error(
    "Missing Redis configuration. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN, or REDIS_URL.",
  );
}

let redis: RedisCache | undefined;

export function getRedis() {
  if (!redis) {
    redis = createRedisCache();
  }
  return redis;
}

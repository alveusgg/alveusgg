import { readFile } from "node:fs/promises";
import type { AppRouter } from "@alveusgg/alveusgg-website";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

type Inputs = inferRouterInputs<AppRouter>;
type Outputs = inferRouterOutputs<AppRouter>;
export type ChatPresetInput = Inputs["presets"]["chatCommand"];
export type ChatPresetOperation = Outputs["presets"]["chatOperation"];
export interface PresetTransport {
  command(
    input: ChatPresetInput,
    signal?: AbortSignal,
  ): Promise<ChatPresetOperation>;
  operation(
    input: Inputs["presets"]["chatOperation"],
    signal?: AbortSignal,
  ): Promise<ChatPresetOperation>;
  catalog(camera: string): Promise<Outputs["presets"]["catalog"]>;
}
export class PresetClientError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
export function createPresetClient({
  apiBaseUrl,
  keyFile,
  fetch: request = globalThis.fetch,
  readKey = () =>
    readFile(keyFile, {
      encoding: "utf8",
      signal: AbortSignal.timeout(requestTimeout),
    }),
  requestTimeout = 5000,
}: {
  apiBaseUrl: string;
  keyFile: string;
  fetch?: typeof fetch;
  readKey?: () => Promise<string>;
  requestTimeout?: number;
}): PresetTransport {
  let base: URL;
  try {
    base = new URL(apiBaseUrl);
    if (
      base.username ||
      base.password ||
      base.search ||
      base.hash ||
      !base.pathname.endsWith("/") ||
      (base.protocol !== "https:" &&
        !(
          base.protocol === "http:" &&
          ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname)
        ))
    )
      throw new Error();
  } catch {
    throw new PresetClientError(
      "CONFIGURATION",
      "Website preset service configuration is invalid.",
    );
  }
  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: new URL("trpc", base).toString(),
        transformer: superjson,
        headers: async () => {
          let key: string;
          try {
            key = (await readKey()).trim();
            if (!key || /[\r\n]/.test(key)) throw new Error();
          } catch {
            throw new PresetClientError(
              "CONFIGURATION",
              "Website preset key file is unavailable or invalid.",
            );
          }
          return { Authorization: `ApiKey ${key}` };
        },
        fetch: async (input, init) => {
          try {
            return await request(input, {
              ...init,
              redirect: "error",
              signal: init?.signal
                ? AbortSignal.any([
                    init.signal,
                    AbortSignal.timeout(requestTimeout),
                  ])
                : AbortSignal.timeout(requestTimeout),
            });
          } catch {
            throw new PresetClientError(
              "UNAVAILABLE",
              "Website preset service is unavailable.",
            );
          }
        },
      }),
    ],
  });
  return {
    command: (input, signal) =>
      client.presets.chatCommand.mutate(input, { signal }),
    operation: (input, signal) =>
      client.presets.chatOperation.query(input, { signal }),
    catalog: (camera) => client.presets.catalog.query({ camera }),
  };
}
export function presetError(error: unknown) {
  const data =
    error && typeof error === "object" && "data" in error
      ? error.data
      : undefined;
  const cause =
    error && typeof error === "object" && "cause" in error
      ? error.cause
      : undefined;
  const code =
    error instanceof PresetClientError
      ? error.code
      : cause instanceof PresetClientError
        ? cause.code
        : data && typeof data === "object" && "code" in data
          ? String(data.code)
          : "UNAVAILABLE";
  const messages: Record<string, string> = {
    CONFIGURATION: "Website preset service is not configured correctly.",
    UNAUTHORIZED: "Preset service authentication was refused.",
    FORBIDDEN:
      "Website preset access was refused. Check your subscription, operator role, or subscriber pause status.",
    BAD_REQUEST: "The camera or preset request is invalid.",
    NOT_FOUND: "Preset or operation not found on the website.",
    PRECONDITION_FAILED: "This preset is archived or unavailable for loading.",
    CONFLICT: "Preset request conflicts with existing state.",
    TOO_MANY_REQUESTS: "Preset cooldown active; wait before another command.",
  };
  return {
    code,
    transient: !Object.hasOwn(messages, code),
    message: messages[code] ?? "Website preset service is unavailable.",
  };
}

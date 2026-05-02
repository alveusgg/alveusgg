import type { z, ZodError, ZodType } from "zod";
import type { Options as AllOptions } from "./env.js";

export type Options = Pick<
  AllOptions,
  "organizationId" | "apiKey" | "baseUrl" | "localTimezone"
>;

type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

type FetchSuccess<T = unknown> = { ok: true; data: T };
type FetchNetworkError = { ok: false; errorType: "network"; error: string };
type FetchRequestError = { ok: false; errorType: "request"; error: string };
type FetchParseError = { ok: false; errorType: "parse"; error: ZodError };

type FetchResult<T = unknown> =
  | FetchSuccess<T>
  | FetchNetworkError
  | FetchRequestError
  | FetchParseError;

const apiHeaders = ({
  organizationId,
  apiKey,
}: Pick<Options, "organizationId" | "apiKey">) => ({
  "NEON-API-VERSION": "2.11",
  authorization: `Basic ${btoa(`${organizationId}:${apiKey}`)}`,
  accept: "application/json",
});

export const url = (strings: TemplateStringsArray, ...values: Array<string>) =>
  strings.reduce(
    (acc, str, i) =>
      acc + str + (i < values.length ? encodeURIComponent(values[i]) : ""),
    "",
  );

const fetch = async (
  options: Options,
  path: string,
  method: ApiMethod = "GET",
  body?: unknown,
) => {
  const request: RequestInit & { headers: Record<string, string> } = {
    method,
    headers: apiHeaders(options),
  };

  if (body) {
    request.headers["content-type"] = "application/json";
    request.body = JSON.stringify(body);
  }

  return global.fetch(options.baseUrl + path, request);
};

export const fetchOk = async (
  options: Options,
  path: string,
  method: ApiMethod = "GET",
  body?: unknown,
): Promise<FetchResult> => {
  try {
    const response = await fetch(options, path, method, body);
    return response.ok
      ? { ok: true, data: null }
      : {
          ok: false,
          errorType: "request",
          error: `Request failed with status ${response.status}`,
        };
  } catch (error) {
    console.error("Error fetching data from Neon CRM API", {
      path,
      error,
    });
    return {
      ok: false,
      errorType: "network",
      error: "Error fetching data from Neon CRM API",
    };
  }
};

export const fetchWithSchema = async <ResponseSchema extends ZodType>(
  options: Options,
  path: string,
  schema: ResponseSchema,
  method?: ApiMethod,
  body?: unknown,
): Promise<FetchResult<z.output<ResponseSchema>>> => {
  try {
    const response = await fetch(options, path, method, body);
    if (!response.ok) {
      return {
        ok: false,
        errorType: "request",
        error: `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    const parsed = await schema.safeParseAsync(data);
    if (parsed.error) {
      console.error("Error parsing data from Neon CRM API", {
        path,
        error: parsed.error,
      });
      return {
        ok: false,
        errorType: "parse",
        error: parsed.error,
      };
    }
    return {
      ok: true,
      data: parsed.data,
    };
  } catch (error) {
    console.error("Error fetching data from Neon CRM API", {
      path,
      error,
    });
    return {
      ok: false,
      errorType: "network",
      error: "Error fetching data from Neon CRM API",
    };
  }
};

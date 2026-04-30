import type { ZodType } from "zod";
import type { Options as AllOptions } from "./env.js";

export type Options = Pick<AllOptions, "organizationId" | "apiKey" | "baseUrl">;

type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

const apiHeaders = ({
  organizationId,
  apiKey,
}: Pick<Options, "organizationId" | "apiKey">) => ({
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
) => {
  try {
    const response = await fetch(options, path, method, body);
    return response.ok;
  } catch (error) {
    console.error("Error fetching data from Neon CRM API", {
      path,
      error,
    });
    return false;
  }
};

export const fetchWithSchema = async <ResponseSchema extends ZodType>(
  options: Options,
  path: string,
  schema: ResponseSchema,
  method?: ApiMethod,
  body?: unknown,
) => {
  try {
    const response = await fetch(options, path, method, body);
    if (!response.ok) return false;
    const data = await response.json();
    const parsed = await schema.safeParseAsync(data);
    if (parsed.error) {
      console.error("Error parsing data from Neon CRM API", {
        path,
        error: parsed.error,
      });
      return false;
    }
    return parsed.data;
  } catch (error) {
    console.error("Error fetching data from Neon CRM API", {
      path,
      error,
    });
    return false;
  }
};

import * as z from "zod";

import { decodeBody, encodeBody } from "./helpers";
import {
  bodySchema,
  requestInitSchema,
  responseInitSchema,
  type SerialisedRequestInit,
  type SerialisedResponseInit,
} from "./platform";

export const serialisedRequestSchema = z.tuple([
  z.literal("request"),
  z.string(),
  requestInitSchema,
]);

export type SerialisedRequest = z.infer<typeof serialisedRequestSchema>;

export function decodeRequest(wire: SerialisedRequest): Request {
  const [, url, init] = wire;
  const { headers, body, ...rest } = init;
  const reqInit: RequestInit = { ...rest, cache: "no-cache" };
  if (headers !== undefined) reqInit.headers = new Headers(headers);
  if (body !== undefined) reqInit.body = decodeBody(body);
  return new Request(url, reqInit);
}

export async function encodeRequest(req: Request): Promise<SerialisedRequest> {
  // Clone so the caller's Request remains usable.
  const cloned = req.clone();
  const init: SerialisedRequestInit = {};

  if (cloned.method !== "GET") init.method = cloned.method;

  const headerPairs = [...cloned.headers.entries()];
  if (headerPairs.length > 0) init.headers = headerPairs;

  if (cloned.body !== null) init.body = await encodeBody(cloned.body);
  return ["request", cloned.url, init];
}

export const serialisedResponseSchema = z.tuple([
  z.literal("response"),
  bodySchema,
  responseInitSchema,
]);

export type SerialisedResponse = z.infer<typeof serialisedResponseSchema>;

export function decodeResponse(wire: SerialisedResponse): Response {
  const [, body, init] = wire;
  const resInit: ResponseInit = { ...init };
  if (init.headers !== undefined) resInit.headers = new Headers(init.headers);
  return new Response(decodeBody(body), resInit);
}

export async function encodeResponse(
  res: Response,
): Promise<SerialisedResponse> {
  const cloned = res.clone();
  const init: SerialisedResponseInit = {};

  if (cloned.status !== 200) init.status = cloned.status;
  if (cloned.statusText !== "") init.statusText = cloned.statusText;

  const headerPairs = [...cloned.headers.entries()];
  if (headerPairs.length > 0) init.headers = headerPairs;

  const body = await encodeBody(cloned.body);

  return ["response", body, init];
}

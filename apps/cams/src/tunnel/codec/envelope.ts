import { z } from "zod";
import {
  serialisedRequest,
  serialisedResponse,
  serialisedResponseSchema,
} from ".";
import { serialisedRequestSchema } from "./codec";

const RequestEnvelopeSchema = z.object({
  type: z.literal("request"),
  id: z.string(),
  request: z.custom<Request>((val) => val instanceof Request),
});

const SerialisedRequestEnvelopeSchema = z.object({
  type: z.literal("request"),
  id: z.string(),
  request: serialisedRequestSchema,
});

const SerialisedWebsocketFrameEnvelopeSchema = z.object({
  type: z.literal("frame"),
  frame: z.string(),
});

export type SerialisedWebsocketFrameEnvelopeSchema = z.infer<
  typeof SerialisedWebsocketFrameEnvelopeSchema
>;

export const RequestEnvelopeCodec = z.codec(
  SerialisedRequestEnvelopeSchema,
  RequestEnvelopeSchema,
  {
    decode: (serialised) => ({
      type: "request" as const,
      id: serialised.id,
      request: serialisedRequest.decode(serialised.request),
    }),
    encode: async (live) => ({
      type: "request" as const,
      id: live.id,
      request: await serialisedRequest.encodeAsync(live.request),
    }),
  },
);

const ResponseEnvelopeSchema = z.object({
  type: z.literal("response"),
  id: z.string(),
  response: z.custom<Response>((val) => val instanceof Response),
});

const SerialisedResponseEnvelopeSchema = z.object({
  type: z.literal("response"),
  id: z.string(),
  response: serialisedResponseSchema,
});

export const ResponseEnvelopeCodec = z.codec(
  SerialisedResponseEnvelopeSchema,
  ResponseEnvelopeSchema,
  {
    decode: (serialised) => ({
      type: "response" as const,
      id: serialised.id,
      response: serialisedResponse.decode(serialised.response),
    }),
    encode: async (live) => ({
      type: "response" as const,
      id: live.id,
      response: await serialisedResponse.encodeAsync(live.response),
    }),
  },
);

export const Envelope = z.discriminatedUnion("type", [
  SerialisedResponseEnvelopeSchema,
  SerialisedRequestEnvelopeSchema,
  SerialisedWebsocketFrameEnvelopeSchema,
]);
type Envelope = z.infer<typeof Envelope>;

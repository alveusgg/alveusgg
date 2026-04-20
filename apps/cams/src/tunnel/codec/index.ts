import * as z from "zod";

import {
  decodeRequest,
  decodeResponse,
  encodeRequest,
  encodeResponse,
  serialisedRequestSchema,
  serialisedResponseSchema,
} from "./codec";

export {
  serialisedRequestSchema,
  serialisedResponseSchema,
  type SerialisedRequest,
  type SerialisedResponse,
} from "./codec";

export const serialisedRequest = z.codec(
  serialisedRequestSchema,
  z.custom<Request>((val) => val instanceof Request),
  {
    decode: (wire) => decodeRequest(wire),
    encode: async (req) => await encodeRequest(req),
  },
);

export const serialisedResponse = z.codec(
  serialisedResponseSchema,
  z.custom<Response>((val) => val instanceof Response),
  {
    decode: (wire) => decodeResponse(wire),
    encode: async (res) => await encodeResponse(res),
  },
);

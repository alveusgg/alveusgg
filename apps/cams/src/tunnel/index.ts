import type { Hono } from "hono";
import type { SerialisedWebsocketFrameEnvelopeSchema } from "./codec/envelope";
import {
  Envelope,
  RequestEnvelopeCodec,
  ResponseEnvelopeCodec,
} from "./codec/envelope";

interface WebSocketLike {
  send: (data: string) => void;
  close: (code: number, reason: string) => void;
  addEventListener: (
    type: "message",
    listener: (event: MessageEvent) => void,
  ) => void;
}

export interface ClientTunnel {
  fetch: (
    input: string | URL | Request,
    init?: RequestInit,
  ) => Promise<Response>;
  addEventListener: (
    event: "message",
    listener: (event: MessageEvent) => void,
  ) => void;
}

export interface ServerTunnel {
  serve: (app: Hono) => void;
  emit: (event: "frame", data: string) => void;
}

export const connectAsClient = async (
  websocket: WebSocketLike,
): Promise<ClientTunnel> => {
  const pending = new Map<string, PromiseWithResolvers<Response>>();

  websocket.addEventListener("message", (event) => {
    const envelope = Envelope.parse(JSON.parse(event.data));
    if (envelope.type !== "response") return;
    const resolvers = pending.get(envelope.id);
    if (!resolvers) {
      return;
    }

    const response = ResponseEnvelopeCodec.decode(envelope);
    resolvers.resolve(response.response);
  });

  return {
    fetch: async (input: string | URL | Request, init?: RequestInit) => {
      const id = crypto.randomUUID();
      const resolvers = Promise.withResolvers<Response>();
      pending.set(id, resolvers);

      const request = new Request(input, init);

      const requestEnvelopeMessage = await RequestEnvelopeCodec.encodeAsync({
        type: "request",
        id: id,
        request: request,
      });

      websocket.send(JSON.stringify(requestEnvelopeMessage));
      const response = await resolvers.promise;
      return response;
    },
    addEventListener: (
      event: "message",
      listener: (event: MessageEvent) => void,
    ) => {
      websocket.addEventListener("message", (event) => {
        const envelope = Envelope.parse(JSON.parse(event.data));
        if (envelope.type !== "frame") return;
        listener(new MessageEvent("message", { data: envelope.frame }));
      });
    },
  };
};

export const connectAsServer = async (
  websocket: WebSocketLike,
): Promise<ServerTunnel> => {
  return {
    serve: (app: Hono) => {
      websocket.addEventListener("message", async (event) => {
        const envelope = Envelope.parse(JSON.parse(event.data));
        if (envelope.type !== "request") return;
        const request = RequestEnvelopeCodec.decode(envelope);
        const response = await app.fetch(request.request);

        const responseEnvelopeMessage = ResponseEnvelopeCodec.encodeAsync({
          type: "response",
          id: request.id,
          response: response,
        });
        websocket.send(JSON.stringify(responseEnvelopeMessage));
      });
    },
    emit: (_: "frame", data: string) => {
      const frame: SerialisedWebsocketFrameEnvelopeSchema = {
        type: "frame",
        frame: data,
      };
      websocket.send(JSON.stringify(frame));
    },
  };
};

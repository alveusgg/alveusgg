import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";
import { WebSocket as ReconnectingWebSocket } from "partysocket";
import { accountWithRoles } from "../middleware/alveus";
import {
  getConfigCapabilitiesByCamera,
  getConfigSpecsByCamera,
} from "../services/control";
import { createClient } from "../services/control/client";
import { forwardWithoutRoutePrefix } from "../utils/path";

const client = createClient({
  baseUrl: `${process.env.CONTROL_API_HOST}:${process.env.CONTROL_API_PORT}`,
  headers: {
    Authorization: `ApiKey ${process.env.CONTROL_API_KEY}`,
  },
});

export class ControlManager extends DurableObject {
  private outgoing: ReconnectingWebSocket;
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);

    const url = new URL(
      `${process.env.CONTROL_API_HOST}:${process.env.CONTROL_WS_PORT}?authorization=ApiKey ${process.env.CONTROL_API_KEY}`,
    );
    url.protocol = "ws:";
    this.outgoing = new ReconnectingWebSocket(url.toString(), undefined, {
      startClosed: true,
    });
    this.outgoing.addEventListener("message", (event) =>
      this.dispatch(event.data),
    );
  }

  async connect() {
    if (this.outgoing.readyState === WebSocket.OPEN) return;
    console.log(`Control API not connected, connecting...`);

    const { resolve, reject, promise } = Promise.withResolvers<void>();
    this.outgoing.addEventListener("open", () => resolve(), { once: true });
    this.outgoing.addEventListener("error", (event) => reject(event), {
      once: true,
    });
    this.outgoing.reconnect();
    console.log("Connecting to control API");
    await promise;
    console.log("Control API connected");
  }

  async fetch(request: Request): Promise<Response> {
    // Only handle websocket upgrade requests
    if (request.headers.get("upgrade") !== "websocket") {
      return new Response("Not a websocket upgrade request", { status: 400 });
    }

    try {
      await this.connect();
      const { 0: client, 1: server } = new WebSocketPair();
      this.ctx.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    } catch (error) {
      return new Response(`Could not connect to control API: ${error}`, {
        status: 500,
      });
    }
  }

  webSocketClose(ws: WebSocket) {
    console.log(`Socket disconnected`);
    const sockets = this.ctx.getWebSockets();
    const others = sockets.filter((s) => s !== ws);
    if (others.length === 0) {
      this.outgoing.close();
      return;
    }

    ws.close(1000, "Socket disconnected");
  }

  private async dispatch(payload: string) {
    const sockets = this.ctx.getWebSockets();

    for await (const socket of sockets) {
      if (socket.readyState !== WebSocket.OPEN) continue;
      socket.send(payload);
    }
  }
}

const control = new Hono<{ Bindings: Env }>()
  .get("/:camera/capabilities", accountWithRoles("ptzControl"), async (c) => {
    const camera = c.req.param("camera");
    if (!camera) throw new Error("Camera is required");
    const { data, error } = await getConfigCapabilitiesByCamera({
      client,
      path: { camera },
    });
    if (error) return c.json(error, 500);
    return c.json(data);
  })
  .get("/:camera/specs", accountWithRoles("ptzControl"), async (c) => {
    const camera = c.req.param("camera");
    if (!camera) throw new Error("Camera is required");
    const { data, error } = await getConfigSpecsByCamera({
      client,
      path: { camera },
    });
    if (error) return c.json(error, 500);
    return c.json(data);
  })
  .get("/events", accountWithRoles("ptzControl"), async (c) => {
    const stub = c.env.CONTROL_MANAGER.getByName("singleton");
    const request = forwardWithoutRoutePrefix(c);
    return stub.fetch(request);
  });

export default control;

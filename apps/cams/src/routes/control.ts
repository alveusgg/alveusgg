import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";
import { accountWithRoles } from "../middleware/alveus";
import { getConfigCapabilitiesByCamera } from "../services/control";
import { type Client, createClient } from "../services/control/client";
import type { ClientTunnel } from "../tunnel";
import { connectAsClient } from "../tunnel";

export class ControlManager extends DurableObject {
  private tunnel?: ClientTunnel;
  private client?: Client;
  private server: Hono<{ Bindings: Env }>;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);

    const control = new Hono<{ Bindings: Env }>()
      .use(async (c, next) => {
        if (!this.client) {
          return c.json({ error: "Not connected to control API" }, 500);
        }
        return next();
      })
      .get(
        "/:camera/capabilities",
        accountWithRoles("ptzControl"),
        async (c) => {
          const camera = c.req.param("camera");
          if (!camera) throw new Error("Camera is required");
          const { data, error } = await getConfigCapabilitiesByCamera({
            client: this.client,
            path: { camera },
          });
          if (error) return c.json(error, 500);
          return c.json(data);
        },
      )
      .get("/events", accountWithRoles("ptzControl"), async () => {
        const { 0: client, 1: server } = new WebSocketPair();
        this.ctx.acceptWebSocket(server, ["client"]);
        return new Response(null, { status: 101, webSocket: client });
      });

    this.server = new Hono<{ Bindings: Env }>()
      .route("/control", control)
      .get("/connect", async () => {
        const { 0: client, 1: server } = new WebSocketPair();
        server.accept();

        this.tunnel = await connectAsClient(server);
        this.client = createClient({
          baseUrl: "http://localhost:1229",
          headers: { Authorization: `ApiKey ${process.env.CONTROL_API_KEY}` },
          fetch: this.tunnel.fetch,
        });

        this.tunnel.addEventListener("message", (event) =>
          this.dispatch(event.data),
        );

        return new Response(null, { status: 101, webSocket: client });
      });
  }

  fetch(request: Request) {
    return this.server.fetch(request);
  }

  private async dispatch(payload: string) {
    const sockets = this.ctx.getWebSockets("client");

    for await (const socket of sockets) {
      if (socket.readyState !== WebSocket.OPEN) continue;
      socket.send(payload);
    }
  }
}

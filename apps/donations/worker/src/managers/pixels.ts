import type { Donation, DonationAlert, Pixel } from "@alveusgg/donations-core";
import { DurableObject } from "cloudflare:workers";

import type { AppRouter } from "@alveusgg/alveusgg-website";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { stringify, SuperJSON } from "superjson";
import { z } from "zod";
import { SyncProvider } from "../live/SyncProvider";
import { createSharedKeyMiddleware } from "../utils/middleware";

interface PixelsManagerState {
  pixels: Pixel[];
}

const Grid = z.object({
  columns: z.number(),
  rows: z.number(),
  size: z.number(),
  squares: z.record(z.string(), z.string()),
});
type Grid = z.infer<typeof Grid>;

export class PixelsManagerDurableObject extends DurableObject<Env> {
  private router: Hono;
  private startup?: Promise<void>;
  private provider?: SyncProvider<PixelsManagerState>;
  private grid?: Grid;
  private api?: ReturnType<typeof createTRPCProxyClient<AppRouter>>;
  private key: string;

  public async ready() {
    if (!this.startup) {
      this.startup = this.init();
    }
    await this.startup;
  }

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.key = `pixels-${env.STATE_KEY}`;
    const sharedKeyMiddleware = createSharedKeyMiddleware(env.SHARED_KEY);

    this.router = new Hono()
      .use(logger())
      .use(cors())
      .use(async (_, next) => {
        await this.ctx.blockConcurrencyWhile(async () => {
          await this.ready();
        });
        return next();
      })
      .get("/current", async () => {
        if (!this.provider) throw new Error("Provider not initialized");
        return Response.json(this.provider.getContext(), { status: 200 });
      })
      .get("/sync", async () => {
        const { 0: client, 1: server } = new WebSocketPair();
        this.ctx.acceptWebSocket(server);
        await this.sync(server);
        return new Response(null, { status: 101, webSocket: client });
      })
      .post("/update/:column/:row", sharedKeyMiddleware, async (c) => {
        const { column, row } = c.req.param();
        const { data } = await c.req.json();
        try {
          await this.update(column, row, data);
          return c.json({ success: true });
        } catch {
          return c.json({ error: "Failed to update pixel" }, 500);
        }
      });
  }

  async init() {
    const state = await this.ctx.storage.get<PixelsManagerState>(
      `${this.key}-state`,
    );
    const persistState = async (state: PixelsManagerState) => {
      await this.ctx.storage.put(`${this.key}-state`, state);
    };

    const grid = await getGrid(this.env.GRID_URL);
    this.grid = grid;

    this.api = createTRPCProxyClient<AppRouter>({
      links: [
        httpLink({
          url: `${this.env.SITE_URL}/api/trpc`,
          transformer: SuperJSON,
          headers: {
            Authorization: `ApiKey ${this.env.SHARED_KEY}`,
            "x-vercel-protection-bypass":
              this.env.OPTIONAL_VERCEL_PROTECTION_BYPASS,
          },
        }),
      ],
    });

    this.provider = new SyncProvider({
      state: { state, persistState },
      init: { pixels: [] },
    });
  }

  private async update(column: string, row: string, data: object) {
    const schema = z.object({
      identifier: z.string(),
      column: z.coerce.number(),
      row: z.coerce.number(),
    });
    const parsed = schema.parse({
      column: parseInt(column),
      row: parseInt(row),
      ...data,
    });
    if (!this.provider) throw new Error("Provider not initialized");
    this.provider.update((state) => {
      const index = state.pixels.findIndex(
        (pixel) => pixel.column === parsed.column && pixel.row === parsed.row,
      );
      if (index === -1) throw new Error("Pixel not found");
      state.pixels[index] = {
        ...state.pixels[index],
        identifier: parsed.identifier,
      };
    });
  }

  private async sync(server: WebSocket) {
    if (!this.provider) throw new Error("Provider not initialized");
    server.send(stringify({ type: "start" }));
  }

  private async broadcast(type: string, payload: unknown) {
    const sockets = this.ctx.getWebSockets();

    for await (const socket of sockets) {
      if (socket.readyState !== WebSocket.OPEN) continue;
      socket.send(stringify({ type, payload }));
    }
  }

  async add(donations: Donation[]) {
    await this.ctx.blockConcurrencyWhile(async () => {
      await this.ready();
      if (!this.provider) throw new Error("Provider not initialized");
      if (!this.api) throw new Error("API not initialized");
      const pixels: Record<string, Pixel[]> = {};
      const emailHashMap = await getEmailHashedMap(donations);
      const twitchBroadcasterIdHashMap = getTwitchBroadcasterMap(donations);
      this.provider.update((state) => {
        if (!this.grid) throw new Error("Grid not initialized");
        for (const donation of donations) {
          // Use the primary property of the donatedBy object to get the identifier or default to "Anonymous"
          let identifier =
            donation.donatedBy[donation.donatedBy.primary] ?? "Anonymous";

          if (donation.donatedBy.primary === "username") {
            identifier = `@${identifier}`;
          }

          const numberOfPixels = determineNumberOfPixels(donation.amount / 100);
          const pixelsForDonation: Pixel[] = [];
          for (let i = 0; i < numberOfPixels; i++) {
            const location = getRandomEmptySquare(
              [
                ...state.pixels,
                ...Object.values(pixels).flat(),
                ...pixelsForDonation,
              ],
              this.grid,
            );
            if (!location) continue;

            const data =
              this.grid.squares[`${location.column}:${location.row}`];

            pixelsForDonation.push({
              id: crypto.randomUUID(),
              donationId: donation.id,
              receivedAt: donation.receivedAt,
              data,
              identifier,
              email: donation.donatedBy.email
                ? emailHashMap.get(donation.donatedBy.email)
                : undefined,
              column: location.column,
              row: location.row,
            });
          }

          pixels[donation.id] = pixelsForDonation;
        }

        state.pixels = [...state.pixels, ...Object.values(pixels).flat()];
      });

      await this.api.donations.createPixels.mutate({
        pixels: Object.values(pixels)
          .flat()
          .map((pixel) => ({
            id: pixel.id,
            donationId: pixel.donationId,
            receivedAt: pixel.receivedAt,
            identifier: pixel.identifier,
            email: pixel.email,
            column: pixel.column,
            row: pixel.row,
            metadata: {
              twitchBroadcasterId: twitchBroadcasterIdHashMap.get(
                pixel.donationId,
              ),
            },
          })),
      });

      for (const donation of donations) {
        const identifier =
          donation.donatedBy[donation.donatedBy.primary] ?? "Anonymous";
        const alert = {
          amount: donation.amount,
          identifier,
          pixels: pixels[donation.id],
        } satisfies DonationAlert;

        await this.broadcast("update", alert);
      }
    });
  }

  fetch(request: Request): Response | Promise<Response> {
    return this.router.fetch(request);
  }
}

function getRandomEmptySquare(pixels: Pixel[], grid: Grid) {
  const totalPossibleSquares = grid.columns * grid.rows;
  const totalPixels = pixels.length;
  const remainingSquares = totalPossibleSquares - totalPixels;
  if (remainingSquares <= 0) {
    console.warn("No empty squares found");
    return;
  }

  const chosenIndex = Math.floor(Math.random() * remainingSquares);

  let emptyCounter = 0;
  for (let column = 0; column < grid.columns; column++) {
    const subset = pixels.filter((p) => p.column === column);
    for (let row = 0; row < grid.rows; row++) {
      if (
        subset.some((pixel) => pixel.column === column && pixel.row === row)
      ) {
        continue;
      }
      if (emptyCounter === chosenIndex) {
        return { column, row };
      }
      emptyCounter++;
    }
  }
}

const PIXEL_PRICE = 100; // Each pixel costs $100 USD
const DONATION_TOLERANCE = 5; // $5 USD wiggle room

function determineNumberOfPixels(donationAmountDollars: number) {
  return Math.floor((donationAmountDollars + DONATION_TOLERANCE) / PIXEL_PRICE);
}

async function hash(identifier: string) {
  return await crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(identifier))
    .then((hash) =>
      Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    );
}

async function getEmailHashedMap(donations: Donation[]) {
  const hashes = new Map<string, string>();
  await Promise.all(
    donations.map(async (donation) => {
      if (!donation.donatedBy.email) return;
      const hashed = await hash(donation.donatedBy.email);
      hashes.set(donation.donatedBy.email, hashed);
    }),
  );
  return hashes;
}

function getTwitchBroadcasterMap(donations: Donation[]) {
  const hashes = new Map<string, string>();
  donations.map((donation) => {
    if ("twitchBroadcasterId" in donation.providerMetadata) {
      hashes.set(donation.id, donation.providerMetadata.twitchBroadcasterId);
    }
  });
  return hashes;
}

async function getGrid(url: string) {
  const response = await fetch(url);
  return Grid.parse(await response.json());
}

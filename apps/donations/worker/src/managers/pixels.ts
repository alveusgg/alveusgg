import type { Donation, DonationAlert, Pixel } from "@alveusgg/donations-core";
import { DurableObject } from "cloudflare:workers";

import type { AppRouter } from "@alveusgg/alveusgg-website";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import { Hono } from "hono";
import { cors } from "hono/cors";
import * as Sentry from "@sentry/cloudflare";
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

class PixelsManagerDurableObjectBase extends DurableObject<Env> {
  private router: Hono;
  private startup?: Promise<void>;
  private provider?: SyncProvider<PixelsManagerState>;
  private grid?: Grid;
  private api?: ReturnType<typeof createTRPCProxyClient<AppRouter>>;
  private muralId: string;

  public async ready() {
    if (!this.startup) {
      this.startup = this.init();
    }
    await this.startup;
  }

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.muralId = env.MURAL_ID;
    const sharedKeyMiddleware = createSharedKeyMiddleware(env.SHARED_KEY);

    this.router = new Hono()
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
        await this.startWebsocketConnection(server);
        return new Response(null, { status: 101, webSocket: client });
      })
      .post("/resync", sharedKeyMiddleware, async (c) => {
        try {
          await this.ctx.blockConcurrencyWhile(async () => {
            await this.resync();
          });
          return c.json({ success: true });
        } catch (error) {
          console.error(error);
          Sentry.captureException(error);
          return c.json(
            { error: "Failed to resync pixels", success: false },
            500,
          );
        }
      });
  }

  async init() {
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

    const pixels = await this.getStateFromAPI();
    this.provider = new SyncProvider({
      state: { state: { pixels } },
      init: { pixels: [] },
    });
  }

  private async resync() {
    if (!this.provider) throw new Error("Provider not initialized");
    const pixels = await this.getStateFromAPI();
    this.provider.update((state) => ({
      ...state,
      pixels,
    }));
  }

  private async getStateFromAPI() {
    if (!this.api) throw new Error("API not initialized");
    const pixels: Omit<Pixel, "data">[] =
      await this.api.donations.getPixels.query({ muralId: this.muralId });

    const pixelsWithImageData = pixels.map((pixel) => {
      if (!this.grid) throw new Error("Grid not initialized");
      return {
        ...pixel,
        data: this.grid.squares[`${pixel.column}:${pixel.row}`],
      };
    });

    return pixelsWithImageData;
  }

  private async startWebsocketConnection(server: WebSocket) {
    if (!this.provider) throw new Error("Provider not initialized");
    server.send(stringify({ type: "start" }));
  }

  private async broadcastToAllConnectedWebsockets(
    type: string,
    payload: unknown,
  ) {
    const sockets = this.ctx.getWebSockets();

    for await (const socket of sockets) {
      if (socket.readyState !== WebSocket.OPEN) continue;
      socket.send(stringify({ type, payload }));
    }
  }

  async process(donations: Donation[]) {
    await this.ctx.blockConcurrencyWhile(async () => {
      await this.ready();
      if (!this.provider) throw new Error("Provider not initialized");
      if (!this.api) throw new Error("API not initialized");
      if (!this.grid) throw new Error("Grid not initialized");

      // Lookups
      const twitchBroadcasterIdHashMap = makeTwitchBroadcasterMap(donations);
      // Current state
      const current = this.provider.getContext();
      // New pixels
      const pixels: Record<string, Pixel[]> = {};
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
              ...current.pixels,
              ...Object.values(pixels).flat(),
              ...pixelsForDonation,
            ],
            this.grid,
          );
          if (!location) continue;

          const data = this.grid.squares[`${location.column}:${location.row}`];
          const emailHash = donation.donatedBy.email
            ? await hash(donation.donatedBy.email)
            : undefined;

          pixelsForDonation.push({
            id: crypto.randomUUID(),
            muralId: this.muralId,
            donationId: donation.id,
            receivedAt: donation.receivedAt,
            data,
            identifier,
            email: emailHash ?? null,
            column: location.column,
            row: location.row,
          });
        }

        pixels[donation.id] = pixelsForDonation;
      }

      // Calling the API
      // This means the whole batch of donations will be deadlettered if the
      // a pixel location is invalid. This allows us to retry easily.
      await this.api.donations.createPixels.mutate({
        pixels: Object.values(pixels)
          .flat()
          .map((pixel) => {
            const optionalTwitchBroadcasterId = twitchBroadcasterIdHashMap.get(
              pixel.donationId,
            );
            return {
              id: pixel.id,
              muralId: pixel.muralId,
              donationId: pixel.donationId,
              receivedAt: pixel.receivedAt,
              identifier: pixel.identifier,
              email: pixel.email,
              column: pixel.column,
              row: pixel.row,
              metadata: {
                twitchBroadcasterId: optionalTwitchBroadcasterId,
              },
            };
          }),
      });

      this.provider.update((state) => ({
        ...state,
        pixels: [...state.pixels, ...Object.values(pixels).flat()],
      }));

      for (const donation of donations) {
        const identifier =
          donation.donatedBy[donation.donatedBy.primary] ?? "Anonymous";

        const alert = {
          amount: donation.amount,
          identifier,
          pixels: pixels[donation.id],
        } satisfies DonationAlert;

        await this.broadcastToAllConnectedWebsockets("update", alert);
      }
    });
  }

  fetch(request: Request): Response | Promise<Response> {
    return this.router.fetch(request);
  }
}

export const PixelsManagerDurableObject =
  Sentry.instrumentDurableObjectWithSentry(
    (env: Env) => ({
      dsn: env.SENTRY_DSN,
    }),
    PixelsManagerDurableObjectBase,
  );

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
    .digest("SHA-256", new TextEncoder().encode(identifier.toLowerCase()))
    .then((hash) =>
      Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    );
}

function makeTwitchBroadcasterMap(donations: Donation[]) {
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

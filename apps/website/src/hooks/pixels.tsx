import { type QueryKey, useQuery, useQueryClient } from "@tanstack/react-query";
import { WebSocket } from "partysocket";
import { type ReactNode, createContext, use, useEffect, useMemo } from "react";
import { parse } from "superjson";

import type { DonationAlert } from "@alveusgg/donations-core";

import { env } from "@/env";

import type { PublicPixel } from "@/server/db/donations";

import type { MuralId } from "@/data/murals";
import murals, { isMuralId } from "@/data/murals";

export type Pixel = PublicPixel & { data: string };

export const PIXEL_SIZE = 3;
export const PIXEL_GRID_WIDTH = 200;
export const PIXEL_GRID_HEIGHT = 50;
export const PIXEL_TOTAL = PIXEL_GRID_WIDTH * PIXEL_GRID_HEIGHT;

interface SyncProviderOptions {
  url: string;
}

interface CorePixelProvider {
  type: "sync" | "static";
  key: QueryKey;
}

export type PixelSyncContext = Pixel[];

interface IPixelSyncProvider extends CorePixelProvider {
  type: "sync";
  ready: () => Promise<void>;
  get: () => Promise<PixelSyncContext>;
  onEvent: (event: (event: DonationAlert) => void) => () => void;
  onUpdate: (event: (context: PixelSyncContext) => void) => () => void;
  close: () => void;
  reconnect: () => void;
}

interface IPixelStaticProvider extends CorePixelProvider {
  type: "static";
  muralId: MuralId;
}

interface StateEvent {
  type: "start";
}

interface UpdateEvent {
  type: "update";
  payload: DonationAlert;
}

type Event = StateEvent | UpdateEvent;

interface EventCallback {
  type: "event";
  callback: (event: DonationAlert) => void;
}

interface UpdateCallback {
  type: "update";
  callback: (context: PixelSyncContext) => void;
}

type Callback = EventCallback | UpdateCallback;

export class PixelSyncProvider implements IPixelSyncProvider {
  type = "sync" as const;
  key: QueryKey;
  socket: WebSocket;
  url: string;
  options: SyncProviderOptions;
  context!: PixelSyncContext;

  private readonly startup: Promise<void>;

  constructor(options: SyncProviderOptions) {
    this.options = options;
    this.url = this.options.url;
    this.key = ["pixels", "live"];
    const socket = new WebSocket(this.url, undefined, { startClosed: true });
    socket.binaryType = "arraybuffer";
    this.socket = socket;

    this.startup = this.init();
  }
  public async get(): Promise<PixelSyncContext> {
    await this.ready();
    return this.context;
  }

  private callbacks: Array<Callback> = [];
  public onEvent(callback: (event: DonationAlert) => void) {
    this.callbacks.push({ type: "event", callback });
    return () => {
      this.callbacks = this.callbacks.filter((c) => c.callback !== callback);
    };
  }
  public onUpdate(callback: (context: PixelSyncContext) => void) {
    this.callbacks.push({ type: "update", callback });
    return () => {
      this.callbacks = this.callbacks.filter((c) => c.callback !== callback);
    };
  }
  public async ready() {
    await this.startup;
  }

  public close() {
    this.socket.close(1000, "Closing connection");
  }

  public reconnect() {
    this.socket.reconnect();
  }

  async init() {
    this.socket.addEventListener("message", (event) =>
      this.handleMessage(event),
    );
    this.context = await this.fetchCurrentContext();
  }

  private handleMessage(raw: MessageEvent<string>) {
    const event = parse<Event>(raw.data);
    if (event.type === "update") {
      if (!this.context)
        throw new Error(
          "State should be always initialized before an update event is received.",
        );
      this.context = [...this.context, ...event.payload.pixels];

      this.callbacks.forEach((callback) => {
        if (callback.type === "event") {
          callback.callback(event.payload);
        }
        if (callback.type === "update") {
          if (!this.context) return;
          callback.callback(this.context);
        }
      });
      return;
    }
  }

  async fetchCurrentContext(): Promise<PixelSyncContext> {
    const response = await fetch(
      `${env.NEXT_PUBLIC_DONATIONS_MANAGER_URL}/pixels/current`,
    );
    const context = await response.json();
    return context.pixels;
  }
}

const getDemoColor = () =>
  [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    255,
  ] as const;

const getShiftedColor = (color: readonly [number, number, number, number]) =>
  [
    Math.max(0, Math.min(255, color[0] + (Math.random() * 50 - 25))),
    Math.max(0, Math.min(255, color[1] + (Math.random() * 50 - 25))),
    Math.max(0, Math.min(255, color[2] + (Math.random() * 50 - 25))),
    color[3],
  ] as const;

interface DemoPixelSyncProviderOptions {
  muralId: MuralId;
}

export class DemoPixelSyncProvider implements IPixelSyncProvider {
  key: QueryKey;
  muralId: MuralId;
  private updateInterval?: NodeJS.Timeout;

  constructor(options: DemoPixelSyncProviderOptions) {
    this.key = ["pixels", "demo", options.muralId, Math.random()];
    this.muralId = options.muralId;
  }

  type = "sync" as const;
  ready = () => Promise.resolve();
  context: PixelSyncContext = [];
  get: () => Promise<PixelSyncContext> = () => Promise.resolve(this.context);
  private callbacks: Array<Callback> = [];
  public onEvent(callback: (event: DonationAlert) => void) {
    this.callbacks.push({ type: "event", callback });
    return () => {
      this.callbacks = this.callbacks.filter((c) => c.callback !== callback);
    };
  }
  public onUpdate(callback: (context: PixelSyncContext) => void) {
    this.callbacks.push({ type: "update", callback });
    return () => {
      this.callbacks = this.callbacks.filter((c) => c.callback !== callback);
    };
  }

  private stopDemo() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
  }

  private startDemo() {
    this.updateInterval = setInterval(() => {
      const donationId = `demo_donation_${Math.floor(Math.random() * 1000000)}`;
      const identifier = `@demo_user_${Math.floor(Math.random() * 1000)}`;

      const numberOfPixels = Math.floor(Math.random() * 2) + 1;

      const fakeEvent: UpdateEvent = {
        type: "update",
        payload: {
          identifier,
          amount: numberOfPixels * 10000 + Math.floor(Math.random() * 3000),
          pixels: Array.from({ length: numberOfPixels }).map(() => {
            const color = getDemoColor();
            return {
              id: `pixel_${Math.floor(Math.random() * 1000000)}`,
              donationId,
              muralId: this.muralId,
              email: null,
              receivedAt: new Date(),
              data: btoa(
                String.fromCharCode(
                  ...Array.from({ length: PIXEL_SIZE * PIXEL_SIZE }).flatMap(
                    () => getShiftedColor(color),
                  ),
                ),
              ),
              identifier,
              column: Math.floor(Math.random() * PIXEL_GRID_WIDTH),
              row: Math.floor(Math.random() * PIXEL_GRID_HEIGHT),
            };
          }),
        },
      };

      this.context = [...this.context, ...fakeEvent.payload.pixels];
      this.callbacks.forEach((callback) => {
        if (callback.type === "event") {
          callback.callback(fakeEvent.payload);
        }
        if (callback.type === "update") {
          callback.callback(this.context);
        }
      });
    }, 1000);
  }

  public close() {
    this.stopDemo();
  }

  public reconnect() {
    this.stopDemo();
    this.startDemo();
  }
}

const PixelSyncProviderContext = createContext<
  IPixelSyncProvider | IPixelStaticProvider | null
>(null);

export const PixelProvider = ({
  children,
  muralId,
}: {
  muralId: MuralId;
  children: ReactNode;
}) => {
  const sync = useMemo(() => {
    const mural = murals[muralId];
    // If the mural is static, we don't need to connect to the websocket
    if (mural.type === "static") {
      return {
        type: "static",
        key: ["pixels", "static", muralId],
        muralId,
      } satisfies IPixelStaticProvider;
    }

    if (env.NEXT_PUBLIC_DONATIONS_DEMO_MODE || typeof window === "undefined") {
      return new DemoPixelSyncProvider({ muralId });
    }

    if (!env.NEXT_PUBLIC_DONATIONS_MANAGER_URL) {
      throw new Error("NEXT_PUBLIC_DONATIONS_MANAGER_URL is not set");
    }

    // If the mural is sync, we need to connect to the websocket
    return new PixelSyncProvider({
      url: `${env.NEXT_PUBLIC_DONATIONS_MANAGER_URL}/pixels/sync`,
    });
  }, [muralId]);

  useEffect(() => {
    if (sync.type === "static") return;
    sync.reconnect();

    return () => {
      sync.close();
    };
  }, [sync]);

  return (
    <PixelSyncProviderContext.Provider value={sync}>
      {children}
    </PixelSyncProviderContext.Provider>
  );
};

const usePixelContext = () => {
  const sync = use(PixelSyncProviderContext);
  if (!sync) throw new Error("PixelSyncProvider not found");
  return sync;
};

interface LivePixelsParams {
  onInit?: (context: PixelSyncContext) => void;
  onEvent?: (alert: DonationAlert) => void;
}

const getStaticPixels = async (muralId: MuralId) => {
  if (!isMuralId(muralId)) {
    throw new Error(`Invalid mural ID: ${muralId}`);
  }

  const mural = murals[muralId];
  if (mural.type !== "static")
    throw new Error(`Mural ${muralId} is not static`);

  const response = await fetch(`/api/pixels/${muralId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error("Failed to get pixels");
  }

  const pixels = data as PublicPixel[];
  const grid = await mural.grid;
  return pixels.map((pixel) => {
    const location = `${pixel.column}:${pixel.row}`;
    const data = grid.squares[location];
    if (!data) throw new Error(`Data for pixel ${location} not found`);
    return { ...pixel, data };
  });
};

export const usePixels = ({ onInit, onEvent }: LivePixelsParams = {}) => {
  const provider = usePixelContext();
  const client = useQueryClient();

  const query = useQuery({
    queryKey: provider.key,
    queryFn: async ({ client }) => {
      if (provider.type === "static") {
        return getStaticPixels(provider.muralId);
      }

      if (provider.type === "sync") {
        await provider.ready();
        provider.onUpdate((context) => {
          client.setQueryData(provider.key, context);
        });
        return provider.get();
      }

      throw new Error("Invalid pixel provider type");
    },
  });

  useEffect(() => {
    // Only attach event listeners after the initial data is loaded
    if (provider.type === "static") return;
    if (!query.isSuccess) return;
    const data = client.getQueryData<PixelSyncContext>(provider.key);
    if (!data) return;

    // Call the onInit callback with the initial data
    if (onInit) onInit(data);

    if (onEvent) {
      const cleanup = provider.onEvent(onEvent);
      return () => {
        cleanup();
      };
    }
  }, [onEvent, onInit, provider, client, query.isSuccess]);

  return query.data;
};

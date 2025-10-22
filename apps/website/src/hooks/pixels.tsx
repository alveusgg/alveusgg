import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WebSocket } from "partysocket";
import { type ReactNode, createContext, use, useEffect, useMemo } from "react";
import { parse, stringify } from "superjson";

import type { DonationAlert, Pixel } from "@alveusgg/donations-core";

import { env } from "@/env";

export const PIXEL_SIZE = 3;
export const PIXEL_GRID_WIDTH = 200;
export const PIXEL_GRID_HEIGHT = 50;
export const PIXEL_TOTAL = PIXEL_GRID_WIDTH * PIXEL_GRID_HEIGHT;

interface StateEvent {
  type: "start";
}

interface UpdateEvent {
  type: "update";
  payload: DonationAlert;
}

type Event = StateEvent | UpdateEvent;

export type PixelSyncContext = { pixels: Pixel[] };

interface SyncProviderOptions {
  url: string;
}

interface IPixelSyncProvider {
  ready: () => Promise<void>;
  get: () => Promise<PixelSyncContext>;
  onEvent: (event: (event: DonationAlert) => void) => () => void;
  onUpdate: (event: (context: PixelSyncContext) => void) => () => void;
  close: () => void;
  reconnect: () => void;
}

abstract class BasePixelSyncProvider {
  protected context?: PixelSyncContext;

  private callbacks: Array<(event: DonationAlert) => void> = [];
  public onEvent(callback: (event: DonationAlert) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((c) => c !== callback);
    };
  }

  private updateCallbacks: Array<(context: PixelSyncContext) => void> = [];
  public onUpdate(callback: (context: PixelSyncContext) => void) {
    this.updateCallbacks.push(callback);
    return () => {
      this.updateCallbacks = this.updateCallbacks.filter((c) => c !== callback);
    };
  }

  protected handleMessage(raw: MessageEvent<string>) {
    const event = parse<Event>(raw.data);
    if (event.type === "update") {
      if (!this.context)
        throw new Error(
          "State should be always initialized before an update event is received.",
        );
      this.context = {
        pixels: [...this.context.pixels, ...event.payload.pixels],
      };

      this.callbacks.forEach((callback) => callback(event.payload));
      this.updateCallbacks.forEach((callback) => {
        if (!this.context) return;
        callback(this.context);
      });
      return;
    }
  }

  public async ready() {}

  public async get(): Promise<PixelSyncContext> {
    await this.ready();
    if (!this.context) throw new Error("No context found");
    return this.context;
  }
}

export class PixelSyncProvider
  extends BasePixelSyncProvider
  implements IPixelSyncProvider
{
  socket: WebSocket;
  url: string;
  options: SyncProviderOptions;
  meta?: Record<string, string>;

  private readonly startup: Promise<void>;

  constructor(options: SyncProviderOptions) {
    super();

    this.options = options;
    this.url = this.options.url;
    const socket = new WebSocket(this.url, undefined, { startClosed: true });
    socket.binaryType = "arraybuffer";
    this.socket = socket;

    this.startup = this.init();
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

  protected async init() {
    this.socket.addEventListener("message", (event) =>
      this.handleMessage(event),
    );
    this.context = await this.fetchCurrentContext();
  }

  protected async fetchCurrentContext(): Promise<PixelSyncContext> {
    const response = await fetch(
      `${env.NEXT_PUBLIC_DONATIONS_MANAGER_URL}/pixels/current`,
    );
    return response.json();
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

export class DemoPixelSyncProvider
  extends BasePixelSyncProvider
  implements IPixelSyncProvider
{
  private updateInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.context = { pixels: [] };
    this.startDemo();
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

      const fakeEvent: Event = {
        type: "update",
        payload: {
          identifier,
          amount: numberOfPixels * 10000 + Math.floor(Math.random() * 3000),
          pixels: Array.from({ length: numberOfPixels }).map(() => {
            const color = getDemoColor();
            return {
              id: `pixel_${Math.floor(Math.random() * 1000000)}`,
              donationId,
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
      this.handleMessage(
        new MessageEvent("message", { data: stringify(fakeEvent) }),
      );
    }, 4000);
  }

  public close() {
    this.stopDemo();
  }

  public reconnect() {
    this.stopDemo();
    this.startDemo();
  }
}

const PixelSyncProviderContext = createContext<IPixelSyncProvider | null>(null);

export const PixelSyncProviderProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const sync = useMemo(() => {
    if (env.NEXT_PUBLIC_DONATIONS_DEMO_MODE) {
      return new DemoPixelSyncProvider();
    }
    if (!env.NEXT_PUBLIC_DONATIONS_MANAGER_URL) {
      throw new Error("NEXT_PUBLIC_DONATIONS_MANAGER_URL is not set");
    }

    return new PixelSyncProvider({
      url: `${env.NEXT_PUBLIC_DONATIONS_MANAGER_URL}/pixels/sync`,
    });
  }, []);

  useEffect(() => {
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

const usePixelSync = () => {
  const sync = use(PixelSyncProviderContext);
  if (!sync) throw new Error("PixelSyncProvider not found");
  return sync;
};

interface LivePixelsParams {
  onInit?: (context: PixelSyncContext) => void;
  onEvent?: (alert: DonationAlert) => void;
}

const LivePixelsQueryKey = ["pixels"];
export const useLivePixels = ({ onEvent, onInit }: LivePixelsParams = {}) => {
  const client = useQueryClient();
  const sync = usePixelSync();
  const query = useQuery({
    queryKey: LivePixelsQueryKey,
    queryFn: async ({ client }) => {
      await sync.ready();
      sync.onUpdate((context) => {
        client.setQueryData(LivePixelsQueryKey, context);
      });
      return sync.get();
    },
  });

  useEffect(() => {
    // Only attach event listeners after the initial data is loaded
    if (!query.isSuccess) return;
    const data = client.getQueryData<PixelSyncContext>(LivePixelsQueryKey);
    if (!data) return;

    // Call the onInit callback with the initial data
    if (onInit) onInit(data);

    if (onEvent) {
      const cleanup = sync.onEvent(onEvent);
      return () => {
        cleanup();
      };
    }
  }, [onEvent, onInit, sync, client, query.isSuccess]);

  return query;
};

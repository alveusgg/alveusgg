import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WebSocket } from "partysocket";
import { createContext, use, useEffect, useMemo } from "react";
import { parse } from "superjson";

import type { DonationAlert, Pixel } from "@alveusgg/donations-core";

import { env } from "@/env";

export const PIXEL_SIZE = 10;
export const PIXEL_GRID_WIDTH = 200;
export const PIXEL_GRID_HEIGHT = 50;
export const PIXEL_TOTAL = PIXEL_GRID_WIDTH * PIXEL_GRID_HEIGHT;

export type PixelSyncContext = { pixels: Pixel[] };

interface SyncProviderOptions {
  url: string;
}
export class PixelSyncProvider {
  socket: WebSocket;
  url: string;
  options: SyncProviderOptions;
  meta?: Record<string, string>;

  private startup: Promise<void>;

  public async ready() {
    await this.startup;
  }

  public close() {
    this.socket.close(1000, "Closing connection");
  }

  public reconnect() {
    this.socket.reconnect();
  }

  async get(): Promise<PixelSyncContext> {
    await this.ready();
    if (!this.context) throw new Error("No context found");
    return this.context;
  }

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

  private context?: PixelSyncContext;

  constructor(options: SyncProviderOptions) {
    this.options = options;
    this.url = this.options.url;
    const socket = new WebSocket(this.url, undefined, { startClosed: true });
    socket.binaryType = "arraybuffer";
    this.socket = socket;

    this.startup = this.init();
  }

  private async init() {
    this.socket.addEventListener("message", (raw) => {
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
    });

    const context = await getCurrentContext();
    this.context = context;
  }
}

const getCurrentContext = async (): Promise<PixelSyncContext> => {
  const response = await fetch(
    `${env.NEXT_PUBLIC_DONATIONS_MANAGER_URL}/pixels/current`,
  );
  return response.json();
};

interface StateEvent {
  type: "start";
}

interface UpdateEvent {
  type: "update";
  payload: DonationAlert;
}

type Event = StateEvent | UpdateEvent;

const PixelSyncProviderContext = createContext<PixelSyncProvider | null>(null);
export const PixelSyncProviderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const sync = useMemo(() => {
    if (!env.NEXT_PUBLIC_DONATIONS_MANAGER_URL) {
      throw new Error("NEXT_PUBLIC_DONATIONS_MANAGER_URL is not set");
    }
    const sync = new PixelSyncProvider({
      url: `${env.NEXT_PUBLIC_DONATIONS_MANAGER_URL}/pixels/sync`,
    });
    return sync;
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
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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

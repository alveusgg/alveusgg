import type { Helpers, PathConfig } from "@conservation-stream/mtx-manager";
import { module } from "@conservation-stream/mtx-manager";
import { Cloudflare } from "cloudflare";
import { Hono } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { createJWT, signJWT } from "../../../utils/jwt";
import type { MinimalWebSocketLike } from "../../../utils/ws";
import { getOrCreateLiveInput } from "./stream";

interface DynamicModuleConfig {
  paths: Record<string, PathConfig>;
  frame: {
    width: number;
    height: number;
    fps: number;
  };
  cloudflare: {
    accountId: string;
    apiToken: string;

    signedAccessKeyId: string;
    signedAccessKeyJWK: string;
    streamHost: string;
  };
}

export const createDynamicModule =
  (config: DynamicModuleConfig) => async (helpers: Helpers) => {
    const handler = new Hono();
    const websockets = new Map<
      string,
      { id: string; websocket: MinimalWebSocketLike }
    >();

    const cloudflare = new Cloudflare({
      apiToken: config.cloudflare.apiToken,
    });

    handler.get(
      "/bitrate/:path",
      upgradeWebSocket((c) => {
        const id = crypto.randomUUID();
        const path = c.req.param("path");
        console.log(
          `Agent ${id} attempting to connect to bitrate endpoint for path ${path}`,
        );
        if (!path) throw new Error("Path is required");
        return {
          onMessage: (_, websocket) => {
            const existingWebsocketForPath = websockets.get(path);
            if (
              existingWebsocketForPath &&
              existingWebsocketForPath.id !== id
            ) {
              websocket.close(
                1008,
                "An agent is already connected to service this request.",
              );
              return;
            }

            console.log(
              `Agent ${id} connected to bitrate endpoint for path ${path}`,
            );
            websockets.set(path, { id, websocket });
          },
          onClose: () => {
            const existingWebsocketForPath = websockets.get(path);
            if (!existingWebsocketForPath) return;

            if (existingWebsocketForPath.id === id) {
              websockets.delete(path);
            }
          },
        };
      }),
    );

    const pathsWithDynamic: Record<string, PathConfig> = {};

    const inputs = await cloudflare.stream.liveInputs.list({
      account_id: config.cloudflare.accountId,
    });
    const liveInputs = inputs as Cloudflare.Stream.LiveInput[];
    const outputs: Record<string, Cloudflare.Stream.LiveInput> = {};

    for (const [path, pathConfig] of Object.entries(config.paths)) {
      const input = await getOrCreateLiveInput(
        cloudflare,
        config.cloudflare.accountId,
        path,
        liveInputs,
      );
      const publishUrl = input.webRTC?.url;
      outputs[path] = { uid: input.uid };

      pathsWithDynamic[path] = {
        ...pathConfig,
        runOnReady: `cstream publish --in rtsp://127.0.0.1:8554/${path} --out rtsp://127.0.0.1:8554/dynamic_${path} --base-bitrate 100 --height ${config.frame.height} --width ${config.frame.width} --rate ${config.frame.fps}/1 --dynamic ${helpers.makeUrl(`/dynamic/bitrate/${path}`, { protocol: "ws" })} --debug`,
        runOnReadyRestart: true,
      };

      pathsWithDynamic[`dynamic_${path}`] = {
        runOnReady: `cstream forward --in rtsp://127.0.0.1:8554/dynamic_${path} --out ${publishUrl} --debug`,
        runOnReadyRestart: true,
      };
    }

    const getPlaybackDetailsForPath = async (path: string) => {
      const input = outputs[path];
      if (!input) throw new Error(`Input not found for path ${path}`);
      const expiresTimeInSeconds = 60 * 5;
      const expiresAt = Math.floor(Date.now() / 1000) + expiresTimeInSeconds;
      const token = createJWT(
        {
          alg: "RS256",
          kid: config.cloudflare.signedAccessKeyId,
        },
        {
          sub: input.uid,
          kid: config.cloudflare.signedAccessKeyId,
          exp: expiresAt,
          accessRules: [
            {
              type: "any",
              action: "allow",
            },
          ],
        },
      );

      const jwt = await signJWT(token, config.cloudflare.signedAccessKeyJWK);
      return {
        origin: `https://${config.cloudflare.streamHost}`,
        jwt: jwt,
        iframe: `https://${config.cloudflare.streamHost}/${jwt}/iframe`,
        whep: `https://${config.cloudflare.streamHost}/${jwt}/webRTC/play`,
      };
    };

    const updateBitrateForPath = async (path: string, bitrate: number) => {
      const input = outputs[path];
      if (!input) throw new Error(`Input not found for path ${path}`);
      const websocket = websockets.get(path);
      if (!websocket) throw new Error("Websocket not found");
      websocket.websocket.send(JSON.stringify({ type: "bitrate", bitrate }));
    };

    return {
      getPlaybackDetailsForPath: getPlaybackDetailsForPath,
      updateBitrateForPath: updateBitrateForPath,
      ...module({
        id: "dynamic",
        path: "/dynamic",
        handler,
        metadata: {
          links: {
            playback: outputs,
            bitrate: {
              post: helpers.makeUrl("/dynamic/bitrate/:path"),
            },
          },
        },
        config: {
          paths: pathsWithDynamic,
        },
      }),
    };
  };

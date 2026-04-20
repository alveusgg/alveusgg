import type { PathConfig } from "@conservation-stream/mtx-manager";
import {
  createAuthModule,
  createLogModule,
  createRecordingModule,
  isLoopback,
  serveModuleHandlers,
} from "@conservation-stream/mtx-manager";
import { validateJWTForRoles } from "../../middleware/alveus";
import { createDynamicModule } from "./modules/dynamic";

export type MTX = Awaited<ReturnType<typeof setup>>;

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;
const BITRATE = 6000;

interface Camera {
  host: string;
  dynamic: boolean;
  record: boolean;
}

export const setup = async (env: Env, cameras: Record<string, Camera>) => {
  const paths: Record<string, PathConfig> = {};
  const dynamicPaths: Record<string, PathConfig> = {};

  for (const [path, camera] of Object.entries(cameras)) {
    if (camera.dynamic) {
      dynamicPaths[path] = {
        rtspTransport: "tcp",
        source: `rtsp://${env.CAM_USERNAME}:${env.CAM_PASSWORD}@${camera.host}/axis-media/media.amp?camera=1&videoframeskipmode=empty&resolution=${WIDTH}x${HEIGHT}&fps=${FPS}&audio=1&timestamp=0&videocodec=h264&h264profile=baseline&videobitratemode=mbr&videomaxbitrate=${BITRATE}&videobitratepriority=fullframerate`,
      };
      continue;
    }

    paths[path] = {
      rtspTransport: "tcp",
      source: `rtsp://${env.CAM_USERNAME}:${env.CAM_PASSWORD}@${camera.host}/axis-media/media.amp?camera=1&videoframeskipmode=empty&resolution=${WIDTH}x${HEIGHT}&fps=${FPS}&audio=1&timestamp=0&videocodec=h264&h264profile=baseline&videobitratemode=mbr&videomaxbitrate=${BITRATE}&videobitratepriority=fullframerate`,
    };
  }

  return serveModuleHandlers({
    origin: env.ORIGIN,
    secret: env.MTX_MANAGER_SECRET,
    prefix: "/api/mtx",
    config: {
      webrtcAdditionalHosts: ["192.168.100.201"],
      paths: {
        ...paths,
      },
    },
    factories: [
      createDynamicModule({
        cloudflare: {
          accountId: env.CF_CLOUDFLARE_ACCOUNT_ID,
          apiToken: env.CF_CLOUDFLARE_API_TOKEN,
          signedAccessKeyId: env.CF_CLOUDFLARE_SIGNED_ACCESS_KEY_ID,
          signedAccessKeyJWK: env.CF_CLOUDFLARE_SIGNED_ACCESS_KEY_JWK,
          streamHost: env.CF_CLOUDFLARE_STREAM_HOST,
        },
        frame: {
          width: WIDTH,
          height: HEIGHT,
          fps: FPS,
        },
        paths: dynamicPaths,
      }),
      createAuthModule({
        check: async (params) => {
          if (isLoopback(params.ip)) return true;
          if (isLAN(params.ip)) return true;
          try {
            return await validateJWTForRoles(params.token, "ptzControl");
          } catch (error) {
            console.error(error);
            return false;
          }
        },
      }),
      createLogModule({
        logFile: "/logs/stream.log",
        logLevel: "info",
        onLogs: () => {},
      }),
      createRecordingModule({
        ttl: "14d",
        directory: "/recordings",
        pathsToRecord: Object.entries(cameras)
          .filter(([_, camera]) => camera.record)
          .map(([path]) => path),
      }),
    ],
  });
};

const isLAN = (ip: string) => {
  return ip.startsWith("192.168.");
};

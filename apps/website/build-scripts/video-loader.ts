import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";

import ffmpeg from "@ffmpeg-installer/ffmpeg";
import ffprobe from "@ffprobe-installer/ffprobe";
import type * as FileType from "file-type";
import { getHashDigest, interpolateName } from "loader-utils";

type VideoLoaderOptions = {
  quality?: string;
  isDevelopment: boolean;
};

type LoaderContext = {
  resourcePath: string;
  resourceQuery?: string;
  rootContext?: string;
  getOptions: () => VideoLoaderOptions;
  async: () => (error: Error | null, output?: string) => void;
};

type VideoLoaderContext = {
  context: LoaderContext;
  format: string;
  content: Buffer;
  cache: string;
  output: string;
};

type VideoLoaderOutput = {
  name: string;
  content: Buffer;
  cached: boolean;
  skipped: boolean;
};

/**
 * Run a shell command
 */
const exec = (file: string, args: string[]) =>
  new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    execFile(file, args, (error, stdout, stderr) => {
      if (error) reject({ error, stdout, stderr });
      else resolve({ stdout, stderr });
    });
  });

let fileTypeCache: typeof FileType | undefined;

/**
 * Get the file type of a buffer
 */
const fileType = async (buffer: Buffer) => {
  if (!fileTypeCache) fileTypeCache = await import("file-type");
  return fileTypeCache.fileTypeFromBuffer(buffer);
};

const cacheDir = "./.next/cache/video-loader";

/**
 * Get the raw video data
 */
const videoRaw = async (ctx: VideoLoaderContext) => {
  // Use ffprobe to get the height
  const { stdout } = await exec(ffprobe.path, [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=height",
    "-of",
    "json",
    ctx.context.resourcePath,
  ]);
  const { height } = (JSON.parse(stdout) as { streams: [{ height: number }] })
    .streams[0];

  // Use file-type to get the mime type
  const { mime } = (await fileType(ctx.content)) || {};
  if (!mime) throw new Error("Could not determine mime type");

  // Get the formatted name
  const interpolatedName = interpolateName(ctx.context, ctx.format, {
    content: ctx.content,
  });

  return {
    name: interpolatedName,
    content: ctx.content,
    height,
    type: mime,
    cached: false,
    skipped: true,
  };
};

/**
 * Get a scale filter for ffmpeg
 *
 * One of width or height must be set
 */
const scaleFilter = (
  width: number | undefined = undefined,
  height: number | undefined = undefined,
) => {
  if (width === undefined && height === undefined)
    throw new Error("One of width or height must be set");

  const widthFilter = width
    ? Math.round(Number(width) / 2) * 2
    : "trunc(oh*a/2)*2";
  const heightFilter = height
    ? Math.round(Number(height) / 2) * 2
    : "trunc(ow/a/2)*2";
  return `scale=w=${widthFilter}:h=${heightFilter}`;
};

/**
 * Get a resized version of the video
 */
const videoResized = async (
  ctx: VideoLoaderContext,
  {
    extension = undefined,
    width = undefined,
    height = undefined,
    fps = undefined,
  }: { extension?: string; width?: number; height?: number; fps?: number },
  args: string[] = [],
  iargs: string[] = [],
): Promise<VideoLoaderOutput> => {
  // Get the original extension
  const originalExtension = interpolateName(ctx.context, "[ext]", {
    context: ctx.context.rootContext,
  });
  const processedExtension = extension || originalExtension;

  // Determine the cache key
  const cacheKey = getHashDigest(
    Buffer.from(
      [
        "video-loader",
        ffmpeg.version,
        width,
        height,
        fps,
        ...args,
        ...iargs,
        getHashDigest(ctx.content, "sha1"),
      ].join(":"),
    ),
    "sha1",
  );
  const cacheFile = `${ctx.cache}/${cacheKey}.${processedExtension}`;

  // See if the cache exists
  let resized;
  let cached = false;
  const cacheData = await readFile(cacheFile).catch(() => null);
  if (cacheData) {
    resized = cacheData;
    cached = true;
  } else {
    // Get a temporary file that we're outputting to
    await mkdir(dirname(cacheFile), { recursive: true });
    const tmpFile = join(
      ctx.cache,
      `${randomBytes(16).toString("hex")}.${processedExtension}`,
    );

    // Combine filters so the frame-rate filter doesn't replace scaling
    const filters = [
      width || height ? scaleFilter(width, height) : undefined,
      fps ? `fps=${fps}` : undefined,
    ].filter(Boolean);

    // Use ffmpeg to change the size to what is requested
    const command = [
      ...iargs,
      "-i",
      ctx.context.resourcePath,
      ...(filters.length ? ["-filter:v", filters.join(",")] : []),
      ...args,
      "-n",
      tmpFile,
    ];
    try {
      await exec(ffmpeg.path, command).catch(({ error, stdout, stderr }) => {
        console.error("ffmpeg command failed:", command);
        console.error("stdout:", stdout);
        console.error("stderr:", stderr);
        throw error;
      });

      // Read in the temporary file
      resized = await readFile(tmpFile);

      // Move the complete temporary file to the cache atomically
      await rename(tmpFile, cacheFile);
    } finally {
      await unlink(tmpFile).catch(() => {});
    }
  }

  // Get the original name
  const name = interpolateName(ctx.context, "[name]", {
    context: ctx.context.rootContext,
  });

  // Get the output name
  // Include processing settings and the ffmpeg version in the output hash
  const interpolatedName = interpolateName(ctx.context, ctx.format, {
    context: ctx.context.rootContext,
    content: Buffer.from(cacheKey),
  })
    .replace(`${name}.`, `${name}-${width || ""}x${height || ""}.`)
    .replace(`.${originalExtension}`, `.${processedExtension}`);

  return {
    name: interpolatedName,
    content: resized,
    cached,
    skipped: false,
  };
};

/**
 * Get the requested quality from the resource query, or the default options
 */
const getQuality = (options: VideoLoaderOptions, query: string | undefined) => {
  if (typeof query === "string" && query[0] === "?") {
    const params = new URLSearchParams(query.slice(1));
    const quality = params.get("quality");
    if (typeof quality === "string") return quality;
  }

  return typeof options.quality === "string" ? options.quality : null;
};

const defaultTypes = {
  high: [
    // Heavily compressed h264 720p30 video (no audio)
    {
      size: 720,
      type: "video/mp4",
      ext: "mp4",
      fps: 30,
      args: ["-an", "-vcodec", "libx264", "-b:v", "1200k"],
      iargs: [],
    },
  ],
  low: [
    // Heavily compressed h264 540p24 video (no audio)
    {
      size: 540,
      type: "video/mp4",
      ext: "mp4",
      fps: 24,
      args: ["-an", "-vcodec", "libx264", "-b:v", "800k"],
      iargs: [],
    },
  ],
  poster: [
    // First frame at 720p
    {
      size: 720,
      type: "video/mp4",
      ext: "png",
      args: ["-an", "-vframes", "1"],
      iargs: [],
    },
    {
      size: 720,
      type: "video/webm",
      ext: "png",
      args: ["-an", "-vframes", "1"],
      iargs: ["-vcodec", "libvpx-vp9"],
    },
  ],
};

type VideoLoaderResult = {
  output: string;
  stats: { cached: number; skipped: number; total: number };
};

/**
 * Run the video loader
 */
const videoLoader = async (
  context: LoaderContext,
  content: Buffer,
): Promise<VideoLoaderResult> => {
  console.log(`Processing video ${context.resourcePath} ...`);

  // Get the prefix for the output files
  const options = context.getOptions();
  const base = "/videos";

  // Get the quality
  const quality =
    getQuality(options, context.resourceQuery) || Object.keys(defaultTypes)[0]!;
  if (quality === "poster" || !Object.hasOwn(defaultTypes, quality))
    throw new Error(`Invalid quality: ${quality}`);

  // Create the context and objects to track the files
  const ctx = {
    context,
    format: "[name].[hash:10].[ext]",
    content,
    cache: join(context.rootContext || process.cwd(), cacheDir),
    output: join(context.rootContext || process.cwd(), "public/videos"),
  };
  const files: VideoLoaderOutput[] = [];
  type Source = { src: string; size: number; type: string };
  const obj: { poster: string | undefined; sources: Source[] } = {
    poster: undefined,
    sources: [],
  };

  // Load the raw video so we know the type
  const raw = await videoRaw(ctx);

  // Expose the first frame as a poster at 720p
  const posterOpts = defaultTypes.poster.find(({ type }) => type === raw.type);
  if (posterOpts) {
    const poster = await videoResized(
      ctx,
      { height: posterOpts.size, extension: posterOpts.ext },
      posterOpts.args,
      posterOpts.iargs,
    );
    files.push(poster);
    obj.poster = `${base}/${encodeURIComponent(poster.name)}`;
  } else {
    console.warn(
      ` ... ${context.resourcePath} no poster options for ${raw.type}`,
    );
  }

  // When not in development mode, process the video
  if (!options.isDevelopment) {
    const resizeOpts = defaultTypes[quality as "high" | "low"].filter(
      ({ type }) => type === raw.type,
    );
    if (resizeOpts.length) {
      for (const { size, type, ext, fps, args, iargs } of resizeOpts) {
        const video = await videoResized(
          ctx,
          { height: size, extension: ext, fps },
          args,
          iargs,
        );
        files.push(video);
        obj.sources.push({
          src: `${base}/${encodeURIComponent(video.name)}`,
          size,
          type,
        });
      }
    } else {
      console.warn(
        ` ... ${context.resourcePath} no resize options for ${raw.type}, using raw`,
      );
    }
  }

  // Otherwise, just expose the original video
  if (!obj.sources.length) {
    files.push(raw);
    obj.sources.push({
      src: `${base}/${encodeURIComponent(raw.name)}`,
      size: raw.height,
      type: raw.type,
    });
  }

  // Turbopack cannot emit assets from loaders, so serve them from public/videos.
  // Publish complete files atomically because server/client loaders can overlap.
  await Promise.all(
    files.map(async ({ name, content }) => {
      const file = join(ctx.output, name);
      if (!content || (await stat(file).catch(() => null))) return;
      await mkdir(dirname(file), { recursive: true });
      const tmpFile = `${file}.${randomBytes(16).toString("hex")}.tmp`;
      try {
        await writeFile(tmpFile, content);
        await rename(tmpFile, file);
      } finally {
        await unlink(tmpFile).catch(() => {});
      }
    }),
  );

  // Collect stats on cache/skipped files
  const stats = files.reduce(
    (acc, { cached, skipped }) => ({
      cached: acc.cached + (cached ? 1 : 0),
      skipped: acc.skipped + (skipped ? 1 : 0),
      total: acc.total + 1,
    }),
    { cached: 0, skipped: 0, total: 0 },
  );

  // Return the object with the paths
  return {
    output: `export default ${JSON.stringify(obj)};`,
    stats,
  };
};

type QueueCallbacks = {
  resolve: (result: VideoLoaderResult) => void;
  reject: (error: unknown) => void;
};
const queue: [LoaderContext, Buffer, QueueCallbacks][] = [];
let processing = false;

/**
 * Process the pending video queue
 */
const queueProcess = async () => {
  if (processing) return;
  processing = true;
  console.log("Processing video queue ...");

  while (queue.length) {
    const [context, content, { resolve, reject }] = queue.shift()!;
    try {
      const res = await videoLoader(context, content);
      // Prune after queued videos have reused their cached conversions.
      if (!queue.length) {
        await cacheCleanup(
          join(context.rootContext || process.cwd(), cacheDir),
        );
      }
      resolve(res);
    } catch (e) {
      reject(e);
    }
  }

  processing = false;
  console.log(" ... video queue processed");
};

/**
 * Run the video loader
 */
const queueVideo = async (context: LoaderContext, content: Buffer) => {
  console.log(`Queueing video ${context.resourcePath} ...`);

  // Create a promise to represent this video processing
  let resolve!: QueueCallbacks["resolve"];
  let reject!: QueueCallbacks["reject"];
  const promise = new Promise<VideoLoaderResult>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  // Add the context to the queue
  queue.push([context, content, { resolve, reject }]);

  // Process the queue in the background
  queueProcess();
  return promise;
};

/**
 * Clean up old cache files
 */
const cacheCleanup = async (cache: string) => {
  // Get all files in the cache dir
  const cacheFiles = await readdir(cache, { withFileTypes: true })
    .then((file) => file.filter((f) => f.isFile()).map((f) => f.name))
    .catch(() => []);

  // Remove all files last accessed over 24 hours ago
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  await Promise.all(
    cacheFiles.map(async (file) => {
      const path = join(cache, file);
      const info = await stat(path).catch(() => null);
      if (info && info.atimeMs < cutoff) await unlink(path).catch(() => {});
    }),
  );
};

export default function (this: LoaderContext, content: Buffer) {
  const callback = this.async();
  queueVideo(this, content)
    .then((res) => {
      console.log(
        ` ... ${this.resourcePath} completed (${res.stats.cached}/${res.stats.total} cached, ${res.stats.skipped}/${res.stats.total} skipped)`,
      );
      callback(null, res.output);
    })
    .catch((e) => {
      console.error(` ... ${this.resourcePath} failed`, e);
      callback(e);
    });
}

export const raw = true;

const { tmpdir } = require("os");
const { randomBytes } = require("crypto");
const { join, dirname } = require("path");
const { exec: execSync } = require("child_process");
const { readFile, rename, mkdir } = require("fs/promises");
const { interpolateName, getHashDigest } = require("loader-utils");
const ffmpeg = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");

const exec = (command) =>
  new Promise((resolve, reject) => {
    execSync(command, (error, stdout, stderr) => {
      if (error) reject({ error, stdout, stderr });
      else resolve({ stdout, stderr });
    });
  });

let fileTypeCache;
const fileType = async (buffer) => {
  if (!fileTypeCache) fileTypeCache = await import("file-type");
  return fileTypeCache.fileTypeFromBuffer(buffer);
};

/**
 * Get the raw video data
 *
 * @param {Object} context Webpack compilation context
 * @param {string} format Output filename format
 * @param {Buffer} content Raw video data
 * @return {Promise<{ name: string, content: Buffer, height: number, type: string }>}
 */
const videoRaw = async ({ context, format, content }) => {
  // Use ffprobe to get the height
  const { stdout } = await exec(
    `${ffprobe.path} -v error -select_streams v:0 -show_entries stream=height -of json ${context.resourcePath}`
  );
  const { height } = JSON.parse(stdout).streams[0];

  // Use file-type to get the mime type
  const { mime } = await fileType(content);

  // Get the formatted name
  const interpolatedName = interpolateName(context, format, { content });

  return {
    name: interpolatedName,
    content,
    height,
    type: mime,
  };
};

/**
 * Get a scale filter for ffmpeg
 *
 * One of width or height must be set
 *
 * @param {number} [width] Optional width for the filter
 * @param {number} [height] Optional height for the filter
 * @return {`-filter:v "scale=${string}:${string}"`}
 */
const scaleFilter = (width = undefined, height = undefined) => {
  if (width === undefined && height === undefined)
    throw new Error("One of width or height must be set");

  const widthFilter = width
    ? Math.round(Number(width) / 2) * 2
    : "trunc(oh*a/2)*2";
  const heightFilter = height
    ? Math.round(Number(height) / 2) * 2
    : "trunc(ow/a/2)*2";
  return `-filter:v "scale=w=${widthFilter}:h=${heightFilter}"`;
};

/**
 * Get a resized version of the video
 *
 * @param {Object} context Webpack compilation context
 * @param {string} format Output filename format
 * @param {string|Buffer} content Input video content
 * @param {boolean} isServer Is the loader being run for the server build
 * @param {string} cache Directory to cache the resized video in
 * @param {string} [extension] Optional output extension (will default to input extension)
 * @param {number} [width] Optional width for the filter
 * @param {number} [height] Optional height for the filter
 * @param {string[]} [args=[]] Additional arguments to pass to ffmpeg
 * @return {Promise<{ name: string, content: Buffer|null, cached: boolean, skipped: boolean }>}
 */
const videoResized = async (
  { context, format, content, isServer, cache },
  { extension = undefined, width = undefined, height = undefined },
  args = []
) => {
  // Get the original extension
  const originalExtension = interpolateName(context, "[ext]", {
    context: context.rootContext,
  });
  const processedExtension = extension || originalExtension;

  // Only process the video if we're on the client
  // See `videoLoader` for context on why we don't emit files for the server
  let resized = null;
  let cached = false;
  if (!isServer) {
    // Determine the cache key
    const cacheKey = getHashDigest(
      Buffer.from(
        [
          "video-loader",
          context.resourcePath,
          width,
          height,
          ...args,
          getHashDigest(content, "sha1"),
        ].join(":")
      ),
      "sha1"
    );
    const cacheFile = `${cache}/${cacheKey}.${processedExtension}`;

    // See if the cache exists
    const cacheData = await readFile(cacheFile).catch(() => null);
    if (cacheData) {
      resized = cacheData;
      cached = true;
    } else {
      // Get a temporary file that we're outputting to
      const tmpFile = join(
        tmpdir(),
        `${randomBytes(16).toString("hex")}.${processedExtension}`
      );

      // Determine the scale filter
      const scale = width || height ? scaleFilter(width, height) : "";

      // Use ffmpeg to change the size to what is requested
      const command = [
        ffmpeg.path,
        "-i",
        context.resourcePath,
        scale,
        ...args,
        "-n",
        tmpFile,
      ]
        .filter(Boolean)
        .join(" ");
      await exec(command).catch(({ error, stdout, stderr }) => {
        console.error("ffmpeg command failed:", command);
        console.error("stdout:", stdout);
        console.error("stderr:", stderr);
        throw error;
      });

      // Read in the temporary file
      resized = await readFile(tmpFile);

      // Move the temporary file to the cache
      await mkdir(dirname(cacheFile), { recursive: true });
      await rename(tmpFile, cacheFile);
    }
  }

  // Get the original name
  const name = interpolateName(context, "[name]", {
    context: context.rootContext,
  });

  // Get the output name
  // Use the input content hash, so it's consistent between server and client
  const interpolatedName = interpolateName(context, format, {
    context: context.rootContext,
    content,
  })
    .replace(`${name}.`, `${name}-${width || ""}x${height || ""}.`)
    .replace(`.${originalExtension}`, `.${processedExtension}`);

  return {
    name: interpolatedName,
    content: resized,
    cached,
    skipped: isServer,
  };
};

/**
 * Get the first frame of the video as a PNG
 *
 * @param {Object} context Webpack compilation context
 * @param {string} format Output filename format
 * @param {string|Buffer} content Input video content
 * @param {boolean} isServer Is the loader being run for the server build
 * @param {string} cache Directory to cache the resized video in
 * @param {number} [width] Optional width for the filter
 * @param {number} [height] Optional height for the filter
 * @return {Promise<{ name: string, content: Buffer|null, cached: boolean, skipped: boolean }>}
 */
const videoPoster = (
  { context, format, content, isServer, cache },
  { width = undefined, height = undefined }
) =>
  videoResized(
    { context, format, content, isServer, cache },
    { extension: "png", width, height },
    ["-an", "-vframes 1"]
  );

/**
 * Get the requested quality from the resource query, or the default options
 *
 * @param {Object} options Webpack loader options
 * @param {string} query Resource query
 * @return {?string}
 */
const getQuality = (options, query) => {
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
      type: "mp4",
      args: ["-an", "-vcodec libx264", "-filter:v fps=30", "-b:v 1200k"],
    },
  ],
  low: [
    // Heavily compressed h264 540p24 video (no audio)
    {
      size: 540,
      type: "mp4",
      args: ["-an", "-vcodec libx264", "-filter:v fps=24", "-b:v 800k"],
    },
  ],
};

const videoLoader = async (context, content) => {
  // Get the prefix for the output files
  // Based on https://github.com/vercel/next.js/blob/888384c5e853ee5f9988b74b9085f1d6f80157a3/packages/next/src/build/webpack/loaders/next-image-loader/index.ts#L25
  const options = context.getOptions();
  const base = `${options.assetPrefix}/_next`;

  // Get the quality
  const quality =
    getQuality(options, context.resourceQuery) || Object.keys(defaultTypes)[0];
  if (!Object.keys(defaultTypes).includes(quality))
    throw new Error(`Invalid quality: ${quality}`);

  // Create the context and objects to track the files
  const ctx = {
    context,
    format: "/static/media/[name].[hash:8].[ext]",
    content,
    isServer: options.isServer,
    cache: "./.next/cache/video-loader",
  };
  const files = [];
  const obj = { poster: "", sources: [] };

  // Expose the first frame as a poster at 720p
  const poster = await videoPoster(ctx, { height: 720 });
  files.push(poster);
  obj.poster = `${base}${poster.name}`;

  if (!options.isDevelopment) {
    // When not in development mode, process the video
    for (const { size, type, args } of defaultTypes[quality]) {
      const video = await videoResized(
        ctx,
        { height: size, extension: type },
        args
      );
      files.push(video);
      obj.sources.push({
        src: `${base}${video.name}`,
        size,
        type: `video/${type}`,
      });
    }
  } else {
    // Otherwise, just expose the original video
    const raw = await videoRaw(ctx);
    files.push(raw);
    obj.sources.push({
      src: `${base}${raw.name}`,
      size: raw.height,
      type: raw.type,
    });
  }

  // Emit the files
  // Based on https://github.com/vercel/next.js/blob/888384c5e853ee5f9988b74b9085f1d6f80157a3/packages/next/src/build/webpack/loaders/next-image-loader/index.ts#L66-L74
  // We don't emit for the server as videos are considered traceable and this breaks things (see https://github.com/vercel/next.js/pull/41554/files)
  if (!options.isServer) {
    files.forEach(({ name, content }) => context.emitFile(name, content, null));
  }

  // Collect stats on cache/skipped files
  const stats = files.reduce(
    (acc, { cached, skipped }) => ({
      cached: (acc.cached || 0) + (cached ? 1 : 0),
      skipped: (acc.skipped || 0) + (skipped ? 1 : 0),
      total: (acc.total || 0) + 1,
    }),
    {}
  );

  // Return the object with the paths
  return {
    output: `export default ${JSON.stringify(obj)};`,
    stats,
  };
};

module.exports = function (content) {
  console.log(`Processing video ${this.resourcePath} ...`);
  const callback = this.async();
  videoLoader(this, content)
    .then((res) => {
      console.log(
        ` ... ${this.resourcePath} completed (${res.stats.cached}/${res.stats.total} cached, ${res.stats.skipped}/${res.stats.total} skipped)`
      );
      callback(null, res.output);
    })
    .catch(callback);
};

module.exports.raw = true;

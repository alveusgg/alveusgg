const { tmpdir } = require("os");
const { randomBytes } = require("crypto");
const { join } = require("path");
const { exec: exexSync } = require("child_process");
const { readFile, unlink } = require("fs/promises");
const { interpolateName } = require("loader-utils");
const ffmpeg = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");

const exec = command => new Promise((resolve, reject) => {
  exexSync(command, (error, stdout, stderr) => {
    if (error) reject({ error, stdout, stderr });
    else resolve({ stdout, stderr });
  });
});

let fileTypeCache;
const fileType = async buffer => {
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
  const { stdout } = await exec(`${ffprobe.path} -v error -select_streams v:0 -show_entries stream=height -of json ${context.resourcePath}`);
  const { height } = JSON.parse(stdout).streams[0];

  // Use file-type to get the mime type
  const { mime } = await fileType(content);

  // Get the formatted name
  const interpolatedName = interpolateName(
    context,
    format,
    { content }
  );

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
  if (width === undefined && height === undefined) throw new Error('One of width or height must be set');
  const widthFilter = `w=${width ? Math.round(Number(width) / 2) * 2 : "trunc(oh*a/2)*2"}`;
  const heightFilter = `h=${height ? Math.round(Number(height) / 2) * 2 : "trunc(ow/a/2)*2"}`;
  return `-filter:v "scale=${widthFilter}:${heightFilter}"`;
};

/**
 * Get a resized version of the video
 *
 * @param {Object} context Webpack compilation context
 * @param {string} format Output filename format
 * @param {string} [extension] Optional output extension (will default to input extension)
 * @param {number} [width] Optional width for the filter
 * @param {number} [height] Optional height for the filter
 * @param {string[]} [args=[]] Additional arguments to pass to ffmpeg
 * @return {Promise<{ name: string, content: Buffer }>}
 */
const videoResized = async (
  { context, format },
  { extension = undefined, width = undefined, height = undefined },
  args = [],
) => {
  // Get the original extension
  const originalExtension = interpolateName(context, '[ext]', { context: context.rootContext });

  // Get a temporary file that we're outputting to
  const tmpFile = join(tmpdir(), `${randomBytes(16).toString('hex')}.${extension || originalExtension}`);

  // Determine the scale filter
  const scale = width || height ? scaleFilter(width, height) : '';

  // Use ffmpeg to change the size to what is requested
  const command = `${ffmpeg.path} -i ${context.resourcePath} ${[ scale, ...args ].filter(Boolean).join(' ')} -n ${tmpFile}`;
  await exec(command).catch(({ error, stdout, stderr }) => {
    console.error('ffmpeg command failed:', command);
    console.error('stdout:', stdout);
    console.error('stderr:', stderr);
    throw error;
  });

  // Read in the temporary file
  const resized = await readFile(tmpFile);
  await unlink(tmpFile);

  // Get the original name
  const name = interpolateName(context, '[name]', { context: context.rootContext });

  // Get the output name
  const interpolatedName = interpolateName(context, format, { context: context.rootContext, content: resized })
    .replace(`${name}.`, `${name}-${width || ''}x${height || ''}.`)
    .replace(`.${originalExtension}`, `.${extension || originalExtension}`);

  return {
    name: interpolatedName,
    content: resized,
  };
};

/**
 * Get the first frame of the video as a PNG
 *
 * @param {Object} context Webpack compilation context
 * @param {string} format Output filename format
 * @param {number} [width] Optional width for the filter
 * @param {number} [height] Optional height for the filter
 * @return {Promise<{ name: string, content: Buffer }>}
 */
const videoPoster = ({ context, format }, { width = undefined, height = undefined }) =>
  videoResized({ context, format }, { extension: 'png', width, height }, [ '-an', '-vframes 1' ]);

const defaultTypes = [
  // Heavily compressed h264 720p video (no audio)
  { size: 720, type: 'mp4', args: [ '-an', '-vcodec libx264', '-crf 25' ] },
];

const videoLoader = async (context, content) => {
  // Get the prefix for the output files
  // Based on https://github.com/vercel/next.js/blob/888384c5e853ee5f9988b74b9085f1d6f80157a3/packages/next/src/build/webpack/loaders/next-image-loader/index.ts#L25
  const options = context.getOptions();
  const base = `${options.assetPrefix}/_next`;

  // Create the context and objects to track the files
  const ctx = { context, format: "/static/media/[name].[hash:8].[ext]", content };
  const files = [];
  const obj = { poster: '', sources: [] };

  // Expose the first frame as a poster at 720p
  const poster = await videoPoster(ctx, { height: 720 });
  files.push(poster);
  obj.poster = `${base}${poster.name}`;

  if (!options.isDevelopment) {
    // When not in development mode, process the video
    for (const { size, type, args } of defaultTypes) {
      const video = await videoResized(ctx, { height: size, extension: type }, args);
      files.push(video);
      obj.sources.push({ src: `${base}${video.name}`, size, type: `video/${type}` });
    }
  } else {
    // Otherwise, just expose the original video
    const raw = await videoRaw(ctx);
    files.push(raw);
    obj.sources.push({ src: `${base}${raw.name}`, size: raw.height, type: raw.type });
  }

  // Emit the files
  // Based on https://github.com/vercel/next.js/blob/888384c5e853ee5f9988b74b9085f1d6f80157a3/packages/next/src/build/webpack/loaders/next-image-loader/index.ts#L66-L74
  files.forEach(({ name, content }) => context.emitFile(
    options.isServer
      ? `../${options.isDevelopment ? '' : '../'}${name}`
      : name,
    content,
    null,
  ));

  // Return the object with the paths
  return `export default ${JSON.stringify(obj)};`;
};

module.exports = function (content) {
  const callback = this.async();
  videoLoader(this, content).then(res => callback(null, res)).catch(callback);
};

module.exports.raw = true;

import { execFileSync } from "node:child_process";
import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  utimes,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

import ffmpeg from "@ffmpeg-installer/ffmpeg";
import ffprobe from "@ffprobe-installer/ffprobe";
import { afterAll, beforeAll, expect, it } from "vitest";

// eslint-disable-next-line import-x/default -- The CommonJS loader uses module.exports.
import videoLoader from "../build-scripts/video-loader.cjs";

type LoaderContext = ThisParameterType<typeof videoLoader>;

let root: string;
let input: string;
let inputContent: Buffer;

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "alveus-video-loader-"));
  input = join(root, "forest clip #1.mp4");
  execFileSync(ffmpeg.path, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-f",
    "lavfi",
    "-i",
    "testsrc2=size=160x120:rate=12:duration=1",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=1000:sample_rate=44100:duration=1",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-shortest",
    input,
  ]);
  inputContent = await readFile(input);
});

afterAll(async () => {
  if (root) await rm(root, { recursive: true, force: true });
});

const load = async (resourceQuery: string, isDevelopment = false) => {
  const code = await new Promise<string>((resolve, reject) => {
    videoLoader.call(
      {
        resourcePath: input,
        resourceQuery,
        rootContext: root,
        getOptions: () => ({ isDevelopment }),
        async: () => (error, result) =>
          error ? reject(error) : resolve(result ?? ""),
      } satisfies LoaderContext,
      inputContent,
    );
  });

  return JSON.parse(
    code
      .replace(/^export default /, "")
      .trim()
      .replace(/;$/, ""),
  ) as {
    poster: string;
    sources: [{ src: string; size: number; type: string }];
  };
};

const outputFile = (url: string) =>
  join(root, "public/videos", decodeURIComponent(basename(url)));

const probe = (file: string) =>
  JSON.parse(
    execFileSync(
      ffprobe.path,
      [
        "-v",
        "error",
        "-show_entries",
        "stream=codec_type,width,height,r_frame_rate,avg_frame_rate",
        "-of",
        "json",
        file,
      ],
      { encoding: "utf8" },
    ),
  ) as {
    streams: {
      codec_type: string;
      width?: number;
      height?: number;
      r_frame_rate?: string;
      avg_frame_rate?: string;
    }[];
  };

it("creates scaled, silent 24 and 30 fps production variants and restores cached outputs", async () => {
  const low = await load("?quality=low");
  const high = await load("?quality=high");

  expect(low.sources[0]).toMatchObject({ size: 540, type: "video/mp4" });
  expect(high.sources[0]).toMatchObject({ size: 720, type: "video/mp4" });

  for (const [source, height, fps] of [
    [low.sources[0], 540, 24],
    [high.sources[0], 720, 30],
  ] as const) {
    const streams = probe(outputFile(source.src)).streams;
    const video = streams.find((stream) => stream.codec_type === "video");
    expect(video).toMatchObject({ height, r_frame_rate: `${fps}/1` });
    expect(video?.width).toBe((height * 4) / 3);
    expect(streams.some((stream) => stream.codec_type === "audio")).toBe(false);
  }

  const cacheDir = join(root, ".next/cache/video-loader");
  const cached = await readdir(cacheDir);
  const mtimes = await Promise.all(
    cached.map(
      async (name) =>
        [name, (await stat(join(cacheDir, name))).mtimeMs] as const,
    ),
  );
  const lowBytes = await readFile(outputFile(low.sources[0].src));

  await rm(join(root, "public/videos"), { recursive: true });
  const restored = await load("?quality=low");

  expect(restored).toEqual(low);
  expect(await readFile(outputFile(restored.sources[0].src))).toEqual(lowBytes);
  expect(
    await Promise.all(
      mtimes.map(
        async ([name, mtime]) =>
          (await stat(join(cacheDir, name))).mtimeMs === mtime,
      ),
    ),
  ).toEqual(mtimes.map(() => true));
});

it("serves the original bytes in development", async () => {
  const result = await load("", true);

  expect(result.sources[0]).toMatchObject({ size: 120, type: "video/mp4" });
  expect(result.sources[0].src).toContain("forest%20clip%20%231");
  expect(await readFile(outputFile(result.sources[0].src))).toEqual(
    inputContent,
  );
});

it("prunes conversions by last access while retaining recently used cache entries", async () => {
  await load("", true);

  const cacheDir = join(root, ".next/cache/video-loader");
  const stale = join(cacheDir, "unused.mp4");
  const recent = join(cacheDir, "recent.mp4");
  const old = new Date(Date.now() - 48 * 60 * 60 * 1000);

  await writeFile(stale, "stale");
  await writeFile(recent, "recent");
  await utimes(stale, old, new Date());
  await utimes(recent, new Date(), old);

  await load("", true);

  const files = await readdir(cacheDir);
  expect(files).not.toContain("unused.mp4");
  expect(files).toContain("recent.mp4");
});

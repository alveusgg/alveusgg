import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

import { sync as probeImage } from "probe-image-size";

import type { Prisma } from "@alveusgg/database";

import { presetCatalogCamera } from "../src/data/tech/camera-identifiers";
import {
  DATA_ROOT,
  DEFAULT_BASE,
  IMAGE_ROOT,
  type LegacyAsset,
  controlImportPatch,
  extractLegacySources,
  mappingConflicts,
  planControlExport,
  sha256,
} from "./migrate-presets-data";

const execute = promisify(execFile);
const repository = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const json = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
async function git(...args: string[]) {
  return (
    await execute("git", args, {
      cwd: repository,
      encoding: "buffer",
      maxBuffer: 32 * 1024 * 1024,
    })
  ).stdout;
}
export async function readLegacyManifest(base = DEFAULT_BASE) {
  const commit = (
    await git("rev-parse", "--verify", "--end-of-options", `${base}^{commit}`)
  )
    .toString()
    .trim();
  const paths = (
    await git(
      "ls-tree",
      "-r",
      "--name-only",
      commit,
      "--",
      DATA_ROOT,
      IMAGE_ROOT,
    )
  )
    .toString()
    .trim()
    .split("\n");
  const sources = await Promise.all(
    paths
      .filter((path) => path.startsWith(DATA_ROOT) && path.endsWith(".ts"))
      .map(async (path) => ({
        path,
        text: (await git("cat-file", "blob", `${commit}:${path}`)).toString(),
      })),
  );
  const { presets, multis } = extractLegacySources(sources);
  const assets: LegacyAsset[] = [];
  for (const path of paths.filter(
    (path) => path.startsWith(IMAGE_ROOT) && path.endsWith(".png"),
  )) {
    const bytes = await git("cat-file", "blob", `${commit}:${path}`);
    const image = probeImage(bytes);
    if (
      !image ||
      image.mime !== "image/png" ||
      image.width < 1 ||
      image.height < 1
    )
      throw new Error(`Invalid archived PNG: ${path}`);
    const references = presets.filter((preset) => preset.imagePath === path);
    const multiReferences = multis.filter((multi) => multi.imagePath === path);
    assets.push({
      path,
      sha256: sha256(bytes),
      size: bytes.length,
      width: image.width,
      height: image.height,
      kind: multiReferences.length
        ? "multi"
        : references.length
          ? "preset"
          : "orphan",
      presets: references,
      multis: multiReferences,
    });
  }
  const images = new Set(assets.map((asset) => asset.path));
  for (const entry of [...presets, ...multis])
    if (!images.has(entry.imagePath))
      throw new Error(`Missing legacy image: ${entry.imagePath}`);
  if (!sources.length || !assets.length)
    throw new Error("The git reference contains no legacy presets/assets");
  return {
    commit,
    sourceFiles: sources.length,
    presets,
    multis,
    assets,
    conflicts: mappingConflicts(presets),
    coverageHash: sha256(
      assets.map((asset) => `${asset.path}\0${asset.sha256}`).join("\n"),
    ),
  };
}
type Manifest = Awaited<ReturnType<typeof readLegacyManifest>>;
type ControlPlan = ReturnType<typeof planControlExport>;
type Transaction = Prisma.TransactionClient;
function archiveMetadata(manifest: Manifest, asset: LegacyAsset) {
  const entry = asset.multis[0] ?? asset.presets[0];
  const content = {
    ...asset,
    archiveVersion: 1,
    ...(entry
      ? {
          description: entry.description,
          modifiedAt: entry.modifiedAt,
          title: entry.title,
          group: entry.group,
        }
      : {}),
    ...(asset.multis[0] ? { ordered_cameras: asset.multis[0].cameras } : {}),
  };
  return {
    ...content,
    sourceCommit: manifest.commit,
    metadataHash: sha256(JSON.stringify(content)),
  };
}
function assertLocalEnvironment(allowRemote = false) {
  if (allowRemote) return;
  const database = new URL(process.env.DATABASE_URL ?? "invalid:");
  const storage = new URL(process.env.FILE_STORAGE_ENDPOINT ?? "invalid:");
  const local = (host: string) =>
    ["localhost", "127.0.0.1", "[::1]"].includes(host);
  if (
    !local(database.hostname) ||
    database.pathname !== "/alveusgg_presets" ||
    !local(storage.hostname) ||
    storage.port !== "9000"
  )
    throw new Error(
      "Apply requires local database alveusgg_presets and local S3 port 9000. No remote resources were contacted.",
    );
}
async function applyMigration(
  manifest: Manifest,
  control: ControlPlan | undefined,
  allowRemote: boolean,
) {
  assertLocalEnvironment(allowRemote);
  const [
    { prisma },
    { env },
    storage,
    { GetObjectCommand, PutObjectCommand },
    { getSignedUrl },
  ] = await Promise.all([
    import("@alveusgg/database"),
    import("../src/env/index.js"),
    import("../src/server/utils/file-storage"),
    import("@aws-sdk/client-s3"),
    import("@aws-sdk/s3-request-presigner"),
  ]);
  const s3 = storage.getFileStorageClient();
  const summary = {
    archived: 0,
    reusedArchives: 0,
    legacySeeded: 0,
    imported: 0,
    preservedCurrent: 0,
  };
  const files = new Map<string, string>();
  async function transaction<T>(callback: (tx: Transaction) => Promise<T>) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await prisma.$transaction(callback, {
          isolationLevel: "Serializable",
          timeout: 30_000,
        });
      } catch (error) {
        if (
          !error ||
          typeof error !== "object" ||
          !("code" in error) ||
          error.code !== "P2034" ||
          attempt >= 2
        )
          throw error;
      }
    }
  }
  async function verify(key: string, asset: LegacyAsset) {
    let object;
    try {
      object = await s3.send(
        new GetObjectCommand({ Bucket: env.FILE_STORAGE_BUCKET, Key: key }),
      );
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "$metadata" in error &&
        (error.$metadata as { httpStatusCode?: number }).httpStatusCode === 404
      )
        return false;
      throw new Error("Could not verify a legacy storage object");
    }
    if (
      !object.Body ||
      object.ContentType !== "image/png" ||
      object.ContentLength !== asset.size
    )
      throw new Error(`Legacy object metadata conflict: ${asset.path}`);
    const bytes = await object.Body.transformToByteArray();
    const image = probeImage(Buffer.from(bytes));
    if (
      sha256(bytes) !== asset.sha256 ||
      !image ||
      image.width !== asset.width ||
      image.height !== asset.height ||
      image.mime !== "image/png"
    )
      throw new Error(
        `Legacy object checksum/dimension conflict: ${asset.path}`,
      );
    return true;
  }
  try {
    for (const asset of manifest.assets) {
      const metadata = archiveMetadata(manifest, asset);
      const existing = await prisma.cameraPresetLegacyAsset.findUnique({
        where: { path: asset.path },
        include: { fileStorageObject: true },
      });
      if (existing) {
        if (
          (existing.metadata as { metadataHash?: string }).metadataHash !==
            metadata.metadataHash ||
          existing.fileStorageObject.deletedAt ||
          !(await verify(existing.fileStorageObject.key, asset))
        )
          throw new Error(`Existing legacy archive differs: ${asset.path}`);
        files.set(asset.path, existing.fileStorageObjectId);
        summary.reusedArchives++;
        continue;
      }
      const pathHash = sha256(asset.path);
      const key = `presets/legacy/${pathHash}-${asset.sha256}.png`;
      if (!(await verify(key, asset))) {
        const bytes = await git(
          "cat-file",
          "blob",
          `${manifest.commit}:${asset.path}`,
        );
        if (sha256(bytes) !== asset.sha256)
          throw new Error("Git object changed during migration");
        const uploadUrl = await getSignedUrl(
          s3,
          new PutObjectCommand({
            Bucket: env.FILE_STORAGE_BUCKET,
            Key: key,
            ContentType: "image/png",
            ACL: "public-read",
            IfNoneMatch: "*",
            Metadata: { acl: "public-read", sha256: asset.sha256 },
          }),
          {
            expiresIn: 3600,
            signableHeaders: new Set([
              "content-type",
              "x-amz-acl",
              "if-none-match",
            ]),
            unhoistableHeaders: new Set(["x-amz-acl"]),
          },
        );
        const response = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "image/png",
            "x-amz-acl": "public-read",
            "If-None-Match": "*",
          },
          body: bytes,
          redirect: "error",
          signal: AbortSignal.timeout(60_000),
        });
        if (!response.ok && response.status !== 412)
          throw new Error(`Legacy upload rejected (${response.status})`);
        await response.body?.cancel();
        if (!(await verify(key, asset)))
          throw new Error("Legacy upload was not persisted");
      }
      const fileId = `legacy-file-${pathHash}`;
      await transaction(async (tx) => {
        const prior = await tx.cameraPresetLegacyAsset.findUnique({
          where: { path: asset.path },
        });
        if (prior) {
          if (
            (prior.metadata as { metadataHash?: string }).metadataHash !==
            metadata.metadataHash
          )
            throw new Error("Concurrent legacy archive conflict");
          files.set(asset.path, prior.fileStorageObjectId);
          return;
        }
        await tx.fileStorageObject.create({
          data: {
            id: fileId,
            key,
            name: asset.path.split("/").at(-1)!,
            type: "image/png",
            prefix: "presets/legacy/",
            acl: "public-read",
            uploadedAt: new Date(),
            expiresAt: null,
            imageMetadata: {
              create: {
                mimeType: "image/png",
                width: asset.width,
                height: asset.height,
              },
            },
          },
        });
        await tx.cameraPresetLegacyAsset.create({
          data: {
            id: `legacy-${pathHash}`,
            path: asset.path,
            kind: asset.kind,
            camera: asset.multis.length
              ? asset.multis[0]!.camera
              : asset.presets[0]
                ? presetCatalogCamera(asset.presets[0].camera)
                : null,
            name: asset.presets.length === 1 ? asset.presets[0]!.name : null,
            metadata: json(metadata),
            fileStorageObjectId: fileId,
          },
        });
        files.set(asset.path, fileId);
      });
      summary.archived++;
      if ((summary.archived + summary.reusedArchives) % 100 === 0)
        console.log(
          `Archived/verified ${summary.archived + summary.reusedArchives}/${manifest.assets.length} legacy PNGs`,
        );
    }
    const conflictCameras = new Set(
      manifest.conflicts.cameras.map((entry) => entry.camera),
    );
    const conflictNames = new Set(
      manifest.conflicts.names.map((entry) => entry.name),
    );
    const groups = new Map<string, Manifest["presets"]>();
    for (const preset of manifest.presets) {
      const camera = presetCatalogCamera(preset.camera);
      if (
        conflictCameras.has(camera) ||
        conflictNames.has(`${camera}/${preset.name}`)
      )
        continue;
      const records = groups.get(camera) ?? [];
      records.push(preset);
      groups.set(camera, records);
    }
    const cameras = new Set([
      ...groups.keys(),
      ...(control?.known.map((entry) => entry.camera) ?? []),
    ]);
    for (const camera of [...cameras].sort()) {
      const changes = await transaction(async (tx) => {
        // Same row lock as website command creation/completion. Pending commands
        // must drain, and an epoch increment fences all pre-import operations.
        await tx.cameraPresetCamera.upsert({
          where: { camera },
          create: { camera },
          update: { version: { increment: 0 } },
        });
        if (
          await tx.cameraPresetOperation.count({
            where: { camera, status: "pending" },
          })
        )
          throw new Error(
            `Camera ${camera} has pending operations. Quiesce producers and drain operations before retrying migration.`,
          );
        const counts = { legacySeeded: 0, imported: 0, preservedCurrent: 0 };
        for (const preset of groups.get(camera) ?? []) {
          if (
            await tx.cameraPreset.findUnique({
              where: { camera_name: { camera, name: preset.name } },
            })
          )
            continue;
          await tx.cameraPreset.create({
            data: {
              camera,
              name: preset.name,
              description: preset.description,
              position: json(preset.position),
              provenance: "legacy",
              imageProvenance: "legacy",
              capturedAt: null,
              fileStorageObjectId: files.get(preset.imagePath)!,
            },
          });
          counts.legacySeeded++;
        }
        for (const preset of control?.known.filter(
          (entry) => entry.camera === camera,
        ) ?? []) {
          const existing = await tx.cameraPreset.findUnique({
            where: { camera_name: { camera, name: preset.name } },
          });
          // Rename/removal counts as a website edit even with legacy provenance.
          if (existing && (existing.deletedAt || existing.version !== 1)) {
            counts.preservedCurrent++;
            continue;
          }
          const patch = controlImportPatch(existing, preset.position);
          if (!patch) {
            counts.preservedCurrent++;
            continue;
          }
          if (existing)
            await tx.cameraPreset.update({
              where: { id: existing.id },
              data: {
                ...patch,
                position: json(patch.position),
                version: { increment: 1 },
              },
            });
          else
            await tx.cameraPreset.create({
              data: {
                camera,
                name: preset.name,
                description: preset.name,
                ...patch,
                position: json(patch.position),
              },
            });
          counts.imported++;
        }
        if (counts.legacySeeded || counts.imported)
          await tx.cameraPresetCamera.update({
            where: { camera },
            data: { version: { increment: 1 } },
          });
        return counts;
      });
      summary.legacySeeded += changes.legacySeeded;
      summary.imported += changes.imported;
      summary.preservedCurrent += changes.preservedCurrent;
    }
    return summary;
  } finally {
    await prisma.$disconnect();
  }
}

type Options = {
  base: string;
  apply: boolean;
  controlExport?: string;
  fetchControl: boolean;
  allowRemote: boolean;
  reportFile?: string;
  envFiles: string[];
};
function parseOptions(args: string[]): Options {
  const options: Options = {
    base: DEFAULT_BASE,
    apply: false,
    fetchControl: false,
    allowRemote: false,
    envFiles: [],
  };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "--apply") options.apply = true;
    else if (arg === "--dry-run") options.apply = false;
    else if (arg === "--allow-remote") options.allowRemote = true;
    else if (arg === "--fetch-control-export") options.fetchControl = true;
    else if (
      ["--base", "--control-export", "--report-file", "--load-env"].includes(
        arg ?? "",
      )
    ) {
      const value = args[++index];
      if (!value || value.startsWith("--"))
        throw new Error(`Missing value for ${arg}`);
      if (arg === "--base") options.base = value;
      else if (arg === "--control-export") options.controlExport = value;
      else if (arg === "--report-file") options.reportFile = value;
      else options.envFiles.push(value);
    } else throw new Error(`Unknown migration option: ${arg}`);
  }
  if (options.allowRemote && !options.apply)
    throw new Error(
      "Remote resources require explicit --apply together with --allow-remote",
    );
  if (options.controlExport && options.fetchControl)
    throw new Error("Choose a cached export or fetch, not both");
  if (options.fetchControl && (!options.apply || !options.reportFile))
    throw new Error(
      "Fetching requires --apply and --report-file to preserve the full export",
    );
  return options;
}
export async function main(args = process.argv.slice(2)) {
  const options = parseOptions(args);
  const manifest = await readLegacyManifest(options.base);
  let controlData: unknown;
  if (options.controlExport)
    controlData = JSON.parse(await readFile(options.controlExport, "utf8"));
  if (options.apply)
    for (const file of options.envFiles) process.loadEnvFile(file);
  if (options.fetchControl) {
    assertLocalEnvironment(options.allowRemote);
    const [{ env }, { issueAccessToken }] = await Promise.all([
      import("../src/env/index.js"),
      import("../src/server/oauth/tokens"),
    ]);
    const url = new URL(
      "direct/presets/export",
      (env.CAM_MANAGER_URL ?? "").replace(/\/?$/, "/"),
    );
    if (
      !options.allowRemote &&
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    )
      throw new Error(
        "This migration run may only fetch the local mock manager export",
      );
    const accessToken = await issueAccessToken({
      subject: "service:preset-bootstrap",
      clientId: "_self",
      roles: ["ptzControl"],
    });
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(30_000),
      redirect: "error",
    });
    if (!response.ok)
      throw new Error(`Control export request rejected (${response.status})`);
    controlData = await response.json();
  }
  const control =
    controlData === undefined ? undefined : planControlExport(controlData);
  if (options.apply && control?.unknown.length && !options.reportFile)
    throw new Error(
      "Unknown control cameras require --report-file before apply; no records will be discarded",
    );
  const report = {
    mode: options.apply ? "apply" : "dry-run",
    sourceCommit: manifest.commit,
    sourceFiles: manifest.sourceFiles,
    presets: manifest.presets.length,
    multiViews: manifest.multis.length,
    pngs: manifest.assets.length,
    referencedPngs: manifest.assets.filter((asset) => asset.kind !== "orphan")
      .length,
    orphanPngs: manifest.assets.filter((asset) => asset.kind === "orphan")
      .length,
    coverageHash: manifest.coverageHash,
    conflicts: manifest.conflicts,
    control: control
      ? {
          knownPresets: control.known.length,
          unknownCameras: control.unknown,
          exportSha256: sha256(JSON.stringify(controlData)),
          fullExport: controlData,
        }
      : null,
  };
  if (options.reportFile) {
    const text = `${JSON.stringify(report, null, 2)}\n`;
    try {
      if ((await readFile(options.reportFile, "utf8")) !== text)
        throw new Error(
          "Existing migration report differs; choose a new report file",
        );
    } catch (error) {
      if (
        !error ||
        typeof error !== "object" ||
        !("code" in error) ||
        error.code !== "ENOENT"
      )
        throw error;
      await writeFile(options.reportFile, text, { flag: "wx", mode: 0o600 });
    }
  }
  console.log(
    JSON.stringify(
      {
        ...report,
        control: control
          ? {
              knownPresets: control.known.length,
              unknownCameraCount: control.unknown.length,
              unknownPresetCount: control.unknown.reduce(
                (count, entry) => count + entry.presets.length,
                0,
              ),
            }
          : null,
      },
      null,
      2,
    ),
  );
  if (options.apply)
    console.log(
      JSON.stringify(
        await applyMigration(manifest, control, options.allowRemote),
        null,
        2,
      ),
    );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main().catch((error) => {
    // Only migration-authored errors may be surfaced; SDK failures can include
    // signed request URLs/headers. Detailed safe guard failures are useful.
    const message =
      error instanceof Error &&
      /^(Camera |Existing migration report|Existing legacy|Legacy object|Legacy upload|Conflicting control|Duplicate control|Unknown control|Fetching requires|Choose a cached|Apply requires|Remote resources|This migration|Missing value|Unknown migration)/.test(
        error.message,
      )
        ? error.message
        : "Check git/export input, immutable archive consistency and local configuration.";
    console.error(`Preset migration stopped: ${message}`);
    process.exitCode = 1;
  });
}

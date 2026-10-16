import { TRPCError } from "@trpc/server";

import { type CameraPresetOperation, Prisma, prisma } from "@alveusgg/database";

import { env } from "@/env";

import { issueAccessToken } from "@/server/oauth/tokens";
import {
  createFileStorageUpload,
  getViewUrlForFileStorageObjectKey,
  renewFileStorageUpload,
} from "@/server/utils/file-storage";
import { isPresetUserBanned } from "@/server/utils/twitch-bans";

import {
  type Transaction,
  dbCode,
  presetTransaction as transaction,
} from "./database";
import {
  isSubscriberLoad,
  lockSubscriberPolicy,
  subscriberCameraPaused,
} from "./policy";
import {
  type CaptureMetadata,
  type PresetCommand,
  captureMatchesOperation,
  captureSchema,
  commandSchema,
  payloadHash,
  positionSchema,
} from "./schema";
import { verifyCaptureUpload } from "./storage";

const json = (
  value: unknown,
): Prisma.InputJsonValue | typeof Prisma.JsonNull =>
  value === null
    ? Prisma.JsonNull
    : (JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue);
function conflict(message: string): never {
  throw new TRPCError({ code: "CONFLICT", message });
}

async function lockCamera(tx: Transaction, camera: string) {
  // The update takes a row lock even for readers that need a consistent revision fence.
  await tx.cameraPresetCamera.upsert({
    where: { camera },
    create: { camera },
    update: { version: { increment: 0 } },
  });
  return tx.cameraPresetCamera.findUniqueOrThrow({ where: { camera } });
}

export function operationDto(operation: CameraPresetOperation) {
  const command = commandSchema.parse(operation.command);
  return {
    id: operation.id,
    action: command.action,
    camera: operation.camera,
    name: command.name,
    newName: command.newName,
    actor: command.actor,
    status: operation.status as "pending" | "completed" | "failed",
    createdAt: operation.createdAt.toISOString(),
    expiresAt: operation.expiresAt.toISOString(),
    preset: operation.preset as {
      id: string;
      version: number;
      position: ReturnType<typeof positionSchema.parse>;
    } | null,
    position: operation.preset
      ? positionSchema.parse(
          (operation.preset as { position: unknown }).position,
        )
      : null,
    result: operation.result,
    error: operation.error,
  };
}

export async function getPresetOperation(id: string) {
  let operation = await prisma.cameraPresetOperation.findUnique({
    where: { id },
  });
  if (!operation)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Preset operation not found",
    });
  if (operation.status === "pending" && operation.action === "load") {
    const command = commandSchema.parse(operation.command);
    let banned: boolean;
    try {
      banned = await isPresetUserBanned(command.actor.id);
    } catch {
      // Leave the operation pending for a bounded worker retry. Never hand the
      // worker a dispatchable load while moderation verification is unavailable.
      throw new TRPCError({
        code: "SERVICE_UNAVAILABLE",
        message:
          "Preset access verification is temporarily unavailable. Try again shortly.",
      });
    }
    if (banned) {
      await prisma.cameraPresetOperation.updateMany({
        where: { id, status: "pending" },
        data: {
          status: "failed",
          error:
            "Preset load cancelled because the user is banned or timed out in Alveus Sanctuary chat.",
        },
      });
      operation = await prisma.cameraPresetOperation.findUniqueOrThrow({
        where: { id },
      });
    }
  }
  if (operation.status === "pending" && isSubscriberLoad(operation)) {
    const camera = operation.camera;
    operation = await transaction(async (tx) => {
      await lockSubscriberPolicy(tx, camera);
      const current = await tx.cameraPresetOperation.findUniqueOrThrow({
        where: { id },
      });
      if (
        current.status === "pending" &&
        isSubscriberLoad(current) &&
        (await subscriberCameraPaused(tx, camera))
      )
        return tx.cameraPresetOperation.update({
          where: { id },
          data: {
            status: "failed",
            error:
              "Subscriber camera control was paused while this load was pending.",
          },
        });
      return current;
    });
  }
  return operationDto(operation);
}

export async function findPresetOperationForUser(
  id: string,
  userId: string,
  operator = false,
) {
  const operation = await prisma.cameraPresetOperation.findUnique({
    where: { id },
  });
  if (!operation) return null;
  const dto = operationDto(operation);
  if (dto.actor.id !== userId && !operator)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This preset operation belongs to another user.",
    });
  return dto;
}

const COMMAND_COOLDOWN_MS = 1500;
async function consumeUserCooldown(
  tx: Transaction,
  userId: string,
  camera: string,
) {
  const now = new Date();
  const keys = [`user:${userId}`, `camera:${camera}`];
  await tx.cameraPresetCooldown.createMany({
    data: keys.map((key) => ({ key, nextAllowedAt: new Date(0) })),
    skipDuplicates: true,
  });
  const updated = await tx.cameraPresetCooldown.updateMany({
    where: { key: { in: keys }, nextAllowedAt: { lte: now } },
    data: { nextAllowedAt: new Date(now.getTime() + COMMAND_COOLDOWN_MS) },
  });
  if (updated.count !== keys.length)
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Please wait 1.5 seconds between preset commands.",
    });
}

function commandIdentity(value: unknown) {
  const command = commandSchema.parse(value);
  // The account's display name may change while an operation is being retried.
  return {
    id: command.id,
    action: command.action,
    camera: command.camera,
    name: command.name,
    newName: command.newName,
    actor: { id: command.actor.id },
  };
}
function assertSameCommand(
  operation: CameraPresetOperation,
  command: PresetCommand,
) {
  const existing = commandSchema.parse(operation.command);
  if (existing.actor.id !== command.actor.id)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This operation ID belongs to another user.",
    });
  if (
    payloadHash(commandIdentity(existing)) !==
    payloadHash(commandIdentity(command))
  )
    conflict("Operation ID was already used for a different command");
}

export async function pendingPresetOperations(after?: {
  createdAt: string;
  id: string;
}) {
  return (
    await prisma.cameraPresetOperation.findMany({
      where: {
        status: "pending",
        action: { in: ["save", "load"] },
        ...(after
          ? {
              OR: [
                { createdAt: { gt: new Date(after.createdAt) } },
                { createdAt: new Date(after.createdAt), id: { gt: after.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: 100,
    })
  ).map(operationDto);
}

async function dispatch(operationId: string) {
  if (!env.CAM_MANAGER_URL) return;
  try {
    const accessToken = await issueAccessToken({
      subject: "service:presets",
      clientId: "_self",
      roles: ["ptzControl"],
    });
    const response = await fetch(
      new URL("presets/jobs", env.CAM_MANAGER_URL.replace(/\/?$/, "/")),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ operationId }),
        signal: AbortSignal.timeout(5000),
        redirect: "error",
      },
    );
    if (!response.ok)
      console.error(
        "Preset job dispatch rejected",
        operationId,
        response.status,
      );
  } catch {
    console.error("Preset job dispatch deferred to recovery", operationId);
  }
}

export async function commandPreset(
  input: PresetCommand,
  options: { cooldownUserId?: string } = {},
) {
  const command = commandSchema.parse(input);
  const hash = payloadHash(commandIdentity(command));
  let operation: CameraPresetOperation;
  try {
    operation = await transaction(async (tx) => {
      const camera = await lockCamera(tx, command.camera);
      const existing = await tx.cameraPresetOperation.findUnique({
        where: { id: command.id },
      });
      if (existing) {
        assertSameCommand(existing, command);
        return existing;
      }
      const preset = command.name
        ? await tx.cameraPreset.findUnique({
            where: {
              camera_name: { camera: command.camera, name: command.name },
            },
          })
        : null;
      if (
        ["load", "rename", "remove"].includes(command.action) &&
        (!preset || preset.deletedAt)
      )
        throw new TRPCError({ code: "NOT_FOUND", message: "Preset not found" });
      if (command.action === "load" && preset?.provenance === "legacy")
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Legacy preset has not been reconciled with the camera source",
        });
      if (command.action === "rename") {
        const target = await tx.cameraPreset.findUnique({
          where: {
            camera_name: { camera: command.camera, name: command.newName! },
          },
        });
        // Retaining tombstones prevents an old name-based operation from targeting a new identity.
        if (target && target.id !== preset!.id)
          conflict("That preset name already exists (including its history)");
      }
      if (command.authorization === "subscriber") {
        if (command.action !== "load")
          throw new TRPCError({ code: "FORBIDDEN" });
        await lockSubscriberPolicy(tx, command.camera);
        if (await subscriberCameraPaused(tx, command.camera))
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Subscriber control is paused for this camera.",
          });
      }
      if (options.cooldownUserId) {
        if (options.cooldownUserId !== command.actor.id)
          throw new TRPCError({ code: "FORBIDDEN" });
        await consumeUserCooldown(tx, options.cooldownUserId, command.camera);
      }
      // The camera generation is only a clear/import epoch; names have independent
      // generations so a delayed save does not suppress a different named preset.
      const version =
        command.action === "clear"
          ? (
              await tx.cameraPresetCamera.update({
                where: { camera: command.camera },
                data: { version: { increment: 1 } },
              })
            ).version
          : camera.version;
      const advanceName = (name: string) =>
        tx.cameraPresetName.upsert({
          where: { camera_name: { camera: command.camera, name } },
          create: { camera: command.camera, name, version: 1 },
          update: { version: { increment: 1 } },
        });
      let nameVersion: number | null = null;
      if (command.action !== "load" && command.name)
        nameVersion = (await advanceName(command.name)).version;
      if (command.action === "rename" && command.newName !== command.name)
        await advanceName(command.newName!);
      let result: unknown = undefined;
      if (command.action === "rename") {
        const updated = await tx.cameraPreset.update({
          where: { id: preset!.id },
          data: { name: command.newName!, version: { increment: 1 } },
        });
        result = {
          presetId: updated.id,
          name: updated.name,
          version: updated.version,
        };
      } else if (command.action === "remove") {
        await tx.cameraPreset.update({
          where: { id: preset!.id },
          data: { deletedAt: new Date(), version: { increment: 1 } },
        });
        result = { presetId: preset!.id };
      } else if (command.action === "clear") {
        const removed = await tx.cameraPreset.updateMany({
          where: { camera: command.camera, deletedAt: null },
          data: { deletedAt: new Date(), version: { increment: 1 } },
        });
        result = { removed: removed.count };
      }
      const now = new Date();
      return tx.cameraPresetOperation.create({
        data: {
          id: command.id,
          commandHash: hash,
          command: json(command),
          camera: command.camera,
          action: command.action,
          status: ["save", "load"].includes(command.action)
            ? "pending"
            : "completed",
          expectedCameraVersion: version,
          expectedNameVersion: nameVersion,
          ...(command.action === "load"
            ? {
                preset: json({
                  id: preset!.id,
                  version: preset!.version,
                  position: positionSchema.parse(preset!.position),
                }),
              }
            : {}),
          ...(result !== undefined ? { result: json(result) } : {}),
          createdAt: now,
          expiresAt: new Date(now.getTime() + 15_000),
        },
      });
    });
  } catch (error) {
    // A concurrent request can commit the same UUID between our transaction's read and insert.
    if (dbCode(error) !== "P2002") throw error;
    const existing = await prisma.cameraPresetOperation.findUnique({
      where: { id: command.id },
    });
    if (!existing)
      conflict("Operation ID or preset name conflicts with an existing record");
    assertSameCommand(existing, command);
    operation = existing;
  }
  if (operation.status === "pending") await dispatch(operation.id);
  return operationDto(operation);
}

export async function preparePresetCapture(
  operationId: string,
  input: CaptureMetadata,
) {
  const capture = captureSchema.parse(input);
  const operation = await prisma.cameraPresetOperation.findUniqueOrThrow({
    where: { id: operationId },
  });
  if (!captureMatchesOperation(capture, operation))
    conflict(
      "Capture does not belong to this save operation or its capture window",
    );
  const metadataHash = payloadHash(capture);
  const existing = await prisma.presetCapture.findUnique({
    where: { operationId },
    include: { fileStorageObject: true },
  });
  if (existing && existing.metadataHash !== metadataHash)
    conflict("Capture metadata is immutable");
  if (existing?.deliveredAt) return { delivered: true as const };
  // A new object replaces an expired upload session; expired keys are never revived while cleanup may be deleting them.
  const usable =
    existing &&
    !existing.fileStorageObject.deletedAt &&
    existing.fileStorageObject.expiresAt &&
    existing.fileStorageObject.expiresAt.getTime() > Date.now() + 60_000;
  const allocated = usable
    ? null
    : await createFileStorageUpload({
        fileName: `${capture.id}.${capture.contentType === "image/png" ? "png" : "jpg"}`,
        fileType: capture.contentType,
        prefix: "presets/captures/",
        expires: 3600,
      });
  const prepared = await transaction(async (tx) => {
    await lockCamera(tx, operation.camera);
    const current = await tx.presetCapture.findUnique({
      where: { operationId },
      include: { fileStorageObject: true },
    });
    if (current && current.metadataHash !== metadataHash)
      conflict("Capture metadata is immutable");
    if (current?.deliveredAt) return current;
    if (
      current &&
      !current.fileStorageObject.deletedAt &&
      current.fileStorageObject.expiresAt &&
      current.fileStorageObject.expiresAt.getTime() > Date.now() + 60_000
    )
      return current;
    if (!allocated) conflict("Upload session changed; retry prepareCapture");
    return tx.presetCapture.upsert({
      where: { operationId },
      create: {
        id: capture.id,
        operationId,
        metadata: json(capture),
        metadataHash,
        fileStorageObjectId: allocated.fileStorageObject.id,
      },
      update: { fileStorageObjectId: allocated.fileStorageObject.id },
      include: { fileStorageObject: true },
    });
  });
  if (prepared.deliveredAt) return { delivered: true as const };
  const seconds = Math.max(
    1,
    Math.floor(
      (prepared.fileStorageObject.expiresAt!.getTime() - Date.now()) / 1000,
    ),
  );
  return {
    delivered: false as const,
    uploadUrl: await renewFileStorageUpload(
      prepared.fileStorageObject.key,
      capture.contentType,
      seconds,
    ),
    headers: {
      "Content-Type": capture.contentType,
      "x-amz-acl": "public-read",
    },
  };
}

export async function commitPresetCapture(
  operationId: string,
  captureId: string,
) {
  const capture = await prisma.presetCapture.findUnique({
    where: { operationId },
    include: { fileStorageObject: true },
  });
  if (!capture || capture.id !== captureId)
    conflict("Capture was not prepared for this operation");
  if (capture.deliveredAt)
    return {
      delivered: true as const,
      ...(await getPresetOperation(operationId)),
    };
  const metadata = captureSchema.parse(capture.metadata);
  const image = await verifyCaptureUpload(
    capture.fileStorageObject.key,
    metadata,
  );
  const completed = await transaction(async (tx) => {
    await lockCamera(tx, metadata.camera);
    const current = await tx.presetCapture.findUniqueOrThrow({
      where: { operationId },
      include: { fileStorageObject: true },
    });
    const operation = await tx.cameraPresetOperation.findUniqueOrThrow({
      where: { id: operationId },
    });
    if (current.deliveredAt) return operation;
    if (current.fileStorageObjectId !== capture.fileStorageObjectId)
      conflict("Upload session changed; upload to the current session");
    if (
      current.fileStorageObject.deletedAt ||
      !current.fileStorageObject.expiresAt ||
      current.fileStorageObject.expiresAt.getTime() <= Date.now() + 1000
    )
      conflict("Upload expired; prepare a new upload session");
    await tx.fileStorageObject.update({
      where: { id: current.fileStorageObjectId },
      data: { uploadedAt: new Date(), expiresAt: null },
    });
    await tx.imageMetadata.upsert({
      where: { fileStorageObjectId: current.fileStorageObjectId },
      create: { fileStorageObjectId: current.fileStorageObjectId, ...image },
      update: image,
    });
    await tx.presetCapture.update({
      where: { id: captureId },
      data: { deliveredAt: new Date() },
    });
    if (operation.status !== "pending") return operation;
    const camera = await tx.cameraPresetCamera.findUniqueOrThrow({
      where: { camera: metadata.camera },
    });
    const command = commandSchema.parse(operation.command);
    const name = await tx.cameraPresetName.findUnique({
      where: { camera_name: { camera: metadata.camera, name: command.name! } },
    });
    if (
      camera.version !== operation.expectedCameraVersion ||
      name?.version !== operation.expectedNameVersion
    )
      return tx.cameraPresetOperation.update({
        where: { id: operationId },
        data: {
          status: "failed",
          error:
            "A newer preset command superseded this save; capture retained",
        },
      });
    const preset = await tx.cameraPreset.upsert({
      where: { camera_name: { camera: metadata.camera, name: command.name! } },
      create: {
        camera: metadata.camera,
        name: command.name!,
        description: command.name!,
        position: json(metadata.position),
        fileStorageObjectId: current.fileStorageObjectId,
        provenance: "capture",
        imageProvenance: "capture",
        capturedAt: new Date(metadata.capturedAt),
      },
      update: {
        position: json(metadata.position),
        fileStorageObjectId: current.fileStorageObjectId,
        provenance: "capture",
        imageProvenance: "capture",
        capturedAt: new Date(metadata.capturedAt),
        deletedAt: null,
        version: { increment: 1 },
      },
    });
    return tx.cameraPresetOperation.update({
      where: { id: operationId },
      data: {
        status: "completed",
        result: json({
          presetId: preset.id,
          version: preset.version,
          captureId,
        }),
      },
    });
  });
  return { delivered: true as const, ...operationDto(completed) };
}

export async function completePresetOperation(input: {
  id: string;
  status: "completed" | "failed";
  error?: string;
  result?: unknown;
}) {
  return transaction(async (tx) => {
    const existing = await tx.cameraPresetOperation.findUniqueOrThrow({
      where: { id: input.id },
    });
    await lockCamera(tx, existing.camera);
    const operation = await tx.cameraPresetOperation.findUniqueOrThrow({
      where: { id: input.id },
    });
    if (operation.status !== "pending") return operationDto(operation);
    if (operation.action !== "load" && input.status === "completed")
      conflict("Only commitCapture can complete a save");
    const update = await tx.cameraPresetOperation.update({
      where: { id: input.id },
      data: {
        status: input.status,
        error: input.error ?? null,
        ...(input.result !== undefined ? { result: json(input.result) } : {}),
      },
    });
    return operationDto(update);
  });
}

export async function presetCatalog(camera?: string) {
  const rows = await prisma.cameraPreset.findMany({
    where: { deletedAt: null, ...(camera ? { camera } : {}) },
    include: { fileStorageObject: { include: { imageMetadata: true } } },
    orderBy: [{ camera: "asc" }, { name: "asc" }],
  });
  return rows.map(({ fileStorageObject, ...preset }) => ({
    id: preset.id,
    camera: preset.camera,
    name: preset.name,
    description: preset.description,
    position: positionSchema.parse(preset.position),
    version: preset.version,
    provenance: preset.provenance,
    imageProvenance: preset.imageProvenance,
    capturedAt: preset.capturedAt?.toISOString() ?? null,
    updatedAt: preset.updatedAt.toISOString(),
    image:
      fileStorageObject?.uploadedAt &&
      !fileStorageObject.deletedAt &&
      fileStorageObject.imageMetadata
        ? {
            src: String(
              getViewUrlForFileStorageObjectKey(fileStorageObject.key),
            ),
            width: fileStorageObject.imageMetadata.width,
            height: fileStorageObject.imageMetadata.height,
          }
        : null,
  }));
}

export async function presetLayout(camera: string) {
  const layout = await prisma.cameraPresetLegacyAsset.findFirst({
    where: { camera, kind: "multi" },
    include: { fileStorageObject: { include: { imageMetadata: true } } },
  });
  if (!layout) return null;
  const meta = layout.metadata as {
    description?: string;
    ordered_cameras?: string[];
    cameras?: string[];
  };
  const file = layout.fileStorageObject;
  return {
    description: meta.description ?? camera,
    cameras: meta.ordered_cameras ?? meta.cameras ?? [],
    image:
      file.uploadedAt && !file.deletedAt && file.imageMetadata
        ? {
            src: String(getViewUrlForFileStorageObjectKey(file.key)),
            width: file.imageMetadata.width,
            height: file.imageMetadata.height,
          }
        : null,
  };
}

import { TRPCError } from "@trpc/server";

import { type CameraPresetPolicy, Prisma, prisma } from "@alveusgg/database";

import { type Transaction, presetTransaction } from "./database";
import { commandSchema } from "./schema";

export const MAX_SUBSCRIBER_PAUSE_MS = 7 * 24 * 60 * 60 * 1000;
export function effectiveSubscriberPolicy(
  rows: Pick<CameraPresetPolicy, "scope" | "paused" | "resumeAt">[],
  now = Date.now(),
) {
  const active = (row: Pick<CameraPresetPolicy, "paused" | "resumeAt">) =>
    row.paused && (!row.resumeAt || row.resumeAt.getTime() > now);
  const global = rows.find(({ scope }) => scope === "global");
  return {
    subscriberControlsPaused: global ? active(global) : true,
    pausedCameras: rows
      .filter((row) => row.scope.startsWith("camera:") && active(row))
      .map(({ scope }) => scope.slice("camera:".length))
      .sort(),
  };
}
export async function subscriberPolicy() {
  return effectiveSubscriberPolicy(await prisma.cameraPresetPolicy.findMany());
}
export async function lockSubscriberPolicy(tx: Transaction, camera?: string) {
  const scopes = camera ? ["global", `camera:${camera}`] : ["global"];
  await tx.cameraPresetPolicy.createMany({
    data: scopes.map((scope) => ({
      scope,
      paused: scope === "global",
      updatedBy: "system",
    })),
    skipDuplicates: true,
  });
  // Read locks and policy writes use the same rows, including their fail-closed defaults.
  await tx.$queryRaw(
    Prisma.sql`SELECT scope FROM CameraPresetPolicy WHERE scope IN (${Prisma.join(scopes)}) ORDER BY scope FOR UPDATE`,
  );
}
export async function subscriberCameraPaused(tx: Transaction, camera: string) {
  const policy = effectiveSubscriberPolicy(
    await tx.cameraPresetPolicy.findMany({
      where: { scope: { in: ["global", `camera:${camera}`] } },
    }),
  );
  return (
    policy.subscriberControlsPaused || policy.pausedCameras.includes(camera)
  );
}
export function isSubscriberLoad(operation: {
  action: string;
  command: unknown;
}) {
  if (operation.action !== "load") return false;
  const command = commandSchema.safeParse(operation.command);
  return command.success && command.data.authorization === "subscriber";
}
export async function setSubscriberPolicy(
  input: { camera?: string; paused: boolean; resumeAt?: string | null },
  userId: string,
) {
  const resumeAt = input.resumeAt ? new Date(input.resumeAt) : null;
  if (
    resumeAt &&
    (!input.paused ||
      !Number.isFinite(resumeAt.getTime()) ||
      resumeAt.getTime() <= Date.now() ||
      resumeAt.getTime() > Date.now() + MAX_SUBSCRIBER_PAUSE_MS)
  )
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "A timed pause must end in the future within seven days.",
    });
  const scope = input.camera ? `camera:${input.camera}` : "global";
  return presetTransaction(async (tx) => {
    await lockSubscriberPolicy(tx, input.camera);
    const policy = await tx.cameraPresetPolicy.update({
      where: { scope },
      data: { paused: input.paused, resumeAt, updatedBy: userId },
    });
    if (input.paused) {
      const pending = await tx.cameraPresetOperation.findMany({
        where: {
          action: "load",
          status: "pending",
          ...(input.camera ? { camera: input.camera } : {}),
        },
      });
      const ids = pending.filter(isSubscriberLoad).map(({ id }) => id);
      if (ids.length)
        await tx.cameraPresetOperation.updateMany({
          where: { id: { in: ids }, status: "pending" },
          data: {
            status: "failed",
            error:
              "Subscriber camera control was paused while this load was pending.",
          },
        });
    }
    return {
      scope,
      paused: policy.paused,
      resumeAt: policy.resumeAt?.toISOString() ?? null,
      ...effectiveSubscriberPolicy(await tx.cameraPresetPolicy.findMany()),
    };
  });
}

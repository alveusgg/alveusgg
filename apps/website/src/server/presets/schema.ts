import { createHash } from "node:crypto";

import { z } from "zod";

export const cameraSchema = z.string().regex(/^[a-z0-9_-]{1,100}$/);
export const presetNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^\P{Cc}+$/u);
export const positionSchema = z.object({
  pan: z.number().finite().min(-180).max(180),
  tilt: z.number().finite().min(-180).max(180),
  zoom: z.number().int().min(1).max(19999),
  focus: z.number().int().min(1).max(19999).optional(),
  brightness: z.number().int().min(1).max(9999).optional(),
  autofocus: z.enum(["on", "off"]).optional(),
  autoiris: z.enum(["on", "off"]).optional(),
});
// Historical catalogs contain zero-zoom positions that must never be sent to a camera.
export const catalogPositionSchema = positionSchema.extend({
  zoom: z.number().int().min(0).max(19999),
});
const commandFields = {
  id: z.uuid(),
  action: z.enum(["save", "load", "rename", "remove", "clear"]),
  camera: cameraSchema,
  name: presetNameSchema.optional(),
  newName: presetNameSchema.optional(),
};
function validateCommand(
  input: { action: string; name?: string; newName?: string },
  ctx: z.RefinementCtx,
) {
  if (input.action !== "clear" && !input.name)
    ctx.addIssue({
      code: "custom",
      message: "Preset name required",
      path: ["name"],
    });
  if (input.action === "rename" && !input.newName)
    ctx.addIssue({
      code: "custom",
      message: "New name required",
      path: ["newName"],
    });
  if (input.action !== "rename" && input.newName !== undefined)
    ctx.addIssue({
      code: "custom",
      message: "newName only applies to rename",
      path: ["newName"],
    });
  if (input.action === "clear" && input.name !== undefined)
    ctx.addIssue({
      code: "custom",
      message: "clear applies to the whole camera",
      path: ["name"],
    });
}
export const commandSchema = z
  .object({
    ...commandFields,
    authorization: z.enum(["subscriber", "operator"]).optional(),
    actor: z.object({
      id: z.string().min(1).max(100),
      name: z.string().max(100).optional(),
    }),
  })
  .superRefine(validateCommand);
export const userCommandSchema = z
  .strictObject(commandFields)
  .superRefine(validateCommand);
export type PresetCommand = z.infer<typeof commandSchema>;
export const MAX_CAPTURE_BYTES = 10 * 1024 * 1024;
export const captureSchema = z.object({
  id: z.uuid(),
  camera: cameraSchema,
  position: positionSchema,
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  size: z.number().int().positive().max(MAX_CAPTURE_BYTES),
  contentType: z.enum(["image/jpeg", "image/png"]),
  capturedAt: z.iso.datetime(),
});
export type CaptureMetadata = z.infer<typeof captureSchema>;

// Sort object keys so repeated JSON requests do not depend on property order.
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}
export const payloadHash = (value: unknown) =>
  createHash("sha256").update(canonicalJson(value)).digest("hex");

export function captureMatchesOperation(
  capture: CaptureMetadata,
  operation: {
    id: string;
    camera: string;
    action: string;
    createdAt: Date;
    expiresAt: Date;
  },
) {
  const capturedAt = Date.parse(capture.capturedAt);
  return (
    operation.action === "save" &&
    capture.id === operation.id &&
    capture.camera === operation.camera &&
    capturedAt >= operation.createdAt.getTime() &&
    capturedAt <= operation.expiresAt.getTime()
  );
}

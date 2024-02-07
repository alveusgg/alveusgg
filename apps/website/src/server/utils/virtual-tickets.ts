import { z } from "zod";

const stickerSchema = z.object({
  imageId: z.string(),
  x: z.number(),
  y: z.number(),
});

export type VirtualTicketCustomization = z.infer<
  typeof virtualTicketCustomizationSchema
>;

export const virtualTicketCustomizationSchema = z.object({
  stickers: z.array(stickerSchema),
});

export const virtualTicketSchema = z.object({
  userId: z.string().uuid(),
  eventId: z.string(),
  customization: virtualTicketCustomizationSchema,
});

export function deserializeVirtualTicketCustomization(
  customizationData: string,
): VirtualTicketCustomization {
  const customization = virtualTicketCustomizationSchema.safeParse(
    JSON.parse(customizationData),
  );

  return customization.success ? customization.data : { stickers: [] };
}

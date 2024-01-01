import { prisma } from "@/server/db/client";
import type { EmailTo } from "@/server/utils/email";

export interface EmailContext {
  type: "admin";
  provider: "resend";
}

export type CreateOutgoingEmail = {
  type: EmailContext["type"];
  provider: EmailContext["provider"];
  to: EmailTo;
  data: string;
};

export type OutgoingEmailUpdate =
  | { sentAt: Date }
  | { failedAt: Date }
  | { bouncedAt: Date }
  | { complainedAt: Date }
  | { deliveredAt: Date }
  | { delayedAt: Date };

export function createOutgoingEmail(data: CreateOutgoingEmail) {
  return prisma.outgoingEmail.create({ data });
}

export function getOutgoingEmail(id: string) {
  return prisma.outgoingEmail.findUnique({ where: { id } });
}

export function getOutgoingEmailByProviderId(
  provider: EmailContext["provider"],
  providerId: string,
) {
  return prisma.outgoingEmail.findFirst({ where: { provider, providerId } });
}

export function updateOutgoingEmailHandedOver(id: string, providerId: string) {
  return prisma.outgoingEmail.update({
    where: { id },
    data: { providerId },
  });
}

export function updateOutgoingEmail(id: string, update: OutgoingEmailUpdate) {
  return prisma.outgoingEmail.update({ where: { id }, data: update });
}

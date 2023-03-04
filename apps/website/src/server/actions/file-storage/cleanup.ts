import { prisma } from "@/server/db/client";
import { deleteFileStorageObject } from "@/server/utils/file-storage";

export async function cleanupFileStorage({
  maxItems = 100,
}: {
  maxItems: number;
}) {
  const now = new Date();

  const expiredFileStorageObjects = await prisma.fileStorageObject.findMany({
    select: { id: true },
    where: {
      expiresAt: { lt: now },
      deletedAt: null,
    },
    take: maxItems,
  });

  await Promise.allSettled(
    expiredFileStorageObjects.map(({ id }) => deleteFileStorageObject(id))
  );
}

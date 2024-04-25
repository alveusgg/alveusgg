import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db/client";

export type ClipSchema = z.infer<typeof clipSchema>;

export const clipSchema = z.object({
  slug: z.string(),
  title: z.string(),
  thumbnailUrl: z.string(),
  createdAt: z.date(),
  creator: z.string(),
});

export const clipVoteSchema = z.object({
  id: z.string().cuid(),
  clip: clipSchema,
  createdAt: z.date(),
});

export type ClipSubmitInput = z.infer<typeof clipSubmitInputSchema>;
export const clipSubmitInputSchema = z.object({
  url: z.string(),
  title: z.string() || undefined,
});

export async function getClipVotes(clipId: string) {
  const res = await prisma.clipVote.findMany({
    where: {
      clipId,
    },
  });

  return res;
}

export async function addClip(input: ClipSchema, userId?: string) {
  const existingClip = await prisma.clip.findFirst({
    where: {
      slug: input.slug,
    },
  });

  if (existingClip) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Clip already submitted",
    });
  }

  return await prisma.clip.create({
    data: {
      slug: input.slug,
      title: input.title,
      thumbnailUrl: input.thumbnailUrl,
      createdAt: input.createdAt,
      creator: input.creator,
      user: userId ? { connect: { id: userId } } : undefined,
    },
  });
}

export async function addVote(clipId: string, userId: string) {
  const hasVoted = await prisma.clipVote.findFirst({
    where: {
      clipId,
      userId,
    },
  });

  if (hasVoted) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Already voted",
    });
  }

  await prisma.clipVote.create({
    data: {
      clip: { connect: { id: clipId } },
      user: { connect: { id: userId } },
    },
  });
}

export async function removeVote(clipId: string, userId: string) {
  await prisma.clipVote.deleteMany({
    where: {
      clipId,
      userId,
    },
  });
}

export type SortType = "top" | "new" | "top_7day" | "top_30day";
export type CreatedPeriod = "7day" | "30day";

const getWhereClause = (sortBy: SortType) => {
  const today = new Date();

  switch (sortBy) {
    case "top_7day":
      return { gte: new Date(today.setDate(today.getDate() - 7)) };
    case "top_30day":
      return { gte: new Date(today.setDate(today.getDate() - 30)) };
    default:
      return undefined;
  }
};

const sorts: Record<SortType, object> = {
  top: {
    votes: {
      _count: "desc",
    },
  },
  new: {
    createdAt: "desc",
  },
  top_7day: {
    votes: {
      _count: "desc",
    },
  },
  top_30day: {
    votes: {
      _count: "desc",
    },
  },
};

export async function getClips({
  limit,
  cursor,
  sortBy,
  userId,
  filter = "approved",
}: {
  limit: number;
  cursor?: string;
  sortBy: SortType;
  userId: string | undefined;
  filter?: "approved" | "unapproved";
}) {
  const clips = await prisma.clip.findMany({
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: sorts[sortBy],
    where: {
      approved: filter === "approved",
      createdAt: getWhereClause(sortBy),
    },
    include: {
      _count: {
        select: {
          votes: true,
        },
      },
      ...(userId && {
        votes: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
      }),
    },
  });

  return clips.map(({ _count, votes, ...clip }) => {
    return {
      ...clip,
      voteCount: _count.votes,
      hasVoted: votes && votes.length > 0,
    };
  });
}

export async function approveClip(clipId: string) {
  return prisma.clip.update({
    where: {
      id: clipId,
    },
    data: {
      approved: true,
    },
  });
}

export async function unapproveClip(clipId: string) {
  return prisma.clip.update({
    where: {
      id: clipId,
    },
    data: {
      approved: false,
    },
  });
}

export async function deleteClip(clipId: string) {
  return prisma.clip.delete({
    where: {
      id: clipId,
    },
  });
}

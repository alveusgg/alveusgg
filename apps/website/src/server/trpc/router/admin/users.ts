import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { Prisma } from "@alveusgg/database";

import { router, superUserProcedure } from "@/server/trpc/trpc";
import { checkIsSuperUserId, getSuperUserIds } from "@/server/utils/auth";

import { isValidUserRole } from "@/data/user-roles";

const connectedAccounts = {
  select: {
    id: true,
    provider: true,
    providerAccountId: true,
    username: true,
    displayName: true,
  },
  orderBy: [{ provider: "asc" }, { id: "asc" }],
} satisfies Prisma.AccountFindManyArgs;

export const adminUsersRouter = router({
  searchUsernames: superUserProcedure
    .input(z.string().trim().min(2).max(100))
    .query(({ ctx, input }) =>
      ctx.prisma.user.findMany({
        where: {
          OR: [
            { id: input },
            { name: { contains: input } },
            {
              accounts: {
                some: {
                  OR: [
                    { username: { contains: input.replace(/^@/, "") } },
                    { displayName: { contains: input } },
                    { providerAccountId: input },
                  ],
                },
              },
            },
          ],
        },
        take: 10,
        orderBy: [{ name: "asc" }, { id: "asc" }],
        select: {
          id: true,
          name: true,
          accounts: connectedAccounts,
        },
      }),
    ),

  assignRole: superUserProcedure
    .input(
      z.object({
        userId: z.cuid(),
        role: z
          .string()
          .refine((role) => isValidUserRole(role), "Invalid role"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      try {
        await ctx.prisma.user.update({
          where: { id: user.id },
          data: {
            roles: {
              create: {
                role: input.role,
              },
            },
          },
        });
      } catch (_) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Role could not be assigned",
        });
      }
    }),

  removeRole: superUserProcedure
    .input(
      z.object({
        userId: z.cuid(),
        role: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      ctx.prisma.userRole.deleteMany({
        where: {
          user: { id: input.userId },
          role: input.role,
        },
      }),
    ),

  getUserWithRoles: superUserProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      where: {
        OR: [
          { id: { in: getSuperUserIds() } },
          { NOT: [{ roles: { none: {} } }] },
        ],
      },
      include: {
        roles: true,
        accounts: connectedAccounts,
      },
    });

    return users.map((user) => ({
      ...user,
      isSuperUser: checkIsSuperUserId(user.id),
    }));
  }),

  getSuperUsers: superUserProcedure.query(({ ctx }) =>
    ctx.prisma.user.findMany({
      where: {
        id: { in: getSuperUserIds() },
      },
      include: {
        roles: true,
      },
    }),
  ),
});

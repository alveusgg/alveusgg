import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, superUserProcedure } from "@/server/trpc/trpc";
import { checkIsSuperUserId, getSuperUserIds } from "@/server/utils/auth";
import { isValidUserRole } from "@/config/user-roles";

export const adminUsersRouter = router({
  searchUsernames: superUserProcedure
    .input(z.string().min(2).max(100))
    .query(({ ctx, input }) =>
      ctx.prisma.user.findMany({
        where: {
          name: { contains: input },
        },
        take: 10,
        include: {
          accounts: true,
          roles: true,
        },
      }),
    ),

  assignRole: superUserProcedure
    .input(
      z.object({
        userName: z.string(),
        role: z
          .string()
          .refine((role) => isValidUserRole(role), "Invalid role"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          name: input.userName,
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
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Role could not be assigned",
        });
      }
    }),

  removeRole: superUserProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
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
        accounts: true,
        roles: true,
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
        accounts: true,
        roles: true,
      },
    }),
  ),
});

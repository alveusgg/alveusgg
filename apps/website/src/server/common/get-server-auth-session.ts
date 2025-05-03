import { type GetServerSidePropsContext } from "next";
import { unstable_getServerSession } from "next-auth";

import { env } from "@/env";

import { DEV_ADMIN_SESSION } from "@/utils/dev-admin-session";

import { authOptions } from "../../pages/api/auth/[...nextauth]";

/**
 * Wrapper for unstable_getServerSession https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return env.NODE_ENV === "development" && env.DISABLE_ADMIN_AUTH
    ? DEV_ADMIN_SESSION
    : await unstable_getServerSession(ctx.req, ctx.res, authOptions);
};

import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";

import { prisma } from "@alveusgg/database";

import { getServerAuthSession } from "../common/get-server-auth-session";

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Looked up on first use, and once for all procedures in a batch. Loading a
  // session takes several database queries, which procedures that don't need
  // it shouldn't wait for.
  let session: Promise<Session | null> | undefined;
  const getSession = () => (session ??= getServerAuthSession({ req, res }));

  return {
    getSession,
    prisma,
    req,
    res,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

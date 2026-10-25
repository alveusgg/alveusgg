import type { NextApiRequest, NextApiResponse } from "next";
import { decode, encode } from "next-auth/jwt";
import { z } from "zod";

import { env } from "@/env";

const secure = env.NEXT_PUBLIC_BASE_URL.startsWith("https://");
const prefix = secure ? "__Host-" : "";
export const RECENT_AUTH_COOKIE = `${prefix}alveus.recent-auth`;
export const ACCOUNT_LINK_COOKIE = `${prefix}alveus.account-link`;
export const WEBSITE_SESSION_COOKIE = "__Secure-next-auth.session-token";
export const RECENT_AUTH_MAX_AGE = 15 * 60;
export const ACCOUNT_LINK_MAX_AGE = 10 * 60;

const actionSchema = z.object({
  purpose: z.literal(["recent-auth", "account-link"]),
  userId: z.string(),
  provider: z.string().optional(),
  exp: z.number(),
});

/** NextAuth encrypts and authenticates these cookies with the website secret. */
export async function createAuthAction(
  purpose: "recent-auth" | "account-link",
  userId: string,
  provider?: string,
) {
  if (!env.NEXTAUTH_SECRET)
    throw new Error("NEXTAUTH_SECRET is required for account management");
  return encode({
    secret: env.NEXTAUTH_SECRET,
    maxAge:
      purpose === "recent-auth" ? RECENT_AUTH_MAX_AGE : ACCOUNT_LINK_MAX_AGE,
    token: { purpose, userId, ...(provider && { provider }) },
  });
}

export async function verifyAuthAction(
  cookie: string | undefined,
  purpose: "recent-auth" | "account-link",
  userId: string,
  provider?: string,
) {
  if (!cookie || !env.NEXTAUTH_SECRET) return false;
  try {
    const action = actionSchema.parse(
      await decode({ token: cookie, secret: env.NEXTAUTH_SECRET }),
    );
    return (
      action.exp > Date.now() / 1000 &&
      action.purpose === purpose &&
      action.userId === userId &&
      action.provider === provider
    );
  } catch {
    return false;
  }
}

export function setAuthActionCookie(
  res: NextApiResponse,
  name: string,
  value: string,
  maxAge: number,
) {
  const previous = res.getHeader("Set-Cookie");
  const cookies = previous
    ? Array.isArray(previous)
      ? previous.map(String)
      : [String(previous)]
    : [];
  res.setHeader("Set-Cookie", [
    ...cookies,
    `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`,
  ]);
}

// The website session permits embedding. Account-management mutations must also
// originate on this site, even when a browser sends that session cross-site.
export function isSameOrigin(req: Pick<NextApiRequest, "headers">) {
  return req.headers.origin === new URL(env.NEXT_PUBLIC_BASE_URL).origin;
}

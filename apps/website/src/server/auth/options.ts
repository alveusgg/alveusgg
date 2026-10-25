import type { NextApiRequest, NextApiResponse } from "next";
import type { NextAuthOptions } from "next-auth";

import { env } from "@/env";

import {
  ACCOUNT_LINK_COOKIE,
  LAST_LOGIN_PROVIDER_COOKIE,
  LAST_LOGIN_PROVIDER_MAX_AGE,
  RECENT_AUTH_COOKIE,
  RECENT_AUTH_MAX_AGE,
  WEBSITE_SESSION_COOKIE,
  createAuthAction,
  setAuthActionCookie,
  verifyAuthAction,
} from "@/server/auth/actions";

import { ACCOUNT_SETTINGS_PATH, isLoginProvider } from "@/data/auth";

/** Add request-specific linking policy without changing server-side session reads. */
export function withAccountManagement(
  options: NextAuthOptions,
  req: NextApiRequest,
  res: NextApiResponse,
): NextAuthOptions {
  return {
    ...options,
    callbacks: {
      ...options.callbacks,
      async signIn(params) {
        const { account } = params;
        if (!account) return false;
        const adapter = options.adapter;
        const token = req.cookies[WEBSITE_SESSION_COOKIE];
        const current = token
          ? await adapter?.getSessionAndUser?.(token)
          : null;
        const signedInUser =
          current && current.session.expires > new Date() ? current.user : null;
        const owner = await adapter?.getUserByAccount?.({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        });
        const intent = req.cookies[ACCOUNT_LINK_COOKIE];
        if (intent) setAuthActionCookie(res, ACCOUNT_LINK_COOKIE, "", 0);
        if (signedInUser) {
          if (owner && owner.id !== signedInUser.id)
            return `${ACCOUNT_SETTINGS_PATH}?error=already-linked`;
          if (
            !owner &&
            (!(await verifyAuthAction(
              intent,
              "account-link",
              signedInUser.id,
              account.provider,
            )) ||
              !(await verifyAuthAction(
                req.cookies[RECENT_AUTH_COOKIE],
                "recent-auth",
                signedInUser.id,
              )))
          ) {
            return `${ACCOUNT_SETTINGS_PATH}?error=link-required`;
          }
        } else if (intent) {
          // The session that started a link expired or changed. Do not turn the
          // callback into a new signup or attach it to a different user.
          return "/auth/signin?error=SessionRequired";
        }
        return options.callbacks?.signIn
          ? options.callbacks.signIn(params)
          : true;
      },
    },
    events: {
      ...options.events,
      async signIn(params) {
        await options.events?.signIn?.(params);
        // This is a browser preference, never proof of identity. Record it only
        // after NextAuth has completed sign-in, and keep it across sign-out.
        if (params.account && isLoginProvider(params.account.provider)) {
          setAuthActionCookie(
            res,
            LAST_LOGIN_PROVIDER_COOKIE,
            params.account.provider,
            LAST_LOGIN_PROVIDER_MAX_AGE,
          );
        }
        if (env.NEXTAUTH_SECRET) {
          setAuthActionCookie(
            res,
            RECENT_AUTH_COOKIE,
            await createAuthAction("recent-auth", params.user.id),
            RECENT_AUTH_MAX_AGE,
          );
        }
      },
      async signOut(params) {
        setAuthActionCookie(res, RECENT_AUTH_COOKIE, "", 0);
        setAuthActionCookie(res, ACCOUNT_LINK_COOKIE, "", 0);
        await options.events?.signOut?.(params);
      },
    },
  };
}

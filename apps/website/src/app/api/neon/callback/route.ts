import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/env";

import {
  exchangeNeonAuthorizationCode,
  getNeonOAuthConfig,
  getNeonOAuthRedirectUri,
} from "@/server/apis/neon";
import { syncNeonDonationAccounts } from "@/server/utils/neon-donations";
import {
  DEFAULT_NEON_RETURN_TO,
  NEON_DONOR_SESSION_COOKIE,
  NEON_OAUTH_STATE_COOKIE,
  createNeonDonorSession,
  getNeonCookieOptions,
  verifyNeonOAuthState,
} from "@/server/utils/neon-donor-session";

function redirectTo(path: string, { failed }: { failed: boolean }) {
  const url = new URL(`${env.NEXT_PUBLIC_BASE_URL}${path}`);
  if (failed) url.searchParams.set("neonLogin", "failed");

  const response = NextResponse.redirect(url);
  // The state is single-use. Not using cookies.delete, as __Host- cookies can
  // only be removed with the same Secure/Path attributes they were set with.
  response.cookies.set(NEON_OAUTH_STATE_COOKIE, "", getNeonCookieOptions(0));
  return response;
}

export async function GET(request: NextRequest) {
  const config = getNeonOAuthConfig();
  if (!config) {
    return new NextResponse("Neon login is not configured", { status: 404 });
  }

  const params = request.nextUrl.searchParams;
  const returnTo = await verifyNeonOAuthState(
    request.cookies.get(NEON_OAUTH_STATE_COOKIE)?.value,
    params.get("state"),
  );
  if (!returnTo) {
    return redirectTo(DEFAULT_NEON_RETURN_TO, { failed: true });
  }

  // Missing when the login was cancelled or failed on Neon's side
  const code = params.get("code");
  if (!code) {
    return redirectTo(returnTo, { failed: true });
  }

  try {
    const { accountId } = await exchangeNeonAuthorizationCode(config, {
      code,
      redirectUri: getNeonOAuthRedirectUri(),
    });
    try {
      await syncNeonDonationAccounts(accountId);
    } catch (error) {
      // A temporary CRM/cache failure must not prevent the donor from logging in.
      console.error("Failed to sync Neon donation ownership", error);
    }
    const session = await createNeonDonorSession(accountId);

    const response = redirectTo(returnTo, { failed: false });
    response.cookies.set(
      NEON_DONOR_SESSION_COOKIE,
      session.cookie,
      getNeonCookieOptions(session.maxAge),
    );
    return response;
  } catch (err) {
    console.error("Neon login failed", err);
    return redirectTo(returnTo, { failed: true });
  }
}

import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/env";

import { getNeonLogoutUrl, getNeonOAuthConfig } from "@/server/apis/neon";
import {
  NEON_DONOR_SESSION_COOKIE,
  getNeonCookieOptions,
  getSafeNeonReturnTo,
} from "@/server/utils/neon-donor-session";

// POST only, so link prefetching or embedded images cannot log donors out
export async function POST(request: NextRequest) {
  const returnTo = getSafeNeonReturnTo(
    request.nextUrl.searchParams.get("returnTo"),
  );
  const target = `${env.NEXT_PUBLIC_BASE_URL}${returnTo}`;

  // Also end the session on Neon's side, otherwise the next "Log in with Neon"
  // on a shared device would silently log in the previous donor again
  const config = getNeonOAuthConfig();
  const response = NextResponse.redirect(
    config ? getNeonLogoutUrl(config, target) : target,
    303,
  );
  response.cookies.set(NEON_DONOR_SESSION_COOKIE, "", getNeonCookieOptions(0));
  return response;
}

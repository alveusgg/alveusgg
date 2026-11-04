import { type NextRequest, NextResponse } from "next/server";

import {
  getNeonAuthorizeUrl,
  getNeonOAuthConfig,
  getNeonOAuthRedirectUri,
} from "@/server/apis/neon";
import {
  NEON_OAUTH_STATE_COOKIE,
  createNeonOAuthState,
  getNeonCookieOptions,
  getSafeNeonReturnTo,
} from "@/server/utils/neon-donor-session";

export async function GET(request: NextRequest) {
  const config = getNeonOAuthConfig();
  if (!config) {
    return new NextResponse("Neon login is not configured", { status: 404 });
  }

  const returnTo = getSafeNeonReturnTo(
    request.nextUrl.searchParams.get("returnTo"),
  );
  const { state, cookie, maxAge } = await createNeonOAuthState(returnTo);

  const response = NextResponse.redirect(
    getNeonAuthorizeUrl(config, {
      redirectUri: getNeonOAuthRedirectUri(),
      state,
    }),
  );
  response.cookies.set(
    NEON_OAUTH_STATE_COOKIE,
    cookie,
    getNeonCookieOptions(maxAge),
  );
  return response;
}

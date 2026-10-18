import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/env";

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

  // This only ends the session on our side. Neon's own logout can't send
  // donors back here, so the page links to it afterwards instead.
  const url = new URL(`${env.NEXT_PUBLIC_BASE_URL}${returnTo}`);
  url.searchParams.set("neonLogin", "loggedOut");

  const response = NextResponse.redirect(url, 303);
  response.cookies.set(NEON_DONOR_SESSION_COOKIE, "", getNeonCookieOptions(0));
  return response;
}

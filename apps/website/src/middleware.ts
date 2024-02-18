import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import { env } from "@/env/index.mjs";
import { callEndpoint } from "@/server/utils/queue";
import type { TrackClickSchema } from "@/pages/api/short-links/track-click";

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const res = await fetch(env.NEXT_PUBLIC_BASE_URL + "/api/short-links", {
    method: "POST",
    body: JSON.stringify({
      slug: req.nextUrl.pathname.replace("/l/", "").trim(),
    }),
  });
  const shortLink = await res.json();

  if (shortLink) {
    event.waitUntil(
      callEndpoint<TrackClickSchema>("/api/short-links/track-click", {
        id: shortLink.id,
      }),
    );
    return NextResponse.redirect(shortLink.link);
  }

  // If no match is found, redirect the user to the home page
  return NextResponse.redirect(env.NEXT_PUBLIC_BASE_URL + "/");
}

export const config = {
  matcher: "/l/:path*",
};

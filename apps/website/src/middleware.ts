import { env } from "@/env";
import type { TrackClickSchema } from "@/pages/api/short-links/track-click";
import { callEndpoint } from "@/server/utils/queue";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";

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

  // If no match is found, redirect the user to the 404 page
  return NextResponse.next();
}

export const config = {
  matcher: "/l/:path*",
};

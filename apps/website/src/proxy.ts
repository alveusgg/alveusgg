import { createTRPCProxyClient, httpLink } from "@trpc/client";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import superjson from "superjson";

import { env } from "@/env";

import type { AppRouter } from "@/server/trpc/router/_app";
import { callEndpoint } from "@/server/utils/queue";

import { getAnalyticsHeaders } from "@/utils/analytics-headers";

import type { TrackClickSchema } from "@/pages/api/short-links/track-click";

const api = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: `${env.NEXT_PUBLIC_BASE_URL}/api/trpc`,
      transformer: superjson,
    }),
  ],
});

export async function proxy(req: NextRequest, event: NextFetchEvent) {
  const shortLink = await api.shortLinks.getShortLink
    .query(req.nextUrl.pathname.replace(/^\/(l|go)\//, ""))
    .catch(() => null);

  if (shortLink) {
    event.waitUntil(
      // TODO: Ideally we'd have the queue use tRPC as well
      callEndpoint<TrackClickSchema>("/api/short-links/track-click", {
        id: shortLink.id,
        slug: shortLink.slug,
        link: shortLink.link,
        headers: getAnalyticsHeaders(req.headers),
      }),
    );
    return NextResponse.redirect(shortLink.link);
  }

  // If no match is found, redirect the user to the 404 page
  return NextResponse.next();
}

export const config = {
  matcher: ["/go/:path*", "/l/:path*"],
};

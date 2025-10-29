import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";

import { env } from "@/env";

import { callEndpoint } from "@/server/utils/queue";

import type { TrackClickSchema } from "@/pages/api/short-links/track-click";

const headersToObject = (headers: Headers) =>
  [...headers.entries()].reduce<Record<string, string | string[]>>(
    (acc, [key, value]) => {
      const existing = acc[key];
      if (existing === undefined) return { ...acc, [key]: value };

      return {
        ...acc,
        [key]: Array.isArray(existing)
          ? [...existing, value]
          : [existing, value],
      };
    },
    {},
  );

export async function proxy(req: NextRequest, event: NextFetchEvent) {
  const res = await fetch(env.NEXT_PUBLIC_BASE_URL + "/api/short-links", {
    method: "POST",
    body: JSON.stringify({
      slug: req.nextUrl.pathname.replace(/^\/(l|go)\//, ""),
    }),
  });
  const shortLink = await res.json();

  if (shortLink) {
    event.waitUntil(
      callEndpoint<TrackClickSchema>("/api/short-links/track-click", {
        id: shortLink.id,
        slug: shortLink.slug,
        link: shortLink.link,
        headers: headersToObject(req.headers),
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

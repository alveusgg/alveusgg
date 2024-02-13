import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import { env } from "@/env/index.mjs";

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const res = await fetch(env.NEXT_PUBLIC_BASE_URL + "/api/short-links", {
    method: "GET",
  });
  const shortLinks = await res.json();

  for (const link of shortLinks) {
    if (req.nextUrl.pathname.startsWith("/l/" + link.slug)) {
      event.waitUntil(
        fetch(env.NEXT_PUBLIC_BASE_URL + "/api/short-links/add", {
          method: "POST",
          body: JSON.stringify({
            id: link.id,
            secret: env.SHORT_LINKS_TRACKING_SECRET,
          }),
        }),
      );
      return NextResponse.redirect(link.link);
    }
  }

  // If no match is found, redirect the user to the home page
  return NextResponse.redirect("/");
}

export const config = {
  matcher: "/l/:path*",
};

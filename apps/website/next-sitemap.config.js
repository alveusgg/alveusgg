// @ts-check
/** @type {import('next-sitemap').IConfig} */
const config = {
  // If there is a NEXT_PUBLIC_VERCEL_URL set, use that like NextAuth.js does
  // Fallback to localhost if we don't have a URL from the env for any reason
  siteUrl:
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL) || "http://localhost",
  // Create a single sitemap, and don't list some routes in it
  generateIndexSitemap: false,
  exclude: [
    "/api",
    "/api/*",
    "/auth",
    "/auth/*",
    "/admin",
    "/admin/*",
    "/forms",
    "/forms/*",
    "/show-and-tell/*",
    "/bingo/play/*",
  ],
  // TODO: Transform to apply proper priority to pages
  // Create a robots txt file, and disallow indexing of some routes
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: process.env.NEXT_PUBLIC_NOINDEX === "true" ? [] : ["/api/og/"],
        disallow:
          process.env.NEXT_PUBLIC_NOINDEX === "true"
            ? ["/"]
            : ["/api/", "/bingo/play/", "/auth/", "/admin/"],
      },
    ],
  },
};

export default config;

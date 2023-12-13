// @ts-check
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // If there is a NEXT_PUBLIC_VERCEL_URL set, use that like NextAuth.js does
  siteUrl: process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL,
  // Create a single sitemap, and don't list some routes in it
  generateIndexSitemap: false,
  exclude: [
    "/api",
    "/api/*",
    "/auth",
    "/auth/*",
    "/admin",
    "/admin/*",
    "/wip",
    "/wip/*",
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
            : [
                "/api/",
                "/bingo/play/",
                "/auth/",
                "/admin/",
                "/wip/",
                "/forms/",
                "/privacy-policy",
              ],
      },
    ],
  },
};

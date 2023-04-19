import { resolve } from "path";
import { withSuperjson } from "next-superjson";
import ambassadorSlugs from "./src/data/ambassador-slugs.json" assert { type: "json" };

// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      // OpenWeatherMap
      {
        protocol: "http",
        hostname: "openweathermap.org",
      },
      // Twitch CDN (profile images etc.)
      {
        protocol: "https",
        hostname: "static-cdn.jtvnw.net",
      },
      // YouTube Thumbnails
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      // Original Website
      {
        protocol: "https",
        hostname: "www.alveussanctuary.org",
      },
      // S3 - Configured CDN
      ...(process.env.FILE_STORAGE_CDN_URL
        ? [
            {
              protocol: "https",
              hostname: process.env.FILE_STORAGE_CDN_URL.replace(
                /^https?:\/\//,
                ""
              ),
            },
          ]
        : []),
      // S3 - Production CDN CNAME
      {
        protocol: "https",
        hostname: "files.alveus.site",
      },
      // S3 - Development CDN Origin
      {
        protocol: "https",
        hostname: "alveus-files.nyc3.cdn.digitaloceanspaces.com",
      },
      // S3 - Production CDN Origin
      {
        protocol: "https",
        hostname: "alveus.nyc3.cdn.digitaloceanspaces.com",
      },
    ],
  },
  redirects: async () => [
    // Redirect progressive web app view to home page
    {
      source: "/homescreen",
      destination: "/",
      permanent: false,
    },
    // Renaming redirects
    {
      source: "/ambassadors/smokey-oak-millipede",
      destination: "/ambassadors/hank-mr-mctrain",
      permanent: false,
    },
    {
      source: "/ambassadors/madagascar-hissing-cockroach",
      destination: "/ambassadors/barbara-baked-bean",
      permanent: false,
    },
    {
      source: "/ambassadors/zebra-isopods",
      destination: "/ambassadors/marty",
      permanent: false,
    },
    {
      source: "/ambassadors/rubber-ducky-isopods",
      destination: "/ambassadors/ducky",
      permanent: false,
    },
    // WordPress route redirects
    {
      source: "/about-alveus",
      destination: "/about/alveus",
      permanent: true,
    },
    {
      source: "/about-maya",
      destination: "/about/maya",
      permanent: true,
    },
    {
      source: "/advisory-board",
      destination: "/about/advisory-board",
      permanent: true,
    },
    {
      source: "/board-of-directors",
      destination: "/about/board-of-directors",
      permanent: true,
    },
    {
      source: "/staff",
      destination: "/about/staff",
      permanent: true,
    },
    {
      source: "/alveus-annual-report",
      destination: "/about/annual-reports",
      permanent: true,
    },
    // Internal redirects
    {
      source: "/security.txt",
      destination: "/.well-known/security.txt",
      permanent: true,
    },
    {
      source: "/collabs",
      destination: "/collaborations",
      permanent: true,
    },
    ...ambassadorSlugs.map((slug) => ({
      source: `/${slug}`,
      destination: `/ambassadors/${slug}`,
      permanent: false,
    })),
    // External redirects
    {
      source: "/merch",
      destination: "https://alveussanctuary.myshopify.com",
      permanent: true,
    },
    {
      source: "/plushies",
      destination: "https://youtooz.com/collections/alveus",
      permanent: true,
    },
    {
      source: "/wishlist",
      destination: "https://smile.amazon.com/hz/wishlist/ls/ZM472JRT5QXG",
      permanent: true,
    },
    {
      source: "/paypal",
      destination:
        "https://www.paypal.com/donate/?hosted_button_id=9HMGFKWST8XD4",
      permanent: true,
    },
    {
      source: "/giving-block",
      destination: "https://thegivingblock.com/donate/alveus-sanctuary/",
      permanent: true,
    },
    {
      source: "/github",
      destination: "https://github.com/alveusgg",
      permanent: true,
    },
    {
      source: "/socials",
      destination: "https://bio.link/alveussanctuary",
      permanent: true,
    },
    {
      source: "/instagram",
      destination: "https://www.instagram.com/alveussanctuary",
      permanent: true,
    },
    {
      source: "/twitter",
      destination: "https://twitter.com/AlveusSanctuary",
      permanent: true,
    },
    {
      source: "/youtube",
      destination: "https://www.youtube.com/AlveusSanctuary",
      permanent: true,
    },
    {
      source: "/tiktok",
      destination: "https://www.tiktok.com/@alveussanctuary",
      permanent: true,
    },
    {
      source: "/twitch",
      destination: "https://twitch.tv/alveussanctuary",
      permanent: true,
    },
    {
      source: "/live",
      destination: "https://twitch.tv/alveussanctuary",
      permanent: false,
    },
  ],
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-Frame-Options",
          value: "GOFORIT",
        },
        {
          key: "Content-Security-Policy",
          value:
            [
              "frame-src 'self'",
              // Allow vercel preview helper (if not in production):
              ["development", "preview"].includes(process.env.VERCEL_ENV) &&
                "https://vercel.live/",
              // Twitch embeds:
              "https://embed.twitch.tv/ https://player.twitch.tv/ https://www.twitch.tv/",
              // YouTube embeds:
              "https://www.youtube-nocookie.com/",
              // The Giving Block (crypto donations):
              "https://tgbwidget.com/",
              // Imgur embeds:
              //"http://imgur.com/ https://imgur.com/ https://imgur.io/",
              // Streamable embeds:
              //"https://streamable.com/",
            ]
              .filter(Boolean)
              .join(" ") + ";",
        },
      ],
    },
  ],
  webpack: (config, options) => {
    // Add a custom loader for videos
    config.module.rules.push({
      test: /\.mp4$/,
      use: [
        {
          loader: resolve("./build-scripts/video-loader.cjs"),
          // Based on https://github.com/vercel/next.js/blob/888384c5e853ee5f9988b74b9085f1d6f80157a3/packages/next/src/build/webpack-config.ts#L1907-L1912
          // and https://github.com/vercel/next.js/blob/888384c5e853ee5f9988b74b9085f1d6f80157a3/packages/next/src/build/webpack-config.ts#L2489-L2490
          options: {
            isServer: !!options.isServer,
            isDevelopment: !!options.dev,
            assetPrefix: options.config.assetPrefix || "",
          },
        },
      ],
    });

    // Load markdown files as strings
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });

    return config;
  },
  transpilePackages: ["@alveusgg/data"],
  experimental: {
    scrollRestoration: true,
  },
};

export default withSuperjson()(config);

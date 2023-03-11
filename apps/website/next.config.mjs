import { resolve } from "path";
import { withSuperjson } from "next-superjson";

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
      // GitHub Pages
      {
        protocol: "https",
        hostname: "alveusgg.github.io",
      },
      // GitHub Raw
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
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
    // External redirects
    {
      source: "/smile",
      destination: "https://smile.amazon.com/ch/86-1772907",
      permanent: true,
    },
    {
      source: "/merch",
      destination: "https://merch.streamelements.com/alveussanctuary",
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
            "frame-src 'self' " +
            // Allow vercel preview helper (if not in production):
            (["development", "preview"].includes(process.env.VERCEL_ENV)
              ? "https://vercel.live/ "
              : "") +
            // Twitch embeds:
            "https://embed.twitch.tv/ https://www.twitch.tv/ " +
            // The Giving Block (crypto donations):
            "https://tgbwidget.com/ " +
            // YouTube embeds:
            "https://www.youtube-nocookie.com/ " +
            // Imgur embeds:
            //"http://imgur.com/ https://imgur.com/ https://imgur.io/ " +
            // Streamable embeds:
            "https://streamable.com/ " +
            // Consent
            "https://consentcdn.cookiebot.com/",
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

    return config;
  },
};

export default withSuperjson()(config);

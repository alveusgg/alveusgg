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
      // Original Website
      {
        protocol: "https",
        hostname: "www.alveussanctuary.org",
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
            "frame-src https://embed.twitch.tv/ https://www.twitch.tv/ https://tgbwidget.com/ https://www.youtube-nocookie.com/",
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
          loader: resolve("./src/build/video-loader.cjs"),
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

    //const baseEntry = config.entry;
    //const baseOutputFilename = config.output.filename;
    //
    //config.entry = async () => {
    //  console.log({ baseEntry });
    //  const res = await baseEntry();
    //
    //  return {
    //    ...res,
    //  };
    //};

    // @ ts-ignore
    //config.output.filename = (chunkInfo) => {
    //  if (chunkInfo.chunk.name === "AlveusPushWorker.js") {
    //    return "static/push/alveus/AlveusPushWorker.js";
    //  }
    //
    //  if (typeof baseOutputFilename === "function") {
    //    return baseOutputFilename(chunkInfo);
    //  }
    //
    //  return baseOutputFilename;
    //};

    return config;
  },
};

export default withSuperjson()(config);

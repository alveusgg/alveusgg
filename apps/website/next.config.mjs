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
      {
        protocol: "http",
        hostname: "openweathermap.org",
      },
      {
        protocol: "https",
        hostname: "static-cdn.jtvnw.net",
      },
      {
        protocol: "https",
        hostname: "www.alveussanctuary.org",
      },
      {
        protocol: "https",
        hostname: "alveusgg.github.io",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
    ],
  },
  redirects: async () => [
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
          value: "frame-src https://embed.twitch.tv/ https://www.twitch.tv/ https://tgbwidget.com/",
        },
      ],
    },
  ],
  webpack: (config, options) => {
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

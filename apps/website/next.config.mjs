import i18nConfig from "./next-i18next.config.mjs";

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
  i18n: i18nConfig.i18n,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static-cdn.jtvnw.net",
      },
      {
        protocol: "https",
        hostname: "www.alveussanctuary.org",
      },
    ],
  },
  redirects: async () => [
    {
      source: "/",
      destination: "/live/",
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
          value: "frame-src https://embed.twitch.tv/ https://www.twitch.tv/",
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

export default config;

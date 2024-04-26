import { resolve } from "path";

import ambassadorSlugs from "./src/data/generated/ambassador-slugs.json" assert { type: "json" };
import animalQuestEpisodes from "./src/data/generated/animal-quest-episodes.json" assert { type: "json" };

import "./src/env/index.js";

/** @type {Array<import("next/dist/shared/lib/image-config").RemotePattern>} */
const cdnImagesRemotePattern = process.env.FILE_STORAGE_CDN_URL
  ? [
      {
        protocol: "https",
        hostname: process.env.FILE_STORAGE_CDN_URL.replace(/^https?:\/\//, ""),
      },
    ]
  : [];

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    dirs: ["."],
  },
  images: {
    remotePatterns: [
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
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      // Streamable Thumbnails
      {
        protocol: "https",
        hostname: "cdn-cf-east.streamable.com",
      },
      // Imgur (stream schedule)
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      // Original Website
      {
        protocol: "https",
        hostname: "www.alveussanctuary.org",
      },
      // S3 - Configured CDN
      ...cdnImagesRemotePattern,
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
    {
      source: "/about",
      destination: "/about/alveus",
      permanent: true,
    },
    {
      source: "/tech",
      destination: "/about/tech",
      permanent: true,
    },
    {
      source: "/commands",
      destination: "/about/tech/commands",
      permanent: true,
    },
    {
      source: "/vote",
      destination: "/voters-guide",
      permanent: true,
    },
    {
      source: "/give-an-hour",
      destination: "/show-and-tell/give-an-hour",
      permanent: true,
    },
    {
      source: "/aq/:path*",
      destination: "/animal-quest/:path*",
      permanent: false,
    },
    ...ambassadorSlugs.map((slug) => ({
      source: `/${slug}`,
      destination: `/ambassadors/${slug}`,
      permanent: false,
    })),
    ...animalQuestEpisodes.flatMap(({ slug, episode }) => [
      {
        source: `/animal-quest/${episode}`,
        destination: `/animal-quest/${slug}`,
        permanent: false,
      },
      {
        source: `/animal-quest/episode-${episode}`,
        destination: `/animal-quest/${slug}`,
        permanent: false,
      },
    ]),
    {
      source: "/animal-quest/cow-edition",
      destination: "/animal-quest/beef-edition",
      permanent: false,
    },
    // Events
    {
      source: "/fc23",
      destination: "/events/fall-carnival-2023",
      permanent: true,
    },
    {
      source: "/fc23/:user*",
      destination: "/events/fall-carnival-2023/tickets/:user*",
      permanent: true,
    },
    // External redirects
    {
      source: "/merch",
      destination: "https://shop.alveussanctuary.org",
      permanent: true,
    },
    {
      source: "/merch-store",
      destination: "https://shop.alveussanctuary.org",
      permanent: true,
    },
    {
      source: "/shop",
      destination: "https://shop.alveussanctuary.org",
      permanent: true,
    },
    {
      source: "/store",
      destination: "https://shop.alveussanctuary.org",
      permanent: true,
    },
    {
      source: "/apparel",
      destination: "https://shop.alveussanctuary.org",
      permanent: true,
    },
    {
      source: "/plushies",
      destination: "https://youtooz.com/collections/alveus",
      permanent: true,
    },
    {
      source: "/plushie",
      destination: "https://youtooz.com/collections/alveus",
      permanent: true,
    },
    {
      source: "/plushy",
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
      source: "/vods",
      destination:
        "https://youtube.com/playlist?list=PLtQafKoimfLchTIBfjEJvWODYELZf-nuy",
      permanent: true,
    },
    {
      source: "/vods/twitchcon-2023",
      destination: "https://youtube.com/watch?v=lxK73_PWjI8",
      permanent: true,
    },
    {
      source: "/vods/non-releasable",
      destination: "https://youtube.com/watch?v=3UZjgUMuYeM",
      permanent: true,
    },
    {
      source: "/vods/keeper-talk",
      destination:
        "https://youtube.com/playlist?list=PLtQafKoimfLckLZ5aCtRNXInyBVs6IoYF",
      permanent: true,
    },
    {
      source: "/vods/connor-projects",
      destination:
        "https://youtube.com/playlist?list=PLtQafKoimfLdtIla7qiJCFYDd4qDZG6y-",
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
      permanent: true,
    },
    {
      source: "/live/twitch",
      destination: "https://twitch.tv/alveussanctuary",
      permanent: true,
    },
    {
      source: "/live/youtube",
      destination: "https://www.youtube.com/AlveusSanctuary/live",
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
            [
              "frame-src 'self'",
              // Allow vercel preview helper (if not in production):
              process.env.VERCEL_ENV &&
                ["development", "preview"].includes(process.env.VERCEL_ENV) &&
                "https://vercel.live/",
              // Twitch embeds:
              "https://embed.twitch.tv/ https://player.twitch.tv/ https://www.twitch.tv/",
              // YouTube embeds:
              "https://www.youtube-nocookie.com/",
              // Streamable embeds:
              "https://streamable.com/",
              // Prezi embeds:
              "https://prezi.com/",
              // The Giving Block (donation widget):
              "https://widget.thegivingblock.com/",
              // Vote.org embeds:
              "https://register.vote.org/ https://verify.vote.org/ https://ballot.vote.org/",
              // Imgur embeds:
              //"http://imgur.com/ https://imgur.com/ https://imgur.io/",
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

    // Disable Webpack caching if not in development
    if (!options.dev && config.cache?.type === "filesystem") {
      config.cache = false;
    }

    return config;
  },
  transpilePackages: ["@alveusgg/data"],
  experimental: {
    scrollRestoration: true,
    swcPlugins: [["next-superjson-plugin", {}]],
  },
};

export default config;

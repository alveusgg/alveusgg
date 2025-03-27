import { resolve } from "path";
import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";
import { withSuperjson } from "next-superjson";

import ambassadors from "@alveusgg/data/build/ambassadors/core";
import animalQuest from "@alveusgg/data/build/animal-quest";
import { isActiveAmbassadorKey } from "@alveusgg/data/build/ambassadors/filters";

import { camelToKebab, sentenceToKebab } from "@/utils/string-case";
import { typeSafeObjectEntries, typeSafeObjectKeys } from "@/utils/helpers";

import { twitchChannels } from "@/data/calendar-events";
import socials from "@/data/socials";

import "@/env/index.js";

function urlOriginAsRemotePattern(url: string): RemotePattern {
  const parsed = new URL(url);
  return {
    protocol: parsed.protocol === "http:" ? "http" : "https",
    hostname: parsed.hostname,
    port: parsed.port,
  };
}

const config: NextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ["."],
  },
  images: {
    // limits the quality levels to limit cache variations for image optimization:
    qualities: [50, 75, 90, 100],
    // we don't expect images to change often:
    // - yt thumbnails might change, but it's not that important
    // - assets should use cache busting for updates
    // - show and tell uploads should be practically static
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
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
      // S3 - File Storage
      urlOriginAsRemotePattern(
        process.env.FILE_STORAGE_CDN_URL ||
          process.env.FILE_STORAGE_ENDPOINT ||
          "https://localhost",
      ),
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
      destination: "/about/staff#maya",
      permanent: true,
    },
    {
      source: "/about/maya",
      destination: "/about/staff#maya",
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
      source: "/annual-reports/:path*",
      destination: "/about/annual-reports/:path*",
      permanent: true,
    },
    {
      source: "/reports/:path*",
      destination: "/about/annual-reports/:path*",
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
      source: "/schedule",
      destination: "/updates",
      permanent: true,
    },
    {
      source: "/calendar",
      destination: "/updates",
      permanent: true,
    },
    {
      source: "/aq/:path*",
      destination: "/animal-quest/:path*",
      permanent: false,
    },
    ...typeSafeObjectKeys(ambassadors)
      .filter(isActiveAmbassadorKey) // We don't want to generate pages for retired ambassadors
      .map((key) => camelToKebab(key))
      .map((slug) => ({
        source: `/${slug}`,
        destination: `/ambassadors/${slug}`,
        permanent: false,
      })),
    ...animalQuest
      .map((episode) => ({
        slug: sentenceToKebab(episode.edition),
        episode: episode.episode,
      }))
      .flatMap(({ slug, episode }) => [
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
      destination: "https://www.amazon.com/hz/wishlist/ls/ZM472JRT5QXG",
      permanent: true,
    },
    {
      source: "/toybox",
      destination: "https://www.wildlifetoybox.com/wishlist/56",
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
    ...typeSafeObjectEntries(socials).map(([key, { link }]) => ({
      source: `/${key}`,
      destination: link,
      permanent: true,
    })),
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
      source: "/vods/twitchcon-2024",
      destination: "https://youtube.com/watch?v=b-d1h-dKEeU",
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
    {
      source: "/updates/ical",
      destination: `https://api.twitch.tv/helix/schedule/icalendar?broadcaster_id=${twitchChannels.alveus.id}`,
      permanent: true,
    },
    ...typeSafeObjectEntries(twitchChannels).map(([key, { id }]) => ({
      source: `/updates/ical/${key}`,
      destination: `https://api.twitch.tv/helix/schedule/icalendar?broadcaster_id=${id}`,
      permanent: true,
    })),
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
              // Cloudflare Stream embeds:
              [
                ...new Set(
                  animalQuest.map(
                    (episode) =>
                      `https://customer-${episode.video.cu}.cloudflarestream.com/`,
                  ),
                ),
              ].join(" "),
              // Twitch embeds:
              "https://embed.twitch.tv/ https://player.twitch.tv/ https://clips.twitch.tv/ https://www.twitch.tv/",
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
      test: /\.(mp4|webm)$/,
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

    // Load PDF files as URLs
    config.module.rules.push({
      test: /\.pdf$/,
      type: "asset/resource",
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
  },
  // Move the dev indicator out the way of the consent toggle
  devIndicators: {
    position: "bottom-right",
  },
};

export default withSuperjson()(config);

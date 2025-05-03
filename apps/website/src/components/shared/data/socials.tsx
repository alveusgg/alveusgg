import { type ComponentType } from "react";

import socials from "@/data/socials";

import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
} from "@/utils/helpers";

import IconBluesky from "@/icons/IconBluesky";
import IconInstagram from "@/icons/IconInstagram";
import IconTikTok from "@/icons/IconTikTok";
import IconTwitch from "@/icons/IconTwitch";
import IconTwitter from "@/icons/IconTwitter";
import IconYouTube from "@/icons/IconYouTube";

const icons = {
  twitch: IconTwitch,
  instagram: IconInstagram,
  twitter: IconTwitter,
  bluesky: IconBluesky,
  tiktok: IconTikTok,
  youtube: IconYouTube,
} as const satisfies Record<keyof typeof socials, ComponentType>;

const links = typeSafeObjectFromEntries(
  typeSafeObjectEntries(socials).map(([key, social]) => [
    key,
    {
      ...social,
      icon: icons[key],
    },
  ]),
);

export default links;

import { type ComponentType } from "react";

import IconInstagram from "@/icons/IconInstagram";
import IconTikTok from "@/icons/IconTikTok";
import IconTwitter from "@/icons/IconTwitter";
import IconTwitch from "@/icons/IconTwitch";
import IconYouTube from "@/icons/IconYouTube";
import IconBluesky from "@/icons/IconBluesky";

import socials from "@/data/socials";

import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
} from "@/utils/helpers";

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

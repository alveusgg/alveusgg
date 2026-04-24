import { type ComponentType } from "react";

import type socials from "@/data/socials";

import type { IconProps } from "@/icons/BaseIcon";
import IconFacebook from "@/icons/IconFacebook";
import IconInstagram from "@/icons/IconInstagram";
import IconSnapchat from "@/icons/IconSnapchat";
import IconTikTok from "@/icons/IconTikTok";
import IconTwitch from "@/icons/IconTwitch";
import IconTwitter from "@/icons/IconTwitter";
import IconYouTube from "@/icons/IconYouTube";

type SocialKey = keyof typeof socials;

const socialsIcon = {
  twitch: IconTwitch,
  youtube: IconYouTube,
  instagram: IconInstagram,
  twitter: IconTwitter,
  facebook: IconFacebook,
  tiktok: IconTikTok,
  snapchat: IconSnapchat,
} as const satisfies Record<SocialKey, ComponentType<IconProps>>;

export const getSocialIcon = (key: SocialKey) => socialsIcon[key];

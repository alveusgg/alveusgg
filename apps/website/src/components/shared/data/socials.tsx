import { type ComponentType } from "react";

import socials, { type SocialKey, type SocialLink } from "@/data/socials";

import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
} from "@/utils/helpers";

import type { IconProps } from "@/icons/BaseIcon";
import IconFacebook from "@/icons/IconFacebook";
import IconInstagram from "@/icons/IconInstagram";
import IconSnapchat from "@/icons/IconSnapchat";
import IconTikTok from "@/icons/IconTikTok";
import IconTwitch from "@/icons/IconTwitch";
import IconTwitter from "@/icons/IconTwitter";
import IconYouTube from "@/icons/IconYouTube";

type IconComponent = ComponentType<IconProps>;

const icons = {
  twitch: IconTwitch,
  instagram: IconInstagram,
  twitter: IconTwitter,
  facebook: IconFacebook,
  tiktok: IconTikTok,
  snapchat: IconSnapchat,
  youtube: IconYouTube,
} as const satisfies Record<SocialKey, IconComponent>;

export type SocialLinkWithIcon = SocialLink & {
  icon: IconComponent;
};

const socialsLinks: Record<SocialKey, SocialLinkWithIcon> =
  typeSafeObjectFromEntries(
    typeSafeObjectEntries(socials).map(([key, social]) => [
      key,
      {
        ...social,
        icon: icons[key],
      },
    ]),
  );

export default socialsLinks;

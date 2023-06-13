import IconInstagram from "@/icons/IconInstagram";
import IconTikTok from "@/icons/IconTikTok";
import IconTwitter from "@/icons/IconTwitter";
import IconTwitch from "@/icons/IconTwitch";
import IconYouTube from "@/icons/IconYouTube";

type SocialLink = {
  link: string;
  title: string;
  icon: React.ComponentType;
};

const socials = {
  twitch: {
    link: "https://twitch.tv/alveussanctuary",
    title: "Twitch.tv",
    icon: IconTwitch,
  },
  instagram: {
    link: "https://www.instagram.com/alveussanctuary",
    title: "Instagram",
    icon: IconInstagram,
  },
  twitter: {
    link: "https://twitter.com/AlveusSanctuary",
    title: "Twitter",
    icon: IconTwitter,
  },
  tiktok: {
    link: "https://www.tiktok.com/@alveussanctuary",
    title: "TikTok",
    icon: IconTikTok,
  },
  youtube: {
    link: "https://www.youtube.com/c/AlveusSanctuary",
    title: "YouTube",
    icon: IconYouTube,
  },
} satisfies Record<string, SocialLink>;

export default socials;

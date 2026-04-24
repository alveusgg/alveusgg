export type SocialLink = {
  link: string;
  title: string;
  isLiveStream: boolean;
};

const socials = {
  twitch: {
    link: "https://twitch.tv/alveussanctuary",
    title: "Twitch.tv",
    isLiveStream: true,
  },
  instagram: {
    link: "https://www.instagram.com/alveussanctuary",
    title: "Instagram",
    isLiveStream: false,
  },
  twitter: {
    link: "https://x.com/AlveusSanctuary",
    title: "X (Twitter)",
    isLiveStream: false,
  },
  facebook: {
    link: "https://www.facebook.com/AlveusSanctuary",
    title: "Facebook",
    isLiveStream: false,
  },
  tiktok: {
    link: "https://www.tiktok.com/@alveussanctuary",
    title: "TikTok",
    isLiveStream: false,
  },
  snapchat: {
    link: "https://www.snapchat.com/@alveussanctuary",
    title: "Snapchat",
    isLiveStream: false,
  },
  youtube: {
    link: "https://www.youtube.com/AlveusSanctuary",
    title: "YouTube",
    isLiveStream: true,
  },
} as const satisfies Record<string, SocialLink>;

export default socials;

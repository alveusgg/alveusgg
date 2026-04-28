export type SocialLink = {
  link: string;
  title: string;
  live: boolean;
};

export type SocialKey = keyof typeof socials;

const socials = {
  twitch: {
    link: "https://twitch.tv/alveussanctuary",
    title: "Twitch.tv",
    live: true,
  },
  instagram: {
    link: "https://www.instagram.com/alveussanctuary",
    title: "Instagram",
    live: false,
  },
  twitter: {
    link: "https://x.com/AlveusSanctuary",
    title: "X (Twitter)",
    live: false,
  },
  facebook: {
    link: "https://www.facebook.com/AlveusSanctuary",
    title: "Facebook",
    live: false,
  },
  tiktok: {
    link: "https://www.tiktok.com/@alveussanctuary",
    title: "TikTok",
    live: false,
  },
  snapchat: {
    link: "https://www.snapchat.com/@alveussanctuary",
    title: "Snapchat",
    live: false,
  },
  youtube: {
    link: "https://www.youtube.com/AlveusSanctuary",
    title: "YouTube",
    live: true,
  },
} as const satisfies Record<string, SocialLink>;

export default socials;

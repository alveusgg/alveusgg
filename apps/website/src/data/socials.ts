type SocialLink = {
  link: string;
  title: string;
};

const socials = {
  twitch: {
    link: "https://twitch.tv/alveussanctuary",
    title: "Twitch.tv",
  },
  instagram: {
    link: "https://www.instagram.com/alveussanctuary",
    title: "Instagram",
  },
  twitter: {
    link: "https://x.com/AlveusSanctuary",
    title: "X (Twitter)",
  },
  bluesky: {
    link: "https://bsky.app/profile/alveussanctuary.org",
    title: "Bluesky",
  },
  facebook: {
    link: "https://www.facebook.com/AlveusSanctuary",
    title: "Facebook",
  },
  tiktok: {
    link: "https://www.tiktok.com/@alveussanctuary",
    title: "TikTok",
  },
  snapchat: {
    link: "https://www.snapchat.com/@alveussanctuary",
    title: "Snapchat",
  },
  youtube: {
    link: "https://www.youtube.com/AlveusSanctuary",
    title: "YouTube",
  },
} as const satisfies Record<string, SocialLink>;

export default socials;

import IconDiscord from "@/icons/IconDiscord";

type UpdateChannelLink = {
  link: string;
  title: string;
  icon: React.ComponentType;
};

const updateChannels = {
  discord: {
    link: "https://discord.gg/maya",
    title: "Discord #alveus-announcements",
    icon: IconDiscord,
  },
} satisfies Record<string, UpdateChannelLink>;

export default updateChannels;

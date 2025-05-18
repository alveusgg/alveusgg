export interface Step {
  id: string;
  name: string;
  type: "server" | "source" | "github" | "service" | "control" | "output";
  description?: string;
  link?: string;
  children?: Step[];
}

// Return a unique chatbot object each time to avoid weird edges in the graph
const chatBot = (id: string): Step => ({
  id: `chatbot-${id}`,
  name: "Chat Bot",
  type: "control",
  description:
    "Custom Node.js application allowing control of stream layout and PTZ cameras from Twitch chat.",
  children: [
    {
      id: `github-chatbot-${id}`,
      name: "alveusgg/chatbot",
      type: "github",
      description:
        "GitHub repository for the chat bot, allowing control of the stream layout and cameras.",
      link: "https://github.com/alveusgg/chatbot",
    },
  ],
});

const localObs: Step = {
  id: "local-obs",
  name: "Local OBS",
  type: "server",
  description: "Open Broadcaster Software, running on a local studio server.",
  children: [
    {
      id: "cameras",
      name: "Cameras",
      type: "source",
      description: "Live IP cameras around the property, mainly Axis devices.",
      children: [
        {
          id: "axis-companion",
          name: "Axis Companion",
          type: "control",
          description:
            "Axis IP camera management software allowing PTZ control.",
        },
        chatBot("cameras"),
      ],
    },
    {
      id: "overlays",
      name: "Overlays",
      type: "source",
      description:
        "Browser-based overlays added to the stream in OBS, providing alerts etc., mainly using StreamElements.",
    },
    chatBot("local-obs"),
  ],
};

const cloudObs: Step = {
  id: "cloud-obs",
  name: "Cloud OBS",
  type: "server",
  description: "Open Broadcaster Software, running on a remote cloud server.",
  children: [
    localObs,
    {
      id: "liveu",
      name: "LiveU Service",
      type: "service",
      description:
        "LiveU cloud streaming service, for ingesting remote video from a LiveU Solo.",
      children: [
        {
          id: "liveu-camera",
          name: "Livestream Backpack",
          type: "source",
          description:
            "LiveU Solo, a portable video encoder for live streaming, with a DSLR camera.",
        },
      ],
    },
    {
      id: "irl-pro",
      name: "IRL Pro",
      type: "service",
      description: "IRL Pro, a mobile app for live streaming from a phone.",
      children: [
        {
          id: "irl-pro-camera",
          name: "Mobile Phone",
          type: "source",
          description:
            "Mobile phone, with IRL Pro app, for on-the-go streaming.",
        },
      ],
    },
    chatBot("cloud-obs"),
  ],
};

const steps: Step[] = [
  {
    id: "twitch",
    name: "Twitch Stream",
    type: "output",
    link: "/live/twitch",
    children: [
      cloudObs,
      {
        id: "github-extension",
        name: "alveusgg/extension",
        type: "github",
        description:
          "GitHub repository for the Twitch extension showing ambassador information on the stream.",
        link: "https://github.com/alveusgg/extension",
      },
    ],
  },
  {
    id: "youtube",
    name: "YouTube Stream",
    type: "output",
    link: "/live/youtube",
    children: [cloudObs],
  },
  {
    id: "website",
    name: "Website",
    type: "output",
    description: "Alveus Sanctuary website at alveussanctuary.org.",
    link: "/",
    children: [
      {
        id: "low-latency",
        name: "Low Latency Feed",
        type: "output",
        description:
          "Low latency feed used by moderators for responsive PTZ control.",
        children: [
          {
            id: "cloudflare-stream",
            name: "Cloudflare Stream",
            type: "service",
            description:
              "Cloudflare Stream, used for the low latency feed over WebRTC.",
            children: [localObs],
          },
        ],
      },
      {
        id: "vercel",
        name: "Vercel",
        type: "service",
        description: "Vercel hosting for the Alveus Sanctuary website.",
        children: [
          {
            id: "github-website",
            name: "alveusgg/alveusgg",
            type: "github",
            description: "GitHub repository for the Alveus Sanctuary website.",
            link: "https://github.com/alveusgg/alveusgg",
          },
        ],
      },
    ],
  },
];

export default steps;

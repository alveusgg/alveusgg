export interface Step {
  id: string;
  name: string;
  type: "server" | "source" | "service" | "control" | "output";
  description?: string;
  children?: Step[];
}

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
        {
          id: "bot-cameras",
          name: "Chat Bot",
          type: "control",
          description:
            "Custom Node.js application allowing PTZ control from Twitch chat.",
        },
      ],
    },
    {
      id: "overlays",
      name: "Overlays",
      type: "source",
      description:
        "Browser-based overlays added to the stream in OBS, providing alerts etc., mainly using StreamElements.",
    },
    {
      id: "bot-local-obs",
      name: "Chat Bot",
      type: "control",
      description:
        "Custom Node.js application allowing control of scene/camera layout from Twitch chat.",
    },
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
    {
      id: "bot-cloud-obs",
      name: "Chat Bot",
      type: "control",
      description:
        "Custom Node.js application allowing control of scene/source swapping from Twitch chat.",
    },
  ],
};

const steps: Step[] = [
  {
    id: "twitch",
    name: "Twitch Stream",
    type: "output",
    children: [cloudObs],
  },
  {
    id: "youtube",
    name: "YouTube Stream",
    type: "output",
    children: [cloudObs],
  },
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
];

export default steps;

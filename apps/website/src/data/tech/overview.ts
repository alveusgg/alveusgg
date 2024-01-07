export interface Step {
  id: string;
  name: string;
  type: "server" | "source" | "service" | "control";
  description?: string;
  children?: Step[];
}

type Upstream = Omit<Step, "children">;

export const upstream: Upstream[] = [
  {
    id: "twitch",
    name: "Twitch",
    type: "service",
  },
  {
    id: "youtube",
    name: "YouTube",
    type: "service",
  },
];

const steps: Step = {
  id: "cloud-obs",
  name: "Cloud OBS",
  type: "server",
  description: "Open Broadcaster Software, running on a remote cloud server.",
  children: [
    {
      id: "local-obs",
      name: "Local OBS",
      type: "server",
      description:
        "Open Broadcaster Software, running on a local studio server.",
      children: [
        {
          id: "cameras",
          name: "Cameras",
          type: "source",
          description:
            "Live IP cameras around the property, mainly using Axis and OBSBot.",
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
    },
    {
      id: "psynaps",
      name: "Psynaps RTMP",
      type: "server",
      description:
        "Psynaps Super Stream System, a custom RTMP server for ingesting remote video.",
      children: [
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
          id: "larix",
          name: "Larix Broadcaster",
          type: "service",
          description:
            "Larix Broadcaster, a mobile app for live streaming from a phone.",
          children: [
            {
              id: "larix-camera",
              name: "Mobile Phone",
              type: "source",
              description:
                "Mobile phone, with Larix Broadcaster app, for on-the-go streaming.",
            },
          ],
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

export default steps;

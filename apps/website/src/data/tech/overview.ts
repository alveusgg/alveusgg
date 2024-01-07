export interface Step {
  id: string;
  name: string;
  description?: string;
  children?: Step[];
}

type Upstream = Omit<Step, "children">;

export const upstream: Upstream[] = [
  {
    id: "twitch",
    name: "Twitch",
  },
  {
    id: "youtube",
    name: "YouTube",
  },
];

const localBot = {
  id: "bot-local-obs",
  name: "Control Bot",
  description:
    "Custom Node.js application allowing control of scene/camera layout from Twitch chat.",
};

const steps: Step = {
  id: "cloud-obs",
  name: "Cloud OBS",
  description: "Open Broadcaster Software, running on a remote cloud server.",
  children: [
    {
      id: "local-obs",
      name: "Local OBS",
      description:
        "Open Broadcaster Software, running on a local studio server.",
      children: [
        {
          id: "overlays",
          name: "Overlays",
          description:
            "Browser-based overlays added to the stream in OBS, providing alerts etc., mainly using StreamElements.",
        },
        {
          id: "cameras",
          name: "Cameras",
          description:
            "Live IP cameras around the property, mainly using Axis and OBSBot.",
          children: [
            localBot,
            {
              id: "axis-companion",
              name: "Axis Companion",
              description:
                "Axis IP camera management software allowing PTZ control.",
            },
          ],
        },
        localBot,
      ],
    },
    {
      id: "psynaps",
      name: "Psynaps RTMP Server",
      description:
        "Psynaps Super Stream System, a custom RTMP server for ingesting remote video.",
      children: [
        {
          id: "liveu",
          name: "LiveU Service",
          description:
            "LiveU cloud streaming service, for ingesting remote video from a LiveU Solo.",
          children: [
            {
              id: "liveu-camera",
              name: "Livestream Backpack",
              description:
                "LiveU Solo, a portable video encoder for live streaming, with a DSLR camera.",
            },
          ],
        },
        {
          id: "larix",
          name: "Larix Broadcaster",
          description:
            "Larix Broadcaster, a mobile app for live streaming from a phone.",
          children: [
            {
              id: "larix-camera",
              name: "Mobile Phone",
              description:
                "Mobile phone, with Larix Broadcaster app, for on-the-go streaming.",
            },
          ],
        },
      ],
    },
    {
      id: "bot-cloud-obs",
      name: "Control Bot",
      description:
        "Custom Node.js application allowing control of scene/source swapping from Twitch chat.",
    },
  ],
};

export default steps;

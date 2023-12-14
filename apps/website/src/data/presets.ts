interface Preset {
  description: string;
}

const presets: Record<string, Record<string, Preset>> = {
  pasture: {
    home: {
      description:
        "Default position. Shows most of the open area in front of the barn.",
    },
  },
};

export default presets;

import type { PresetEntry } from "@/data/tech/cameras.types";

export const homePreset = (
  presets: readonly PresetEntry[],
): PresetEntry | undefined =>
  presets.find(
    ([name]) => name.toLocaleLowerCase() == "home".toLocaleLowerCase(),
  ) || presets.toSorted(([, a], [, b]) => a.position.zoom - b.position.zoom)[0];

export const wrapPreset = (
  home: PresetEntry | undefined,
): ((entry: PresetEntry) => PresetEntry) => {
  const wrapPan = (pan: number) => {
    const leftLimit = (home?.[1].position.pan ?? 0) - 180;
    const rightLimit = leftLimit + 360;
    if (pan < leftLimit) return pan + 360;
    if (pan > rightLimit) return pan - 360;
    return pan;
  };

  return ([name, preset]) => [
    name,
    {
      ...preset,
      position: {
        pan: wrapPan(preset.position.pan),
        tilt: preset.position.tilt,
        zoom: preset.position.zoom,
      },
    },
  ];
};

export const sortPresets = (
  presets: readonly PresetEntry[],
): readonly PresetEntry[] => {
  const home = homePreset(presets);
  const wrap = wrapPreset(home);

  const sortKeyGenerator = ([name, preset]: PresetEntry): number => {
    // home preset should always be first
    if (name === home?.[0]) {
      return -Infinity;
    }

    const [, wrapped] = wrap([name, preset]);

    return (
      wrapped.position.pan +
      // if the preset is a "downward" preset put them at the end of the list
      (wrapped.position.tilt < -30 ? 1000 : 0)
    );
  };

  return presets.toSorted((a, b) => sortKeyGenerator(a) - sortKeyGenerator(b));
};

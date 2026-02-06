import type { Preset } from "@/data/tech/cameras.types";

export const sortPresets = (
  presets: readonly [string, Preset][],
): readonly [string, Preset][] => {
  // find a home preset, ideally named home, if not, then the first preset that is zoomed out
  const homePreset =
    presets.find(
      ([name]) => name.toLocaleLowerCase() == "home".toLocaleLowerCase(),
    ) ||
    presets.toSorted(([, a], [, b]) => a.position.zoom - b.position.zoom)[0];

  // use the home location to create a dividing line for logical left/right
  // assuming home is the middle, then the far left would be 180 deg to the left
  // and the right bound would be 180 to the right
  // therefore preset pan values would need to be wrapped to be within that range for sorting
  const wrapPan = (pan: number) => {
    const leftLimit = (homePreset?.[1].position.pan || 0) - 180;
    const rightLimit = leftLimit + 360;
    if (pan < leftLimit) {
      return pan + 360;
    }
    if (pan > rightLimit) {
      return pan - 360;
    }
    return pan;
  };

  const sortKeyGenerator = ([name, preset]: [string, Preset]): number => {
    // home preset should always be first
    if (name === homePreset?.[0]) {
      return -Infinity;
    }

    return (
      wrapPan(preset.position.pan) +
      // if the preset is a "downward" preset put them at the end of the list
      (preset.position.tilt < -30 ? 1000 : 0)
    );
  };

  return presets.toSorted((a, b) => sortKeyGenerator(a) - sortKeyGenerator(b));
};

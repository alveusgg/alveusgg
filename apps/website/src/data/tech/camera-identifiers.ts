// Explicit names shared by the website, legacy chat commands and control-api.
// Unmapped legacy views remain archival; never guess a physical camera target.
export const controlCameraNames = [
  "garden",
  "pushpopoutdoor",
  "pushpopindoor",
  "pushpopcrunch",
  "scorpion",
  "marmosetindoor",
  "marmosetoutdoor",
  "crowoutdoor",
  "crowindoor",
  "georgie",
  "georgiewater",
  "patchy",
  "toast",
  "toastcrunch",
  "noodle",
  "tarantulawall",
  "tarantula",
  "marty",
  "bb",
  "roaches",
  "chickenoutdoor",
  "chickenindoor",
  "wolf",
  "wolfcorner",
  "wolfindoor",
  "wolfswitch",
  "wolfden",
  "wolfden2",
  "pasture",
  "pasturelower",
  "pasturefeeder",
  "emu",
  "emucover",
  "emupond",
  "parrot",
  "macaws",
  "fox",
  "foxcovered",
  "foxindoor",
  "serval",
  "servalcorner",
  "servalindoor",
  "chins",
  "nature",
  "eventenclosure",
  "event",
] as const;

export type ControlCamera = (typeof controlCameraNames)[number];

const aliases: Record<string, ControlCamera> = {
  chicken: "chickenoutdoor",
  crow: "crowoutdoor",
  crowout: "crowoutdoor",
  crowin: "crowindoor",
  marmoset: "marmosetoutdoor",
  marmout: "marmosetoutdoor",
  marmin: "marmosetindoor",
  littles: "parrot",
  parrots: "parrot",
  macaw: "macaws",
  pushpop: "pushpopoutdoor",
  tarantulaptz: "tarantulawall",
  roach: "roaches",
  chin: "chins",
};

export function resolveControlCamera(name: string): ControlCamera | undefined {
  const normalized = name.trim().toLowerCase().replace(/cam$/, "");
  if ((controlCameraNames as readonly string[]).includes(normalized))
    return normalized as ControlCamera;
  return aliases[normalized];
}

export function presetCatalogCamera(name: string) {
  return resolveControlCamera(name) ?? `legacy:${name.trim().toLowerCase()}`;
}

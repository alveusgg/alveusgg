import { z } from "zod";
import fetch from "node-fetch";
import type { FeatureCollection } from "geojson";
import { notEmpty } from "./helpers";

export type Ambassador = z.infer<typeof ambassadorSchema>;
export type Ambassadors = z.infer<typeof ambassadorsSchema>;

export type Facility = z.infer<typeof facilitySchema>;
export type Facilities = z.infer<typeof facilitiesSchema>;

export type Enclosure = z.infer<typeof enclosureSchema>;
export type Enclosures = z.infer<typeof enclosuresSchema>;

export type Cam = z.infer<typeof camSchema>;
export type Cams = z.infer<typeof camsSchema>;

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  label: z.string().optional(),
});

const imagesSchema = z.array(imageSchema);

const linksSchema = z.record(z.string(), z.string().url());

export const ambassadorSchema = z.object({
  name: z.string(),
  species: z.string(),
  scientificName: z.string(),
  sex: z.string(),
  dateOfBirth: z.union([
    z.string().length(0),
    z.string().regex(/\d{4}-\d{2}-\d{2}/),
  ]),
  iucnStatus: z.string(),
  story: z.string(),
  conservationMission: z.string(),
  links: linksSchema.optional(),
  images: imagesSchema.optional(),
});

export const ambassadorsSchema = z.record(z.string(), ambassadorSchema);

const commonFacilityAndEnclosureSchema = z.object({
  label: z.string(),
  costToBuild: z.string().optional(),
  sponsoredBy: z.string().optional(),
  links: linksSchema.optional(),
  images: imagesSchema.optional(),
  ambassadors: z.array(z.string()).optional(),
  nonAmbassadors: z.array(z.string()).optional(),
  cams: z.array(z.string()).optional(),
});

export const facilitySchema = commonFacilityAndEnclosureSchema.and(
  z.object({
    enclosures: z.array(z.string()).optional(),
  })
);

export const facilitiesSchema = z.record(z.string(), facilitySchema);

export const enclosureSchema = commonFacilityAndEnclosureSchema.and(
  z.object({
    facilities: z.array(z.string()).optional(),
  })
);

export const enclosuresSchema = z.record(z.string(), enclosureSchema);

export const camSchema = z.object({
  label: z.string(),
  command: z.string(),
  cams: z.array(z.string()).optional(),
  facilities: z.array(z.string()).optional(),
  ambassadors: z.array(z.string()).optional(),
  nonAmbassadors: z.array(z.string()).optional(),
  links: linksSchema.optional(),
  images: imagesSchema.optional(),
});

export const camsSchema = z.record(z.string(), camSchema);

export async function getAmbassadorsData() {
  const ambassadorsRes = await fetch(
    "https://alveusgg.github.io/data/ambassadors.json"
  );
  return await ambassadorsSchema.parseAsync(await ambassadorsRes.json());
}

export async function getFacilitiesData() {
  const facilitiesRes = await fetch(
    "https://alveusgg.github.io/data/facilities.json"
  );
  return await facilitiesSchema.parseAsync(await facilitiesRes.json());
}

export async function getCamsData() {
  const camsRes = await fetch("https://alveusgg.github.io/data/cams.json");
  return await camsSchema.parseAsync(await camsRes.json());
}

export async function getEnclosuresData() {
  const enclosuresRes = await fetch(
    "https://alveusgg.github.io/data/enclosures.json"
  );
  return await enclosuresSchema.parseAsync(await enclosuresRes.json());
}

export async function getMapData() {
  let mapData: FeatureCollection | null = null;
  try {
    const mapRes = await fetch("https://alveusgg.github.io/data/map.geojson");
    mapData = (await mapRes.json()) as any; // TODO: parse geojson with zod?
  } catch (e) {}

  return mapData;
}

export async function getAllData() {
  let ambassadors: Ambassadors = {};
  let cams: Cams = {};
  let facilities: Facilities = {};
  let enclosures: Enclosures = {};
  let mapData: FeatureCollection = { type: "FeatureCollection", features: [] };

  await Promise.all([
    getAmbassadorsData().then((data) => {
      ambassadors = data;
    }),
    getCamsData().then((data) => {
      cams = data;
    }),
    getFacilitiesData().then((data) => {
      facilities = data;
    }),
    getEnclosuresData().then((data) => {
      enclosures = data;
    }),
    getMapData().then((data) => {
      if (data) {
        mapData = data;
      }
    }),
  ]);

  return { ambassadors, cams, facilities, mapData, enclosures };
}

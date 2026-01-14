import type {
  CarmenGeojsonFeature,
  MaplibreGeocoderApi,
  MaplibreGeocoderApiConfig,
  MaplibreGeocoderFeatureResults,
} from "@maplibre/maplibre-gl-geocoder";
import { Marker } from "maplibre-gl";

import { env } from "@/env";

type Address = {
  municipality?: string;
  city?: string;
  town?: string;
  village?: string;
  region?: string;
  state?: string;
  county?: string;
  country?: string;
};

/**
 * Rounds a coordinate to the desired precision
 * @param coord Longitude or Latitude
 * @param precision Any number.
 * @returns The rounded coord. If the precision is bigger than the coord it just returns the unaltered coord.
 */
export const roundCoord = (coord: number, precision: number) => {
  const coordStr = coord.toString();
  if (coordStr.includes(".")) {
    const decimals = coordStr.split(".")[1];
    if (decimals && decimals.length > 0 && decimals.length > precision) {
      return +coord.toFixed(precision);
    }
  }
  return coord;
};

/**
 * Gets a place name from its coordinates
 * @param lat Latitude
 * @param lon Longitude
 * @returns Place name or empty string if it can't find it.
 */
export const reverseSearch = async (lat: number, lon: number) => {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.append("format", "geojson");
  url.searchParams.append("lat", String(lat));
  url.searchParams.append("lon", String(lon));
  url.searchParams.append("addressdetails", "1");
  url.searchParams.append("accept-language", "en-US,en");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "alveus.gg",
      Referer: env.NEXT_PUBLIC_BASE_URL,
    },
  });
  if (response.ok) {
    const data = await response.json();
    if (data && data.features) {
      return createAddress(data.features[0].properties.address);
    }
  }

  throw new Error("Couldn't search for that place.");
};

/**
 * Forms a nice looking address from the reverse search info.
 * @param address Result of the {@link https://nominatim.org/release-docs/develop/api/Reverse/|API Call}
 * @see {@link https://nominatim.org/release-docs/develop/api/Output/#addressdetails|Address Details}
 * @returns
 */
const createAddress = (address: Address) => {
  const parts = [];

  if (address.municipality) {
    parts.push(address.municipality);
  } else if (address.city) {
    parts.push(address.city);
  } else if (address.town) {
    parts.push(address.town);
  } else if (address.village) {
    parts.push(address.village);
  }

  if (address.region) {
    parts.push(address.region);
  } else if (address.state) {
    parts.push(address.state);
  } else if (address.county) {
    parts.push(address.county);
  }

  if (address.country) {
    parts.push(address.country);
  }

  return parts.join(", ");
};

const forwardGeocode = async (
  config: MaplibreGeocoderApiConfig,
): Promise<MaplibreGeocoderFeatureResults> => {
  const features: CarmenGeojsonFeature[] = [];
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.append("q", String(config.query));
    url.searchParams.append("format", "geojson");
    url.searchParams.append("addressdetails", "1");
    url.searchParams.append("accept-language", "en-US,en");

    const response = await fetch(url);
    const geoData = await response.json();

    for (const feature of geoData.features) {
      const point: CarmenGeojsonFeature = {
        id: feature.properties.placeid,
        type: "Feature",
        geometry: feature.geometry,
        properties: feature.properties,
        place_name: feature.properties.display_name,
        place_type: ["place"],
        text: createAddress(feature.properties.address),
        bbox: feature.bbox,
      };
      features.push(point);
    }
  } catch (e) {
    console.error(`Failed to forwardGeocode with error: ${e}`);
  }

  return {
    type: "FeatureCollection",
    features,
  };
};

const reverseGeocode = async (
  config: MaplibreGeocoderApiConfig,
): Promise<MaplibreGeocoderFeatureResults> => {
  const features: CarmenGeojsonFeature[] = [];
  try {
    if (!config.query || config.query.length != 2)
      return { type: "FeatureCollection", features: [] };

    const lon = config.query[0] as number;
    const lat = config.query[1] as number;

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.append("format", "geojson");
    url.searchParams.append("lat", String(lat));
    url.searchParams.append("lon", String(lon));
    url.searchParams.append("addressdetails", "1");
    url.searchParams.append("accept-language", "en-US,en");

    const response = await fetch(url);
    const geoData = await response.json();

    if (geoData && geoData.features) {
      for (const feature of geoData.features) {
        const point: CarmenGeojsonFeature = {
          id: feature.properties.placeid,
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [lon, lat],
          },
          properties: feature.properties,
          place_name: feature.properties.display_name,
          place_type: ["place"],
          language: "en",
          text: createAddress(feature.properties.address),
        };
        features.push(point);
      }
    }
  } catch (e) {
    console.error(`Failed to reverseGeocode with error: ${e}`);
  }

  return {
    type: "FeatureCollection",
    features,
  };
};

export const geocoderApi: MaplibreGeocoderApi = {
  forwardGeocode,
  reverseGeocode,
};

/**
 * Generates a default marker in Alveus green
 * @see {@link https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MarkerOptions/#type-declaration|Default Marker Options}
 * @returns Marker
 */
export const getDefaultMarker = () =>
  new Marker({ color: "var(--color-alveus-green)" });

import { useEffect, useRef, useState } from "react";
import maplibregl, { GeolocateControl, Map, Marker } from "maplibre-gl";
import type {
  CarmenGeojsonFeature,
  MaplibreGeocoderApi,
  MaplibreGeocoderApiConfig,
  MaplibreGeocoderFeatureResults,
} from "@maplibre/maplibre-gl-geocoder";
import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";
import IconWorld from "@/icons/IconWorld";
import IconX from "@/icons/IconX";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css"; // Searchbox CSS
import "maplibre-gl/dist/maplibre-gl.css"; // Import the MapLibre CSS
import config from "../../../../tailwind.config";
import { CheckboxField } from "./CheckboxField";

// TODO: Check for WebGL? https://maplibre.org/maplibre-gl-js/docs/examples/check-for-support/
// TODO: when loading full data if slow then https://maplibre.org/maplibre-style-spec/layers/#icon-allow-overlap turn to true (from https://maplibre.org/maplibre-gl-js/docs/guides/large-data/#visualising-the-data)

// FIXME?: some locations (like LA, San Diego or Madeira) go outside the borders when rounding coords, and they land in water next to the country or in a totally different country.
// FIXME?: check if rounded coords are off the country and round 1 less decimal? so precission-1 and check recursively until you land on the original site? That defeats the purpose of rounding in the first place.

/**
 * @param name Unique name of the element
 * @param initiallyHidden Initial state of the checkbox that handles the map visibility
 * @param textToShow Text that appears next to the checkbox
 * @param initialZoom Self describing
 * @param allowMultipleMarkers Do we allow multiple markers in this map?
 * @param coordsPrecission Number of decimals that we'll keep on the coordinates
 *
 * For the rest and additional @see {@link https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/|Map Options}
 */
export type MapPickerFieldProps = {
  name: string;
  initiallyHidden?: boolean;
  textToShow?: string;
  center?: [lon: number, lat: number];
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  antialias?: boolean;
  allowMultipleMarkers?: boolean;
  coordsPrecission?: number;
  defaultLocation?: MapLocation;
  onLocationChange: (userSelectedLocation: MapLocation) => void;
};

export type MapLocation = {
  latitude: number;
  longitude: number;
  location: string;
};

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
 * Map field with integrated searchbox and geolocalization capabilities
 *
 * @see {@link https://maplibre.org/maplibre-gl-js/docs/API/|MapLibre API Docs}
 * @see {@link https://maplibre.org/maplibre-gl-geocoder/types/MaplibreGeocoderApi.html|Geocoder API (Search function)}
 * @returns
 */
export const MapPickerField = ({
  defaultLocation,
  initiallyHidden = defaultLocation?.location ? false : true,
  textToShow = "Show map",
  minZoom = 0,
  maxZoom = 22,
  initialZoom = defaultLocation?.location ? maxZoom : 1,
  center = defaultLocation?.location
    ? [defaultLocation.longitude, defaultLocation.latitude]
    : [0, 0],
  antialias = false,
  allowMultipleMarkers = false,
  coordsPrecission = 2,
  onLocationChange,
}: MapPickerFieldProps) => {
  const mapContainerRef = useRef(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [showMap, setShowMap] = useState(!initiallyHidden);
  const [postLocation, setPostLocation] = useState(
    defaultLocation || ({} as MapLocation),
  );
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!showMap || !mapContainerRef.current) {
      return;
    }

    const map = new Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        name: "Alveus Show and Tell",
        center: center,
        zoom: initialZoom,
        sources: {
          "raster-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            minzoom: minZoom,
            maxzoom: maxZoom + 1, // We add one level of rendering zoom so the text is crisp, the actual zoom won't be affected.
          },
        },
        layers: [
          {
            id: "simple-tiles",
            type: "raster",
            source: "raster-tiles",
          },
        ],
      },
      antialias: antialias,
    });

    if (defaultLocation?.location) {
      if (!allowMultipleMarkers && markersRef.current.length > 0) {
        markersRef.current
          ?.at(0)
          ?.setLngLat([defaultLocation?.longitude, defaultLocation?.latitude]);
      } else {
        const marker = new Marker({
          color: config.theme.colors["alveus-green"].DEFAULT,
          draggable: true,
        })
          .setLngLat([defaultLocation?.longitude, defaultLocation?.latitude])
          .addTo(map)
          .on("dragstart", () => (isDraggingRef.current = true))
          .on("dragend", () => {
            handleLocationSet(
              map,
              marker.getLngLat().lat,
              marker.getLngLat().lng,
            );
            isDraggingRef.current = false;
          });
        markersRef.current.push(marker);
      }

      const newPostLocation = {
        latitude: defaultLocation.latitude,
        longitude: defaultLocation.longitude,
        location: defaultLocation.location,
      };
      setPostLocation(newPostLocation);
      onLocationChange(newPostLocation);
    }

    // Search Service
    const geocoderApi: MaplibreGeocoderApi = {
      forwardGeocode: async (
        config: MaplibreGeocoderApiConfig,
      ): Promise<MaplibreGeocoderFeatureResults> => {
        const features: CarmenGeojsonFeature[] = [];
        try {
          const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geoData=1&addressdetails=1`;
          const response = await fetch(request);
          const geoData = await response.json();

          for (const feature of geoData.features) {
            const point: CarmenGeojsonFeature = {
              id: feature.properties.placeid,
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [feature.bbox[0], feature.bbox[1]],
              },
              properties: feature.properties,
              place_name: feature.properties.display_name,
              place_type: ["place"],
              text: feature.properties.display_name,
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
      },

      reverseGeocode: async (
        config: MaplibreGeocoderApiConfig,
      ): Promise<MaplibreGeocoderFeatureResults> => {
        const features: CarmenGeojsonFeature[] = [];
        try {
          if (!config.query || config.query.length != 2)
            return { type: "FeatureCollection", features: [] };

          const lon = config.query[0] as number;
          const lat = config.query[1] as number;

          const request = `https://nominatim.openstreetmap.org/reverse?format=geojson&lat=${lat}&lon=${lon}&addressdetails=1`;
          const response = await fetch(request);
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
                text: feature.properties.display_name,
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
      },
    };

    // Add searchbox to map
    map.addControl(
      new MaplibreGeocoder(geocoderApi, {
        maplibregl,
        marker: false,
        showResultsWhileTyping: true,
        showResultMarkers: {
          color: config.theme.colors["alveus-tan"][500],
        },
        // collapsed: true, // TODO: Weird on mobile?
      }).on(
        "result",
        ({
          result: {
            geometry: { coordinates },
          },
        }) => {
          handleLocationSet(map, coordinates[1], coordinates[0]); // FIXME: pasar localización del mismo objeto del que he obtenido coords
        },
      ),
    );

    // Add geolocation button
    map.addControl(
      new GeolocateControl({
        showAccuracyCircle: false,
        showUserLocation: false,
      }).on("geolocate", ({ coords }) => {
        handleLocationSet(map, coords.latitude, coords.longitude); // FIXME: pasar localización del mismo objeto del que he obtenido coords
      }),
    );

    // When clicking on the map
    map.on("mouseup", ({ lngLat: { lat, lng } }) => {
      // If the click is part of a click and drag to move around, ignore it.
      if (isDraggingRef.current) return;
      handleLocationSet(map, lat, lng);
    });

    // To avoid setting post location on mouse Dragging.
    map.on("dragstart", () => (isDraggingRef.current = true));
    map.on("dragend", () => (isDraggingRef.current = false));
    map.on("zoom", () => {
      // I don't like this solution, but the ScrollZoomHandler doesn't have this functionality.
      if (map.getZoom() > maxZoom) {
        map.setZoom(maxZoom);
      }
    });

    // Clean up on component unmount
    return () => {
      handleLocationClear();
      map.remove();
    };
  }, [showMap]);

  const handleLocationClear = () => {
    setPostLocation({} as MapLocation);
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  };

  const roundCoord = (coord: number, precission: number) => {
    const coordStr = coord.toString();
    if (coordStr.includes(".")) {
      const decimals = coordStr.split(".")[1];
      if (decimals && decimals.length > 0) {
        return +coord.toFixed(precission);
      }
    }
    return coord;
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

  /**
   * Gets a place name from its coordinates
   * @param coords
   * @param defaultName
   * @returns
   */
  const reverseSearch = async (lat: number, lon: number) => {
    const request = `https://nominatim.openstreetmap.org/reverse?format=geojson&lat=${lat}&lon=${lon}&addressdetails=1`;
    const response = await fetch(request);
    const data = await response.json();

    if (data && data.features) {
      return createAddress(data.features[0].properties.address);
    }
    return "";
  };

  /**
   * Main method that handles marker position and coordinate rounding
   * @param coords Coords where we want to put the marker
   * @param map The rendered map
   */
  const handleLocationSet = async (
    map: Map,
    lat: number,
    lon: number,
    location?: string,
  ) => {
    const roundedCoords = {
      lat: roundCoord(lat, coordsPrecission),
      lon: roundCoord(lon, coordsPrecission),
    };

    if (!location) {
      location = await reverseSearch(roundedCoords.lat, roundedCoords.lon);
    }

    if (!allowMultipleMarkers && markersRef.current.length > 0) {
      // There's already a marker on the map and we don't allow multiple, so we just update its location.
      markersRef.current?.at(0)?.setLngLat(roundedCoords);
    } else {
      // There are no markers yet or we allow multiple, so let's create one.
      const marker = new Marker({
        color: config.theme.colors["alveus-green"].DEFAULT,
        draggable: true,
      })
        .setLngLat(roundedCoords)
        .addTo(map)
        .on("dragstart", () => (isDraggingRef.current = true))
        .on("dragend", () => {
          handleLocationSet(
            map,
            marker.getLngLat().lat,
            marker.getLngLat().lng,
          );
          isDraggingRef.current = false;
        });
      markersRef.current.push(marker);
    }

    const newPostLocation = {
      latitude: roundedCoords.lat,
      longitude: roundedCoords.lon,
      location: location,
    };

    setPostLocation(newPostLocation);
    onLocationChange(newPostLocation);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <CheckboxField
          className="mr-2"
          onChange={setShowMap}
          defaultSelected={showMap}
        >
          {textToShow}
        </CheckboxField>

        {
          <div className="flex items-center">
            <IconWorld className="h-6 w-6"></IconWorld>
            {showMap && postLocation.location
              ? postLocation.location
              : "No post location set"}
            {showMap && postLocation.location && (
              <button
                className="px-2"
                type="button"
                onClick={handleLocationClear}
              >
                <IconX className="h-6 w-6" />
              </button>
            )}
          </div>
        }
      </div>
      {showMap && (
        <div className="h-[500px] w-full overflow-hidden rounded-lg">
          <div
            ref={mapContainerRef}
            style={{
              width: "100%",
              height: "500px",
              visibility: showMap ? "visible" : "hidden",
            }}
          />
        </div>
      )}
    </>
  );
};

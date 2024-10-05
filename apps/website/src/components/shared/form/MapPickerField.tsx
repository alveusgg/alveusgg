import { useCallback, useEffect, useRef, useState } from "react";
import maplibregl, { GeolocateControl, Map, type Marker } from "maplibre-gl";
import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";
import IconWorld from "@/icons/IconWorld";
import IconX from "@/icons/IconX";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css"; // Searchbox CSS
import "maplibre-gl/dist/maplibre-gl.css"; // Import the MapLibre CSS
import {
  geocoderApi,
  getDefaultMarker,
  reverseSearch,
  roundCoord,
} from "@/utils/geolocation";
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
  minZoom = 1,
  maxZoom = 24,
  initialZoom = defaultLocation?.location ? maxZoom : 1,
  center = defaultLocation?.location
    ? [defaultLocation.longitude, defaultLocation.latitude]
    : [0, 0],
  antialias = true,
  allowMultipleMarkers = false,
  coordsPrecission = 2,
  onLocationChange,
}: MapPickerFieldProps) => {
  const [showMap, setShowMap] = useState(!initiallyHidden);
  const [postLocation, setPostLocation] = useState(
    defaultLocation || ({} as MapLocation),
  );

  const mapContainerRef = useRef(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const isDraggingRef = useRef(false);

  /**
   * Creates a map with the props provided to the Component
   */
  const createMap = useCallback(() => {
    console.log("CREATING MAP");
    if (mapContainerRef.current) {
      const map = new Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          name: "Alveus Map",
          center,
          zoom: initialZoom,
          sources: {
            "raster-tiles": {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              minzoom: minZoom,
              maxzoom: maxZoom < 24 ? maxZoom + 1 : maxZoom, // We add one level of rendering zoom so the text is crisp, the actual zoom won't be affected.
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
        antialias,
      })
        .addControl(
          new MaplibreGeocoder(geocoderApi, {
            maplibregl,
            marker: false,
            showResultsWhileTyping: true,
            showResultMarkers: {
              color: config.theme.colors["alveus-tan"][500],
            },
            debounceSearch: 1000, // No heavy uses (an absolute maximum of 1 request per second) < https://operations.osmfoundation.org/policies/nominatim/.
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
        )
        // Add geolocation button
        .addControl(
          new GeolocateControl({
            showAccuracyCircle: false,
            showUserLocation: false,
          }).on("geolocate", ({ coords }) => {
            handleLocationSet(map, coords.latitude, coords.longitude); // FIXME: pasar localización del mismo objeto del que he obtenido coords
          }),
        )

        // When clicking on the map
        .on("mouseup", ({ lngLat: { lat, lng } }) => {
          // If the click is part of a click and drag to move around, ignore it.
          if (isDraggingRef.current) return;
          handleLocationSet(map, lat, lng);
        })
        // To avoid setting post location on mouse Dragging.
        .on("dragstart", () => (isDraggingRef.current = true))
        .on("dragend", () => (isDraggingRef.current = false))
        .on("zoom", () => {
          // I don't like this solution, but the ScrollZoomHandler doesn't have this functionality.
          if (map.getZoom() > maxZoom!) {
            map.setZoom(maxZoom!);
          }
        });
      return map;
    }
  }, [antialias, center, initialZoom, minZoom, maxZoom]);

  /**
   * Clears the markers and resets the location
   */
  const handleLocationClear = useCallback(() => {
    setPostLocation({} as MapLocation);
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  /**
   * Main method that handles marker position and coordinate rounding
   * @param coords Coords where we want to put the marker
   * @param map The rendered map
   */
  const handleLocationSet = useCallback(
    async (map: Map, lat: number, lon: number, location?: string) => {
      console.log("HANDLING LOCATION SET");
      const roundedCoords = {
        lat: roundCoord(lat, coordsPrecission),
        lon: roundCoord(lon, coordsPrecission),
      };
      if (!location) {
        console.log("SEARCHING PLACE NAME...");
        location = await reverseSearch(roundedCoords.lat, roundedCoords.lon);
        console.log(`GOT ${location}`);
      }

      if (!allowMultipleMarkers && markersRef.current.length > 0) {
        // There's already a marker on the map and we don't allow multiple, so we just update its location.
        markersRef.current[0]?.setLngLat(roundedCoords);
      } else {
        // There are no markers yet or we allow multiple, so let's create one.
        const marker = getDefaultMarker(roundedCoords, mapRef.current);

        if (marker) {
          marker
            .on("dragstart", () => (isDraggingRef.current = true))
            .on("dragend", () => {
              console.log("DRAG ENDED ON MARKER 2");
              handleLocationSet(
                map,
                marker.getLngLat().lat,
                marker.getLngLat().lng,
              );
              isDraggingRef.current = false;
            });
          markersRef.current.push(marker);
        }
      }

      const newPostLocation = {
        latitude: roundedCoords.lat,
        longitude: roundedCoords.lon,
        location: location,
      };

      setPostLocation(newPostLocation);
      onLocationChange(newPostLocation);
    },
    [coordsPrecission, allowMultipleMarkers, onLocationChange],
  );

  useEffect(() => {
    // Ensure map container exists and map hasn't been initialized yet
    if (!showMap || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = createMap();
    if (map) {
      mapRef.current = map;
      if (defaultLocation?.location) {
        handleLocationSet(
          map,
          defaultLocation.latitude,
          defaultLocation.longitude,
          defaultLocation.location,
        );
      }
    }

    // Clean up on component unmount
    return () => {
      handleLocationClear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [showMap]);

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

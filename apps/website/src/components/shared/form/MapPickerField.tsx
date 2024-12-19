import { useCallback, useEffect, useRef, useState } from "react";
import maplibregl, { GeolocateControl, Map, type Marker } from "maplibre-gl";
import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";
import tailwindConfig from "@alveusgg/data/src/tailwind";
import "maplibre-gl/dist/maplibre-gl.css"; // Actual map CSS
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css"; // Map search box CSS

import {
  geocoderApi,
  getDefaultMarker,
  reverseSearch,
  roundCoord,
} from "@/utils/geolocation";
import mapStyle from "@/data/map-style";

import IconWorld from "@/icons/IconWorld";
import IconX from "@/icons/IconX";

import { CheckboxField } from "./CheckboxField";

/**
 * @param name Unique name of the element
 * @param initiallyHidden Initial state of the checkbox that handles the map visibility
 * @param textToShow Text that appears next to the checkbox
 * @param initialZoom Self describing
 * @param allowMultipleMarkers Do we allow multiple markers in this map?
 * @param coordsPrecision Number of decimals that we'll keep on the coordinates
 *
 * For the rest and additional @see {@link https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/|Map Options}
 */
export type MapPickerFieldProps = {
  name: string;
  initiallyHidden?: boolean;
  textToShow?: string;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  antialias?: boolean;
  allowMultipleMarkers?: boolean;
  coordsPrecision?: number;
  initialLocation?: MapLocation;
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
 * @see {@link https://support.garmin.com/en-US/?faq=hRMBoCTy5a7HqVkxukhHd8|Must see before changing default precision: "Coords accuracy based on their decimals"}
 * @returns
 */
export const MapPickerField = ({
  initialLocation,
  initiallyHidden = initialLocation?.location ? false : true,
  textToShow = "Show map",
  minZoom = 1,
  maxZoom = 24,
  initialZoom = initialLocation?.location ? maxZoom : 1,
  antialias = true,
  allowMultipleMarkers = false,
  coordsPrecision = 2, // 2 is around 1.1km precision
  onLocationChange,
}: MapPickerFieldProps) => {
  const [showMap, setShowMap] = useState(!initiallyHidden);
  const [postLocation, setPostLocation] = useState(
    initialLocation || ({} as MapLocation),
  );

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map>(null);
  const markersRef = useRef<Marker[]>([]);
  const isDraggingRef = useRef(false);

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
      const roundedCoords = {
        lat: roundCoord(lat, coordsPrecision),
        lon: roundCoord(lon, coordsPrecision),
      };
      if (!location) {
        try {
          location = await reverseSearch(roundedCoords.lat, roundedCoords.lon);
        } catch (e) {
          console.error(`Failed to reverseGeocode with error: ${e}`);
          return;
        }
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
    [coordsPrecision, allowMultipleMarkers, onLocationChange],
  );

  useEffect(() => {
    // Ensure map container exists and map hasn't been initialized yet
    if (!showMap || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = new Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: initialLocation?.location
        ? [initialLocation.longitude, initialLocation.latitude]
        : [0, 0],
      zoom: initialZoom,
      minZoom,
      maxZoom,
      antialias,
    })
      .addControl(
        new MaplibreGeocoder(geocoderApi, {
          maplibregl,
          marker: false,
          showResultsWhileTyping: true,
          showResultMarkers: {
            color: tailwindConfig.theme.colors["alveus-tan"][500],
          },
          debounceSearch: 1000, // No heavy uses (an absolute maximum of 1 request per second) < https://operations.osmfoundation.org/policies/nominatim/.
        }).on(
          "result",
          ({
            result: {
              geometry: { coordinates },
              text,
            },
          }) => {
            handleLocationSet(map, coordinates[1], coordinates[0], text);
          },
        ),
      )
      // Add geolocation button
      .addControl(
        new GeolocateControl({
          showAccuracyCircle: false,
          showUserLocation: false,
        }).on("geolocate", ({ coords }) => {
          handleLocationSet(map, coords.latitude, coords.longitude);
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
      .on("dragend", () => (isDraggingRef.current = false));

    if (map) {
      mapRef.current = map;
      if (initialLocation?.location) {
        handleLocationSet(
          map,
          initialLocation.latitude,
          initialLocation.longitude,
          initialLocation.location,
        );
      }
    }

    // Clean up on component unmount
    return () => {
      handleLocationClear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [
    antialias,
    initialZoom,
    maxZoom,
    minZoom,
    showMap,
    initialLocation,
    handleLocationClear,
    handleLocationSet,
  ]);

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

        <div className="flex items-center">
          <IconWorld className="size-6"></IconWorld>
          {showMap && postLocation.location
            ? postLocation.location
            : "No post location set"}
          {showMap && postLocation.location && (
            <button
              className="px-2"
              type="button"
              onClick={handleLocationClear}
            >
              <IconX className="size-6" />
            </button>
          )}
        </div>
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

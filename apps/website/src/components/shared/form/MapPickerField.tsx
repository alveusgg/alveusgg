import MaplibreGeocoder, {
  type CarmenGeojsonFeature,
} from "@maplibre/maplibre-gl-geocoder";
import maplibregl, {
  GeolocateControl,
  Map,
  type MapMouseEvent,
  type Marker,
} from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";

import mapStyle from "@/data/map-style";

import {
  geocoderApi,
  getDefaultMarker,
  reverseSearch,
  roundCoord,
} from "@/utils/geolocation";

import Box from "@/components/content/Box";

import IconWorld from "@/icons/IconWorld";
import IconX from "@/icons/IconX";

import { CheckboxField } from "./CheckboxField";

import "maplibre-gl/dist/maplibre-gl.css";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";

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
  initialLocation?: MapLocation;
  initiallyHidden?: boolean;
  textToShow?: string;
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  allowMultipleMarkers?: boolean;
  coordsPrecision?: number;
  onLocationChange: (userSelectedLocation?: MapLocation) => void;
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
  allowMultipleMarkers = false,
  coordsPrecision = 2, // 2 is around 1.1km precision
  onLocationChange,
}: MapPickerFieldProps) => {
  const [showMap, setShowMap] = useState(!initiallyHidden);
  const [postLocation, setPostLocation] = useState(initialLocation);

  const mapRef = useRef<Map>(null);
  const geocoderRef = useRef<MaplibreGeocoder>(null);
  const geolocateRef = useRef<GeolocateControl>(null);
  const markersRef = useRef<Marker[]>([]);
  const isDraggingRef = useRef(false);

  /**
   * Clears the markers and resets the location
   */
  const handleLocationClear = useCallback(() => {
    setPostLocation(undefined);
    onLocationChange(undefined);

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, [onLocationChange]);

  /**
   * Main method that handles marker position and coordinate rounding
   * @param coords Coords where we want to put the marker
   * @param map The rendered map
   */
  const handleLocationSet = useCallback(
    async (
      lat: number,
      lon: number,
      location?: string,
      options: { isInitialSet?: boolean } = {},
    ) => {
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
        const map = mapRef.current;
        if (map) {
          // There are no markers yet or we allow multiple, so let's create one.
          const marker = getDefaultMarker();
          marker.setLngLat(roundedCoords).setDraggable(true).addTo(map);
          marker.on("dragstart", () => (isDraggingRef.current = true));
          marker.on("dragend", () => {
            handleLocationSet(marker.getLngLat().lat, marker.getLngLat().lng);
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
      if (!options.isInitialSet) onLocationChange(newPostLocation);
    },
    [coordsPrecision, allowMultipleMarkers, onLocationChange],
  );

  /**
   * Toggles the map visibility and resets location if hiding
   */
  const handleShowMapChange = useCallback(
    (newShowMap: boolean) => {
      setShowMap(newShowMap);

      if (newShowMap) {
        if (initialLocation?.location) {
          handleLocationSet(
            initialLocation.latitude,
            initialLocation.longitude,
            initialLocation.location,
          );
        }
      } else {
        handleLocationClear();
      }
    },
    [initialLocation, handleLocationSet, handleLocationClear],
  );

  const mapContainerCleanup = useCallback(() => {
    mapRef.current?.remove();
    mapRef.current = null;
    geocoderRef.current = null;
    geolocateRef.current = null;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  }, []);

  const mapContainerRef = useCallback(
    (node: HTMLDivElement) => {
      if (mapRef.current && node !== mapRef.current.getContainer()) {
        mapContainerCleanup();
      }

      const isNewMapInstance = !mapRef.current;
      mapRef.current ??= new Map({
        container: node,
        style: mapStyle,
        center: initialLocation?.location
          ? [initialLocation.longitude, initialLocation.latitude]
          : [0, 0],
        zoom: initialZoom,
        canvasContextAttributes: {
          antialias: true,
        },
      });
      mapRef.current.setMinZoom(minZoom);
      mapRef.current.setMaxZoom(maxZoom);

      // Add, or update the callback for, the geocoder input
      geocoderRef.current ??= new MaplibreGeocoder(geocoderApi, {
        maplibregl,
        marker: false,
        showResultsWhileTyping: true,
        showResultMarkers: {
          color: "var(--color-alveus-tan-500)",
        },
        debounceSearch: 1000, // No heavy uses (an absolute maximum of 1 request per second) < https://operations.osmfoundation.org/policies/nominatim/.
      });
      const geocoderHandle = ({
        result: { geometry, text },
      }: {
        result: CarmenGeojsonFeature;
      }) => {
        if (geometry.type !== "Point") return;

        const [lon, lat] = geometry.coordinates;
        if (typeof lat !== "number" || typeof lon !== "number") return;

        handleLocationSet(lat, lon, text);
      };
      geocoderRef.current.on("result", geocoderHandle);
      if (isNewMapInstance) mapRef.current.addControl(geocoderRef.current);

      // Add, or update the callback for, the geolocate button
      geolocateRef.current ??= new GeolocateControl({
        showAccuracyCircle: false,
        showUserLocation: false,
      });
      const geolocateHandle = ({ coords }: GeolocationPosition) => {
        handleLocationSet(coords.latitude, coords.longitude);
      };
      geolocateRef.current.on("geolocate", geolocateHandle);
      if (isNewMapInstance) mapRef.current.addControl(geolocateRef.current);

      // Add, or update the callback for, mouse clicks on the map
      const mouseupHandle = ({ lngLat: { lat, lng } }: MapMouseEvent) => {
        // If the click is part of a click and drag to move around, ignore it.
        if (isDraggingRef.current) return;
        handleLocationSet(lat, lng);
      };
      mapRef.current.on("mouseup", mouseupHandle);

      // To avoid setting post location on mouse dragging
      if (isNewMapInstance) {
        mapRef.current.on("dragstart", () => (isDraggingRef.current = true));
        mapRef.current.on("dragend", () => (isDraggingRef.current = false));
      }

      if (isNewMapInstance && initialLocation?.location) {
        handleLocationSet(
          initialLocation.latitude,
          initialLocation.longitude,
          initialLocation.location,
          { isInitialSet: true },
        );
      }

      return () => {
        geocoderRef.current?.off("result", geocoderHandle);
        geolocateRef.current?.off("geolocate", geolocateHandle);
        mapRef.current?.off("mouseup", mouseupHandle);
      };
    },
    [
      initialLocation,
      initialZoom,
      minZoom,
      maxZoom,
      handleLocationSet,
      mapContainerCleanup,
    ],
  );

  useEffect(() => () => mapContainerCleanup(), [mapContainerCleanup]);

  return (
    <>
      <div className="flex items-center justify-between">
        <CheckboxField
          className="mr-2"
          onChange={handleShowMapChange}
          defaultSelected={showMap}
        >
          {textToShow}
        </CheckboxField>

        <div className="flex items-center">
          <IconWorld className="size-6"></IconWorld>
          {showMap && postLocation?.location
            ? postLocation.location
            : "No post location set"}
          {showMap && postLocation?.location && (
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
        <Box className="p-0">
          <div
            ref={mapContainerRef}
            onKeyDown={(e) => {
              // If enter is pressed, don't bubble up to submit the form
              if (e.key === "Enter") e.preventDefault();
            }}
            className="h-128"
          />
        </Box>
      )}
    </>
  );
};

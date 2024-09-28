import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { GeolocateControl, LngLat, Map, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css"; // Import the MapLibre CSS
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css"; // Searchbox CSS
import type {
  MaplibreGeocoderApi,
  MaplibreGeocoderApiConfig,
} from "@maplibre/maplibre-gl-geocoder";
import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";
import { round } from "lodash";
import IconX from "@/icons/IconX";
import IconWorld from "@/icons/IconWorld";
import { CheckboxField } from "./CheckboxField";

// TODO: Check for WebGL? https://maplibre.org/maplibre-gl-js/docs/examples/check-for-support/
// TODO: implement suggestions. No free services with suggestions?????

// FUTURE: if multiple markers... what is the location shown? First? Last? Do we let the user pick one marker (it changes color) and that's the one?
// FUTURE: export map style to a json file with multiple styles depending on the map application

/**
 * @param initiallyHidden Initial state of the checkbox that handles the map visibility
 * @param textToShow Text that appears next to the checkbox
 * @param center Pair of coordinates where the map is initially focused
 * @param initialZoom Self describing
 * @param minZoom The smaller the number the further away you start from earth [0-24]
 * @param maxZoom The bigger the number the more accuracy we allow [0-24]
 * @param antialias It makes the map look better (with a small hit in performance)
 * @param allowMultipleMarkers Do we allow multiple markers in this map?
 * @param coordsPrecission Number of decimals that we'll keep on both coordinates
 */
export type MapPickerFieldProps = {
  name: string;
  initiallyHidden?: boolean;
  textToShow?: string;
  center?: [number, number]; // [LAT, LNG]
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  antialias?: boolean;
  allowMultipleMarkers?: boolean;
  coordsPrecission?: number;
  defaultLocation?: string;
};

type Coords = {
  lat: number;
  lng: number;
};

export type MapLocation = {
  coords: Coords;
  displayName: string;
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

const validCoords = (coords: [number, number]) => {
  return (
    coords[0] >= -90 && coords[0] <= 90 && coords[1] >= -180 && coords[1] <= 180
  );
};

/**
 * Map field with integrated searchbox and geolocalization capabilities
 *
 * @see {@link https://maplibre.org/maplibre-gl-js/docs/API/|MapLibre API Docs}
 * @see {@link https://maplibre.org/maplibre-gl-geocoder/types/MaplibreGeocoderApi.html|Geocoder API (Search function)}
 * @returns
 */
export const MapPickerField = ({
  initiallyHidden = true,
  textToShow = "Show map",
  center = [0, 0],
  initialZoom = 1,
  minZoom = 0,
  maxZoom = 20,
  antialias = false,
  allowMultipleMarkers = false,
  coordsPrecission = 2,
  defaultLocation,
}: MapPickerFieldProps) => {
  if (!validCoords(center)) {
    center = [0, 0];
  }

  const mapContainerRef = useRef(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [showMap, setShowMap] = useState(!initiallyHidden);
  const [postLocation, setPostLocation] = useState<MapLocation>(
    defaultLocation ? JSON.parse(defaultLocation) : {},
  );
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(isDragging);

  // To avoid stale closure, onmousemove doesn't work to capture dragging.
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;

    const map = new Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        name: "Alveus",
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

    // Search Service
    const geocoderApi: MaplibreGeocoderApi = {
      forwardGeocode: async (config: MaplibreGeocoderApiConfig) => {
        const features = [];
        try {
          const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geoData=1&addressdetails=1`;
          const response = await fetch(request);
          const geoData = await response.json();

          for (const feature of geoData.features) {
            const center = [
              feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
              feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
            ];

            const point = {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: center,
              },
              place_name: feature.properties.display_name,
              properties: feature.properties,
              text: feature.properties.display_name,
              place_type: ["place"],
              center,
              id: feature.properties.placeid,
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
    };

    // Add searchbox to map
    map.addControl(
      new MaplibreGeocoder(geocoderApi, {
        maplibregl,
        marker: false,
      }).on("result", ({ result }) => {
        handleLocationSet(
          {
            lat: result.geometry.coordinates[1],
            lng: result.geometry.coordinates[0],
          },
          map,
        );
      }),
    );

    // Add geolocation button
    map.addControl(
      new GeolocateControl({
        showAccuracyCircle: false,
        showUserLocation: false,
      }).on("geolocate", ({ coords }) => {
        handleLocationSet({ lat: coords.latitude, lng: coords.longitude }, map);
      }),
    );

    // When clicking on the map
    map.on("mouseup", ({ lngLat }) => {
      // If the click is part of a click and drag to move around, ignore it.
      if (isDraggingRef.current) return;

      handleLocationSet({ lat: lngLat.lat, lng: lngLat.lng }, map);
    });

    // To avoid setting post location on mouse Dragging.
    map.on("dragstart", () => setIsDragging(true));
    map.on("dragend", () => setIsDragging(false));
    map.on("zoom", () => {
      // I don't like this solution.
      // TODO? https://maplibre.org/maplibre-gl-js/docs/API/classes/ScrollZoomHandler/
      if (map.getZoom() > maxZoom) {
        map.setZoom(maxZoom);
      }
    });

    // Clean up on component unmount
    return () => {
      map.remove();
      handleLocationClear();
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
  const reverseSearch = async (coords: Coords) => {
    const request = `https://nominatim.openstreetmap.org/reverse?format=geojson&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1`;
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
  const handleLocationSet = async (coords: Coords, map: Map) => {
    const roundedCoords = {
      lat: roundCoord(coords.lat, coordsPrecission),
      lng: roundCoord(coords.lng, coordsPrecission),
    };
    const displayName = await reverseSearch(roundedCoords);

    if (!allowMultipleMarkers && markersRef.current.length > 0) {
      // There's already a marker on the map and we don't allow multiple, so we just update its location.
      markersRef.current?.at(0)?.setLngLat(roundedCoords);
    } else {
      // There are no markers yet or we allow multiple, so let's create one.
      const marker = new Marker({
        color: "#636A60", // FIXME: alveus-green
        draggable: true,
      })
        .setLngLat(roundedCoords)
        .addTo(map)
        .on("dragstart", () => setIsDragging(true))
        .on("dragend", () => {
          handleLocationSet(
            {
              lat: marker.getLngLat().lat,
              lng: marker.getLngLat().lng,
            },
            map,
          );
          setIsDragging(false);
        });
      markersRef.current.push(marker);
    }

    setPostLocation({
      coords: { lat: roundedCoords.lat, lng: roundedCoords.lng },
      displayName: displayName,
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <CheckboxField
          className="mr-2"
          onChange={setShowMap}
          defaultSelected={!initiallyHidden}
        >
          {textToShow}
        </CheckboxField>

        {
          <div className="flex items-center">
            <IconWorld className="h-6 w-6"></IconWorld>
            {showMap && postLocation.displayName
              ? postLocation.displayName
              : "No post location set"}
            {showMap && postLocation.displayName && (
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
        <div
          ref={mapContainerRef}
          style={{
            width: "100%",
            height: "500px",
            visibility: showMap ? "visible" : "hidden",
          }}
        />
      )}
    </>
  );
};

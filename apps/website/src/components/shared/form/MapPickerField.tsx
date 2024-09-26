import { useEffect, useRef, useState } from "react";
import maplibregl, { LngLat, Map, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css"; // Import the MapLibre CSS
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css"; // Searchbox CSS
import type {
  MaplibreGeocoderApi,
  MaplibreGeocoderApiConfig,
} from "@maplibre/maplibre-gl-geocoder";
import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";
import IconX from "@/icons/IconX";
import IconWorld from "@/icons/IconWorld";
import { CheckboxField } from "./CheckboxField";

export type MapPickerFieldProps = {
  initiallyHidden?: boolean;
  textToShow?: string;
  center?: [number, number]; // [LAT, LNG]
  zoom?: number;
  antialias?: boolean;
  allowMultipleMarkers?: boolean;
};

type MapLocation = {
  lat: number;
  lng: number;
  name: string;
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
  zoom = 1,
  antialias = false,
  allowMultipleMarkers = false,
}: MapPickerFieldProps) => {
  if (!validCoords(center)) {
    center = [0, 0];
  }

  const mapContainerRef = useRef(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [showMap, setShowMap] = useState(!initiallyHidden);
  const [postLocation, setPostLocation] = useState({} as MapLocation);
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
        zoom: zoom,
        sources: {
          "raster-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            minzoom: 0,
            maxzoom: 20, // TODO: 20 enables way too much precission
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
    // TODO: move from nominatim to pelias to get suggestions?
    // FIXME: Lupa y Cruz fuera de lugar
    // forwardGeocode: converts a human readable place into coordinates
    // reverseGeocode: converts coordinates into a human readable place
    const geocoderApi: MaplibreGeocoderApi = {
      forwardGeocode: async (config: MaplibreGeocoderApiConfig) => {
        const features = [];
        try {
          const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geoData=1&addressdetails=1`;
          const response = await fetch(request);
          const geoData = await response.json();

          for (const feature of geoData.features) {
            // 0: Top Left
            // 1: Top Right
            // 2: Bottom Left
            // 3: Bottom Right
            const center = [
              feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
              feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
            ];

            console.log(feature);
            // TODO: better filter? test markers on residential areas, city centers, downtown zoos, etc
            if (feature.properties.type === "house") {
              center[0] = center[0].toFixed(2);
              center[1] = center[1].toFixed(2);
            }

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
      // TODO: implement reverseGeocode
      // TODO: implement suggestions. No free services with suggestions?????
    };

    // Add searchbox to map
    // FIXME: error geocoderApi => reverseGeocode => API DOC
    map.addControl(new MaplibreGeocoder(geocoderApi, { maplibregl }));
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
    );

    map.on("mouseup", ({ lngLat }) => {
      if (isDraggingRef.current) return;

      // TODO: Reverse geocode to get place name
      const markerLocation = lngLat.wrap();

      if (!allowMultipleMarkers && markersRef.current.length > 0) {
        // There's already a marker on the map, we just update its location.
        markersRef.current?.at(0)?.setLngLat(markerLocation);
      } else {
        // There are no markers yet or we allow multiple, so let's create one.
        const marker = new maplibregl.Marker({
          color: "#636A60", // FIXME: alveus-green
          draggable: true,
        })
          .setLngLat(markerLocation)
          .addTo(map)
          .on("dragstart", () => setIsDragging(true))
          .on("dragend", () => {
            setPostLocation({
              lat: marker.getLngLat().lat,
              lng: marker.getLngLat().lng,
              name: "CUSTOM LOCATION BY USER",
            });
            setIsDragging(false);
          });
        // We add it to the marker list for the future
        markersRef.current.push(marker);
      }

      setPostLocation({
        lat: markerLocation.lat,
        lng: markerLocation.lng,
        name: "CLICKED",
      });
    });

    // To avoid setting post location on mouse Dragging. Possible headache: if the mouse moves 1 pixel it counts as dragging and no marker is going to get created.
    map.on("dragstart", () => setIsDragging(true));
    map.on("dragend", () => setIsDragging(false));

    // Clean up on component unmount
    return () => {
      map.remove();
      markersRef.current = [];
      setPostLocation({} as MapLocation);
    };
  }, [showMap]);

  const handleLocationClear = () => {
    setPostLocation({} as MapLocation);
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
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
            {showMap && postLocation.name
              ? JSON.stringify(postLocation)
              : "No post location set"}
            {showMap && postLocation.name && (
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

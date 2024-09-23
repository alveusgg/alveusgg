import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css"; // Import the MapLibre CSS
import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";

export type MapPickerFieldProps = {
  hidden?: boolean;
  center?: [number, number]; // [LAT, LONG]
  zoom?: number;
  antialias?: boolean;
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
 * @returns
 */
export const MapPickerField = ({
  hidden = false,
  center = [0, 0],
  zoom = 1,
  antialias = false,
}: MapPickerFieldProps) => {
  const mapContainerRef = useRef(null);

  if (!validCoords(center)) {
    center = [0, 0];
  }

  useEffect(() => {
    console.log("BUILDING MAP");

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
            maxzoom: 20,
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
    // FIXME: Lupa y Cruz fuera de lugar
    const geocoderApi = {
      forwardGeocode: async (config) => {
        const features = [];
        try {
          const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`;
          const response = await fetch(request);
          const geojson = await response.json();
          console.log(JSON.stringify(geojson));
          for (const feature of geojson.features) {
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
            };
            features.push(point);
          }
        } catch (e) {
          console.error(`Failed to forwardGeocode with error: ${e}`);
        }

        return {
          features,
        };
      },
    };

    // Add searchbox to map
    // FIXME: error geocoderApi => reverseGeocode => API DOC
    map.addControl(
      new MaplibreGeocoder(geocoderApi, {
        maplibregl,
      }),
    );

    /*
        // FIXME: useEffect, map.flyTo
        const browserLocation = navigator.geolocation;
        if (browserLocation) {
            console.log("USER LOC: " + JSON.stringify(browserLocation.getCurrentPosition));
            browserLocation.getCurrentPosition((position) => {
                map.setCenter([position.coords.latitude, position.coords.longitude]);
                map.setZoom(5);
            });
        } else {
            console.log("USER DIDNT ALLOW GEOLOC");
        }
        */

    // Clean up on component unmount
    return () => {
      console.log("REMOVING MAP");
      map.remove();
    };
  }, []);

  return (
    // TODO: if hidden then dropdown
    <>
      {hidden && <div>HIDDEN</div>}
      <div
        id="mapContainer"
        ref={mapContainerRef}
        style={{ width: "100%", height: "500px" }} // You can adjust the map size
      />
    </>
  );
};

import { useEffect, useState } from "react";
import { Map, Marker, Popup } from "maplibre-gl";
import type {
  LocationFeature,
  LocationResponse,
} from "@/pages/api/show-and-tell/locations";
import "maplibre-gl/dist/maplibre-gl.css"; // Import the MapLibre CSS
import IconArrowUp from "@/icons/IconArrowUp";
import IconArrowDown from "@/icons/IconArrowDown";
import config from "../../../tailwind.config";
import Heading from "../content/Heading";
import { Button } from "../shared/form/Button";

export const CommunityMap = () => {
  const [showMap, setShowMap] = useState(false);
  const [locations, setLocations] = useState<LocationResponse["features"]>([]);
  const [uniqueLocationsCount, setUniqueLocationsCount] = useState(0);
  const [uniqueCountriesCount, setUniqueCountriesCount] = useState(0);
  const [calculatingData, setCalculatingData] = useState(true);

  const MAX_ZOOM = 10;

  useEffect(() => {
    const fetchLocations = async () => {
      const response = await fetch("/api/show-and-tell/locations");
      if (response.ok) {
        const data = await response.json();
        setLocations(data.features);

        const uniqueLocations = new Set(
          data.features.map((l: LocationFeature) => l.properties.location),
        );
        setUniqueLocationsCount(uniqueLocations.size);

        const uniqueCountries = new Set(
          data.features.map((l: LocationFeature) =>
            l.properties.location?.substring(
              l.properties.location.lastIndexOf(","),
            ),
          ),
        );
        setUniqueCountriesCount(uniqueCountries.size);
      }
      setCalculatingData(false);
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (!showMap) return;

    const map = new Map({
      container: "mapVisualizerContainer",
      style: {
        version: 8,
        name: "Alveus Community Map",
        center: [0, 0],
        zoom: 1,
        sources: {
          "raster-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            minzoom: 0,
            maxzoom: MAX_ZOOM + 1,
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
      antialias: true,
    });

    map.on("zoom", () => {
      if (map.getZoom() > MAX_ZOOM) {
        map.setZoom(MAX_ZOOM);
      }
    });

    // TODO: fullscreen eats ram and cpu cores for breakfast, gotta tinker a bit.
    // .addControl(new FullscreenControl());

    locations.forEach((p: LocationFeature) => {
      const postUrl = `/admin/show-and-tell/review/${p.properties.id}/preview`;
      const popupHtml = `<strong>${p.properties.displayName ?? "A chatter"}</strong> was here!<br>Check their <a target="_blank" href="${postUrl}"><u>post</u></a>.`;

      // Marker on hover popout S&T entry post relevant info (entry.displayName from entry.location)
      new Marker({
        color: config.theme.colors["alveus-green"].DEFAULT,
        draggable: false,
      })
        .setLngLat([p.geometry.coordinates[0], p.geometry.coordinates[1]])
        .setPopup(
          new Popup({
            offset: 24,
            className: "text-alveus-green flex", // FIXME: add alveus' classes
          }).setHTML(popupHtml),
        )
        .addTo(map);
    });

    // Clean up on component unmount
    return () => {
      map.remove();
    };
  }, [showMap]);

  const handleButtonClick = () => {
    setShowMap(!showMap);
  };

  return (
    <>
      <div className="w-full md:w-3/5">
        <Heading>Community Map</Heading>
        <p className="pb-4 text-lg">Reaching every part of the Globe!</p>

        {!calculatingData &&
          uniqueLocationsCount > 0 &&
          uniqueCountriesCount > 0 && (
            <p className="pb-4">
              A total of {locations.length} locations have been shared,
              including {uniqueLocationsCount} unique locations across{" "}
              {uniqueCountriesCount} countries.
            </p>
          )}
      </div>
      <Button onClick={handleButtonClick}>
        {showMap ? "Hide map" : "Show map"}
        {showMap ? <IconArrowUp /> : <IconArrowDown />}
      </Button>
      {showMap && (
        <div className="h-[600px] w-full overflow-hidden rounded-lg">
          <div
            id="mapVisualizerContainer"
            style={{ width: "100%", height: "600px" }}
          />
        </div>
      )}
    </>
  );
};

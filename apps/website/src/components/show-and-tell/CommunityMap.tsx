import { useCallback, useEffect, useRef, useState } from "react";
import { Map, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css"; // Import the MapLibre CSS

import IconArrowUp from "@/icons/IconArrowUp";
import IconArrowDown from "@/icons/IconArrowDown";
import { trpc } from "@/utils/trpc";
import { MessageBox } from "@/components/shared/MessageBox";
import { ShowAndTellEntry } from "@/components/show-and-tell/ShowAndTellEntry";
import type { LocationFeature } from "@/server/db/show-and-tell";

import config from "../../../tailwind.config";

import { Button } from "../shared/form/Button";
import { ModalDialog } from "../shared/ModalDialog";
import Heading from "../content/Heading";

const MAX_ZOOM = 8;

export const CommunityMap = () => {
  const communityMapData = trpc.showAndTell.communityMapData.useQuery();
  const [showMap, setShowMap] = useState(false);

  // To show post info on marker click
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const features = communityMapData.data?.features;

  const mapRef = useRef<Map | null>(null);

  const renderFeaturesOnMap = useCallback(
    (features?: Array<LocationFeature>) => {
      const map = mapRef.current;
      if (!map || !features) return;

      features?.forEach((feature) => {
        // Marker on hover popout S&T entry post relevant info (entry.displayName from entry.location)
        const marker = new Marker({
          color: config.theme.colors["alveus-green"].DEFAULT,
          draggable: false,
        })
          .setLngLat([feature.longitude, feature.latitude])
          .addTo(map);

        marker.getElement().setAttribute("data-id", feature.id);
        marker
          .getElement()
          .addEventListener("click", () => setSelectedMarkerId(feature.id));
      });
    },
    [],
  );

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
            attribution:
              "© OpenStreetMap contributors - Open Database License",
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
    }).on("zoom", () => {
      if (map.getZoom() > MAX_ZOOM) {
        map.setZoom(MAX_ZOOM);
      }
    });

    // TODO: fullscreen eats ram and cpu cores for breakfast and messes with the fullscreen option of the posts, gotta tinker a bit.
    // .addControl(new FullscreenControl());

    mapRef.current = map;

    renderFeaturesOnMap(features);

    // Clean up on component unmount
    return () => {
      map.remove();
    };
  }, [features, renderFeaturesOnMap, showMap]);

  useEffect(() => {
    renderFeaturesOnMap(features);
  }, [features, renderFeaturesOnMap]);

  const handleButtonClick = () => {
    setShowMap(!showMap);
  };

  const entryQuery = trpc.showAndTell.getEntry.useQuery(
    String(selectedMarkerId),
    {
      enabled: !!selectedMarkerId,
    },
  );

  return (
    <>
      <div className="w-full md:w-3/5">
        <Heading>Community Map</Heading>
        <p className="pb-4 text-lg">Reaching every part of the Globe!</p>

        {communityMapData.data && (
          <p className="pb-4">
            A total of {communityMapData.data.features.length} locations have
            been shared, including {communityMapData.data.uniqueLocationsCount}{" "}
            unique locations across {communityMapData.data.uniqueCountriesCount}{" "}
            countries.
          </p>
        )}
      </div>
      <Button onClick={handleButtonClick}>
        {showMap ? "Hide map" : "Show map"}
        {showMap ? <IconArrowUp /> : <IconArrowDown />}
      </Button>
      {showMap && (
        <div className="h-[800px] w-full overflow-hidden rounded-lg">
          <div
            id="mapVisualizerContainer"
            style={{ width: "100%", height: "800px" }}
          />
          <ModalDialog
            title=""
            panelClassName="max-w-fit"
            closeLabel="Return to Community Map"
            isOpen={!!selectedMarkerId}
            closeModal={() => setSelectedMarkerId(null)}
          >
            <div className="container min-h-[70vh] min-w-[70vw]">
              {entryQuery.error && (
                <MessageBox variant="failure">
                  Failed to load Show and Tell entry!
                </MessageBox>
              )}
              {entryQuery.isLoading && <p>Loading...</p>}
              {entryQuery.data && (
                <ShowAndTellEntry
                  entry={entryQuery.data}
                  isPresentationView={false}
                />
              )}
            </div>
          </ModalDialog>
        </div>
      )}
    </>
  );
};

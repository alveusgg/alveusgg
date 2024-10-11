import { useCallback, useEffect, useRef, useState } from "react";
import { Map, type GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css"; // Import the MapLibre CSS

import { env } from "@/env";

import { trpc } from "@/utils/trpc";
import { MessageBox } from "@/components/shared/MessageBox";
import { ShowAndTellEntry } from "@/components/show-and-tell/ShowAndTellEntry";
import type { LocationFeature } from "@/server/db/show-and-tell";
import mapStyle from "@/data/map-style";

import { ModalDialog } from "../shared/ModalDialog";

const MAX_ZOOM = 8;

type CommunityMapProps = {
  features: Array<LocationFeature> | undefined;
};

export function CommunityMap({ features }: CommunityMapProps) {
  // To show post info on marker click
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const mapRef = useRef<Map | null>(null);

  const renderFeaturesOnMap = useCallback(
    async (features?: Array<LocationFeature>) => {
      const map = mapRef.current;
      if (!map || !features) return;

      map.on("load", async () => {
        const source = map.getSource("features") as GeoJSONSource | undefined;
        if (!source) return;

        source.setData({
          type: "FeatureCollection",
          features: features.map((feature) => ({
            type: "Feature",
            properties: {
              id: feature.id,
              name: feature.location,
            },
            geometry: {
              type: "Point",
              coordinates: [feature.longitude, feature.latitude],
            },
          })),
        });
      });
    },
    [],
  );

  useEffect(() => {
    const map = new Map({
      container: "mapVisualizerContainer",
      style: mapStyle,
      center: [0, 15],
      zoom: 1,
      minZoom: 0,
      maxZoom: MAX_ZOOM + 1,
      antialias: true,
    })
      .on("zoom", () => {
        if (map.getZoom() > MAX_ZOOM) {
          map.setZoom(MAX_ZOOM);
        }
      })
      .on("load", async () => {
        map.addSource("features", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        renderFeaturesOnMap(features);

        const image = await map.loadImage(
          env.NEXT_PUBLIC_BASE_URL + "/assets/map-pin.png",
        );
        map.addImage("custom-marker", image.data);

        map.addLayer({
          id: "features",
          type: "symbol",
          source: "features",
          layout: {
            "icon-image": "custom-marker",
            "icon-allow-overlap": true,
            "icon-size": 1,
          },
        });
      })
      .on("click", "features", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;

        setSelectedMarkerId(feature.properties.id);
      })
      .on("mouseenter", "features", () => {
        map.getCanvas().style.cursor = "pointer";
      })
      .on("mouseleave", "features", () => {
        map.getCanvas().style.cursor = "";
      });

    mapRef.current = map;

    // Clean up on component unmount
    return () => {
      map.remove();
    };
  }, [features, renderFeaturesOnMap]);

  useEffect(() => {
    renderFeaturesOnMap(features);
  }, [features, renderFeaturesOnMap]);

  const entryQuery = trpc.showAndTell.getEntry.useQuery(
    String(selectedMarkerId),
    {
      enabled: !!selectedMarkerId,
    },
  );

  return (
    <>
      <div
        id="mapVisualizerContainer"
        className="h-[60vh] max-h-[800px] w-full overflow-hidden rounded-xl border-4 border-alveus-green bg-gray-400 shadow-2xl"
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
    </>
  );
}

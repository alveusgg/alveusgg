import { type GeoJSONSource, Map, Popup } from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";

import type { LocationFeature } from "@/server/db/show-and-tell";

import mapStyle from "@/data/map-style";

import { trpc } from "@/utils/trpc";

import Section from "@/components/content/Section";
import { MessageBox } from "@/components/shared/MessageBox";
import { ModalDialog } from "@/components/shared/ModalDialog";
import { ShowAndTellEntry } from "@/components/show-and-tell/ShowAndTellEntry";

import mapPin from "@/assets/show-and-tell/map-pin.png";

import "maplibre-gl/dist/maplibre-gl.css";

const MAX_ZOOM = 8;
const TOOLTIP_MIN_ZOOM = 3;

type CommunityMapProps = {
  features: Array<LocationFeature> | undefined;
  postsFromANewLocation: Set<string>;
};

export function CommunityMap({
  features,
  postsFromANewLocation,
}: CommunityMapProps) {
  // To show post info on marker click
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const mapRef = useRef<Map>(null);

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
    const popup = new Popup({
      closeButton: false,
      closeOnClick: false,
      anchor: "left",
      offset: [20, 0],
    });

    const map = new Map({
      container: "mapVisualizerContainer",
      style: mapStyle,
      center: [0, 15],
      zoom: 1,
      minZoom: 0,
      maxZoom: MAX_ZOOM,
      canvasContextAttributes: {
        antialias: true,
      },
    });

    map.on("load", async () => {
      map.addSource("features", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      renderFeaturesOnMap(features);

      const image = await map.loadImage(mapPin.src);
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
    });

    map.on("click", "features", (e) => {
      const feature = e.features?.[0];
      if (!feature) return;

      setSelectedMarkerId(feature.properties.id);
    });

    map.on("mouseenter", "features", (e) => {
      map.getCanvas().style.cursor = "pointer";
      const feature = e.features?.[0];
      if (!feature) return;

      if (
        feature.geometry.type === "Point" &&
        map.getZoom() >= TOOLTIP_MIN_ZOOM
      ) {
        const coordinates = feature.geometry.coordinates.slice() as [
          number,
          number,
        ];
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        popup
          .setLngLat(coordinates)
          .setHTML(feature.properties.name)
          .addTo(map);
      }
    });

    map.on("mouseleave", "features", () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
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
        className="alveus-community-map h-[60vh] max-h-[800px] w-full overflow-hidden rounded-xl border-4 border-alveus-green bg-gray-400 shadow-2xl"
      />

      <ModalDialog
        title=""
        panelClassName="max-w-fit"
        closeLabel="Return to Community Map"
        isOpen={!!selectedMarkerId}
        closeModal={() => setSelectedMarkerId(null)}
      >
        <Section className="min-h-[40vh] min-w-[70vw] rounded-xl py-4">
          {entryQuery.error && (
            <MessageBox variant="failure">
              Failed to load Show and Tell entry!
            </MessageBox>
          )}
          {entryQuery.isPending && (
            <p className="p-4 text-center text-xl">Loading...</p>
          )}
          {entryQuery.data && (
            <ShowAndTellEntry
              entry={entryQuery.data}
              newLocation={postsFromANewLocation.has(entryQuery.data.id)}
              withHeight={false}
            />
          )}
        </Section>
      </ModalDialog>
    </>
  );
}

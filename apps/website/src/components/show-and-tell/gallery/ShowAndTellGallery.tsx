import type { JSX } from "react";
import { useMemo, useState } from "react";

import type { LinkAttachment } from "@alveusgg/database";

import type { ImageAttachmentWithFileStorageObject } from "@/server/db/show-and-tell";

import { classes } from "@/utils/classes";

import Carousel from "@/components/content/Carousel";
import Lightbox from "@/components/content/Lightbox";
import {
  VideoItemEmbed,
  VideoItemPreview,
} from "@/components/show-and-tell/gallery/VideoItem";

import { ImageItemEmbed, ImageItemPreview } from "./ImageItem";

export const ShowAndTellGallery = ({
  isPresentationView,
  imageAttachments,
  videoAttachments,
}: {
  isPresentationView: boolean;
  imageAttachments: Array<ImageAttachmentWithFileStorageObject>;
  videoAttachments: Array<LinkAttachment>;
}) => {
  const [lightboxOpen, setLightboxOpen] = useState<string>();

  const lightboxItems = useMemo(() => {
    const imageItems: [string, JSX.Element][] = imageAttachments.map(
      (image) => [
        image.id,
        <ImageItemEmbed key={image.id} imageAttachment={image} />,
      ],
    );

    const videoItems: [string, JSX.Element][] = videoAttachments.map(
      (video) => [
        video.id,
        <VideoItemEmbed key={video.id} videoAttachment={video} />,
      ],
    );

    return Object.fromEntries([...videoItems, ...imageItems]);
  }, [videoAttachments, imageAttachments]);

  const carouselItems = useMemo(() => {
    const videoItems: [string, JSX.Element][] = videoAttachments.map(
      (video) => [
        video.id,
        <VideoItemPreview
          key={video.id}
          videoAttachment={video}
          lightbox={setLightboxOpen}
          preview
        />,
      ],
    );

    const imageItems: [string, JSX.Element][] = imageAttachments.map(
      (image) => [
        image.id,
        <ImageItemPreview
          key={image.id}
          imageAttachment={image}
          lightbox={setLightboxOpen}
          preview
        />,
      ],
    );

    return Object.fromEntries([...videoItems, ...imageItems]);
  }, [videoAttachments, imageAttachments]);

  const carouselCount = Object.keys(carouselItems).length;

  return (
    <div className="flex flex-1 flex-col">
      {carouselCount > 0 && (
        <Carousel
          className="flex-1"
          // Negative margin to allow padding for shadows
          wrapperClassName={classes(
            "flex-1",
            isPresentationView ? "-mb-4 pb-6" : "-mb-12 pb-16",
          )}
          auto={null}
          itemClassName={classes(
            "flex basis-full flex-col justify-center p-4",
            carouselCount >= 2 && "md:basis-1/2",
            carouselCount >= 3 && "lg:basis-1/3",
            carouselCount >= 4 && "xl:basis-1/4",
          )}
          items={carouselItems}
        />
      )}

      {carouselCount > 1 && (
        <div className="my-2 flex flex-row flex-wrap items-center justify-center gap-2">
          {videoAttachments.map((video) => (
            <VideoItemPreview
              key={video.id}
              videoAttachment={video}
              lightbox={setLightboxOpen}
            />
          ))}

          {imageAttachments.map((image) => (
            <ImageItemPreview
              key={image.id}
              imageAttachment={image}
              lightbox={setLightboxOpen}
            />
          ))}

          <Lightbox
            open={lightboxOpen}
            onClose={() => setLightboxOpen(undefined)}
            items={lightboxItems}
            className={classes(isPresentationView && "w-[80%]")}
          />
        </div>
      )}
    </div>
  );
};

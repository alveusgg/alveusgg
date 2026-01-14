import type { JSX } from "react";
import { useMemo, useState } from "react";

import type { ShowAndTellEntryAttachments } from "@/server/db/show-and-tell";

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
  attachments,
}: {
  isPresentationView: boolean;
  attachments: ShowAndTellEntryAttachments;
}) => {
  const [lightboxOpen, setLightboxOpen] = useState<string>();

  const lightboxItems = useMemo(
    () =>
      Object.fromEntries(
        attachments
          .map<[string, JSX.Element] | null>((att) => {
            if (att.attachmentType === "image" && att.imageAttachment) {
              return [
                att.imageAttachment.id,
                <ImageItemEmbed
                  key={att.imageAttachment.id}
                  imageAttachment={att.imageAttachment}
                />,
              ];
            }

            if (att.attachmentType === "video" && att.linkAttachment) {
              return [
                att.linkAttachment.id,
                <VideoItemEmbed
                  key={att.linkAttachment.id}
                  videoAttachment={att.linkAttachment}
                />,
              ];
            }

            return null;
          })
          .filter((item) => item !== null),
      ),
    [attachments],
  );

  const carouselItems = useMemo(
    () =>
      Object.fromEntries(
        attachments
          .map<[string, JSX.Element] | null>((att) => {
            if (att.attachmentType === "image" && att.imageAttachment) {
              return [
                att.imageAttachment.id,
                <ImageItemPreview
                  key={att.imageAttachment.id}
                  imageAttachment={att.imageAttachment}
                  lightbox={setLightboxOpen}
                  preview
                />,
              ];
            }

            if (att.attachmentType === "video" && att.linkAttachment) {
              return [
                att.linkAttachment.id,
                <VideoItemPreview
                  key={att.linkAttachment.id}
                  videoAttachment={att.linkAttachment}
                  lightbox={setLightboxOpen}
                  preview
                />,
              ];
            }

            return null;
          })
          .filter((item) => item !== null),
      ),
    [attachments],
  );

  const thumbnailItems = useMemo(
    () =>
      attachments
        .map<JSX.Element | null>((att) => {
          if (att.attachmentType === "image" && att.imageAttachment) {
            return (
              <ImageItemPreview
                key={att.imageAttachment.id}
                imageAttachment={att.imageAttachment}
                lightbox={setLightboxOpen}
              />
            );
          }

          if (att.attachmentType === "video" && att.linkAttachment) {
            return (
              <VideoItemPreview
                key={att.linkAttachment.id}
                videoAttachment={att.linkAttachment}
                lightbox={setLightboxOpen}
              />
            );
          }

          return null;
        })
        .filter((item) => item !== null),
    [attachments],
  );

  const carouselCount = Object.keys(carouselItems).length;

  return (
    <div className="flex flex-1 flex-col">
      {carouselCount > 0 && (
        <>
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

          <Lightbox
            open={lightboxOpen}
            onClose={() => setLightboxOpen(undefined)}
            items={lightboxItems}
            className={classes(isPresentationView && "w-[80%]")}
          />
        </>
      )}

      {carouselCount > 1 && (
        <div className="my-2 flex flex-row flex-wrap items-center justify-center gap-2">
          {thumbnailItems}
        </div>
      )}
    </div>
  );
};

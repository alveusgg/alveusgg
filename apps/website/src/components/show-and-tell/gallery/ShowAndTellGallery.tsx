import Image from "next/image";
import type { JSX } from "react";
import { useMemo, useState } from "react";

import type { LinkAttachment } from "@alveusgg/database";

import type { ImageAttachmentWithFileStorageObject } from "@/server/db/show-and-tell";

import { classes } from "@/utils/classes";
import { createImageUrl } from "@/utils/image";

import Carousel from "@/components/content/Carousel";
import Lightbox from "@/components/content/Lightbox";
import {
  VideoItemEmbed,
  VideoItemPreview,
} from "@/components/show-and-tell/gallery/VideoItem";

import IconInformationCircle from "@/icons/IconInformationCircle";

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
        <div key={image.id} className="flex h-full flex-col">
          <div
            className="mx-auto flex max-h-full max-w-full grow"
            style={{
              aspectRatio: `${image.fileStorageObject?.imageMetadata?.width || 1920} / ${image.fileStorageObject?.imageMetadata?.height || 1080}`,
            }}
          >
            <Image
              src={image.url}
              width={image.fileStorageObject?.imageMetadata?.width || 1920}
              height={image.fileStorageObject?.imageMetadata?.height || 1080}
              alt={image.alternativeText}
              quality={90}
              draggable={false}
              className="my-auto h-auto max-h-full w-full rounded-xl bg-alveus-green-800 shadow-xl"
              style={{
                aspectRatio: `${image.fileStorageObject?.imageMetadata?.width || 1920} / ${image.fileStorageObject?.imageMetadata?.height || 1080}`,
              }}
            />
          </div>

          {image.caption && (
            <p className="my-4 text-center text-balance text-alveus-tan md:mb-0 lg:mt-8">
              {image.caption}
            </p>
          )}
        </div>,
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
        <a
          key={image.id}
          href={createImageUrl({
            src: image.url,
            width: 1920,
            quality: 90,
          })}
          onClick={(e) => {
            e.preventDefault();
            setLightboxOpen(image.id);
          }}
          draggable={false}
          className="flex items-center justify-center select-none"
        >
          <figure className="group/carousel-item relative flex items-center justify-center overflow-hidden rounded-lg bg-black text-white shadow-xl transition hover:scale-102 hover:shadow-2xl">
            <Image
              src={image.url}
              width={600}
              height={600}
              alt={image.alternativeText}
              draggable={false}
              className="pointer-events-none max-h-[40vh] min-h-[100px] w-auto object-cover select-none"
            />
            {image.caption && (
              <>
                <div className="absolute right-0 bottom-0 m-2 flex flex-row items-center gap-1 opacity-100 drop-shadow-lg transition-opacity duration-200 group-hover/carousel-item:opacity-0">
                  caption <IconInformationCircle className="size-5" />
                </div>
                <figcaption className="absolute inset-0 top-auto flex items-center justify-center bg-black/80 p-2 leading-tight opacity-0 transition-opacity duration-200 group-hover/carousel-item:opacity-100">
                  {image.caption}
                </figcaption>
              </>
            )}
          </figure>
        </a>,
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
            <a
              key={image.id}
              href={createImageUrl({
                src: image.url,
                width: 1920,
                quality: 90,
              })}
              onClick={(e) => {
                e.preventDefault();
                setLightboxOpen(image.id);
              }}
              className="group relative flex items-center justify-center select-none"
            >
              <Image
                loading="lazy"
                width={100}
                height={100}
                draggable={false}
                className="pointer-events-none aspect-square size-14 rounded-sm object-cover shadow-lg"
                src={image.url}
                alt={image.alternativeText}
                title={image.title}
              />
            </a>
          ))}

          <Lightbox
            open={lightboxOpen}
            onClose={() => setLightboxOpen(undefined)}
            items={lightboxItems}
          />
        </div>
      )}
    </div>
  );
};

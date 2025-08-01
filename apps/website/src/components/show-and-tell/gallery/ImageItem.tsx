import Image from "next/image";

import type { ImageAttachmentWithFileStorageObject } from "@/server/db/show-and-tell";

import { classes } from "@/utils/classes";
import { createImageUrl } from "@/utils/image";

import Link from "@/components/content/Link";

import IconInformationCircle from "@/icons/IconInformationCircle";

type ImageItemPreviewProps = {
  imageAttachment: ImageAttachmentWithFileStorageObject;
  lightbox: (id: string) => void;
  preview?: boolean;
};

export const ImageItemPreview = ({
  imageAttachment,
  lightbox: setLightboxOpen,
  preview = false,
}: ImageItemPreviewProps) => (
  <Link
    href={createImageUrl({
      src: imageAttachment.url,
      width: 1920,
      quality: 90,
    })}
    external
    onClick={(e) => {
      e.preventDefault();
      setLightboxOpen(imageAttachment.id);
    }}
    draggable={false}
    className="flex items-center justify-center select-none"
    custom
  >
    <figure className="group/carousel-item relative flex items-center justify-center overflow-hidden rounded-lg bg-black text-white shadow-xl transition hover:scale-102 hover:shadow-2xl">
      <Image
        src={imageAttachment.url}
        width={preview ? 600 : 100}
        height={preview ? 600 : 100}
        alt={imageAttachment.alternativeText}
        draggable={false}
        className={classes(
          "pointer-events-none object-cover select-none",
          preview
            ? "max-h-[40vh] min-h-[100px] w-auto"
            : "aspect-square size-14",
        )}
      />

      {preview && imageAttachment.caption && (
        <>
          <div className="absolute right-0 bottom-0 m-2 flex flex-row items-center gap-1 opacity-100 drop-shadow-lg transition-opacity duration-200 group-hover/carousel-item:opacity-0">
            Caption <IconInformationCircle className="size-5" />
          </div>
          <figcaption className="absolute inset-0 top-auto flex items-center justify-center bg-black/80 p-2 leading-tight opacity-0 transition-opacity duration-200 group-hover/carousel-item:opacity-100">
            {imageAttachment.caption}
          </figcaption>
        </>
      )}
    </figure>
  </Link>
);

type ImageItemEmbedProps = {
  imageAttachment: ImageAttachmentWithFileStorageObject;
};

export const ImageItemEmbed = ({ imageAttachment }: ImageItemEmbedProps) => {
  return (
    <div className="flex h-full flex-col">
      <div
        className="mx-auto flex max-h-full min-h-0 max-w-full shrink grow"
        style={{
          aspectRatio: `${imageAttachment.fileStorageObject?.imageMetadata?.width || 1920} / ${imageAttachment.fileStorageObject?.imageMetadata?.height || 1080}`,
        }}
      >
        <Image
          src={imageAttachment.url}
          width={
            imageAttachment.fileStorageObject?.imageMetadata?.width || 1920
          }
          height={
            imageAttachment.fileStorageObject?.imageMetadata?.height || 1080
          }
          alt={imageAttachment.alternativeText}
          quality={90}
          draggable={false}
          className="my-auto h-auto max-h-full w-full rounded-xl bg-alveus-green-800 shadow-xl"
          style={{
            aspectRatio: `${imageAttachment.fileStorageObject?.imageMetadata?.width || 1920} / ${imageAttachment.fileStorageObject?.imageMetadata?.height || 1080}`,
          }}
        />
      </div>

      {imageAttachment.caption && (
        <p className="my-4 shrink-0 text-center text-balance text-alveus-tan md:mb-0 lg:mt-8">
          {imageAttachment.caption}
        </p>
      )}
    </div>
  );
};

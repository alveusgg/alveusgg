import type { MouseEventHandler, MutableRefObject } from "react";
import React, { useCallback, useEffect, useId, useMemo, useRef } from "react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import Image from "next/image";

import {
  parseVideoUrl,
  validateNormalizedVideoUrl,
  videoPlatformConfigs,
} from "@/utils/video-urls";
import { getDefaultPhotoswipeLightboxOptions } from "@/utils/photoswipe";
import { createImageUrl } from "@/utils/image";

import { useConsent } from "@/hooks/consent";

import Carousel from "@/components/content/Carousel";
import { VideoItem } from "@/components/show-and-tell/gallery/VideoItem";
import type { ShowAndTellEntryWithAttachments } from "@/components/show-and-tell/ShowAndTellEntry";
import IconInformationCircle from "@/icons/IconInformationCircle";

export function ShowAndTellGallery({
  isPresentationView,
  lightboxParentRef,
  imageAttachments,
  videoAttachments,
}: {
  isPresentationView: boolean;
  lightboxParentRef: MutableRefObject<HTMLElement | null>;
  imageAttachments: Array<
    NonNullable<
      ShowAndTellEntryWithAttachments["attachments"][number]["imageAttachment"]
    >
  >;
  videoAttachments: Array<
    NonNullable<
      ShowAndTellEntryWithAttachments["attachments"][number]["linkAttachment"]
    >
  >;
}) {
  const { update: updateConsent } = useConsent();

  const lightboxRef = useRef<PhotoSwipeLightbox>();
  const photoswipeId = `photoswipe-${useId().replace(/\W/g, "")}`;
  useEffect(() => {
    const defaultConfig = getDefaultPhotoswipeLightboxOptions();
    const lightboxParent = isPresentationView
      ? lightboxParentRef?.current
      : null;
    const lightbox = new PhotoSwipeLightbox({
      ...defaultConfig,
      gallery: `#${photoswipeId}`,
      children: "a[data-pswp-type]",
      appendToEl: lightboxParent || defaultConfig.appendToEl,
      mainClass: lightboxParent ? "alveus-sat-pswp" : undefined,
      padding: {
        top: 0,
        right: 40,
        bottom: 0,
        left: 40,
      },
      getViewportSizeFn: lightboxParent
        ? () => ({
            x: document.documentElement.clientWidth * 0.8,
            y: window.innerHeight,
          })
        : undefined,
    });

    lightbox.addFilter("itemData", (itemData) => ({
      ...itemData,
      iframeUrl: itemData.element?.dataset.iframeUrl,
      consent: itemData.element?.dataset.consent,
    }));

    lightbox.on("contentLoad", (e) => {
      const { content } = e;
      if (content.type === "iframe") {
        e.preventDefault();

        // Ensure the user has consented to YouTube
        if (content.data.consent)
          updateConsent({ [content.data.consent]: true });

        content.element = document.createElement("div");
        content.element.className =
          "pointer-events-none flex flex-col items-center h-full p-0 md:p-4 lg:p-8 " +
          (lightboxParent ? "w-[80%] mr-[20%]" : "w-[calc(100%-80px)]");

        // Create our video wrapper
        const wrapper = document.createElement("div");
        wrapper.className = `flex items-center justify-center h-full w-full pswp--${photoswipeId}-wrapper`;
        content.element.appendChild(wrapper);

        // Create our iframe
        const iframe = document.createElement("iframe");
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "no-referrer";
        iframe.allow = "fullscreen; encrypted-media";
        iframe.setAttribute("sandbox", "allow-same-origin allow-scripts");
        iframe.draggable = false;
        iframe.className = `pointer-events-auto w-[calc(100%-80px)] mx-auto aspect-video select-none`;
        iframe.src = content.data.iframeUrl;

        // Register the photoswipe load bindings
        iframe.addEventListener("load", () => {
          content.onLoaded();
        });
        iframe.addEventListener("error", () => {
          content.onError();
        });

        // Append the iframe
        wrapper.appendChild(iframe);
      }
    });

    lightbox.on("uiRegister", () => {
      lightbox.pswp?.ui?.registerElement({
        name: "alveus-caption",
        order: 9,
        isButton: false,
        appendTo: "root",
        onInit: (el, pswp) => {
          pswp.on("change", () => {
            let captionText = "";
            const caption =
              pswp.currSlide?.data.element?.querySelector("figcaption");
            if (caption) {
              // get caption from element with class hidden-caption-content
              captionText = caption.textContent || "";
            }
            el.textContent = captionText;
          });
        },
      });
    });

    lightbox.init();

    lightboxRef.current = lightbox;
    return () => {
      lightbox.destroy();
    };
  }, [lightboxParentRef, isPresentationView, photoswipeId, updateConsent]);

  const openLightBox = useCallback(
    (index: number) => {
      const gallery = document.getElementById(
        photoswipeId,
      ) as HTMLElement | null;
      if (!gallery) return;
      lightboxRef.current?.loadAndOpen(index, { gallery });
    },
    [photoswipeId],
  );

  const carouselItems = useMemo(() => {
    const videoItems: [string, JSX.Element][] = videoAttachments
      .filter(({ url }) => validateNormalizedVideoUrl(url))
      .map((videoAttachment, i) => [
        `001-video-${i}`,
        <VideoItem
          key={`image-${i}`}
          videoAttachment={videoAttachment}
          showPreview
          openInLightbox
          linkAttributes={{
            className:
              "group/trigger pointer-events-auto flex items-center justify-center cursor-pointer select-none",
            draggable: false,
          }}
        />,
      ]);

    const imageItems: [string, JSX.Element][] = imageAttachments.map(
      (imageAttachment, i) => [
        `002-image-${i}`,
        <a
          key={`image-${i}`}
          draggable="false"
          href={createImageUrl({
            src: imageAttachment.url,
            width: 1920,
            quality: 90,
          })}
          data-pswp-type="image"
          data-pswp-width={
            imageAttachment.fileStorageObject?.imageMetadata?.width || 1920
          }
          data-pswp-height={
            imageAttachment.fileStorageObject?.imageMetadata?.height || 1080
          }
          className="flex select-none items-center justify-center"
        >
          <figure className="group/carousel-item relative flex items-center justify-center overflow-hidden rounded-lg bg-black text-white shadow-xl transition hover:scale-102 hover:shadow-2xl">
            <Image
              width={600}
              height={600}
              draggable={false}
              className="pointer-events-none max-h-[40vh] min-h-[100px] w-auto select-none object-cover"
              src={imageAttachment.url}
              alt={imageAttachment.alternativeText}
            />
            {imageAttachment.caption && (
              <>
                <div className="absolute bottom-0 right-0 m-2 flex flex-row items-center gap-1 opacity-100 drop-shadow-lg transition-opacity duration-200 group-hover/carousel-item:opacity-0">
                  caption <IconInformationCircle className="h-5 w-5" />
                </div>
                <figcaption className="absolute inset-0 top-auto flex items-center justify-center bg-black/80 p-2 leading-tight opacity-0 transition-opacity duration-200 group-hover/carousel-item:opacity-100">
                  {imageAttachment.caption}
                </figcaption>
              </>
            )}
          </figure>
        </a>,
      ],
    );

    return Object.fromEntries([...videoItems, ...imageItems]);
  }, [imageAttachments, videoAttachments]);

  const carouselCount = Object.keys(carouselItems).length;
  const carousel = carouselCount !== 0 && (
    <Carousel
      className="flex-1"
      // Negative margin to allow padding for shadows
      wrapperClassName={`flex-1 ${
        isPresentationView ? "pb-6 -mb-4" : "pb-16 -mb-12"
      }`}
      auto={null}
      itemClassName={`
          flex flex-col justify-center basis-full p-4
          ${carouselCount >= 2 ? "md:basis-1/2" : ""}
          ${carouselCount >= 3 ? "lg:basis-1/3" : ""}
          ${carouselCount >= 4 ? "xl:basis-1/4" : ""}
        `}
      items={carouselItems}
    />
  );

  let countItemsInPhotoswipe = 0;
  let thumbnails: JSX.Element | null = null;
  if (carouselCount > 1) {
    thumbnails = (
      <div className="my-2 flex flex-row flex-wrap items-center justify-center gap-2">
        {videoAttachments.map((videoAttachment) => {
          const parsedVideoUrl = parseVideoUrl(videoAttachment.url);
          if (!parsedVideoUrl) return null;
          let handleClick: MouseEventHandler<HTMLAnchorElement> | undefined =
            undefined;
          if ("embedUrl" in videoPlatformConfigs[parsedVideoUrl.platform]) {
            const lightboxIndex = countItemsInPhotoswipe++;
            handleClick = (e) => {
              e.preventDefault();
              openLightBox(lightboxIndex);
            };
          }

          return (
            <VideoItem
              key={videoAttachment.id}
              videoAttachment={videoAttachment}
              linkAttributes={{ onClick: handleClick }}
            />
          );
        })}
        {imageAttachments.map((imageAttachment, idx) => (
          <a
            key={imageAttachment.id}
            onClick={(e) => {
              e.preventDefault();
              openLightBox(countItemsInPhotoswipe + idx);
            }}
            href={imageAttachment.url}
            className="group relative flex select-none items-center justify-center"
          >
            <Image
              loading="lazy"
              width={100}
              height={100}
              draggable={false}
              className="pointer-events-none aspect-square h-14 w-14 rounded object-cover shadow-lg"
              src={imageAttachment.url}
              alt={imageAttachment.alternativeText}
              title={imageAttachment.title}
            />
          </a>
        ))}
      </div>
    );
  }

  return (
    <div id={photoswipeId} className="flex flex-1 flex-col">
      {carousel}
      {thumbnails}
    </div>
  );
}

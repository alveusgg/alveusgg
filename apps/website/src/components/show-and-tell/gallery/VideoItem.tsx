import type { LinkAttachment } from "@prisma/client";
import type { AnchorHTMLAttributes } from "react";

import { createImageUrl } from "@/utils/image";
import { parseVideoUrl, videoPlatformConfigs } from "@/utils/video-urls";

import { Preview } from "@/components/content/YouTube";
import { VideoPlatformIcon } from "@/components/shared/VideoPlatformIcon";
import IconYouTube from "@/icons/IconYouTube";

type VideoThumbnailProps = {
  videoAttachment: LinkAttachment;
  showPreview?: boolean;
  openInLightbox?: boolean;
  linkAttributes?: Record<string, unknown> &
    AnchorHTMLAttributes<HTMLAnchorElement>;
};

export function VideoItem({
  videoAttachment,
  openInLightbox = false,
  showPreview = false,
  linkAttributes = {},
}: VideoThumbnailProps) {
  const parsedVideoUrl = parseVideoUrl(videoAttachment.url);
  if (!parsedVideoUrl) {
    return null;
  }

  const { platform, id, normalizedUrl } = parsedVideoUrl;
  const videoPlatformConfig = videoPlatformConfigs[platform];

  // default attributes
  linkAttributes = {
    target: "_blank",
    rel: "noreferrer",
    ...linkAttributes,
  };

  let urlEmbed, urlPreview;
  if ("embedUrl" in videoPlatformConfig) {
    urlEmbed = videoPlatformConfig.embedUrl(id);
  }
  if ("previewUrl" in videoPlatformConfig) {
    urlPreview = videoPlatformConfig.previewUrl(id);
  }

  let content: JSX.Element;
  if (showPreview && platform === "youtube") {
    // YouTube has a custom preview
    content = (
      <div className="max-w-2xl">
        <Preview videoId={id} />
      </div>
    );
  } else if (showPreview && urlPreview) {
    // Support platforms that have dedicated thumbnail URLs
    content = (
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={createImageUrl({ src: urlPreview, width: 720 })}
          alt=""
          loading="lazy"
          className="pointer-events-none max-h-[40vh] min-h-[100px] w-auto rounded-2xl bg-alveus-green-800 object-cover shadow-xl transition group-hover/trigger:scale-102 group-hover/trigger:shadow-2xl"
        />
        <IconYouTube
          size={80}
          className="absolute inset-0 m-auto text-alveus-tan drop-shadow-md transition group-hover/trigger:scale-110 group-hover/trigger:drop-shadow-xl"
        />
      </div>
    );
  } else {
    content = (
      <div
        className={
          "flex w-fit flex-col items-center justify-center rounded-lg text-center text-black transition group-hover/trigger:scale-102 " +
          (showPreview
            ? "gap-2 bg-white p-4 shadow-xl group-hover/trigger:shadow-2xl"
            : "gap-0.5 bg-white/60 p-2 text-sm shadow-lg group-hover/trigger:shadow-xl")
        }
      >
        <VideoPlatformIcon
          platform={videoPlatformConfig.key}
          className="h-5 w-5"
        />
        {showPreview && "Open "}
        {videoPlatformConfig.label}
        {showPreview && " in a new tab."}
      </div>
    );
  }

  linkAttributes = {
    href: normalizedUrl,
    ...linkAttributes,
  };

  if (urlEmbed && openInLightbox) {
    linkAttributes = {
      "data-pswp-type": "iframe",
      "data-iframe-url": urlEmbed,
      ...linkAttributes,
    };

    if ("consent" in videoPlatformConfig) {
      linkAttributes = {
        "data-consent": videoPlatformConfig.consent,
        ...linkAttributes,
      };
    }
  }

  return (
    <div className="flex items-center justify-center">
      <a {...linkAttributes}>{content}</a>
    </div>
  );
}

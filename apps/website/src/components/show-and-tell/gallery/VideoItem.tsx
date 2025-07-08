import type { AnchorHTMLAttributes, JSX, ReactNode } from "react";

import type { LinkAttachment } from "@alveusgg/database";

import { parseVideoUrl, videoPlatformConfigs } from "@/utils/video-urls";

import { StreamablePreview } from "@/components/content/Streamable";
import { YouTubePreview } from "@/components/content/YouTube";

import IconExternal from "@/icons/IconExternal";
import IconStreamable from "@/icons/IconStreamable";
import IconYouTube from "@/icons/IconYouTube";

type VideoThumbnailProps = {
  videoAttachment: LinkAttachment;
  showPreview?: boolean;
  openInLightbox?: boolean;
  linkAttributes?: Record<string, unknown> &
    AnchorHTMLAttributes<HTMLAnchorElement>;
};

const previews: Record<
  keyof typeof videoPlatformConfigs,
  ({ videoId }: { videoId: string }) => ReactNode
> = {
  youtube: ({ videoId }: { videoId: string }) => (
    <YouTubePreview videoId={videoId} className="aspect-video h-auto w-full" />
  ),
  streamable: ({ videoId }: { videoId: string }) => (
    <StreamablePreview
      videoId={videoId}
      className="max-h-[40vh] min-h-[100px] w-auto"
    />
  ),
};

const icons: Record<
  keyof typeof videoPlatformConfigs,
  ({ size }: { size: number }) => ReactNode
> = {
  youtube: IconYouTube,
  streamable: IconStreamable,
};

export const VideoItemPreview = ({
  videoAttachment,
  openInLightbox = false,
  showPreview = false,
  linkAttributes = {},
}: VideoThumbnailProps) => {
  const parsed = parseVideoUrl(videoAttachment.url);
  const config = parsed && videoPlatformConfigs[parsed.platform];

  let content: JSX.Element;
  if (showPreview && config) {
    const Preview = previews[config.key];
    content = (
      <div className="max-w-2xl">
        <Preview videoId={parsed.id} />
      </div>
    );
  } else {
    const Icon = config ? icons[config.key] : IconExternal;
    content = (
      <div
        className={
          "flex w-fit flex-col items-center justify-center rounded-lg text-center text-black transition group-hover/trigger:scale-102 " +
          (showPreview
            ? "gap-2 bg-white p-4 shadow-xl group-hover/trigger:shadow-2xl"
            : "gap-0.5 bg-white/60 p-2 text-sm shadow-lg group-hover/trigger:shadow-xl")
        }
      >
        <Icon size={20} />
        {showPreview && "Open "}
        {config?.label ??
          new URL(videoAttachment.url).hostname.replace(/^www\./, "")}
        {showPreview && " in a new tab."}
      </div>
    );
  }

  // default attributes
  linkAttributes = {
    target: "_blank",
    rel: "noreferrer",
    ...linkAttributes,
  };

  if (parsed) {
    linkAttributes = {
      href: parsed.normalizedUrl,
      ...linkAttributes,
    };

    if (config) {
      const urlEmbed = config.embedUrl(parsed.id);
      if (urlEmbed && openInLightbox) {
        linkAttributes = {
          "data-pswp-type": "iframe",
          "data-iframe-url": urlEmbed,
          ...linkAttributes,
        };

        if ("consent" in config) {
          linkAttributes = {
            "data-consent": config.consent,
            ...linkAttributes,
          };
        }
      }
    }
  }

  return (
    <div className="flex items-center justify-center">
      <a {...linkAttributes}>{content}</a>
    </div>
  );
};

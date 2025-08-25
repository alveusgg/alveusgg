import type { JSX, ReactNode } from "react";

import type { LinkAttachment } from "@alveusgg/database";

import { classes } from "@/utils/classes";
import { parseVideoUrl, videoPlatformConfigs } from "@/utils/video-urls";

import Link from "@/components/content/Link";
import {
  StreamableEmbed,
  StreamablePreview,
} from "@/components/content/Streamable";
import { YouTubeEmbed, YouTubePreview } from "@/components/content/YouTube";

import IconExternal from "@/icons/IconExternal";
import IconStreamable from "@/icons/IconStreamable";
import IconYouTube from "@/icons/IconYouTube";

type VideoItemPreviewProps = {
  videoAttachment: LinkAttachment;
  lightbox?: (id: string) => void;
  preview?: boolean;
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
  lightbox,
  preview = false,
}: VideoItemPreviewProps) => {
  const parsed = parseVideoUrl(videoAttachment.url);
  const config = parsed && videoPlatformConfigs[parsed.platform];

  let content: JSX.Element;
  if (preview && config) {
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
        className={classes(
          "flex w-fit flex-col items-center justify-center rounded-lg text-center text-black transition group-hover/trigger:scale-102",
          preview
            ? "gap-2 bg-white p-4 shadow-xl group-hover/trigger:shadow-2xl"
            : "gap-0.5 bg-white/60 p-2 text-sm shadow-lg group-hover/trigger:shadow-xl",
        )}
      >
        <Icon size={20} />
        {preview && "Open "}
        {config?.label ??
          new URL(videoAttachment.url).hostname.replace(/^www\./, "")}
        {preview && " in a new tab."}
      </div>
    );
  }

  return (
    <Link
      href={parsed?.normalizedUrl ?? videoAttachment.url}
      external
      onClick={(e) => {
        if (!lightbox) return;

        e.preventDefault();
        lightbox(videoAttachment.id);
      }}
      draggable={false}
      className="group/trigger pointer-events-auto flex cursor-pointer items-center justify-center select-none"
      custom
    >
      {content}
    </Link>
  );
};

type VideoItemEmbedProps = {
  videoAttachment: LinkAttachment;
};

const embeds: Record<
  keyof typeof videoPlatformConfigs,
  ({ videoId }: { videoId: string }) => ReactNode
> = {
  youtube: ({ videoId }: { videoId: string }) => (
    <YouTubeEmbed videoId={videoId} />
  ),
  streamable: ({ videoId }: { videoId: string }) => (
    <StreamableEmbed videoId={videoId} />
  ),
};

export const VideoItemEmbed = ({ videoAttachment }: VideoItemEmbedProps) => {
  const parsed = parseVideoUrl(videoAttachment.url);
  const config = parsed && videoPlatformConfigs[parsed.platform];
  if (config) {
    const Embed = embeds[config.key];
    return <Embed videoId={parsed.id} />;
  }

  return (
    <div className="flex h-full items-center justify-center">
      <VideoItemPreview
        key={videoAttachment.id}
        videoAttachment={videoAttachment}
        preview
      />
    </div>
  );
};

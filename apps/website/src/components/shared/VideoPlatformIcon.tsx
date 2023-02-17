import React from "react";
import Image from "next/image";
import youtubeIcon from "simple-icons/icons/youtube.svg";
import imgurIcon from "simple-icons/icons/imgur.svg";
import { VideoCameraIcon } from "@heroicons/react/20/solid";
import streamableIcon from "@/assets/icons/streamable.svg";

import type { videoPlatformConfigs } from "@/utils/video-urls";

export function VideoPlatformIcon({
  platform,
  alt = "",
  ...props
}: {
  platform: keyof typeof videoPlatformConfigs | undefined;
  className?: string;
  alt?: string;
}) {
  switch (platform) {
    case "youtube":
      return <Image alt={alt} {...props} src={youtubeIcon} />;
    case "streamable":
      return <Image alt={alt} {...props} src={streamableIcon} />;
    case "imgur":
    case "imgurGallery":
      return <Image alt={alt} {...props} src={imgurIcon} />;
    default:
      return <VideoCameraIcon {...props} />;
  }
}

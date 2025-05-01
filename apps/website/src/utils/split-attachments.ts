import type { ShowAndTellEntryAttachments } from "@/server/db/show-and-tell";

import { parseVideoUrl, videoPlatformConfigs } from "./video-urls";

export function splitAttachments(attachments: ShowAndTellEntryAttachments) {
  const imageAttachments = [];
  const videoAttachments = [];
  for (let i = 0; i < attachments.length; i++) {
    const attachment = attachments[i]!;
    switch (attachment.attachmentType) {
      case "image":
        if (attachment.imageAttachment) {
          imageAttachments.push(attachment.imageAttachment);
        }
        break;
      case "video":
        if (attachment.linkAttachment) {
          videoAttachments.push(attachment.linkAttachment);
        }
        break;
    }
  }

  let featuredImage:
    | (typeof imageAttachments | typeof videoAttachments)[number]
    | undefined = imageAttachments[0];
  if (typeof featuredImage === "undefined") {
    for (const videoAttachment of videoAttachments) {
      const parsedVideoUrl = parseVideoUrl(videoAttachment.url);
      if (!parsedVideoUrl) continue;
      const videoPlatformConfig = videoPlatformConfigs[parsedVideoUrl.platform];
      if (!("previewUrl" in videoPlatformConfig)) continue;
      featuredImage = {
        ...videoAttachment,
        name: `${parsedVideoUrl.id}-thumbnail`,
        url: videoPlatformConfig.previewUrl(parsedVideoUrl.id),
      };
      break;
    }
  }

  return { featuredImage, imageAttachments, videoAttachments };
}

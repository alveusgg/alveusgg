import type { ShowAndTellEntryAttachments } from "@/server/db/show-and-tell";

import { parseVideoUrl, videoPlatformConfigs } from "./video-urls";

export function featuredAttachmentsImage(
  attachments: ShowAndTellEntryAttachments,
) {
  // Try to find the first image attachment
  const image = attachments.find((att) => att.attachmentType === "image");
  if (image?.imageAttachment) {
    return image.imageAttachment;
  }

  // If no image attachment, try to find a video attachment with a preview image
  for (const att of attachments) {
    if (att.attachmentType !== "video" || !att.linkAttachment) continue;

    const parsedVideoUrl = parseVideoUrl(att.linkAttachment.url);
    if (!parsedVideoUrl) continue;

    const videoPlatformConfig = videoPlatformConfigs[parsedVideoUrl.platform];
    if (!("previewUrl" in videoPlatformConfig)) continue;
    return {
      ...att.linkAttachment,
      name: `${parsedVideoUrl.id}-thumbnail`,
      url: videoPlatformConfig.previewUrl(parsedVideoUrl.id),
    };
  }
}

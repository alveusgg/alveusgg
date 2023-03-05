import * as fs from "node:fs";
import { JSDOM } from "jsdom";
import { parse } from "date-fns";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";
import {
  createFileStorageUpload,
  deleteFileStorageObject,
} from "@/server/utils/file-storage";
import { parseVideoUrl } from "@/utils/video-urls";
import {
  createPost,
  deletePost,
  withAttachments,
} from "@/server/db/show-and-tell";

type Image = {
  url: string;
  title?: string;
  description?: string;
  caption?: string;
  alternativeText?: string;
};

const overwrite = false;
const maxFileTransferTries = 3;

function cleanupString(str: string | null = "") {
  return (str || "").replace(/\s+/g, " ").trim();
}

function parseDateTime(str: string) {
  return parse(str, "LLLL d, yyyy h:mm a", new Date());
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

function guessImageType(filExt: string) {
  filExt = filExt.toLowerCase();
  switch (filExt) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    default:
      return "image/jpeg";
  }
}

async function transferFile(
  src: string | URL,
  dest: string | URL,
  srcOptions?: RequestInit,
  destOptions?: RequestInit
) {
  const file = await fetch(src, { method: "GET", ...srcOptions });
  const fileBuffer = await file.blob();
  return await fetch(dest, { method: "PUT", body: fileBuffer, ...destOptions });
}

export default async function migrateShowAndTellEntries(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const html = fs.readFileSync(
    "public/data/2023-03-05_show-and-tell.html",
    "utf8"
  );

  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const items = Array.from(
    doc.querySelectorAll(
      '.post.category-showandtell[data-elementor-type="single-post"]'
    )
  ) as HTMLDivElement[];

  console.log(`Migrating ${items.length} show and tell posts...`);

  for (let i = 0; i < 200; i++) {
    const item = items[i];
    if (!item) continue;

    const title = cleanupString(
      item.querySelector(".elementor-heading-title")?.textContent
    );
    const authorName = cleanupString(
      item.querySelector(".elementor-author-box__name")?.textContent
    );
    const date = cleanupString(
      item.querySelector(".elementor-post-info__item--type-date")?.textContent
    );
    const time = cleanupString(
      item.querySelector(".elementor-post-info__item--type-time")?.textContent
    );
    const dateTime = parseDateTime(`${date} ${time}`);

    const existingEntry = await prisma.showAndTellEntry.findFirst({
      ...withAttachments,
      where: {
        title,
        displayName: authorName,
        createdAt: dateTime,
      },
    });
    if (existingEntry) {
      if (!overwrite) {
        console.log(`Skipping existing entry #${i}: ${title} (${authorName})`);
        continue;
      } else {
        await Promise.allSettled([
          deletePost(existingEntry.id),
          // Delete all file attachments
          ...existingEntry.attachments
            .map(
              ({ imageAttachment }) => imageAttachment?.fileStorageObject?.id
            )
            .filter(notEmpty)
            .map((id) => deleteFileStorageObject(id)),
        ]);
      }
    }

    const collectedImages: Image[] = [];
    let content = "";

    const contentEl = item.querySelector(
      ".elementor-widget-theme-post-content .elementor-widget-container"
    );
    if (contentEl) {
      const imageElementsInContent = Array.from(
        contentEl.querySelectorAll(
          'a[href^="https://www.alveussanctuary.org/wp-content/uploads/"]'
        )
      );
      imageElementsInContent.forEach((el) => {
        if (!el) return;
        if (!el.querySelector("img[src].attachment-thumbnail")) return;

        const url = el.getAttribute("href");
        if (!url) return;

        const parent = el.parentNode as HTMLParagraphElement | undefined;
        el.remove();
        if (parent && parent.matches(":empty")) {
          parent.remove();
        }

        collectedImages.push({ url });
      });

      content = cleanupString(contentEl.innerHTML);
    }

    const featureImageEl = item.querySelector(
      ".elementor-widget-theme-post-featured-image .elementor-image > a"
    );
    if (featureImageEl) {
      const texts = Array.from(
        featureImageEl.parentNode?.parentNode?.parentNode?.parentNode?.querySelectorAll(
          ".elementor-text-editor"
        ) || []
      ).map((el) => cleanupString(el.textContent));

      const url = featureImageEl.getAttribute("href") || "";

      const caption = texts
        .filter((text) => text.startsWith("Caption:"))
        .map((text) => text.replace("Caption:", "").trim())
        .join(", ");

      collectedImages.push({ url, caption });
    }

    [...item.querySelectorAll("a.elementor-gallery-item[href]")].forEach(
      (el) => {
        const url = el.getAttribute("href");
        if (!url) return null;

        const title = cleanupString(
          el.querySelector(".elementor-gallery-item__title")?.textContent
        );

        const description = cleanupString(
          el.querySelector(".elementor-gallery-item__description")?.textContent
        );

        const caption = [title, description].filter(Boolean).join(" - ");

        collectedImages.push({ url, caption });
      }
    );

    const iframes = Array.from(
      item.querySelectorAll(
        'video source[src*=""], iframe[src*="streamable.com"], iframe[src*="imgur.com"], iframe[src*="youtube.com"], iframe[src*="youtu.be"]'
      )
    ) as Array<HTMLIFrameElement | HTMLVideoElement>;

    const videoLinks = iframes
      .map((el) => parseVideoUrl(el.src)?.normalizedUrl)
      .filter(notEmpty);

    console.log(`Found ${iframes.length} videos...`, { videoLinks, iframes });

    // Merge images with the same URL, concatenate captions:
    const images = collectedImages.filter(notEmpty).reduce((acc, image) => {
      const existingImage = acc.find((img) => img.url === image.url);
      if (existingImage) {
        existingImage.caption = [existingImage.caption, image.caption]
          .filter(Boolean)
          .join(", ");
      } else {
        acc.push(image);
      }
      return acc;
    }, [] as Image[]);

    let uploadedImages;
    try {
      uploadedImages = await Promise.all(
        images.map(async (image, i) => {
          const fileName = image.url.split("/").pop() || `image-${i}.jpg`;
          const fileType = guessImageType(fileName?.split(".").pop() || "jpg");

          const { uploadUrl, viewUrl, fileStorageObject } =
            await createFileStorageUpload({
              fileName,
              fileType,
              acl: "public-read",
              prefix: "show-and-tell/",
            });

          // try 3 times
          let uploaded = false;
          for (let i = 0; i < maxFileTransferTries; i++) {
            try {
              const res = await transferFile(image.url, uploadUrl, undefined, {
                headers: {
                  "Content-Type": fileType,
                  "x-amz-acl": "public-read",
                },
              });
              if (res.status === 200) {
                uploaded = true;
                break;
              }
            } catch (e) {
              console.error(
                `Failed to upload image (try #${i}/${maxFileTransferTries}):`,
                e
              );
            }
          }
          if (!uploaded) {
            throw new Error(`Failed to upload image`);
          }

          return {
            name: fileName,
            url: viewUrl.toString(),
            caption: image.caption || "",
            fileStorageObjectId: fileStorageObject.id,
            title: "",
            description: "",
            alternativeText: "",
          };
        })
      );
    } catch (e) {}

    if (!uploadedImages) {
      console.error(`Failed to import post ${i + 1}: Failed to transfer image`);
      continue;
    }

    const postData = {
      text: content,
      title: title,
      displayName: authorName,
      imageAttachments: {
        create: uploadedImages,
        update: {},
      },
      videoLinks,
    };

    console.log(`Importing post ${i + 1} / ${items.length}:`, postData);
    try {
      await createPost(postData, undefined, dateTime);
      console.log(`Importing of post ${i + 1} / ${items.length} done!`);
    } catch (e) {
      console.error(`Failed to import post ${i + 1}:`, e);
    }
  }

  res.status(200).send("OK");
}

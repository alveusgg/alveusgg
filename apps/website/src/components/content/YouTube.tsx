import React, {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import PhotoSwipeLightbox from "photoswipe/lightbox";

import { getDefaultPhotoswipeLightboxOptions } from "@/utils/photoswipe";
import { camelToKebab } from "@/utils/string-case";
import { createImageUrl } from "@/utils/image";
import { type HTMLAttributes } from "@/utils/attrs";
import { classes } from "@/utils/classes";

import { useConsent } from "@/hooks/consent";

import IconYouTube from "@/icons/IconYouTube";

const iframeSrc = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
    id,
  )}?modestbranding=1&rel=0`;

const iframeAttrs: HTMLAttributes = {
  title: "YouTube video",
  referrerpolicy: "no-referrer",
  allow: "encrypted-media",
  sandbox: "allow-same-origin allow-scripts",
  loading: "lazy",
  class: "aspect-video w-full rounded-2xl shadow-xl bg-alveus-green-800",
};

const safeJsonParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

export const parseUrl = (url: string) => {
  const match = url.match(
    /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)$/,
  );
  if (!match?.[1]) throw new Error(`Invalid YouTube URL: ${url}`);
  return match[1];
};

type TriggerProps = {
  videoId: string;
  caption?: string;
  className?: string;
  children: React.ReactNode;
};

const createTrigger = (id: string) => {
  const Trigger: React.FC<TriggerProps> = ({
    videoId,
    caption,
    className,
    children,
  }) => {
    return (
      <a
        href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`}
        target="_blank"
        rel="noreferrer"
        className={classes("group/trigger", className)}
        {...{ [`data-lightbox-${id}`]: JSON.stringify({ videoId, caption }) }}
      >
        {children}
      </a>
    );
  };
  return Trigger;
};

type PreviewProps = {
  videoId: string;
  className?: string;
};

const imgSrc = (id: string, type: string) =>
  createImageUrl({
    src: `https://img.youtube.com/vi/${encodeURIComponent(
      id,
    )}/${encodeURIComponent(type)}.jpg`,
    width: 1280,
    quality: 100,
  });

export const Preview: React.FC<PreviewProps> = ({ videoId, className }) => {
  // Handle falling back to hq if there isn't a maxres image
  const [type, setType] = useState<"maxresdefault" | "hqdefault">(
    "maxresdefault",
  );
  const onError = useCallback(() => {
    if (type === "maxresdefault") setType("hqdefault");
  }, [type]);

  return (
    <div className="relative aspect-video w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc(videoId, type)}
        onError={onError}
        alt=""
        loading="lazy"
        className={classes(
          "pointer-events-none object-cover transition group-hover/trigger:scale-102 group-hover/trigger:shadow-2xl",
          iframeAttrs.class,
          className,
        )}
      />
      <IconYouTube
        size={80}
        className="absolute inset-0 m-auto text-alveus-tan drop-shadow-md transition group-hover/trigger:scale-110 group-hover/trigger:drop-shadow-xl"
      />
    </div>
  );
};

type LightboxCtxProps = {
  Trigger: ReturnType<typeof createTrigger>;
  parseUrl: typeof parseUrl;
  id: string;
};

type LightboxProps = {
  id?: string;
  className?: string;
  children: React.ReactNode | ((ctx: LightboxCtxProps) => React.ReactNode);
};

export const Lightbox: React.FC<LightboxProps> = ({
  id,
  className,
  children,
}) => {
  const { update: updateConsent } = useConsent();

  const defaultId = useId().replace(/\W/g, "").toLowerCase();
  const photoswipeId = `photoswipe-${id || defaultId}`;
  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      ...getDefaultPhotoswipeLightboxOptions(),
      gallery: `#${photoswipeId}`,
      mainClass: `pswp--${photoswipeId}`,
      children: `a[data-lightbox-${photoswipeId}]`,
      preloaderDelay: 0,
    });

    // Expose the video id
    lightbox.addFilter("itemData", (itemData) => ({
      ...itemData,
      youTube: safeJsonParse(
        itemData.element?.getAttribute(`data-lightbox-${photoswipeId}`) || "",
      ),
    }));

    // Create the lightbox iframe
    lightbox.on("contentLoad", (e) => {
      const { content } = e;
      if (!content.data.youTube?.videoId) return;

      // Prevent the default content load
      e.preventDefault();

      // Ensure the user has consented to YouTube
      updateConsent({ youtube: true });

      // Create our content element
      content.element = document.createElement("div");
      content.element.className =
        "pointer-events-none flex flex-col items-center h-full w-full p-0 md:p-4 lg:p-8";

      // Create our video wrapper
      const wrapper = document.createElement("div");
      wrapper.className = `flex items-center justify-center h-full w-full pswp--${photoswipeId}-wrapper`;
      content.element.appendChild(wrapper);

      // Create our iframe
      const iframe = document.createElement("iframe");
      iframe.src = iframeSrc(content.data.youTube.videoId);
      Object.entries(iframeAttrs).forEach(([key, value]) => {
        iframe.setAttribute(camelToKebab(key), value);
      });
      iframe.className = classes("pointer-events-auto", iframe.className);

      // Allow full-screen for the iframe
      iframe.allowFullscreen = true;
      iframe.allow = ["fullscreen", iframe.allow].filter(Boolean).join("; ");

      // Register the photoswipe load bindings
      iframe.addEventListener("load", () => {
        content.onLoaded();
      });
      iframe.addEventListener("error", () => {
        content.onError();
      });

      // Append the iframe
      wrapper.appendChild(iframe);

      // If we have a caption, add it
      if (content.data.youTube.caption) {
        const caption = document.createElement("div");
        caption.className = "text-alveus-tan text-xl my-4 md:mb-0 lg:mt-8";
        caption.innerHTML = content.data.youTube.caption;
        content.element.appendChild(caption);
      }
    });

    lightbox.init();
    return () => {
      lightbox.destroy();
    };
  }, [photoswipeId, updateConsent]);

  // Expose the nested components
  const ctx: LightboxCtxProps = useMemo(
    () => ({
      Trigger: createTrigger(photoswipeId),
      parseUrl,
      id: photoswipeId,
    }),
    [photoswipeId],
  );

  // Allow children to be functions that receive the context
  const childrenToRender = useMemo(
    () =>
      (Array.isArray(children) ? children : [children]).map((child, index) => {
        const element = typeof child === "function" ? child(ctx) : child;
        return cloneElement(element, { key: index });
      }),
    [children, ctx],
  );

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          // Hide the placeholder overlay
          // Ensure we retain the aspect ratio of the video
          __html: `
.pswp--${photoswipeId} .pswp__img--placeholder {
  display: none;
}

.pswp--${photoswipeId} .pswp__item[aria-hidden="false"] .pswp--${photoswipeId}-wrapper {
  container-type: size;
  container-name: photoswipe-${photoswipeId};
}

@container photoswipe-${photoswipeId} (aspect-ratio > 16/9) {
  .pswp--${photoswipeId} .pswp__item[aria-hidden="false"] .pswp--${photoswipeId}-wrapper iframe {
    width: auto;
    height: 100%;
  }
}
`,
        }}
      />
      <div id={photoswipeId} className={className}>
        {childrenToRender}
      </div>
    </>
  );
};

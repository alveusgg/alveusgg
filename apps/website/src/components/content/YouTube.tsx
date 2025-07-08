import PhotoSwipeLightbox from "photoswipe/lightbox";
import {
  type ReactNode,
  type Ref,
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import { classes } from "@/utils/classes";
import { createImageUrl } from "@/utils/image";
import {
  getDefaultPhotoswipeLightboxOptions,
  resolvePhotoswipeElementProvider,
} from "@/utils/photoswipe";
import { camelToKebab } from "@/utils/string-case";

import { useConsent } from "@/hooks/consent";

import IconYouTube from "@/icons/IconYouTube";

import BaseLightbox from "./Lightbox";
import Link from "./Link";

type PreviewProps = {
  videoId: string;
  alt?: string;
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

export const Preview = ({ videoId, alt = "", className }: PreviewProps) => {
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
        alt={alt}
        loading="lazy"
        className={classes(
          "pointer-events-none aspect-video w-full rounded-2xl bg-alveus-green-800 object-cover shadow-xl transition group-hover/trigger:scale-102 group-hover/trigger:shadow-2xl",
          className,
        )}
      />
      <div className="absolute inset-0 m-auto box-content aspect-[10/7] w-20 rounded-2xl bg-alveus-green/25 p-0.5 backdrop-blur-sm transition group-hover/trigger:scale-110 group-hover/trigger:bg-alveus-green/50" />
      <IconYouTube
        size={80}
        className="absolute inset-0 m-auto text-white drop-shadow-md transition group-hover/trigger:scale-110 group-hover/trigger:drop-shadow-xl"
      />
    </div>
  );
};

export const YouTubePreview = Preview;

type EmbedProps = {
  videoId: string;
  caption?: string;
};

const iframeSrc = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
    id,
  )}?modestbranding=1&rel=0`;

export const YouTubeEmbed = ({ videoId, caption }: EmbedProps) => (
  <div className="flex h-full flex-col">
    <div className="mx-auto flex aspect-video max-w-full grow">
      <iframe
        src={iframeSrc(videoId)}
        referrerPolicy="no-referrer"
        allow="fullscreen; encrypted-media"
        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
        loading="lazy"
        className="pointer-events-auto my-auto aspect-video h-auto w-full rounded-2xl bg-alveus-green-800 shadow-xl"
        allowFullScreen
      />
    </div>

    {caption && (
      <p className="my-4 text-center text-xl text-balance text-alveus-tan md:mb-0 lg:mt-8">
        {caption}
      </p>
    )}
  </div>
);

export const YouTubeLightbox = ({
  videoId,
  caption,
  children,
  className,
}: {
  videoId: string;
  caption?: string;
  children?: ReactNode;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const onClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <Link
        href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`}
        external
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        custom
        className={classes("group/trigger", className)}
      >
        {children || <Preview videoId={videoId} alt={caption} />}
      </Link>

      <BaseLightbox
        open={open ? videoId : undefined}
        onClose={onClose}
        items={{
          [videoId]: <YouTubeEmbed videoId={videoId} caption={caption} />,
        }}
      />
    </>
  );
};

// TODO: Remove below

const iframeAttrs = {
  title: "YouTube video",
  referrerpolicy: "no-referrer",
  allow: "encrypted-media",
  sandbox:
    "allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox",
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
  triggerId?: string;
  className?: string;
  children: ReactNode;
};

const createTrigger = (id: string) => {
  const Trigger = ({
    videoId,
    caption,
    triggerId,
    className,
    children,
  }: TriggerProps) => (
    <a
      href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`}
      target="_blank"
      rel="noreferrer"
      className={classes("group/trigger", className)}
      {...{
        [`data-lightbox-${id}`]: JSON.stringify({
          videoId,
          caption,
          triggerId: triggerId ?? videoId,
        }),
      }}
    >
      {children}
    </a>
  );
  Trigger.displayName = "Trigger";
  return Trigger;
};

type LightboxCtxProps = {
  Trigger: ReturnType<typeof createTrigger>;
  parseUrl: typeof parseUrl;
  id: string;
};

type LightboxProps = {
  id?: string;
  className?: string;
  children: ReactNode | ((ctx: LightboxCtxProps) => ReactNode);
  value?: string;
  onChange?: (value?: string) => void;
  ref?: Ref<HTMLDivElement>;
};

export const Lightbox = ({
  id,
  className,
  children,
  value,
  onChange,
  ref,
}: LightboxProps) => {
  const { update: updateConsent } = useConsent();

  // Start up Photoswipe lightbox
  const defaultId = useId().replace(/\W/g, "").toLowerCase();
  const photoswipeId = `photoswipe-${id || defaultId}`;
  const [photoswipe, setPhotoswipe] = useState<PhotoSwipeLightbox>();

  useEffect(() => {
    const defaultConfig = getDefaultPhotoswipeLightboxOptions();
    const lightbox = new PhotoSwipeLightbox({
      ...defaultConfig,
      gallery: `#${photoswipeId}`,
      mainClass: classes(defaultConfig.mainClass, `pswp--${photoswipeId}`),
      children: `a[data-lightbox-${photoswipeId}]`,
      preloaderDelay: 0,
    });

    // Expose the video id
    lightbox.addFilter("itemData", (itemData) => ({
      ...itemData,
      trigger: safeJsonParse(
        itemData.element?.getAttribute(`data-lightbox-${photoswipeId}`) || "",
      ),
    }));

    // Create the lightbox iframe
    lightbox.on("contentLoad", (e) => {
      const { content } = e;
      if (!content.data.trigger?.videoId) return;

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
      iframe.src = iframeSrc(content.data.trigger.videoId);
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
      if (content.data.trigger.caption) {
        const caption = document.createElement("div");
        caption.className = "text-alveus-tan text-xl my-4 md:mb-0 lg:mt-8";
        caption.innerHTML = content.data.trigger.caption;
        content.element.appendChild(caption);
      }
    });

    // Expose the current slide to the controlled value
    lightbox.on("contentActivate", ({ content }) => {
      if (onChange) onChange(content.data.trigger?.triggerId);
    });

    // When closing, let the controlled value know
    lightbox.on("close", () => {
      if (onChange) onChange(undefined);
    });

    // Initialize the lightbox
    lightbox.init();
    setPhotoswipe(lightbox);

    // Do the cleanup in the reverse order
    return () => {
      setPhotoswipe(undefined);
      lightbox.destroy();
    };
  }, [photoswipeId, updateConsent, onChange]);

  // If the controlled value changes, make sure the lightbox and it are in sync
  useEffect(() => {
    // If we have no lightbox, do nothing
    if (!photoswipe) return;

    // If we have no value, close the lightbox
    if (!value) {
      photoswipe.pswp?.close();
      return;
    }

    // If photoswipe is active and the value is the same, do nothing
    const active = photoswipe.pswp?.currSlide?.data?.trigger?.triggerId as
      | string
      | undefined;
    if (active === value) return;

    // Get the gallery and children
    const gallery = resolvePhotoswipeElementProvider(
      photoswipe.options.gallery,
    )?.[0];
    if (!gallery) return;
    const items = resolvePhotoswipeElementProvider(
      photoswipe.options.children,
      gallery,
    );
    if (!items) return;

    // Locate the matching trigger and open it
    // If we can't find it, set the value back to the active slide
    const match = items.findIndex(
      (child) =>
        safeJsonParse(child.getAttribute(`data-lightbox-${photoswipeId}`) || "")
          ?.triggerId === value,
    );
    if (match !== -1)
      photoswipe.loadAndOpen(
        match,
        photoswipe.options.dataSource || { gallery, items },
      );
    if (match === -1 && onChange) onChange(active);
  }, [value, photoswipe, photoswipeId, onChange]);

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
      <div id={photoswipeId} className={className} ref={ref}>
        {childrenToRender}
      </div>
    </>
  );
};

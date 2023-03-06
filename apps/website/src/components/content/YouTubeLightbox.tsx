import React, { useEffect, useId, useMemo } from "react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import { getDefaultPhotoswipeLightboxOptions } from "@/utils/photoswipe";

const parse = (url: string) => {
  const match = url.match(
    /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)$/
  );
  if (!match?.[1]) throw new Error(`Invalid YouTube URL: ${url}`);
  return match[1];
};

type TriggerProps = {
  videoId: string;
  className?: string;
  children: React.ReactNode;
};

const getTrigger = (id: string) => {
  const Trigger: React.FC<TriggerProps> = ({
    videoId,
    className,
    children,
  }) => {
    return (
      <a
        href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`}
        target="_blank"
        rel="noreferrer"
        className={className}
        {...{ [`data-lightbox-${id}`]: "" }}
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

const Preview: React.FC<PreviewProps> = ({ videoId, className }) => {
  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(
        videoId
      )}?modestbranding=1`}
      referrerPolicy="no-referrer"
      allow="encrypted-media"
      sandbox="allow-same-origin allow-scripts"
      loading="lazy"
      className={
        "pointer-events-none aspect-video" + (className ? " " + className : "")
      }
    />
  );
};

type YouTubeLightboxCtxProps = {
  Trigger: React.FC<TriggerProps>;
  Preview: React.FC<PreviewProps>;
  parse: (url: string) => string;
  id: string;
};

type YouTubeLightboxProps = {
  className?: string;
  children:
    | React.ReactNode
    | ((ctx: YouTubeLightboxCtxProps) => React.ReactNode);
};

const YouTubeLightbox: React.FC<YouTubeLightboxProps> = ({
  className,
  children,
}) => {
  const photoswipeId = `photoswipe-${useId().replace(/\W/g, "")}`;
  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      ...getDefaultPhotoswipeLightboxOptions(),
      gallery: `#${photoswipeId}`,
      mainClass: `pswp--${photoswipeId}`,
      children: `a[data-lightbox-${photoswipeId}]`,
      showHideAnimationType: "fade",
      loop: false,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      pswpModule: () => import("photoswipe"),
    });

    // Expose the iframe url
    lightbox.addFilter("itemData", (itemData) => ({
      ...itemData,
      iframeUrl: itemData.element?.querySelector("iframe")?.src,
    }));

    // Create the lightbox iframe
    lightbox.on("contentLoad", (e) => {
      const { content } = e;
      if (!content.data.iframeUrl) return;

      // Prevent the default content load
      e.preventDefault();

      // Create our content element
      content.element = document.createElement("div");
      content.element.className =
        "pointer-events-none flex items-center justify-center h-full w-full p-0 md:p-4 lg:p-8";

      // Create our iframe
      const iframe = document.createElement("iframe");
      iframe.src = content.data.iframeUrl;
      iframe.referrerPolicy = "no-referrer";
      iframe.allow = "encrypted-media";
      iframe.className = "pointer-events-auto aspect-video w-full";
      iframe.setAttribute("sandbox", "allow-same-origin allow-scripts");

      // Register the photoswipe load bindings
      iframe.addEventListener("load", () => {
        content.onLoaded();
      });
      iframe.addEventListener("error", () => {
        content.onError();
      });

      // Append the iframe
      content.element.appendChild(iframe);
    });

    lightbox.init();
    return () => {
      lightbox.destroy();
    };
  }, [photoswipeId]);

  // Expose the nested components
  const ctx: YouTubeLightboxCtxProps = useMemo(
    () => ({
      Trigger: getTrigger(photoswipeId),
      Preview,
      parse,
      id: photoswipeId,
    }),
    [photoswipeId]
  );

  // Allow children to be functions that receive the context
  const childrenToRender = useMemo(
    () =>
      (Array.isArray(children) ? children : [children]).map((child) => {
        if (typeof child === "function") {
          return child(ctx);
        }
        return child;
      }),
    [children, ctx]
  );

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          // Ensure we retain the aspect ratio of the video
          __html: `
.pswp--${photoswipeId} {
    container-type: size;
    container-name: photoswipe-${photoswipeId};
}

@container photoswipe-${photoswipeId} (aspect-ratio > 16/9) {
  .pswp--${photoswipeId} .pswp__item iframe {
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

export default YouTubeLightbox;

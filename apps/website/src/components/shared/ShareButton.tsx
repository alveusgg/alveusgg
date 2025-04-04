import {
  Fragment,
  type ComponentPropsWithoutRef,
  type MouseEventHandler,
} from "react";

import { PopoverButton as PopoverButtonHeadless } from "@headlessui/react";

import { classes } from "@/utils/classes";
import {
  blueskyShareUrl,
  emailShareUrl,
  facebookShareUrl,
  twitterShareUrl,
} from "@/utils/share-url";

import IconTwitter from "@/icons/IconTwitter";
import IconBluesky from "@/icons/IconBluesky";
import IconFacebook from "@/icons/IconFacebook";
import IconShare from "@/icons/IconShare";
import IconEnvelope from "@/icons/IconEnvelope";
import IconClipboard from "@/icons/IconClipboard";

import { Button, defaultButtonClasses } from "@/components/shared/form/Button";
import { PopoverButton } from "@/components/shared/PopoverButton";
import { QRCode } from "@/components/QrCode";

import { useCopyToClipboard } from "@/hooks/clipboard";

function ShareLink({
  className,
  ...attributes
}: ComponentPropsWithoutRef<"a">) {
  return (
    <PopoverButtonHeadless as={Fragment}>
      <a
        target="_blank"
        rel="noopener noreferrer"
        className={classes(
          "flex gap-1 rounded-lg p-1 text-sm hover:underline",
          className,
        )}
        {...attributes}
      />
    </PopoverButtonHeadless>
  );
}

export function ShareButton({
  url,
  title,
  text,
}: {
  url: string;
  title: string;
  text: string;
}) {
  const handleClick: MouseEventHandler = (e) => {
    if (navigator.share) {
      e.preventDefault();
      e.stopPropagation();

      navigator
        .share({ title, text, url })
        .then()
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const {
    copy,
    status: linkCopiedState,
    statusText: linkCopiedText,
  } = useCopyToClipboard();

  return (
    <PopoverButton
      onClick={handleClick}
      label={
        <>
          <IconShare className="mr-1 size-5" />
          Share
        </>
      }
    >
      <p className="mb-1">Share this link</p>

      <div className="mb-3 flex items-stretch gap-2">
        <input
          readOnly={true}
          type="url"
          className="w-full grow bg-transparent p-0.5 text-sm text-inherit"
          value={url}
          onClick={(e) =>
            e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
          }
        />

        <Button
          width="auto"
          size="small"
          className={classes(
            defaultButtonClasses,
            "transition-colors hover:bg-gray-900",
            linkCopiedState === "success" && "bg-green-900",
            linkCopiedState === "error" && "bg-red-900",
          )}
          onClick={async () => {
            await copy(url);
          }}
          title="Copy link to clipboard"
        >
          <IconClipboard className="size-4" />
          {linkCopiedText}
        </Button>
      </div>

      <div className="flex gap-2">
        <ShareLink
          href={twitterShareUrl({ url, text, title })}
          title="Share on X (Twitter)"
        >
          <IconTwitter className="size-4" />X (Twitter)
        </ShareLink>
        <ShareLink
          href={blueskyShareUrl({ url, text, title })}
          title="Share on Bluesky"
        >
          <IconBluesky className="size-4" />
          Bluesky
        </ShareLink>
        <ShareLink
          href={facebookShareUrl({ url, text, title })}
          title="Share on Facebook"
        >
          <IconFacebook className="size-4" />
          Facebook
        </ShareLink>
        <ShareLink
          href={emailShareUrl({ url, text, title })}
          title="Share via Email"
        >
          <IconEnvelope className="size-4" />
          Email
        </ShareLink>
      </div>

      <div className="mt-3 border-t">
        <QRCode
          className="mx-auto my-3 aspect-square max-w-[120px]"
          value={url}
        />
      </div>
    </PopoverButton>
  );
}

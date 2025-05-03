import { PopoverButton as PopoverButtonHeadless } from "@headlessui/react";
import {
  type ComponentPropsWithoutRef,
  Fragment,
  type MouseEventHandler,
  useMemo,
} from "react";

import { classes } from "@/utils/classes";
import sharePlatforms, { type SharePlatform } from "@/utils/share";

import { useCopyToClipboard } from "@/hooks/clipboard";

import { QRCode } from "@/components/QrCode";
import { PopoverButton } from "@/components/shared/PopoverButton";
import { Button, defaultButtonClasses } from "@/components/shared/form/Button";

import IconClipboard from "@/icons/IconClipboard";
import IconShare from "@/icons/IconShare";

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

  const share = useMemo(
    () =>
      Object.entries(sharePlatforms).map(
        ([key, item]) =>
          [
            key,
            {
              ...item,
              url: item.url({ url, text, title }),
            },
          ] as [string, SharePlatform & { url: string }],
      ),
    [url, text, title],
  );

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
        {share.map(([key, item]) => (
          <ShareLink key={key} href={item.url} title={item.description}>
            <item.icon size={16} />
            {item.name}
          </ShareLink>
        ))}
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

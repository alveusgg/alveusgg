import type { ComponentPropsWithoutRef, MouseEventHandler } from "react";
import { Fragment, useEffect, useId, useState } from "react";

import { Popover } from "@headlessui/react";

import { env } from "@/env/index.mjs";

import { classes } from "@/utils/classes";

import IconTwitter from "@/icons/IconTwitter";
import IconFacebook from "@/icons/IconFacebook";
import IconShare from "@/icons/IconShare";
import IconEnvelope from "@/icons/IconEnvelope";
import IconClipboard from "@/icons/IconClipboard";
import IconReddit from "@/icons/IconReddit";
import IconFacebookMessenger from "@/icons/IconFacebookMessenger";
import IconTelegram from "@/icons/IconTelegram";
import IconWhatsapp from "@/icons/IconWhatsapp";
import IconSMS from "@/icons/IconSMS";

import { Button } from "@/components/shared/Button";
import { PopoverButton } from "@/components/shared/PopoverButton";
import { QRCode } from "@/components/QrCode";

function createTwitterLink({ text, url }: { text: string; url: string }) {
  const link = new URL("https://twitter.com/intent/tweet");
  link.searchParams.append("text", text);
  link.searchParams.append("url", url);
  return link.toString();
}

function createFacebookLink({ url }: { url: string }) {
  const link = new URL("https://www.facebook.com/sharer/sharer.php");
  link.searchParams.append("u", url);
  return link.toString();
}

function createFacebookMessengerLink({
  url,
  appId,
}: {
  url: string;
  appId: string;
}) {
  const link = new URL("https://www.facebook.com/dialog/send");
  link.searchParams.append("link", url);
  link.searchParams.append("redirect_uri", url);
  link.searchParams.append("app_id", appId);
  return link.toString();
}

function createWhatsappLink({ text, url }: { text: string; url: string }) {
  const link = new URL("whatsapp://send");
  link.searchParams.append("text", `${text}\n\n${url}`);
  return link.toString();
}

function createTelegramLink({ text, url }: { text: string; url: string }) {
  const link = new URL("https://telegram.me/share/url");
  link.searchParams.append("text", `${text}\n\n${url}`);
  return link.toString();
}

function createRedditLink({ text, url }: { text: string; url: string }) {
  const link = new URL("https://www.reddit.com/submit");
  link.searchParams.append("title", text);
  link.searchParams.append("url", url);
  link.searchParams.append("resubmit", "true");
  return link.toString();
}

// Only works with Firefox on Desktop and Android
function createSMSLink({ text, url }: { text: string; url: string }) {
  const link = new URL("sms:");
  link.searchParams.append("body", `${text}\n\n${url}`);
  return link.toString().replaceAll("+", "%20");
}

// Only works with Safari on macOS and iOS
function createIMessageLink({ text, url }: { text: string; url: string }) {
  const link = new URL("imessage:");
  link.searchParams.append("body", `${text}\n\n${url}`);
  return link.toString().replaceAll("+", "%20");
}

const isBrowser = typeof window !== "undefined";
const isIOS = isBrowser && navigator.userAgent.includes("iPhone");
const isMacOS = isBrowser && navigator.userAgent.includes("Macintosh");
const isFirefox = isBrowser && navigator.userAgent.includes("Firefox");
const canSentMessageByProtocol = isBrowser && (isIOS || isMacOS || isFirefox);

function createMessageLink({ text, url }: { text: string; url: string }) {
  if (!canSentMessageByProtocol) return;
  if (isIOS || isMacOS) return createIMessageLink({ text, url });
  return createSMSLink({ text, url });
}

function createEmailLink({
  title,
  text,
  url,
}: {
  title: string;
  text: string;
  url: string;
}) {
  const link = new URL("mailto:");
  link.searchParams.append("subject", title);
  link.searchParams.append("body", `${text}\n\n${url}`);
  return link.toString().replaceAll("+", "%20");
}

function ShareLink({
  className,
  ...attributes
}: ComponentPropsWithoutRef<"a">) {
  return (
    <Popover.Button as={Fragment}>
      <a
        target="_blank"
        rel="noopener noreferrer"
        className={classes("flex gap-1 rounded-lg p-1 text-sm", className)}
        {...attributes}
      />
    </Popover.Button>
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

  const linkInputId = useId();
  const [linkCopiedState, setLinkCopiedState] = useState<
    undefined | "success" | "error"
  >();
  const linkCopiedText =
    linkCopiedState === "success"
      ? "Copied!"
      : linkCopiedState === "error"
      ? "Failed"
      : "Copy";
  useEffect(() => {
    if (linkCopiedState) {
      const timeout = setTimeout(() => {
        setLinkCopiedState(undefined);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [linkCopiedState]);

  return (
    <PopoverButton
      onClick={handleClick}
      label={
        <>
          <IconShare className="mr-1 h-5 w-5" />
          Share
        </>
      }
    >
      <p className="mb-1">Share this link</p>

      <div className="mb-3 flex items-stretch gap-2">
        <input
          id={linkInputId}
          readOnly={true}
          type="url"
          className="w-full flex-grow bg-transparent p-0.5 text-sm text-inherit"
          value={url}
          onClick={(e) =>
            e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
          }
        />

        <Button
          width="auto"
          size="small"
          onClick={() => {
            const linkInputElement = document.getElementById(
              linkInputId,
            ) as HTMLInputElement;

            try {
              linkInputElement.focus();
              linkInputElement.setSelectionRange(
                0,
                linkInputElement.value.length,
              );
              document.execCommand("copy");
              setLinkCopiedState("success");
            } catch (e) {
              setLinkCopiedState("error");
            }
          }}
          title="Copy link to clipboard"
        >
          <IconClipboard className="h-4 w-4" />
          {linkCopiedText}
        </Button>
      </div>

      <div className="flex gap-2">
        <ShareLink
          href={createTwitterLink({ text, url })}
          title="Share on Twitter"
        >
          <IconTwitter className="h-4 w-4" />
          Twitter
        </ShareLink>
        <ShareLink href={createFacebookLink({ url })} title="Share on Facebook">
          <IconFacebook className="h-4 w-4" />
          Facebook
        </ShareLink>
        <ShareLink
          href={createEmailLink({ title, text, url })}
          title="Share via Email"
        >
          <IconEnvelope className="h-4 w-4" />
          Email
        </ShareLink>
        {canSentMessageByProtocol && (
          <ShareLink
            href={createMessageLink({ text, url })}
            title="Share via SMS/iMessage"
          >
            <IconSMS className="h-4 w-4" />
            Message
          </ShareLink>
        )}
      </div>

      <div className="flex gap-2">
        {env.NEXT_PUBLIC_FACEBOOK_APP_ID && (
          <ShareLink
            href={createFacebookMessengerLink({
              url,
              appId: env.NEXT_PUBLIC_FACEBOOK_APP_ID,
            })}
            title="Share on Facebook Messenger"
          >
            <IconFacebookMessenger className="h-4 w-4" />
            Messenger
          </ShareLink>
        )}
        <ShareLink
          href={createWhatsappLink({ text, url })}
          title="Share on Whatsapp"
        >
          <IconWhatsapp className="h-4 w-4" />
          Whatsapp
        </ShareLink>
        <ShareLink
          href={createTelegramLink({ text, url })}
          title="Share on Telegram"
        >
          <IconTelegram className="h-4 w-4" />
          Telegram
        </ShareLink>
        <ShareLink
          href={createRedditLink({ text, url })}
          title="Share on Reddit"
        >
          <IconReddit className="h-4 w-4" />
          Reddit
        </ShareLink>
      </div>

      <div className="mt-3 border-t">
        <QRCode
          className="mx-auto my-3 aspect-square max-w-[160px]"
          value={url}
        />
      </div>
    </PopoverButton>
  );
}

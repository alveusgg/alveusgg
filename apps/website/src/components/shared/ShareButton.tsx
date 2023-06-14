import type { MouseEventHandler } from "react";
import { Fragment } from "react";

import { Popover } from "@headlessui/react";

import IconTwitter from "@/icons/IconTwitter";
import IconFacebook from "@/icons/IconFacebook";
import IconShare from "@/icons/IconShare";
import IconEnvelope from "@/icons/IconEnvelope";

import { Button } from "@/components/shared/Button";
import { PopoverButton } from "@/components/shared/PopoverButton";

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
          console.log(err);
        });
    }
  };

  const createTwitterLink = () => {
    const link = new URL("https://twitter.com/intent/tweet");
    link.searchParams.append("text", text);
    link.searchParams.append("url", url);
    return link.toString();
  };

  const createFacebookLink = () => {
    const link = new URL("https://www.facebook.com/sharer/sharer.php");
    link.searchParams.append("u", url);
    return link.toString();
  };

  const createEmailLink = () => {
    const link = new URL("mailto:");
    link.searchParams.append("subject", title);
    link.searchParams.append("body", `${text}\n\n${url}`);
    return link.toString().replaceAll("+", "%20");
  };

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
      <p className="mb-1">Share this link:</p>
      <input
        readOnly={true}
        type="url"
        className="mb-2 w-full bg-transparent text-inherit"
        value={url}
      />

      <div className="flex gap-2">
        <Popover.Button as={Fragment}>
          <Button
            width="auto"
            size="small"
            onClick={() => window.open(createTwitterLink(), "_blank")}
            title="Share announcement on Twitter"
          >
            <IconTwitter className="mr-1 h-4 w-4" />
            Twitter
          </Button>
        </Popover.Button>
        <Popover.Button as={Fragment}>
          <Button
            width="auto"
            size="small"
            onClick={() => window.open(createFacebookLink(), "_blank")}
            title="Share announcement on Facebook"
          >
            <IconFacebook className="mr-1 h-4 w-4" />
            Facebook
          </Button>
        </Popover.Button>
        <Popover.Button as={Fragment}>
          <Button
            width="auto"
            size="small"
            onClick={() => window.open(createEmailLink())}
            title="Share announcement on Email"
          >
            <IconEnvelope className="mr-1 h-4 w-4" />
            Email
          </Button>
        </Popover.Button>
      </div>
    </PopoverButton>
  );
}

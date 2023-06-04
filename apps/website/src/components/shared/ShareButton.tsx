import type { MouseEventHandler } from "react";
import { Disclosure } from "@headlessui/react";
import { Fragment } from "react";
import ShareIcon from "@heroicons/react/20/solid/ShareIcon";
import { Button } from "@/components/shared/Button";
import IconTwitter from "@/icons/IconTwitter";
import IconEmail from "@/icons/IconEmail";
import IconFacebook from "@/icons/IconFacebook";

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
    <div className="relative">
      <Disclosure>
        <Disclosure.Button as={Fragment}>
          <Button width="auto" size="small" onClick={handleClick}>
            <ShareIcon className="mr-1 h-5 w-5" />
            Share
          </Button>
        </Disclosure.Button>
        <Disclosure.Panel className="absolute z-20 mt-0.5 rounded bg-gray-800 p-2 text-white shadow-xl">
          <p className="mb-1">Share this link:</p>
          <input
            readOnly={true}
            type="url"
            className="mb-2 w-full bg-transparent text-inherit"
            value={url}
          />

          <div className="flex gap-2">
            <Button
              width="auto"
              size="small"
              onClick={() => window.open(createTwitterLink(), "_blank")}
              title="Share announcement on Twitter"
            >
              <IconTwitter className="mr-1 h-4 w-4" />
              Twitter
            </Button>
            <Button
              width="auto"
              size="small"
              onClick={() => window.open(createFacebookLink(), "_blank")}
              title="Share announcement on Facebook"
            >
              <IconFacebook className="mr-1 h-4 w-4" />
              Facebook
            </Button>
            <Button
              width="auto"
              size="small"
              onClick={() => window.open(createEmailLink())}
              title="Share announcement on Email"
            >
              <IconEmail className="mr-1 h-4 w-4" />
              Email
            </Button>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  );
}

export default ShareButton;

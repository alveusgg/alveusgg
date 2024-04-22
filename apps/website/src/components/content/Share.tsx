import { useMemo } from "react";

import { classes } from "@/utils/classes";
import {
  emailShareUrl,
  facebookShareUrl,
  linkedinShareUrl,
  twitterShareUrl,
} from "@/utils/share-url";
import { getShortBaseUrl } from "@/utils/short-url";

import IconEnvelope from "@/icons/IconEnvelope";
import IconFacebook from "@/icons/IconFacebook";
import IconLinkedIn from "@/icons/IconLinkedIn";
import IconTwitter from "@/icons/IconTwitter";

import Link from "./Link";

interface ShareProps {
  title: string;
  text: string;
  path: string;
  dark?: boolean;
  className?: string;
}

interface Share {
  link: string;
  text: string;
  icon: React.ComponentType<{ size: number }>;
}

const Share = ({ title, text, path, dark = false, className }: ShareProps) => {
  const data = useMemo(
    () => ({ title, text, url: `${getShortBaseUrl()}${path}` }),
    [title, text, path],
  );
  const share = useMemo<Record<string, Share>>(
    () => ({
      twitter: {
        link: twitterShareUrl(data),
        text: "Share on X (Twitter)",
        icon: IconTwitter,
      },
      facebook: {
        link: facebookShareUrl(data),
        text: "Share on Facebook",
        icon: IconFacebook,
      },
      linkedIn: {
        link: linkedinShareUrl(data),
        text: "Share on LinkedIn",
        icon: IconLinkedIn,
      },
      email: {
        link: emailShareUrl(data),
        text: "Share via Email",
        icon: IconEnvelope,
      },
    }),
    [data],
  );

  return (
    <div className={className}>
      <ul className="flex justify-center gap-4">
        {Object.entries(share).map(([key, item]) => (
          <li key={key}>
            <Link
              href={item.link}
              external
              custom
              className={classes(
                "block rounded-2xl p-3 transition-colors",
                dark
                  ? "bg-alveus-tan text-alveus-green hover:bg-alveus-green hover:text-alveus-tan"
                  : "bg-alveus-green text-alveus-tan hover:bg-alveus-tan hover:text-alveus-green",
              )}
              title={item.text}
            >
              <item.icon size={32} />
            </Link>
          </li>
        ))}
      </ul>

      <input
        readOnly={true}
        type="url"
        className={classes(
          "m-0 mt-2 w-full bg-transparent p-0.5 text-center text-sm italic outline-none",
          dark ? "text-alveus-tan" : "text-alveus-green-600",
        )}
        value={data.url}
        onClick={(e) =>
          e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
        }
      />
    </div>
  );
};

export default Share;

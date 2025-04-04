import { useMemo } from "react";

import { getShortBaseUrl } from "@/utils/short-url";
import sharePlatforms, { type SharePlatform } from "@/utils/share";
import { classes } from "@/utils/classes";

import Link from "./Link";

interface ShareProps {
  title: string;
  text: string;
  path: string;
  dark?: boolean;
  className?: string;
}

const Share = ({ title, text, path, dark = false, className }: ShareProps) => {
  const share = useMemo(
    () =>
      Object.entries(sharePlatforms).map(
        ([key, item]) =>
          [
            key,
            {
              ...item,
              url: item.url({
                title,
                text,
                url: `${getShortBaseUrl()}${path}`,
              }),
            },
          ] as [string, SharePlatform & { url: string }],
      ),
    [title, text, path],
  );

  return (
    <div className={className}>
      <ul className="flex justify-center gap-4">
        {share.map(([key, item]) => (
          <li key={key}>
            <Link
              href={item.url}
              external
              custom
              className={classes(
                "block rounded-2xl p-3 transition-colors",
                dark
                  ? "bg-alveus-tan text-alveus-green hover:bg-alveus-green-800 hover:text-alveus-tan"
                  : "bg-alveus-green text-alveus-tan hover:bg-alveus-tan hover:text-alveus-green",
              )}
              title={item.description}
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
          "m-0 mt-2 w-full bg-transparent p-0.5 text-center text-sm italic outline-hidden",
          dark ? "text-alveus-tan" : "text-alveus-green-600",
        )}
        value={`${getShortBaseUrl()}${path}`}
        onClick={(e) =>
          e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
        }
      />
    </div>
  );
};

export default Share;

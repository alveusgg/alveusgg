import { useCallback, type MouseEventHandler, type ReactNode } from "react";
import Image, { type ImageProps } from "next/image";

import { classes } from "@/utils/classes";

import {
  useConsent,
  consentData,
  consentExplainer,
  type ConsentKey,
} from "@/hooks/consent";
import useCrawler from "@/hooks/crawler";

import Link from "@/components/content/Link";
import Button from "@/components/content/Button";

type ConsentProps = {
  item: string;
  consent: ConsentKey;
  indexable?: boolean;
  thumbnail?: ImageProps["src"];
  className?: string;
  children: ReactNode;
};

const Consent = ({
  item,
  consent: key,
  indexable,
  thumbnail,
  className,
  children,
}: ConsentProps) => {
  // Get the current user consent state
  // If this is "indexable", we'll ignore consent for known crawlers
  const { consent, update, loaded } = useConsent();
  const crawler = useCrawler();

  // When the user clicks the consent button, update the state
  const clicked = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.preventDefault();
      update({ [key]: true });
    },
    [key, update],
  );

  return (
    <div
      className={classes(
        "relative z-0 flex flex-col items-center justify-center",
        className,
      )}
    >
      {loaded &&
        ((indexable && crawler) || consent[key] ? (
          <>
            <p className="absolute -z-10 m-auto text-2xl" aria-hidden="true">
              Loading {item}...
            </p>
            {children}
          </>
        ) : (
          <>
            {thumbnail && (
              <div className="absolute inset-0 -z-10 overflow-hidden">
                <Image
                  src={thumbnail}
                  fill
                  alt=""
                  className="h-full w-full object-cover blur brightness-50"
                />
              </div>
            )}

            <p className="m-6 mb-3 text-2xl">Loading {item}...</p>

            <div className="m-6 mt-3 flex max-w-2xl flex-col gap-4 rounded-lg bg-alveus-tan p-4 text-alveus-green shadow-lg">
              <p>
                This content is from a third party and we need your consent to
                show it. It {consentExplainer}.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <Button as="button" type="button" onClick={clicked}>
                  Consent to loading {consentData[key].name}
                </Button>

                <Link href={consentData[key].privacy} external>
                  Privacy Policy
                </Link>
              </div>
            </div>
          </>
        ))}
    </div>
  );
};

export default Consent;

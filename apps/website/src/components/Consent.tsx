import Image, { type ImageProps } from "next/image";
import { type MouseEventHandler, type ReactNode, useCallback } from "react";

import { classes } from "@/utils/classes";

import {
  type ConsentKey,
  consentData,
  consentExplainer,
  useConsent,
} from "@/hooks/consent";
import useCrawler from "@/hooks/crawler";

import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";

import IconArrowRight from "@/icons/IconArrowRight";
import IconLock from "@/icons/IconLock";

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
      {...(loaded && consent[key] ? { "data-consent": "" } : {})}
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
                  className="size-full object-cover blur-sm brightness-50"
                />
              </div>
            )}

            <Box className="m-6 flex max-w-3xl flex-col gap-4">
              <div className="flex items-start gap-8">
                <div className="min-w-0 grow">
                  <p className="text-sm font-bold tracking-widest text-alveus-green uppercase">
                    Third-party content
                  </p>
                  <Heading level={2} className="my-0">
                    Consent required to load the {item}
                  </Heading>
                </div>

                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-alveus-green text-alveus-green">
                  <IconLock className="size-6" aria-hidden="true" />
                </span>
              </div>

              <p className="text-lg/relaxed text-alveus-green-800">
                This content is provided by {consentData[key].name}. Loading it{" "}
                {consentExplainer}.
              </p>

              <div className="flex flex-wrap items-center gap-6">
                <Button
                  as="button"
                  type="button"
                  filled
                  onClick={clicked}
                  className="inline-flex items-center gap-3"
                >
                  Allow {consentData[key].name} content
                  <IconArrowRight className="size-5" aria-hidden="true" />
                </Button>

                <Link
                  href={consentData[key].privacy}
                  external
                  className="ml-auto"
                >
                  Privacy policy
                </Link>
              </div>
            </Box>
          </>
        ))}
    </div>
  );
};

export default Consent;

import { Input } from "@headlessui/react";
import { type NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useMemo, useRef, useState } from "react";

import { env } from "@/env";

import { classes } from "@/utils/classes";

import { useConsent } from "@/hooks/consent";
import type { StoredPixel } from "@/hooks/pixels";

import Consent from "@/components/Consent";
import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Donate from "@/components/content/Donate";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import TheGivingBlockEmbed from "@/components/content/TheGivingBlockEmbed";
import Pixels from "@/components/institute/Pixels";
import Wolves from "@/components/institute/Wolves";

import IconArrowRight from "@/icons/IconArrowRight";
import IconArrowsIn from "@/icons/IconArrowsIn";
import IconArrowsOut from "@/icons/IconArrowsOut";
import IconSearch from "@/icons/IconSearch";

import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import usfwsRedWolfWalkingImage from "@/assets/institute/usfws-red-wolf-walking.jpg";

const InstitutePixelsPage: NextPage = () => {
  const { consent } = useConsent();
  const { query, replace, isReady } = useRouter();

  const search = typeof query.s === "string" ? query.s : "";
  const setSearch = (value: string) => {
    if (!isReady) return;

    const { s: _, ...updated } = query;
    if (value.length) {
      updated.s = value;
    }

    replace({ query: updated }, undefined, { shallow: true });
  };

  const filter = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return undefined;

    const hashed = window.crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(normalized))
      .then((hash) =>
        Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
      );

    return (pixel: NonNullable<StoredPixel>) =>
      pixel.username.toLowerCase().includes(normalized) ||
      hashed.then((h) => pixel.email === h);
  }, [search]);

  const [fullscreen, setFullscreen] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const fullscreenToggle = useCallback(() => {
    setFullscreen((v) => {
      if (v) {
        document.body.style.overflow = "";
      } else {
        document.body.style.overflow = "hidden";
        window.requestAnimationFrame(() => {
          if (!fullscreenRef.current) return;
          const { scrollWidth, clientWidth } = fullscreenRef.current;
          fullscreenRef.current.scrollLeft = (scrollWidth - clientWidth) / 2;
        });
      }
      return !v;
    });
  }, []);

  return (
    <>
      <Meta
        title="Pixel Project | Research & Recovery Institute"
        description="Donate $100 or more to unlock a pixel on the institute mural and support the development of the Alveus Research & Recovery Institute."
      >
        <meta
          key="canonical"
          property="canonical"
          content={`${env.NEXT_PUBLIC_BASE_URL}/institute/pixels`}
        />
        {fullscreen && (
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
        )}
      </Meta>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        containerClassName="flex flex-wrap gap-4 justify-between items-end"
      >
        <Heading>Alveus Research & Recovery Institute Pixel Project</Heading>
        <Button
          href="/institute"
          dark
          className="inline-flex items-center gap-2"
        >
          <IconArrowRight className="size-5 -scale-x-100" />
          Learn More About the Institute
        </Button>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section
        className="grow overflow-hidden py-8"
        containerClassName="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3 items-start"
        offsetParent={!fullscreen}
      >
        <div
          className={classes(
            fullscreen
              ? "fixed inset-0 isolate z-100 flex h-screen w-screen touch-none flex-col gap-8 bg-alveus-green-900 p-4 ring-8 ring-alveus-green"
              : "contents",
          )}
        >
          <div className="relative z-10 col-span-full shrink grow">
            <Image
              src={leafRightImage2}
              alt=""
              className="pointer-events-none absolute bottom-0 left-full -z-10 h-3/4 max-h-64 w-auto -translate-x-2 -scale-x-100 drop-shadow-md select-none"
            />
            <Image
              src={leafLeftImage3}
              alt=""
              className="pointer-events-none absolute top-full left-0 -z-10 h-2/5 max-h-48 w-auto -translate-x-2/5 -translate-y-1/3 -scale-x-100 drop-shadow-md select-none"
            />

            <Pixels
              filter={filter}
              className={classes(
                fullscreen &&
                  "scrollbar-none aspect-[unset]! h-full! touch-pan-x justify-start! overflow-x-scroll rounded-lg bg-alveus-green shadow-xl ring-4 ring-alveus-green",
              )}
              canvasClassName={classes(
                "rounded-lg",
                fullscreen
                  ? "max-w-none!"
                  : "shadow-xl ring-4 ring-alveus-green",
              )}
              ref={fullscreenRef}
            />

            {fullscreen && (
              <div className="pointer-events-none absolute top-1/2 left-1/2 flex w-1/2 max-w-xs -translate-1/2 rounded-xl bg-alveus-green-800/75 p-4 text-alveus-tan opacity-0 shadow-xl backdrop-blur-sm delay-1000 duration-1000 starting:opacity-100">
                <IconArrowRight className="aspect-square size-auto shrink grow -scale-x-100" />
                <IconArrowRight className="aspect-square size-auto shrink grow" />
              </div>
            )}
          </div>

          <Box
            dark
            className="relative z-10 col-span-full flex shrink-0 bg-alveus-green-800/75 p-0 backdrop-blur-xs"
          >
            <IconSearch className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for pixels by username or email..."
              className="shrink grow rounded-xl py-3 pl-10 font-mono text-xs outline-none placeholder:text-alveus-tan/75 sm:text-sm"
            />

            <button
              type="button"
              onClick={fullscreenToggle}
              title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className={classes(
                "z-20 shrink-0 rounded-xl p-3 text-sm transition-colors",
                fullscreen
                  ? "hover:bg-alveus-green"
                  : "hover:bg-alveus-green-800",
              )}
            >
              {fullscreen ? (
                <IconArrowsIn className="size-5" />
              ) : (
                <IconArrowsOut className="size-5" />
              )}
            </button>
          </Box>
        </div>

        <div className="relative pb-8 max-lg:order-last xl:col-span-2">
          <Image
            src={leafLeftImage2}
            alt=""
            className="pointer-events-none absolute right-0 -bottom-12 z-10 h-auto w-1/2 max-w-40 -scale-x-100 drop-shadow-md select-none"
          />

          <Box dark>
            <Heading level={2}>Saving Animals From Extinction</Heading>

            <p className="text-lg">
              We&apos;re taking the Alveus approach to the wild, and need your
              help. Each donation of $100 or more unlocks a pixel on our mural,
              on our way to raising $1,000,000 to fund the initial development
              of the Alveus Research & Recovery Institute. Each pixel unlocked
              by your donation will display your name, denoting you as one of
              the 10,000 vital original supporters of the Institute. More pixels
              can be unlocked for each additional $100 included in your
              donation.
            </p>

            <Wolves
              image={{
                src: usfwsRedWolfWalkingImage,
                alt: "Red wolf, Hillebrand, Steve/USFWS, Public Domain, https://www.fws.gov/media/just-little-closer",
              }}
            >
              <p className="text-lg">
                The Alveus Research & Recovery Institute is aiming to create a
                conservation breeding program for the critically endangered
                Mexican Gray and Red wolves, helping to maintain a population
                under human care with the end goal of reintroducing these
                incredible animals back into the wild.
              </p>

              <Button
                href="/institute"
                dark
                className="mt-4 inline-flex items-center gap-2"
              >
                <IconArrowRight className="size-5 -scale-x-100" />
                Learn More About the Institute
              </Button>
            </Wolves>

            <p className="mt-4 text-xs text-balance opacity-75">
              Alveus Sanctuary will use all donations as part of the Pixel
              Project to fund the initial development of the institute.
              <br />
              In the event that more funds are raised than are needed for the
              project, additional funds will be allocated to the operations of
              the institute.
            </p>
          </Box>
        </div>

        <div className="flex flex-col gap-8">
          <Donate type="twitch" />
          {!consent.givingBlock && <Donate type="givingBlock" />}

          <Consent item="donation widget" consent="givingBlock">
            <TheGivingBlockEmbed
              campaignId="Wolf"
              className="flex w-full justify-center"
            />
          </Consent>
        </div>
      </Section>
    </>
  );
};

export default InstitutePixelsPage;

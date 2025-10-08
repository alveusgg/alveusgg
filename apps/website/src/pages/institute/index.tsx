import { type NextPage } from "next";
import Image from "next/image";
import { useMemo } from "react";

import useLocaleString from "@/hooks/locale";
import usePixels from "@/hooks/pixels";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Progress from "@/components/content/Progress";
import Section from "@/components/content/Section";
import Transparency from "@/components/content/Transparency";
import Wolves from "@/components/institute/Wolves";

import IconArrowRight from "@/icons/IconArrowRight";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import usfwsMexicanWolfFieldImage from "@/assets/institute/usfws-mexican-wolf-field.jpg";
import usfwsMexicanWolfReleasedImage from "@/assets/institute/usfws-mexican-wolf-released.jpg";
import usfwsRedWolfImage from "@/assets/institute/usfws-red-wolf.jpg";

const InstitutePage: NextPage = () => {
  const pixels = usePixels();
  const unlocked = useMemo(
    () => pixels.filter((p) => p !== null).length,
    [pixels],
  );

  const unlockedLocale = useLocaleString(unlocked);
  const totalLocale = useLocaleString(pixels.length);

  return (
    <>
      <Meta
        title="Research & Recovery Institute"
        description="The Alveus Research & Recovery Institute ..."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-auto w-1/2 max-w-xs drop-shadow-md select-none lg:block 2xl:max-w-sm"
        />

        <Section dark>
          <div className="w-full lg:w-4/5 lg:py-8">
            <Heading className="text-balance">
              Alveus Research & Recovery Institute
            </Heading>

            <p className="text-lg text-balance">
              We are taking the Alveus approach to the wild. Pushing forward
              conservation technology, public involvement in science, and
              recovery ecology to make our world a better place for both people
              and wildlife.
            </p>
          </div>
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-48 drop-shadow-md select-none lg:block"
        />

        <Section>
          <div className="flex flex-col items-center gap-8 lg:flex-row">
            <div>
              <Heading id="campaign" level={2} link className="text-balance">
                Support the Institute with the Pixel Campaign
              </Heading>

              <p className="text-lg text-balance">
                We need your help to fund the initial development of the Alveus
                Research & Recovery Institute. We&apos;re aiming to raise
                $1,000,000 to kickstart our first projects and build out the
                infrastructure needed to ensure long-term success. Every
                donation of $100 or more will unlock a pixel on our institute
                mural, allowing you to leave your mark on this exciting new
                venture.
              </p>

              <Button
                href="/institute/pixels"
                filled
                className="mt-4 inline-flex items-center gap-2"
              >
                Donate Now to Unlock a Pixel
                <IconArrowRight className="size-5" />
              </Button>
            </div>

            <div className="z-0 flex w-full max-w-lg items-center justify-center lg:order-first">
              <Image
                src={usfwsRedWolfImage}
                width={256}
                alt="Red wolf, B. Bartel/USFWS, Public Domain, https://www.fws.gov/media/red-wolf-7"
                className="z-10 mr-[-10%] h-auto w-2/5 max-w-64 rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl"
              />
              <Image
                src={usfwsMexicanWolfReleasedImage}
                width={384}
                alt="Mexican wolf released back into the wild, Mexican Wolf Interagency Field Team, Public Domain, https://www.fws.gov/media/mexican-wolf-released-back-wild"
                className="h-auto w-3/5 max-w-96 rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-x-4 gap-y-1 lg:flex-row">
            <Progress
              progress={(unlocked / pixels.length) * 100}
              className="ring-4 ring-alveus-green lg:flex-1"
            />

            <p className="tabular-nums">
              <span className="opacity-10 select-none">
                {totalLocale
                  .slice(0, totalLocale.length - unlockedLocale.length)
                  .replace(/\d/g, "0")}
              </span>
              {unlockedLocale} / {totalLocale} pixels unlocked
            </p>
          </div>
        </Section>
      </div>

      <Section className="overflow-x-hidden" dark>
        <Heading id="safe" level={2} link className="text-balance">
          Saving Animals From Extinction
        </Heading>

        <p className="text-lg text-balance">
          Conservation breeding programs can help prevent extinction by
          preserving remaining genetic diversity and maintaining populations of
          endangered species under human care. The ultimate goal of conservation
          breeding programs is to reintroduce endangered species back into the
          wild.
        </p>

        <Wolves
          image={{
            src: usfwsMexicanWolfFieldImage,
            alt: "Mexican wolf in field, New Mexico Department of Game and Fish, Public Domain, https://www.fws.gov/media/mexican-wolf-field",
          }}
        >
          <p className="text-lg text-balance">
            Alveus Sanctuary&apos;s Research & Recovery Institute will apply for
            acceptance to the{" "}
            <strong>
              Association of Zoos and Aquariums (AZA) Saving Animals From
              Extinction (SAFE) Programs for Mexican Gray Wolves and Red Wolves
            </strong>
            . This program is a coordinated effort between zoological
            facilities, U.S. Fish and Wildlife Service, Mexico&apos;s Fish &
            Wildlife Agencies and managed under the Association of Zoos and
            Aquariums (AZA).
          </p>
        </Wolves>
      </Section>

      {/* Grow the last section to cover the page */}
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -top-32 right-0 z-10 hidden h-auto w-1/2 max-w-32 -scale-x-100 drop-shadow-md select-none lg:block"
        />

        <Transparency className="grow" />
      </div>
    </>
  );
};

export default InstitutePage;

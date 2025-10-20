import { type NextPage } from "next";
import Image from "next/image";

import { PixelSyncProviderProvider } from "@/hooks/pixels";

import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Slideshow from "@/components/content/Slideshow";
import Transparency from "@/components/content/Transparency";
import PixelsDescription from "@/components/institute/PixelsDescription";
import PixelsProgress from "@/components/institute/PixelsProgress";
import Wolves from "@/components/institute/Wolves";

import IconArrowRight from "@/icons/IconArrowRight";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import buildingHeroImage from "@/assets/institute/hero/building.png";
import denHeroImage from "@/assets/institute/hero/den.png";
import labHeroImage from "@/assets/institute/hero/lab.png";
import prepHeroImage from "@/assets/institute/hero/prep.png";
import vetHeroImage from "@/assets/institute/hero/vet.png";
import wolvesHeroImage from "@/assets/institute/hero/wolves.png";
import usfwsMexicanWolfFieldImage from "@/assets/institute/usfws-mexican-wolf-field.jpg";
import usfwsMexicanWolfReleasedImage from "@/assets/institute/usfws-mexican-wolf-released.jpg";
import usfwsRedWolfImage from "@/assets/institute/usfws-red-wolf.jpg";

const slides = [
  {
    src: buildingHeroImage,
    alt: "Drawing of the Alveus Research & Recovery Institute building",
  },
  {
    src: denHeroImage,
    alt: "Drawing of three wolf pups in a den",
  },
  {
    src: prepHeroImage,
    alt: "Drawing of the food preparation area of the institute",
  },
  {
    src: vetHeroImage,
    alt: "Drawing of the veterinary care area with a wolf being examined",
  },
  {
    src: labHeroImage,
    alt: "Drawing of the technology lab area of the institute",
  },
  {
    src: wolvesHeroImage,
    alt: "Drawing of released wolves walking through the landscape",
  },
];

const InstitutePage: NextPage = () => {
  return (
    <PixelSyncProviderProvider>
      <Meta
        title="Research & Recovery Institute"
        description="The Alveus Research & Recovery Institute is taking the Alveus approach to the wild to help save species from extinction, aiming to create a conservation breeding program for the critically endangered Mexican Gray and Red wolves."
        image={buildingHeroImage.src}
      />

      {/* Hero, offset to be navbar background */}
      <div className="relative z-0 flex min-h-[95vh] flex-col lg:-mt-40">
        <div className="absolute inset-0 -z-10 bg-alveus-green">
          <Slideshow images={slides} />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="container mx-auto flex grow flex-col gap-8 p-4 text-white lg:mt-40 lg:pt-8 lg:pb-16 xl:gap-16">
          <div className="mt-auto lg:max-w-4/5">
            <Heading className="text-5xl text-balance">
              Alveus Research & Recovery Institute
            </Heading>

            <p className="mt-8 text-xl text-balance">
              We are taking the Alveus approach to the wild. Pushing forward
              conservation technology, public involvement in science, and
              recovery ecology to make our world a better place for both people
              and wildlife.
            </p>
          </div>

          <Box
            dark
            className="mt-auto rounded-2xl bg-alveus-green-900/50 backdrop-blur-md"
          >
            <div className="flex flex-col items-center gap-8 lg:flex-row">
              <div>
                <Heading id="pixels" level={2} link className="text-balance">
                  Support the Institute with the Pixel Project
                </Heading>

                <p className="text-lg">
                  We need your help to fund the initial development of the
                  Alveus Research & Recovery Institute. We&apos;re aiming to
                  raise $1,000,000 to kickstart our first projects and build out
                  the infrastructure needed to ensure long-term success. Every
                  donation of $100 or more will unlock a pixel on our institute
                  mural, allowing you to leave your mark on this exciting new
                  venture.
                </p>

                <Button
                  href="/institute/pixels"
                  dark
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
              <PixelsProgress className="bg-alveus-green-900/75 lg:flex-1" />
              <PixelsDescription />
            </div>
          </Box>
        </div>
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
    </PixelSyncProviderProvider>
  );
};

export default InstitutePage;

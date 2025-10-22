import { type NextPage } from "next";
import Image from "next/image";

import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Slideshow from "@/components/content/Slideshow";
import Transparency from "@/components/content/Transparency";
import Wolves from "@/components/institute/Wolves";

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
    className: "object-[25%_50%]",
  },
  {
    src: denHeroImage,
    alt: "Drawing of three wolf pups in a den",
  },
  {
    src: prepHeroImage,
    alt: "Drawing of the food preparation area of the institute",
    className: "object-[75%_50%]",
  },
  {
    src: vetHeroImage,
    alt: "Drawing of the veterinary care area with a wolf being examined",
    className: "object-[25%_50%]",
  },
  {
    src: labHeroImage,
    alt: "Drawing of the technology lab area of the institute",
  },
  {
    src: wolvesHeroImage,
    alt: "Drawing of released wolves walking through the landscape",
    className: "object-[75%_50%]",
  },
];

const InstitutePage: NextPage = () => {
  return (
    <>
      <Meta
        title="Alveus Research & Recovery Institute"
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
            className="mt-auto flex flex-col gap-x-4 gap-y-8 rounded-2xl bg-alveus-green-900/25 backdrop-blur-sm lg:flex-row"
          >
            <div className="flex grow flex-col items-start gap-4">
              <Heading id="pixels" level={2} link className="my-0 text-balance">
                The Pixel Project is Complete!
              </Heading>

              <p className="text-lg text-balance">
                Thanks to your incredible support, all 10,000 pixels in our
                mural have been unlocked, raising $1,000,000 to fund the initial
                development of the institute! While this milestone has been
                reached, we still need your continued support to fund the
                ongoing work at the Alveus Research & Recovery Institute. Every
                donation helps us work towards our goal of saving species from
                extinction.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button href="/institute/pixels" dark>
                  Explore the Completed Mural
                </Button>

                <Button href="/donate" dark>
                  Donate to Support the Institute
                </Button>
              </div>
            </div>

            <div className="z-0 flex w-full items-center justify-center lg:order-first lg:max-w-lg">
              <Image
                src={usfwsRedWolfImage}
                width={300}
                alt="Red wolf, B. Bartel/USFWS, Public Domain, https://www.fws.gov/media/red-wolf-7"
                className="z-10 mr-[-10%] h-auto w-2/5 rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl"
              />
              <Image
                src={usfwsMexicanWolfReleasedImage}
                width={400}
                alt="Mexican wolf released back into the wild, Mexican Wolf Interagency Field Team, Public Domain, https://www.fws.gov/media/mexican-wolf-released-back-wild"
                className="h-auto w-3/5 rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl"
              />
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
    </>
  );
};

export default InstitutePage;

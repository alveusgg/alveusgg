import { type NextPage } from "next";
import Image from "next/image";
import React from "react";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";

const enclosures = {
  foxes: {
    name: "Foxes",
    items: {
      wideAngle: {
        name: "Wide Angle",
        model: "Axis M2036-LE (Fixed)",
      },
      den: {
        name: "Den",
        model: "Axis P3268-LV (Fixed)",
      },
      main: {
        name: "Main",
        model: "Axis M5525-E (PTZ)",
      },
      audio: {
        name: "Audio",
        model: "???",
      },
    },
  },
  crows: {
    name: "Crows",
    items: {
      indoor: {
        name: "Indoor",
        model: "Axis M5525-E (PTZ)",
      },
      outdoor: {
        name: "Outdoor",
        model: "Axis M5525-E (PTZ)",
      },
      audio: {
        name: "Audio",
        model: "???",
      },
    },
  },
  marmosets: {
    name: "Marmosets",
    items: {
      indoor: {
        name: "Indoor",
        model: "???",
      },
      outdoor: {
        name: "Outdoor",
        model: "???",
      },
      audio: {
        name: "Audio",
        model: "???",
      },
    },
  },
  georgie: {
    name: "Georgie",
    items: {
      main: {
        name: "Main",
        model: "???",
      },
      water: {
        name: "Water",
        model: "???",
      },
    },
  },
  noodle: {
    name: "Noodle",
    items: {
      main: {
        name: "Main",
        model: "???",
      },
    },
  },
  critterCave: {
    name: "Critter Cave",
    items: {
      hank: {
        name: "Hank",
        model: "???",
      },
      barbaraBakedBean: {
        name: "Barbara / Baked Bean",
        model: "???",
      },
      marty: {
        name: "Marty",
        model: "???",
      },
      bb: {
        name: "BB",
        model: "???",
      },
    },
  },
  parrots: {
    name: "Parrots",
    items: {
      main: {
        name: "Main",
        model: "Axis M5525-E (PTZ)",
      },
      audio: {
        name: "Audio",
        model: "???",
      },
    },
  },
  pasture: {
    name: "Pasture",
    items: {
      main: {
        name: "Main",
        model: "Axis Q6135-LE (PTZ)",
      },
      audio: {
        name: "Audio",
        model: "???",
      },
    },
  },
};

const AboutTechPage: NextPage = () => {
  return (
    <>
      <Meta
        title="About Tech"
        description="Alveus Sanctuary is a virtual education center, and with that comes the need for a lot of technology to make it all work, from livestream broadcast systems to PTZ cameras and microphones in the ambassador enclosures."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-auto w-1/2 max-w-md select-none lg:block xl:max-w-lg"
        />

        <Section dark className="py-24">
          <div className="w-full lg:w-3/5">
            <Heading level={1}>About Tech at Alveus</Heading>
            <p className="text-lg">
              Alveus Sanctuary is a virtual education center, and with that
              comes the need for a lot of technology to make it all work, from
              livestream broadcast systems to PTZ cameras and microphones in the
              ambassador enclosures.
            </p>
          </div>
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-32 left-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block 2xl:-bottom-48 2xl:max-w-[12rem]"
        />

        <Section>
          <Heading level={2}>Broadcast studio</Heading>

          <ul>
            <li>
              <p>Software: OBS + Psynaps Cloud Server</p>
            </li>
            <li>
              <p>Camera: ???</p>
            </li>
            <li>
              <p>
                Wireless Mics: 4x Sennheiser ME 3 w/ SK-XSW Bodypacks + EM-XSW 1
                Receivers
              </p>
            </li>
            <li>
              <p>Overhead Mic: Audio Technica PRO45</p>
            </li>
            <li>
              <p>Audio Interface: Focusrite Scarlett 18i8</p>
            </li>
            <li>
              <p>Livestream PC: ???</p>
            </li>
          </ul>
        </Section>
      </div>

      <div className="relative">
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 right-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section dark>
          <Heading level={2}>Outside broadcasts</Heading>

          <p>Livestream backpack: GoPro, LiveU</p>
          <p>Animal cams: Phone w/ Software</p>
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-20 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section className="flex-grow">
          <Heading level={2}>Enclosure cameras + audio</Heading>

          <ul>
            {Object.entries(enclosures).map(([key, enclosure]) => (
              <li key={key}>
                <Heading level={3}>{enclosure.name}</Heading>
                <ul>
                  {Object.entries(enclosure.items).map(([key, item]) => (
                    <li key={key}>
                      <p>
                        {item.name}: {item.model}
                      </p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  );
};

export default AboutTechPage;

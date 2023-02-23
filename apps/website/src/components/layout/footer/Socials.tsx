import Image from "next/image";
import React from "react";

import socials from "../../shared/data/socials";

import Heading from "../../content/Heading";
import Section from "../../content/Section";

import socialsImage from "../../../assets/socials.png";

const Socials = () => (
  <Section dark className="z-0 pb-0">
    <div className="flex flex-wrap-reverse items-center">
      <div className="basis-full pt-8 md:basis-1/2 md:pt-0 md:pr-8">
        <Image
          src={socialsImage}
          alt="TikTok screenshot showing Georgie the frog, and a second photo baby Stompy the emu on a scale"
          className="mx-auto h-auto w-full max-w-lg"
        />
      </div>

      <div className="basis-full pb-16 md:basis-1/2 md:py-4">
        <Heading level={2}>Stay Updated!</Heading>

        <p className="my-4">
          follow <span className="font-bold">@alveussanctuary</span> on all
          social platforms to keep up to date!
        </p>

        <ul className="flex flex-wrap gap-4">
          {Object.entries(socials).map(([key, social]) => (
            <li key={key}>
              <a
                className="block rounded-2xl bg-alveus-tan p-3 text-alveus-green transition-colors hover:bg-alveus-green hover:text-alveus-tan"
                href={social.link}
                target="_blank"
                rel="noreferrer"
                aria-label={social.title}
              >
                <social.icon size={24} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </Section>
);

export default Socials;

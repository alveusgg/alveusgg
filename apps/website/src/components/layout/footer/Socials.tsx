import React from "react";

import Link from "next/link";
import Image from "next/image";

import reelVideo from "@/assets/socials/gerogie-reel-clip.mp4";
import pic from "@/assets/socials/twitter-pic-winnie.jpg";
import IconInstagram from "@/icons/IconInstagram";
import IconTwitter from "@/icons/IconTwitter";

import socials from "@/components/shared/data/socials";

import Heading from "@/components/content/Heading";
import Section from "@/components/content/Section";
import Video from "@/components/content/Video";

const Socials = () => (
  <Section dark className="z-0 pb-0">
    <div className="flex flex-wrap-reverse items-center">
      <div className="basis-full md:basis-1/2 md:pt-0 md:pr-8">
        <div className="relative mx-auto -mt-10 aspect-[1.1/1] h-full w-full max-w-lg overflow-hidden">
          <Link
            href="https://www.instagram.com/p/CoIq_hvOxiQ/"
            rel="noreferrer"
            target="_blank"
            className="absolute top-[5%] left-[8%] aspect-[4/6.8] w-[60%] rotate-[-6.8deg] overflow-hidden rounded-3xl border-[7px] border-white bg-gray-700 drop-shadow-2xl transition-transform duration-150 hover:scale-[1.02]"
          >
            <Video
              {...reelVideo}
              className="absolute inset-0"
              autoPlay
              loop
              muted
              playsInline
            />
            <IconInstagram
              className="absolute top-0 right-0 m-3 opacity-60"
              size={30}
            />
          </Link>
          <Link
            href="https://twitter.com/AlveusSanctuary/status/1627138286140461063/"
            rel="noreferrer"
            target="_blank"
            className="absolute top-[23%] right-[3%] aspect-square w-[45%] rotate-[4.26deg] overflow-hidden rounded-2xl border-[7px] border-white bg-gray-700 drop-shadow-lg transition-transform duration-150 hover:scale-[1.02]"
          >
            <Image
              {...pic}
              width={400}
              height={400}
              loading="lazy"
              alt=""
              className="absolute inset-0"
            />
            <IconTwitter
              className="absolute top-0 right-0 m-3 opacity-80"
              size={30}
            />
          </Link>
        </div>
      </div>

      <div className="basis-full pt-8 pb-16 md:basis-1/2 md:py-4">
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

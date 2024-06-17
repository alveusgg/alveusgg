import Link from "next/link";
import Image from "next/image";

import usePrefersReducedMotion from "@/hooks/motion";
import useCrawler from "@/hooks/crawler";

import reelVideo from "@/assets/socials/georgie-reel-clip.mp4?quality=low";
import pic from "@/assets/socials/twitter-pic-winnie.jpg";

import IconInstagram from "@/icons/IconInstagram";
import IconTwitter from "@/icons/IconTwitter";

import socials from "@/components/shared/data/socials";
import updateChannels from "@/components/shared/data/updateChannels";

import Heading from "@/components/content/Heading";
import Section from "@/components/content/Section";
import Video from "@/components/content/Video";
import { NotificationsButton } from "@/components/notifications/NotificationsButton";

const buttonClasses =
  "block rounded-2xl bg-alveus-tan p-3 text-alveus-green transition-colors hover:bg-alveus-green-800 hover:text-alveus-tan dark:hover:bg-alveus-green-900";

const Socials = () => {
  const reducedMotion = usePrefersReducedMotion();

  // If this is a known crawler, we'll not load the video
  // This is an attempt to stop Google reporting unindexable video pages
  const crawler = useCrawler();

  return (
    <Section dark className="z-0 py-0">
      <div className="flex flex-wrap-reverse gap-y-4 pt-8">
        <div className="mt-auto basis-full md:basis-1/2 md:pr-8">
          <div className="relative mx-auto aspect-[1.1/1] h-full w-full max-w-lg overflow-hidden">
            <Link
              href="https://www.instagram.com/p/CoIq_hvOxiQ/"
              rel="noreferrer"
              target="_blank"
              className="absolute left-[8%] top-[5%] aspect-[4/6.8] w-[60%] rotate-[-6.8deg] overflow-hidden rounded-3xl border-[7px] border-white bg-gray-700 shadow-2xl transition-transform duration-150 hover:scale-102"
            >
              <span className="sr-only">
                Open Instagram post of Georgie, Alveus&apos; African Bullfrog
              </span>
              {crawler || reducedMotion ? (
                <Image
                  src={reelVideo.poster}
                  alt=""
                  width={400}
                  height={680}
                  loading="lazy"
                  className="absolute inset-0"
                />
              ) : (
                <Video
                  sources={reelVideo.sources}
                  poster={reelVideo.poster}
                  className="absolute inset-0"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}
              <IconInstagram
                className="absolute right-0 top-0 m-3 opacity-60"
                size={30}
              />
            </Link>
            <Link
              href="https://twitter.com/AlveusSanctuary/status/1627138286140461063/"
              rel="noreferrer"
              target="_blank"
              className="absolute right-[3%] top-[23%] aspect-square w-[45%] rotate-[4.26deg] overflow-hidden rounded-2xl border-[7px] border-white bg-gray-700 shadow-lg transition-transform duration-150 hover:scale-102"
            >
              <Image
                src={pic}
                width={400}
                height={400}
                loading="lazy"
                alt="A picture of Winnie the Moo, Alveus' Red Angus cow, on X (Twitter)"
                className="absolute inset-0"
              />
              <IconTwitter
                className="absolute right-0 top-0 m-3 opacity-80"
                size={30}
              />
            </Link>
          </div>
        </div>

        <div className="my-auto basis-full py-4 md:basis-1/2">
          <Heading level={2}>Stay Updated!</Heading>

          <p className="mb-2 mt-4">
            follow <span className="font-bold">@alveussanctuary</span> on all
            social platforms!
          </p>

          <ul className="flex flex-wrap gap-4">
            {Object.entries(socials).map(([key, social]) => (
              <li key={key}>
                <a
                  className={buttonClasses}
                  href={social.link}
                  target="_blank"
                  rel="noreferrer"
                  title={social.title}
                >
                  <social.icon size={24} />
                </a>
              </li>
            ))}
          </ul>

          <p className="mb-2 mt-4">
            and keep up-to-date with our announcement channels:
          </p>

          <ul className="flex flex-wrap gap-4">
            <li>
              <NotificationsButton
                className={buttonClasses}
                openDirectionX="right"
                openDirectionY="top"
              />
            </li>
            {Object.entries(updateChannels).map(([key, updateChannel]) => (
              <li key={key}>
                <a
                  className={buttonClasses}
                  href={updateChannel.link}
                  target="_blank"
                  rel="noreferrer"
                  title={updateChannel.title}
                >
                  <updateChannel.icon size={24} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
};

export default Socials;

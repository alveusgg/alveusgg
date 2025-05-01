import Image from "next/image";
import Link from "next/link";

import useCrawler from "@/hooks/crawler";
import usePrefersReducedMotion from "@/hooks/motion";

import Heading from "@/components/content/Heading";
import Section from "@/components/content/Section";
import Video from "@/components/content/Video";
import { NotificationsButton } from "@/components/notifications/NotificationsButton";
import socials from "@/components/shared/data/socials";
import updateChannels from "@/components/shared/data/updateChannels";

import IconInstagram from "@/icons/IconInstagram";
import IconTwitter from "@/icons/IconTwitter";

import reelVideo from "@/assets/socials/georgie-reel-clip.mp4?quality=low";
import pic from "@/assets/socials/twitter-pic-winnie.jpg";

const buttonClasses =
  "block rounded-2xl bg-alveus-tan p-3 text-alveus-green transition-colors hover:bg-alveus-green-800 hover:text-alveus-tan";

const Socials = () => {
  const reducedMotion = usePrefersReducedMotion();

  // If this is a known crawler, we'll not load the video
  // This is an attempt to stop Google reporting unindexable video pages
  const crawler = useCrawler();

  return (
    <Section dark className="z-0 py-0">
      <div className="flex flex-wrap-reverse gap-y-4 pt-8">
        <div className="mt-auto basis-full md:basis-1/2 md:pr-8">
          <div className="relative mx-auto aspect-[1.1/1] size-full max-w-lg overflow-hidden">
            <Link
              href="https://www.instagram.com/p/CoIq_hvOxiQ/"
              rel="noreferrer"
              target="_blank"
              className="absolute top-[5%] left-[8%] aspect-[4/6.8] w-3/5 rotate-[-6.8deg] overflow-hidden rounded-3xl border-[7px] border-white bg-gray-700 shadow-2xl transition-transform duration-150 hover:scale-102"
            >
              <span className="sr-only">
                Open Instagram post of Georgie, Alveus&apos; African Bullfrog
              </span>
              {crawler || reducedMotion ? (
                <Image
                  src={reelVideo.poster || ""}
                  alt=""
                  width={400}
                  height={680}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover"
                />
              ) : (
                <Video
                  sources={reelVideo.sources}
                  poster={reelVideo.poster}
                  className="absolute inset-0 size-full object-cover"
                  width={400}
                  height={680}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}
              <IconInstagram
                className="absolute top-0 right-0 m-3 opacity-60"
                size={30}
              />
            </Link>
            <Link
              href="https://x.com/AlveusSanctuary/status/1627138286140461063/"
              rel="noreferrer"
              target="_blank"
              className="absolute top-[23%] right-[3%] aspect-square w-[45%] rotate-[4.26deg] overflow-hidden rounded-2xl border-[7px] border-white bg-gray-700 shadow-lg transition-transform duration-150 hover:scale-102"
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
                className="absolute top-0 right-0 m-3 opacity-80"
                size={30}
              />
            </Link>
          </div>
        </div>

        <div className="my-auto basis-full py-4 md:basis-1/2">
          <Heading level={2}>Stay Updated!</Heading>

          <p className="mt-4 mb-2">
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
                  rel="noreferrer me"
                  title={social.title}
                >
                  <social.icon size={24} />
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-4 mb-2">
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

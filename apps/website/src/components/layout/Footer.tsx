import Image from "next/image";
import Link from "next/link";

import { classes } from "@/utils/classes";

import useCrawler from "@/hooks/crawler";
import usePrefersReducedMotion from "@/hooks/motion";

import Heading from "@/components/content/Heading";
import Section from "@/components/content/Section";
import Video from "@/components/content/Video";
import { NotificationsButton } from "@/components/notifications/NotificationsButton";
import socials from "@/components/shared/data/socials";
import updateChannels from "@/components/shared/data/updateChannels";

import IconGitHub from "@/icons/IconGitHub";
import IconInstagram from "@/icons/IconInstagram";
import IconTwitter from "@/icons/IconTwitter";

import logoImage from "@/assets/logo.png";
import reelVideo from "@/assets/socials/georgie-reel-clip.mp4?quality=low";
import pic from "@/assets/socials/twitter-pic-winnie.jpg";

import { MayaSignature } from "../content/Maya";

const buttonClasses =
  "block rounded-xl border border-alveus-tan p-2 text-alveus-tan transition-colors hover:bg-alveus-tan hover:text-alveus-green";

const linkClasses =
  "underline decoration-alveus-green-200 transition-colors text-alveus-tan hover:text-alveus-tan-50 hover:decoration-alveus-tan";

const links: { title: string; href: string }[] = [
  {
    title: "Alveus Ambassadors",
    href: "/ambassadors",
  },
  {
    title: "About Alveus",
    href: "/about",
  },
  {
    title: "Annual Reports",
    href: "/about/annual-reports",
  },
  {
    title: "Contact Us",
    href: "/contact-us",
  },
  {
    title: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    title: "Land Acknowledgment",
    href: "/about/land-acknowledgment",
  },
];

const Footer = () => {
  const reducedMotion = usePrefersReducedMotion();

  // If this is a known crawler, we'll not load the video
  // This is an attempt to stop Google reporting unindexable video pages
  const crawler = useCrawler();

  return (
    <Section dark className="z-0 py-0" as="footer">
      <div className="grid grid-cols-1 gap-8 pt-8 lg:grid-cols-5 lg:grid-rows-auto-2">
        <h2 className="sr-only">Page footer</h2>

        <div className="grid h-fit grid-cols-auto-2 justify-start gap-4 lg:col-span-2 lg:row-start-1">
          <Image
            src={logoImage}
            alt="Alveus Sanctuary Inc."
            height={120}
            className="h-28 w-auto"
          />

          <p className="my-auto w-fit uppercase">
            <span className="flex justify-between font-serif text-4xl leading-none">
              {"Alveus".split("").map((letter, index) => (
                // eslint-disable-next-line @eslint-react/no-array-index-key -- Each letter is at a fixed position
                <span key={index}>{letter}</span>
              ))}
            </span>{" "}
            <span className="flex justify-between pr-0.5 text-xl leading-none font-extrabold">
              {"Sanctuary".split("").map((letter, index) => (
                // eslint-disable-next-line @eslint-react/no-array-index-key -- Each letter is at a fixed position
                <span key={index}>{letter}</span>
              ))}
            </span>
          </p>

          <p className="col-start-2 text-sm font-semibold">
            Registered 501(c)(3) nonprofit
            <br />
            EIN 86-1772907
          </p>
        </div>

        <div className="relative aspect-[1.1/1] size-full h-fit max-w-lg self-end overflow-y-clip max-lg:order-last lg:col-span-2 lg:row-start-2">
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

        <div className="flex flex-col justify-between gap-8 lg:col-span-3 lg:row-span-full lg:pb-8">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div>
              <p className="font-bold tracking-widest text-alveus-tan-200 uppercase">
                @alveussanctuary
              </p>
              <Heading level={2} className="text-5xl text-balance">
                Stay connected to the sanctuary.
              </Heading>
              <p className="text-alveus-green-200">
                Follow along with the ambassadors, their care, and our work.
              </p>
            </div>

            <div className="flex flex-col gap-4 xl:justify-self-end">
              <div>
                <p className="mb-2 text-sm font-bold tracking-widest text-alveus-green-200 uppercase">
                  Follow us
                </p>

                <ul className="flex flex-wrap gap-2">
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
              </div>

              <div>
                <p className="mb-2 text-sm font-bold tracking-widest text-alveus-green-200 uppercase">
                  Announcement channels
                </p>

                <ul className="flex flex-wrap gap-2">
                  <li>
                    <NotificationsButton
                      size={24}
                      className={buttonClasses}
                      openDirectionX="right"
                      openDirectionY="top"
                    />
                  </li>
                  {Object.entries(updateChannels).map(
                    ([key, updateChannel]) => (
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
                    ),
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-serif text-2xl text-alveus-green-100">
              <span>&ldquo;</span>I love the natural world with my whole heart
              and entire being.
              <br className="hidden sm:block" /> All I want is to inspire that
              same love in others.
              <span>&rdquo;</span>
            </p>

            <div className="flex items-start gap-2">
              <MayaSignature className="h-8 text-alveus-green-200" />
              <p className="sr-only">Maya Higa</p>
              <p className="text-xs/loose tracking-widest text-alveus-green-200 uppercase">
                Founder, Alveus Sanctuary
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={classes(
                      linkClasses,
                      "font-semibold underline-offset-6",
                    )}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-balance text-alveus-green-200">
              <span>
                Original design by Chanelrooh, built by the{" "}
                <Link
                  href="https://github.com/alveusgg"
                  rel="noreferrer"
                  target="_blank"
                  className={classes(linkClasses, "underline-offset-4")}
                >
                  <IconGitHub size={16} className="mr-1 inline-block" />
                  Alveus.gg team
                </Link>{" "}
                and community.
              </span>

              <span>
                Copyright &copy; {new Date().getFullYear()} Alveus Sanctuary.
                All rights reserved.
              </span>
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Footer;

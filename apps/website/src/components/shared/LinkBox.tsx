import React from "react";

import youtubeIcon from "simple-icons/icons/youtube.svg";
import instagramIcon from "simple-icons/icons/instagram.svg";
import tiktokIcon from "simple-icons/icons/tiktok.svg";
import twitterIcon from "simple-icons/icons/twitter.svg";
import twitchIcon from "simple-icons/icons/twitch.svg";
import Image from "next/image";

export const LinkBoxIcon: React.FC<{ src: string; alt?: string }> = ({
  src,
  alt = "",
}) => <Image className="h-8 w-8" src={src} alt={alt} />;

const Link: React.FC<{
  href: string;
  children: React.ReactNode;
}> = ({ href, children }) => (
  <li className="md:basis-[calc(50%-1em)] lg:basis-[calc(33.3%-1em)]">
    <a
      className="flex items-center gap-5 rounded-xl border bg-white/80 px-5 py-2 text-xl transition-colors transition-transform hover:scale-[1.01] hover:bg-white"
      rel="noopener noreferrer"
      target="_blank"
      href={href}
    >
      {children}
    </a>
  </li>
);

export const LinkBox: React.FC<
  {
    children: React.ReactNode;
  } & React.HTMLProps<HTMLUListElement>
> & {
  Link: typeof Link;
} = ({ children, className = "" }) => (
  <ul className={`flex flex-col gap-4 md:flex-row md:flex-wrap ${className}`}>
    {children}
  </ul>
);

LinkBox.Link = Link;

export const LinkBoxSocials = () => (
  <>
    <LinkBox.Link href="https://www.twitch.tv/alveussanctuary">
      <LinkBoxIcon src={twitchIcon} />
      Twitch
    </LinkBox.Link>
    <LinkBox.Link href="https://www.youtube.com/AlveusSanctuary">
      <LinkBoxIcon src={youtubeIcon} />
      YouTube
    </LinkBox.Link>
    <LinkBox.Link href="https://www.instagram.com/alveussanctuary/">
      <LinkBoxIcon src={instagramIcon} />
      Instagram
    </LinkBox.Link>
    <LinkBox.Link href="https://www.tiktok.com/@alveussanctuary">
      <LinkBoxIcon src={tiktokIcon} />
      TikTok
    </LinkBox.Link>
    <LinkBox.Link href="https://twitter.com/AlveusSanctuary">
      <LinkBoxIcon src={twitterIcon} />
      Twitter
    </LinkBox.Link>
  </>
);

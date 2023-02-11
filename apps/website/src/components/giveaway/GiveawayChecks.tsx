import React, { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { GlobeAltIcon } from "@heroicons/react/24/outline";
import twitterIcon from "simple-icons/icons/twitter.svg";
import youtubeIcon from "simple-icons/icons/youtube.svg";
import instagramIcon from "simple-icons/icons/instagram.svg";
import tiktokIcon from "simple-icons/icons/tiktok.svg";

export const Icon: React.FC<{ src: string; alt?: string }> = ({
  src,
  alt = "",
}) => <Image className="h-8 w-8" src={src} alt={alt} />;

const GiveawayCheck: React.FC<{
  name: string;
  label: string;
  children: React.ReactNode;
  url?: string;
}> = ({ name, label, children, url }) => {
  const [isClicked, setIsClicked] = useState(false);

  const needsToBeClicked = url !== undefined;

  const handleClick = useCallback(() => {
    // Wait at least 2 seconds before allowing to check the checkmark
    setTimeout(() => setIsClicked(true), 1000);
  }, []);

  const id = `giveaway-req-${name}`;
  const containerClasses =
    "flex flex-row rounded border border-gray-200 bg-white shadow-xl";
  const disabled = needsToBeClicked && !isClicked;
  const content = (
    <>
      <span className="flex flex-1 flex-row items-center gap-5 p-5">
        {children}
      </span>
      <label
        htmlFor={id}
        className={`flex flex-row items-center ${
          disabled ? "bg-gray-200" : "bg-white"
        }  px-5`}
      >
        <span className="sr-only">{label}</span>
        <input
          id={id}
          name={`req-${name}`}
          value="yes"
          type="checkbox"
          disabled={disabled}
          defaultChecked={needsToBeClicked && isClicked}
          required={true}
        />
      </label>
    </>
  );

  if (needsToBeClicked) {
    return (
      <Link
        rel="noreferrer"
        target="_blank"
        onClick={handleClick}
        href={url}
        className={`${containerClasses} underline`}
      >
        {content}
      </Link>
    );
  } else {
    return <div className={containerClasses}>{content}</div>;
  }
};

export const GiveawayChecks: React.FC = () => (
  <div className="flex flex-col gap-5">
    <GiveawayCheck name="twitter" label="Follow @AlveusSanctuary on Twitter">
      <Icon src={twitterIcon} />
      <span>
        Follow{" "}
        <Link
          className="underline"
          href="https://twitter.com/AlveusSanctuary"
          rel="noreferrer"
          target="_blank"
        >
          @AlveusSanctuary on Twitter
        </Link>
      </span>
    </GiveawayCheck>

    <GiveawayCheck
      name="yt-main"
      label="Subscribe to AlveusSanctuary on YouTube"
    >
      <Icon src={youtubeIcon} />
      <span>
        Subscribe to{" "}
        <Link
          className="underline"
          href="https://www.youtube.com/alveussanctuary?sub_confirmation=1"
          rel="noreferrer"
          target="_blank"
        >
          AlveusSanctuary on YouTube
        </Link>
      </span>
    </GiveawayCheck>

    <GiveawayCheck
      name="yt-clips"
      label="Subscribe to AlveusSanctuaryHighlights on YouTube"
    >
      <Icon src={youtubeIcon} />
      <span>
        Subscribe to{" "}
        <Link
          className="underline"
          href="https://www.youtube.com/@alveussanctuaryhighlights?sub_confirmation=1"
          rel="noreferrer"
          target="_blank"
        >
          AlveusSanctuaryHighlights on YouTube
        </Link>
      </span>
    </GiveawayCheck>

    <GiveawayCheck name="ig" label="Follow @alveussanctuary on Instagram">
      <Icon src={instagramIcon} />
      <span>
        Follow{" "}
        <Link
          className="underline"
          href="https://www.instagram.com/alveussanctuary/"
          rel="noreferrer"
          target="_blank"
        >
          @alveussanctuary on Instagram
        </Link>
      </span>
    </GiveawayCheck>

    <GiveawayCheck name="tiktok" label="Follow @alveussanctuary on TikTok">
      <Icon src={tiktokIcon} />
      <span>
        Follow{" "}
        <Link
          className="underline"
          href="https://www.tiktok.com/@alveussanctuary"
          rel="noreferrer"
          target="_blank"
        >
          @alveussanctuary on TikTok
        </Link>
      </span>
    </GiveawayCheck>

    <GiveawayCheck
      name="website"
      url="https://alveussanctuary.org/"
      label="Visit our Website"
    >
      <GlobeAltIcon className="h-8 w-8" />
      <span>Visit our Website</span>
    </GiveawayCheck>
  </div>
);

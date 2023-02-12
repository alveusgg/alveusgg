import React, { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { GlobeAltIcon } from "@heroicons/react/24/outline";
import twitchIcon from "simple-icons/icons/twitch.svg";
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

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.currentTarget === e.target) {
      // Wait at least 2 seconds before allowing to check the checkmark
      setTimeout(() => setIsClicked(true), 1000);
    }
  }, []);

  const containerClasses =
    "flex flex-row rounded border border-gray-200 bg-white shadow-xl";
  const disabled = needsToBeClicked && !isClicked;
  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      if (disabled) {
        e.preventDefault();
      }
    },
    [disabled]
  );

  const content = (
    <>
      <span className="flex flex-1 flex-row items-center gap-5 p-5">
        {children}
      </span>
      <label
        className={`flex flex-row items-center ${
          disabled ? "pointer-events-none bg-gray-200" : "bg-white"
        }  px-5`}
      >
        <span className="sr-only">{label}</span>
        <input
          name={`req-${name}`}
          value="yes"
          type="checkbox"
          onClick={handleCheckboxClick}
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
    <GiveawayCheck
      name="twitter"
      label="Follow AlveusSanctuary on Twitch"
      url="https://twitch.tv/AlveusSanctuary"
    >
      <Icon src={twitchIcon} />
      <span>Follow AlveusSanctuary on Twitch</span>
    </GiveawayCheck>

    <GiveawayCheck
      name="twitter"
      label="Follow @AlveusSanctuary on Twitter"
      url="https://twitter.com/AlveusSanctuary"
    >
      <Icon src={twitterIcon} />
      <span>Follow @AlveusSanctuary on Twitter</span>
    </GiveawayCheck>

    <GiveawayCheck
      name="yt-main"
      label="Subscribe to AlveusSanctuary on YouTube"
      url="https://www.youtube.com/alveussanctuary?sub_confirmation=1"
    >
      <Icon src={youtubeIcon} />
      <span>Subscribe to AlveusSanctuary on YouTube</span>
    </GiveawayCheck>

    <GiveawayCheck
      name="ig"
      label="Follow @alveussanctuary on Instagram"
      url="https://www.instagram.com/alveussanctuary/"
    >
      <Icon src={instagramIcon} />
      <span>Follow @alveussanctuary on Instagram</span>
    </GiveawayCheck>

    <GiveawayCheck
      name="tiktok"
      label="Follow @alveussanctuary on TikTok"
      url="https://www.tiktok.com/@alveussanctuary"
    >
      <Icon src={tiktokIcon} />
      <span>Follow @alveussanctuary on TikTok</span>
    </GiveawayCheck>

    <GiveawayCheck
      name="website"
      label="Visit our Website"
      url="https://alveussanctuary.org/"
    >
      <GlobeAltIcon className="h-8 w-8" />
      <span>Visit our Website</span>
    </GiveawayCheck>
  </div>
);

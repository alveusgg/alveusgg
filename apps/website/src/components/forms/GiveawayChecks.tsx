import React, { useCallback, useState } from "react";
import Link from "next/link";

import IconTwitch from "@/icons/IconTwitch";
import IconTwitter from "@/icons/IconTwitter";
import IconYouTube from "@/icons/IconYouTube";
import IconInstagram from "@/icons/IconInstagram";
import IconTikTok from "@/icons/IconTikTok";
import IconShoppingCart from "@/icons/IconShoppingCart";

import { classes } from "@/utils/classes";

const GiveawayCheck: React.FC<{
  name: string;
  label: string;
  children: React.ReactNode;
  url?: string;
}> = ({ name, label, children, url }) => {
  const [isClicked, setIsClicked] = useState(false);
  const hasLink = url !== undefined;

  // If this is a link, and the user has already clicked once,
  // then just the children should be the link (not the checkbox)
  const childrenJsx =
    hasLink && isClicked ? (
      <Link
        rel="noreferrer"
        target="_blank"
        href={url}
        className="flex flex-1 flex-row items-center gap-5 p-5 underline"
      >
        {children}
      </Link>
    ) : (
      <span className="flex flex-1 flex-row items-center gap-5 p-5">
        {children}
      </span>
    );

  // Disable the checkbox if this is a link, and the user hasn't clicked yet
  const disabled = hasLink && !isClicked;
  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      if (disabled) {
        e.preventDefault();
      }
    },
    [disabled],
  );

  const checkboxJsx = (
    <label
      className={classes(
        "flex cursor-pointer flex-row items-center px-5",
        disabled ? "pointer-events-none bg-gray-200" : "bg-white",
      )}
    >
      <span className="sr-only">{label}</span>
      <input
        name={`req-${name}`}
        value="yes"
        type="checkbox"
        defaultChecked={hasLink && isClicked}
        required={true}
        aria-disabled={disabled}
        onClick={handleCheckboxClick}
        className={classes(disabled && "opacity-50")}
      />
    </label>
  );

  const handleLinkClick = useCallback(() => {
    // Wait at least 2 seconds before allowing to check the checkmark
    setTimeout(() => setIsClicked(true), 1000);
  }, []);

  const containerClasses =
    "flex flex-row rounded border border-gray-200 bg-white shadow-xl";

  // If we have a link, and the user hasn't clicked yet, then the whole container should be a link
  if (hasLink && !isClicked) {
    return (
      <Link
        rel="noreferrer"
        target="_blank"
        href={url}
        onClick={handleLinkClick}
        className={classes(containerClasses, "underline")}
      >
        {childrenJsx}
        {checkboxJsx}
      </Link>
    );
  }

  // Otherwise, just render the container with the checkbox and children
  return (
    <div className={containerClasses}>
      {childrenJsx}
      {checkboxJsx}
    </div>
  );
};

export const GiveawayChecks: React.FC = () => (
  <div className="flex flex-col gap-5">
    <GiveawayCheck
      name="twitter"
      label="Follow AlveusSanctuary on Twitch"
      url="https://twitch.tv/AlveusSanctuary"
    >
      <IconTwitch size={32} />
      <span>Follow AlveusSanctuary on Twitch</span>
    </GiveawayCheck>

    <GiveawayCheck
      name="twitter"
      label="Follow @AlveusSanctuary on Twitter"
      url="https://twitter.com/intent/follow?user_id=1349932850632667137"
    >
      <IconTwitter size={32} />
      <span>Follow @AlveusSanctuary on Twitter</span>
    </GiveawayCheck>

    <GiveawayCheck
      name="yt-main"
      label="Subscribe to AlveusSanctuary on YouTube"
      url="https://www.youtube.com/alveussanctuary?sub_confirmation=1"
    >
      <IconYouTube size={32} />
      <span>Subscribe to AlveusSanctuary on YouTube</span>
    </GiveawayCheck>

    <GiveawayCheck
      name="ig"
      label="Follow @alveussanctuary on Instagram"
      url="https://www.instagram.com/alveussanctuary/"
    >
      <IconInstagram size={32} />
      <span>Follow @alveussanctuary on Instagram</span>
    </GiveawayCheck>

    <GiveawayCheck
      name="tiktok"
      label="Follow @alveussanctuary on TikTok"
      url="https://www.tiktok.com/@alveussanctuary"
    >
      <IconTikTok size={32} />
      <span>Follow @alveussanctuary on TikTok</span>
    </GiveawayCheck>

    <GiveawayCheck name="website" label="Visit our Merch Store" url="/shop">
      <IconShoppingCart size={32} />
      <span>Visit our Merch Store</span>
    </GiveawayCheck>
  </div>
);

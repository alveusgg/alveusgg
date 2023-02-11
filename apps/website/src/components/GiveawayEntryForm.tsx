import React, { useCallback, useState } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import type { Giveaway, GiveawayEntry } from "@prisma/client";
import Link from "next/link";

import { GlobeAltIcon } from "@heroicons/react/24/outline";
import twitterIcon from "simple-icons/icons/twitter.svg";
import youtubeIcon from "simple-icons/icons/youtube.svg";
import instagramIcon from "simple-icons/icons/instagram.svg";
import tiktokIcon from "simple-icons/icons/tiktok.svg";

import { trpc } from "../utils/trpc";
import {
  DEFAULT_COUNTRY_CODE,
  commonCountries,
  otherCountries,
} from "../utils/countries";

import { Headline } from "./shared/Headline";
import IconTwitch from "../icons/IconTwitch";

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

export const GiveawayEntryForm: React.FC<{
  giveaway: Giveaway;
  existingEntry: GiveawayEntry | null;
}> = ({ giveaway, existingEntry }) => {
  const { data: session } = useSession();

  const enterGiveaway = trpc.giveaways.enterGiveaway.useMutation();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const data = new FormData(e.currentTarget);
      enterGiveaway.mutate({
        giveawayId: giveaway.id,
        givenName: String(data.get("given-name")),
        familyName: String(data.get("family-name")),
        addressLine1: String(data.get("address-line1")),
        addressLine2: String(data.get("address-line2")),
        country: String(data.get("country")),
        state: String(data.get("state")),
        city: String(data.get("city")),
        postalCode: String(data.get("postal-code")),
      });
    },
    [enterGiveaway, giveaway.id]
  );

  if (!session?.user?.id) {
    return (
      <div className="rounded-lg bg-white p-2 shadow-xl">
        <p className="mb-4">
          You need to be logged in with Twitch to enter the giveaway.
        </p>

        <button
          className="flex w-full flex-row justify-center gap-2 rounded-xl bg-[#6441a5] p-3 text-center font-semibold text-white no-underline"
          onClick={() => signIn("twitch")}
        >
          <IconTwitch />
          <span>Log in</span>
        </button>
      </div>
    );
  }

  if (enterGiveaway.isSuccess) {
    return (
      <div className="rounded-lg bg-green-100 p-2 shadow-xl">
        You have been successfully entered in the giveaway! Good luck!
      </div>
    );
  }

  if (existingEntry) {
    return (
      <div className="rounded-lg bg-green-100 p-2 shadow-xl">
        You already are entered in this giveaway! Good luck!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {enterGiveaway.error && (
        <div className="rounded-lg bg-red-200 p-2 text-red-900 shadow-xl">
          Error: {enterGiveaway.error.message}
        </div>
      )}

      <Headline>Steps to enter</Headline>

      <div className="flex flex-col gap-5">
        <GiveawayCheck
          name="twitter"
          label="Follow @AlveusSanctuary on Twitter"
        >
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

      <Headline>Enter your details</Headline>

      <fieldset>
        <legend className="mb-2 font-bold">Name</legend>

        <div className="flex flex-col gap-5 md:flex-row">
          <label className="flex-1">
            First name
            <br />
            <input
              className="w-full rounded-sm border border-gray-700 bg-white p-1"
              name="given-name"
              type="text"
              autoComplete="given-name"
              required={true}
              minLength={1}
            />
          </label>

          <label className="flex-1">
            Last name
            <br />
            <input
              className="w-full rounded-sm border border-gray-700 bg-white p-1"
              name="family-name"
              type="text"
              autoComplete="family-name"
              required={true}
              minLength={1}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="mt-3">
        <legend className="mb-2 font-bold">Shipping address</legend>

        <div className="flex flex-col gap-2">
          <label className="flex-1">
            Street Address
            <br />
            <input
              className="w-full rounded-sm border border-gray-700 bg-white p-1"
              name="address-line1"
              type="text"
              autoComplete="address-line1"
              required={true}
              minLength={1}
            />
          </label>

          <label className="flex-1">
            Second address line
            <br />
            <input
              className="w-full rounded-sm border border-gray-700 bg-white p-1"
              name="address-line2"
              type="text"
              autoComplete="address-line2"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-col gap-5 md:flex-row">
          <label className="flex-1">
            City
            <br />
            <input
              className="w-full rounded-sm border border-gray-700 bg-white p-1"
              name="city"
              type="text"
              autoComplete="address-level2"
              required={true}
              minLength={1}
            />
          </label>

          <label className="flex-1">
            ZIP / Postal Code
            <br />
            <input
              className="w-full rounded-sm border border-gray-700 bg-white p-1"
              name="postal-code"
              type="text"
              autoComplete="postal-code"
              required={true}
              minLength={1}
            />
          </label>
        </div>

        <div className="mt-3 flex flex-col gap-5 md:flex-row">
          <label className="flex-1">
            State / Province / Region
            <br />
            <input
              className="w-full rounded-sm border border-gray-700 bg-white p-1"
              name="state"
              type="text"
              autoComplete="address-level1"
              required={true}
              minLength={1}
            />
          </label>

          <label className="flex-1">
            Country
            <br />
            <select
              className="w-full rounded-sm border border-gray-700 bg-white p-1"
              name="country"
              autoComplete="country"
              required={true}
            >
              <optgroup>
                {commonCountries.map((country) => (
                  <option
                    key={country.code}
                    value={country.code}
                    defaultChecked={country.code === DEFAULT_COUNTRY_CODE}
                  >
                    {country.name}
                  </option>
                ))}
              </optgroup>
              <optgroup>
                {otherCountries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="mt-3">
        <legend className="mb-2 font-bold">Rules</legend>
        <label className="flex flex-row gap-3">
          <input type="checkbox" required={true} />
          <span>
            I agree to the{" "}
            <Link
              className="underline"
              href={`/giveaways/${giveaway.slug || giveaway.id}/rules`}
              target="_blank"
            >
              Official Rules
            </Link>
          </span>
        </label>
      </fieldset>

      <div className="mt-7">
        <button
          type="submit"
          className="block w-full rounded-lg bg-gray-600 p-4 text-white"
          disabled={enterGiveaway.isLoading}
        >
          Enter to Win
        </button>
      </div>
    </form>
  );
};

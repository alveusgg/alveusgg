import React, { useCallback } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import type { Raffle, RaffleEntry } from "@prisma/client";

import twitterIcon from "simple-icons/icons/twitter.svg";
import youtubeIcon from "simple-icons/icons/youtube.svg";
//import twitchIcon from "simple-icons/icons/twitch.svg";
//import instagramIcon from "simple-icons/icons/instagram.svg";
//import tiktokIcon from "simple-icons/icons/tiktok.svg";

import { trpc } from "../utils/trpc";

import { Headline } from "./shared/Headline";

export const Icon: React.FC<{ src: string; alt?: string }> = ({
  src,
  alt = "",
}) => <Image className="h-8 w-8" src={src} alt={alt} />;

export const RaffleEntryForm: React.FC<{
  raffle: Raffle;
  existingEntry: RaffleEntry | null;
}> = ({ raffle, existingEntry }) => {
  const { data: session } = useSession();

  const enterRaffle = trpc.raffles.enterRaffle.useMutation();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const data = new FormData(e.currentTarget);
      enterRaffle.mutate({
        raffleId: raffle.id,
        givenName: String(data.get("given-name")),
        familyName: String(data.get("family-name")),
        addressLine1: String(data.get("address-line1")),
        addressLine2: String(data.get("address-line2")),
        // country, state, postal code etc.
      });
    },
    [enterRaffle, raffle.id]
  );

  if (!session?.user?.id) {
    return (
      <div className="rounded-lg bg-white p-2 shadow-xl">
        <p>You need to be logged in with Twitch to enter the raffle.</p>

        <button
          className="px-5 font-semibold text-white no-underline transition hover:bg-black/20"
          onClick={() => signIn("twitch")}
        >
          Log in
        </button>
      </div>
    );
  }

  if (enterRaffle.isSuccess) {
    return (
      <div className="rounded-lg bg-green-100 p-2 shadow-xl">
        You have been successfully entered in the raffle! Good luck!
      </div>
    );
  }

  if (existingEntry) {
    return (
      <div className="rounded-lg bg-green-100 p-2 shadow-xl">
        You already are entered in this raffle! Good luck!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {enterRaffle.error && (
        <div className="rounded-lg bg-red-200 p-2 text-red-900 shadow-xl">
          Error: {enterRaffle.error.message}
        </div>
      )}

      <Headline>Steps to enter</Headline>

      <div className="flex flex-col gap-5">
        <div className="flex flex-row rounded border border-gray-200 bg-white p-5 shadow-xl">
          <label
            htmlFor="raffle-req-twitter"
            className="flex flex-1 flex-row items-center gap-5"
          >
            <Icon src={twitterIcon} />
            <span>Follow @AlveusSanctuary on Twitter</span>
          </label>
          <input
            id="raffle-req-twitter"
            name="req-twitter"
            value="yes"
            type="checkbox"
            required={true}
          />
        </div>

        <div className="flex flex-row rounded border border-gray-200 bg-white p-5 shadow-xl">
          <label
            htmlFor="raffle-req-yt-main"
            className="flex flex-1 flex-row items-center gap-5"
          >
            <Icon src={youtubeIcon} />
            <span>Subscribe to AlveusSanctuary on YouTube</span>
          </label>
          <input
            id="raffle-req-yt-main"
            name="req-yt-main"
            value="yes"
            type="checkbox"
            required={true}
          />
        </div>

        <div className="flex flex-row rounded border border-gray-200 bg-white p-5 shadow-xl">
          <label
            htmlFor="raffle-req-yt-clips"
            className="flex flex-1 flex-row items-center gap-5"
          >
            <Icon src={youtubeIcon} />
            <span>Subscribe to @AlveusSanctuaryHighlights on YouTube</span>
          </label>
          <input
            id="raffle-req-yt-clips"
            name="req-yt-clips"
            value="yes"
            type="checkbox"
            required={true}
          />
        </div>
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

      <fieldset className="mt-5">
        <legend className="mb-2 font-bold">Shipping address</legend>

        <div className="flex flex-col gap-5">
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
              required={true}
              minLength={1}
            />
          </label>
        </div>
      </fieldset>

      <div className="mt-5">
        <button
          type="submit"
          className="block w-full rounded-lg bg-gray-600 p-4 text-white"
          disabled={enterRaffle.isLoading}
        >
          Enter to Win
        </button>
      </div>
    </form>
  );
};

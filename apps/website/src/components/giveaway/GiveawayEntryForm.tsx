import React, { useCallback } from "react";
import { signIn, useSession } from "next-auth/react";
import type { Giveaway, GiveawayEntry } from "@prisma/client";

import { calcGiveawayConfig } from "../../utils/giveaways";
import { trpc } from "../../utils/trpc";
import IconTwitch from "../../icons/IconTwitch";
import { Headline } from "../shared/Headline";

import { GiveawayChecks } from "./GiveawayChecks";
import { GiveawayEntryShippingAddressFieldset } from "./GiveawayEntryShippingAddressFieldset";
import { GiveawayEntryNameFieldset } from "./GiveawayEntryNameFieldset";
import { GiveawayEntryContactFieldset } from "./GiveawayEntryContactFieldset";
import { GiveawayEntryRulesFieldset } from "./GiveawayEntryRulesFieldset";

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
        email: String(data.get("email")),
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
        <p className="mb-4">You need to be logged in with Twitch to enter.</p>

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
        Your entry was successful!
      </div>
    );
  }

  if (existingEntry) {
    return (
      <div className="rounded-lg bg-green-100 p-2 shadow-xl">
        You are already entered!
      </div>
    );
  }

  const config = calcGiveawayConfig(giveaway.config);

  return (
    <form onSubmit={handleSubmit}>
      {config.introHTML && (
        <p
          className="alveus-ugc my-3 text-lg"
          dangerouslySetInnerHTML={{ __html: config.introHTML }}
        />
      )}

      {enterGiveaway.error && (
        <div className="rounded-lg bg-red-200 p-2 text-red-900 shadow-xl">
          Error: {enterGiveaway.error.message}
        </div>
      )}

      {config.checks && (
        <>
          <Headline>Steps to enter</Headline>
          <GiveawayChecks />
        </>
      )}

      <Headline>Enter your details</Headline>

      <div className="flex flex-col gap-4">
        <GiveawayEntryNameFieldset />
        <GiveawayEntryContactFieldset
          defaultEmailAddress={session.user.email || undefined}
        />
        <GiveawayEntryShippingAddressFieldset />
        {config.rulesHTML && <GiveawayEntryRulesFieldset giveaway={giveaway} />}
      </div>

      <div className="mt-7">
        <button
          type="submit"
          className="block w-full rounded-lg bg-gray-600 p-4 text-white"
          disabled={enterGiveaway.isLoading}
        >
          {config.submitButtonText || "Enter to Win"}
        </button>
      </div>
    </form>
  );
};

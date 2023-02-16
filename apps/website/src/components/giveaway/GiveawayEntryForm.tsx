import React, { useCallback } from "react";
import { useSession } from "next-auth/react";
import type { Giveaway } from "@prisma/client";

import type { GiveawayEntryWithAddress } from "../../pages/giveaways/[giveawayId]";
import { calcGiveawayConfig } from "../../utils/giveaways";
import { trpc } from "../../utils/trpc";
import { getCountryName } from "../../utils/countries";

import { LoginWithTwitchButton } from "../shared/LoginWithTwitchButton";
import { Headline } from "../shared/Headline";
import { Button } from "../shared/Button";
import { MessageBox } from "../shared/MessageBox";
import { GiveawayChecks } from "./GiveawayChecks";
import { GiveawayEntryShippingAddressFieldset } from "./GiveawayEntryShippingAddressFieldset";
import { GiveawayEntryNameFieldset } from "./GiveawayEntryNameFieldset";
import { GiveawayEntryContactFieldset } from "./GiveawayEntryContactFieldset";
import { GiveawayEntryRulesFieldset } from "./GiveawayEntryRulesFieldset";

export const GiveawayEntryForm: React.FC<{
  giveaway: Giveaway;
  existingEntry: GiveawayEntryWithAddress | null;
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
      <MessageBox>
        <p className="mb-4">You need to be logged in with Twitch to enter.</p>

        <LoginWithTwitchButton />
      </MessageBox>
    );
  }

  if (enterGiveaway.isSuccess) {
    return (
      <MessageBox variant="success">Your entry was successful!</MessageBox>
    );
  }

  if (existingEntry) {
    return (
      <>
        <MessageBox variant="success">You are already entered!</MessageBox>

        <Headline>Check your data</Headline>
        <p className="my-2">
          Username: {session.user.name}
          <br />
          Email: {existingEntry.email}
          <br />
          Name: {existingEntry.givenName} {existingEntry.familyName}
        </p>
        <p className="my-2">
          <strong>Shipping address:</strong>
          <br />
          Street address: {existingEntry.mailingAddress.addressLine1}
          <br />
          Second address line:{" "}
          {existingEntry.mailingAddress.addressLine2 || "-"}
          <br />
          City: {existingEntry.mailingAddress.city}
          <br />
          State / Province / Region: {existingEntry.mailingAddress.state}
          <br />
          Postal code/ZIP: {existingEntry.mailingAddress.postalCode}
          <br />
          Country: {getCountryName(existingEntry.mailingAddress.country)}
        </p>
      </>
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
        <MessageBox variant="failure">
          Error: {enterGiveaway.error.message}
        </MessageBox>
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
        <Button type="submit" disabled={enterGiveaway.isLoading}>
          {config.submitButtonText || "Enter to Win"}
        </Button>
      </div>
    </form>
  );
};

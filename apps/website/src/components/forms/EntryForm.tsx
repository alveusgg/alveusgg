import React, { useCallback } from "react";
import { useSession } from "next-auth/react";
import type { Form } from "@prisma/client";

import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import { Button } from "@/components/shared/Button";
import { MessageBox } from "@/components/shared/MessageBox";

import Markdown from "@/components/content/Markdown";
import Heading from "@/components/content/Heading";
import Section from "@/components/content/Section";

import { getCountryName } from "@/utils/countries";
import { trpc } from "@/utils/trpc";
import { calcFormConfig } from "@/utils/forms";

import type { FormEntryWithAddress } from "@/pages/forms/[formId]";

import { ConsentFieldset } from "./ConsentFieldset";
import { GiveawayChecks } from "./GiveawayChecks";
import { ShippingAddressFieldset } from "./ShippingAddressFieldset";
import { NameFieldset } from "./NameFieldset";
import { ContactFieldset } from "./ContactFieldset";
import { EntryRulesFieldset } from "./EntryRulesFieldset";
import { Promos } from "./Promos";

export const EntryForm: React.FC<{
  form: Form;
  existingEntry: FormEntryWithAddress | null;
}> = ({ form, existingEntry }) => {
  const { data: session } = useSession();

  const config = calcFormConfig(form.config);
  const enterForm = trpc.forms.enterForm.useMutation();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const data = new FormData(e.currentTarget);
      enterForm.mutate({
        formId: form.id,
        email: String(data.get("email")),
        givenName: String(data.get("given-name")),
        familyName: String(data.get("family-name")),
        acceptRules: config.hasRules
          ? String(data.get("acceptRules")) === "yes"
          : undefined,
        acceptPrivacy: String(data.get("acceptPrivacy")) === "yes",
        allowMarketingEmails:
          String(data.get("allowMarketingEmails")) === "yes",
        mailingAddress: config.requireShippingAddress
          ? {
              addressLine1: String(data.get("address-line1")),
              addressLine2: String(data.get("address-line2")),
              country: String(data.get("country")),
              state: String(data.get("state")),
              city: String(data.get("city")),
              postalCode: String(data.get("postal-code")),
            }
          : undefined,
      });
    },
    [config.hasRules, config.requireShippingAddress, enterForm, form.id],
  );

  // Map submitted form data, or existing entry data, to a consistent format
  const entry = enterForm.isSuccess ? enterForm.variables : existingEntry;

  return (
    <>
      <Section dark>
        <header>
          <Heading>{form.label}</Heading>
        </header>

        {config.intro && <Markdown content={config.intro} dark />}
      </Section>

      {/* Handle users that aren't logged in */}
      {!session?.user?.id && (
        <Section containerClassName="max-w-lg">
          <MessageBox>
            <p className="mb-4">
              You need to be logged in with Twitch to enter.
            </p>

            <LoginWithTwitchButton />
          </MessageBox>
        </Section>
      )}

      {/* Handle users that are logged in, but have already submitted */}
      {session?.user?.id && entry && (
        <>
          <Section containerClassName="max-w-xl">
            <MessageBox variant="success">
              <Heading level={2} className="mx-2 mb-2 text-2xl">
                {enterForm.isSuccess
                  ? "Your entry has been submitted!"
                  : "You've already entered!"}
              </Heading>

              <p className="m-2">Check the details you submitted below.</p>
            </MessageBox>

            <Heading level={2} className="mb-6 mt-16 text-2xl">
              Your Entry
            </Heading>

            <table className="w-full table-auto border-separate border-spacing-1">
              <tbody>
                <tr>
                  <th className="text-left">Username</th>
                  <td>{session.user.name}</td>
                </tr>
                <tr>
                  <th className="text-left">Email</th>
                  <td>{entry.email}</td>
                </tr>
                <tr>
                  <th className="text-left">Name</th>
                  <td>
                    {entry.givenName} {entry.familyName}
                  </td>
                </tr>

                {config.requireShippingAddress && entry.mailingAddress && (
                  <>
                    <tr>
                      <th colSpan={2} className="pt-2 text-left text-xl">
                        Shipping address
                      </th>
                    </tr>
                    <tr>
                      <th className="text-left">Street address</th>
                      <td>{entry.mailingAddress.addressLine1}</td>
                    </tr>
                    <tr>
                      <th className="text-left">Second address line</th>
                      <td>{entry.mailingAddress.addressLine2}</td>
                    </tr>
                    <tr>
                      <th className="text-left">City</th>
                      <td>{entry.mailingAddress.city}</td>
                    </tr>
                    <tr>
                      <th className="text-left">State / Province / Region</th>
                      <td>{entry.mailingAddress.state}</td>
                    </tr>
                    <tr>
                      <th className="text-left">ZIP / Postal Code</th>
                      <td>{entry.mailingAddress.postalCode}</td>
                    </tr>
                    <tr>
                      <th className="text-left">Country</th>
                      <td>
                        {entry.mailingAddress.country &&
                          getCountryName(entry.mailingAddress.country)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </Section>
        </>
      )}

      {/* Handle users that are logged in, but haven't submitted yet */}
      {session?.user?.id && !entry && (
        <form onSubmit={handleSubmit}>
          {config.checks && (
            <>
              <Section containerClassName="max-w-lg">
                {/* Surface errors at the start */}
                {enterForm.error && (
                  <MessageBox variant="failure">
                    Error: {enterForm.error.message}
                  </MessageBox>
                )}

                <Heading level={2} className="mb-6 text-2xl">
                  1) Actions to Enter
                </Heading>

                <GiveawayChecks />

                <p className="mt-8 text-sm italic opacity-75">
                  Enter your details below to enter once you&apos;ve completed
                  all the actions.
                </p>
              </Section>

              <Section dark>
                <Promos />
              </Section>
            </>
          )}

          <Section containerClassName="max-w-lg">
            {/* Surface errors at the start, if there was no checks section */}
            {!config.checks && enterForm.error && (
              <MessageBox variant="failure">
                Error: {enterForm.error.message}
              </MessageBox>
            )}

            <Heading level={2} className="mb-6 text-2xl">
              {config.checks && "2) "}
              Your Details
            </Heading>

            <div className="flex flex-col gap-4">
              <NameFieldset />
              <ContactFieldset
                defaultEmailAddress={session.user.email || undefined}
              />
              {config.requireShippingAddress && <ShippingAddressFieldset />}
              {config.hasRules && <EntryRulesFieldset form={form} />}
              <ConsentFieldset
                withShippingAddress={config.requireShippingAddress}
                askMarketingEmails={config.askMarketingEmails}
                askMarketingEmailsLabel={config.askMarketingEmailsLabel}
              />
            </div>

            <div className="mt-7">
              <Button type="submit" disabled={enterForm.isLoading}>
                {config.submitButtonText || "Enter to Win"}
              </Button>
            </div>
          </Section>
        </form>
      )}
    </>
  );
};

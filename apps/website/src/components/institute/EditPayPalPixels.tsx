import { type FormEvent, useMemo, useRef, useState } from "react";
import { z } from "zod";

import type { DonationPixel } from "@/server/trpc/router/donations";

import { trpc } from "@/utils/trpc";

import { EditPixelsForm } from "@/components/institute/EditPixelsForm";
import { MessageBox } from "@/components/shared/MessageBox";
import { Button as FormButton } from "@/components/shared/form/Button";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { TextField } from "@/components/shared/form/TextField";

export type PayPalVerification = z.infer<typeof payPalVerificationSchema>;

export const payPalVerificationSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
});

export function EditPayPalPixels() {
  const [lastPixelsData, setLastPixelsData] = useState<
    DonationPixel[] | undefined
  >(undefined);
  const getPayPalPixels = trpc.donations.getPayPalPixels.useMutation({
    onSuccess: (data) => {
      setLastPixelsData(data);
    },
  });

  const [overrideIdentifier, setOverrideIdentifier] =
    useState<string>("Anonymous");

  const verificationRef = useRef<PayPalVerification | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get("firstName"));
    const lastName = String(formData.get("lastName"));
    const email = String(formData.get("email"));

    const input = payPalVerificationSchema.safeParse({
      firstName,
      lastName,
      email,
    });

    setOverrideIdentifier(firstName);
    // If we search new, we do not want to keep old pixel data
    setLastPixelsData(undefined);

    if (input.success) {
      verificationRef.current = input.data;
      getPayPalPixels.mutate(input.data);
    } else {
      verificationRef.current = null;
    }
  };

  const persistedPixelsData = getPayPalPixels.data ?? lastPixelsData;
  const pixelsQuery = useMemo(
    () => ({
      ...getPayPalPixels,
      data: persistedPixelsData,
    }),
    [getPayPalPixels, persistedPixelsData],
  );

  return (
    <>
      <form onSubmit={submit}>
        <div className="mb-4 space-y-4">
          <div className="max-w-xl space-y-4">
            <Fieldset legend="Your PayPal donation info">
              <TextField
                label="First name(s)"
                name="firstName"
                autoComplete="given-name"
                isRequired={true}
              />

              <TextField
                label="Last name(s)"
                name="lastName"
                autoComplete="family-name"
                isRequired={true}
              />

              <TextField
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                isRequired={true}
              />
            </Fieldset>

            <FormButton size="small" type="submit">
              Search
            </FormButton>
          </div>

          {getPayPalPixels.isPending ? (
            <MessageBox>Searching for your Pixels…</MessageBox>
          ) : null}

          {getPayPalPixels.isError ? (
            <MessageBox variant="failure">
              Failed to find your Pixels: {getPayPalPixels.error.message}
            </MessageBox>
          ) : null}

          {getPayPalPixels.isSuccess && getPayPalPixels.data.length < 1 ? (
            <MessageBox variant="warning">
              No Pixels found! Please check the exact spelling including spaces
              and capitalization. Use your PayPal donation receipt you got via
              email as reference.
            </MessageBox>
          ) : null}
        </div>
      </form>

      {persistedPixelsData ? (
        <EditPixelsForm
          pixelsQuery={pixelsQuery}
          renameMutation={trpc.donations.renamePayPalPixel}
          renameAllMutation={trpc.donations.renameAllPayPalPixels}
          overrideIdentifier={overrideIdentifier}
          setOverrideIdentifier={setOverrideIdentifier}
          onRename={(mutate, pixel, newIdentifier) => {
            const verification = verificationRef.current;
            if (!verification) {
              return;
            }

            mutate(
              {
                donationId: pixel.donationId,
                pixelId: pixel.id,
                newIdentifier,
                verification,
              },
              {
                onSuccess: () => {
                  getPayPalPixels.mutate(verification);
                },
              },
            );
          }}
          onRenameAll={(mutate) => {
            const verification = verificationRef.current;
            if (!verification) {
              return;
            }

            mutate(
              { newIdentifier: overrideIdentifier, verification },
              {
                onSuccess: () => {
                  getPayPalPixels.mutate(verification);
                },
              },
            );
          }}
        />
      ) : null}
    </>
  );
}

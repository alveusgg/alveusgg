import { type FormEvent, useMemo, useRef, useState } from "react";
import { z } from "zod";

import type { DonationPixel } from "@/server/trpc/router/donations";

import type { MuralId } from "@/data/murals";

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

export function EditPayPalPixels({ muralId }: { muralId: MuralId }) {
  const [lastPixelsData, setLastPixelsData] = useState<
    DonationPixel[] | undefined
  >(undefined);
  const getPayPalPixels = trpc.donations.getPayPalPixels.useMutation({
    onSuccess: (data) => {
      setLastPixelsData(data);
    },
  });

  const [overrideIdentifier, setOverrideIdentifier] = useState("");
  const [defaultIdentifier, setDefaultIdentifier] = useState("Anonymous");

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

    setDefaultIdentifier(firstName);
    // If we search new, we do not want to keep old pixel data
    setLastPixelsData(undefined);

    if (input.success) {
      verificationRef.current = input.data;
      getPayPalPixels.mutate({
        muralId,
        verification: input.data,
      });
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

  const renameMutation = trpc.donations.renamePayPalPixels.useMutation();

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
            <MessageBox>Searching for your pixels…</MessageBox>
          ) : null}

          {getPayPalPixels.isError ? (
            <MessageBox variant="failure">
              Failed to find your pixels: {getPayPalPixels.error.message}
            </MessageBox>
          ) : null}

          {getPayPalPixels.isSuccess && getPayPalPixels.data.length < 1 ? (
            <MessageBox variant="warning">
              No pixels found! Please check the exact spelling including spaces
              and capitalization. Check the PayPal donation receipt you received
              via email.
            </MessageBox>
          ) : null}
        </div>
      </form>

      {persistedPixelsData?.length ? (
        <EditPixelsForm
          defaultIdentifier={defaultIdentifier}
          pixelsQuery={pixelsQuery}
          renameMutation={renameMutation}
          overrideIdentifier={overrideIdentifier}
          setOverrideIdentifier={setOverrideIdentifier}
          onRename={(newIdentifier, pixelId?: string) => {
            const verification = verificationRef.current;
            if (!verification) {
              return;
            }

            renameMutation.mutate(
              { muralId, newIdentifier, pixelId, verification },
              {
                onSuccess: () => {
                  getPayPalPixels.mutate({
                    muralId,
                    verification,
                  });
                },
              },
            );
          }}
        />
      ) : null}
    </>
  );
}

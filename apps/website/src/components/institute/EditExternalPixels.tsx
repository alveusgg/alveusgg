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

import IconLoading from "@/icons/IconLoading";

export type ExternalVerification = z.infer<typeof externalVerificationSchema>;

export const externalVerificationSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
});

export function EditExternalPixels({ muralId }: { muralId: MuralId }) {
  const [lastPixelsData, setLastPixelsData] = useState<
    DonationPixel[] | undefined
  >(undefined);
  const getExternalPixels = trpc.donations.getExternalPixels.useMutation({
    onSuccess: (data) => {
      setLastPixelsData(data);
    },
  });

  const [overrideIdentifier, setOverrideIdentifier] = useState("");
  const [defaultIdentifier, setDefaultIdentifier] = useState("Anonymous");

  const verificationRef = useRef<ExternalVerification | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get("firstName"));
    const lastName = String(formData.get("lastName"));
    const email = String(formData.get("email"));

    const input = externalVerificationSchema.safeParse({
      firstName,
      lastName,
      email,
    });

    setDefaultIdentifier(firstName);
    // If we search new, we do not want to keep old pixel data
    setLastPixelsData(undefined);

    if (input.success) {
      verificationRef.current = input.data;
      getExternalPixels.mutate({
        muralId,
        verification: input.data,
      });
    } else {
      verificationRef.current = null;
    }
  };

  const persistedPixelsData = getExternalPixels.data ?? lastPixelsData;
  const pixelsQuery = useMemo(
    () => ({
      ...getExternalPixels,
      data: persistedPixelsData,
    }),
    [getExternalPixels, persistedPixelsData],
  );

  const renameMutation = trpc.donations.renameExternalPixels.useMutation();

  return (
    <>
      <form onSubmit={submit}>
        <div className="mb-4 space-y-4">
          <div className="max-w-xl space-y-4">
            <Fieldset legend="Your donation info">
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

          {getExternalPixels.isPending ? (
            <MessageBox className="flex flex-row items-center gap-4">
              <IconLoading />
              Searching for your pixels…
            </MessageBox>
          ) : null}

          {getExternalPixels.isError ? (
            <MessageBox variant="failure">
              Failed to find your pixels: {getExternalPixels.error.message}
            </MessageBox>
          ) : null}

          {getExternalPixels.isSuccess && getExternalPixels.data.length < 1 ? (
            <MessageBox variant="warning">
              No pixels found! Please check the exact spelling including spaces
              and capitalization. Check the donation receipt you received via
              email.
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
                  getExternalPixels.mutate({
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

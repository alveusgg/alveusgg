import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import {
  PIXEL_RENAME_LOCK_DURATION_TEXT,
  PixelSyncProviderProvider,
} from "@/hooks/pixels";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import { EditMyPixels } from "@/components/institute/EditMyPixels";
import { EditPayPalPixels } from "@/components/institute/EditPayPalPixels";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import { MessageBox } from "@/components/shared/MessageBox";

import IconArrowRight from "@/icons/IconArrowRight";

import buildingHeroImage from "@/assets/institute/hero/building.png";

const MyPixelsPage: NextPage = () => {
  const session = useSession();

  return (
    <>
      <Meta
        title="My Pixels | Alveus Research & Recovery Institute"
        description="View and edit your donated Pixels."
        image={buildingHeroImage.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        containerClassName="flex flex-wrap gap-4 justify-between items-end"
      >
        <div>
          <Heading>Alveus Research & Recovery Institute My Pixels</Heading>
          <p>
            You will only be able to rename your Pixel once every{" "}
            {PIXEL_RENAME_LOCK_DURATION_TEXT}. The last date to rename Pixels
            will be announced on Alveus channels!
          </p>
        </div>
        <Button href="/pixels" dark className="inline-flex items-center gap-2">
          <IconArrowRight className="size-5 -scale-x-100" />
          Learn More About the Pixel Project
        </Button>
      </Section>

      <PixelSyncProviderProvider>
        <>
          <Section containerClassName="space-y-4 text-lg max-w-screen-lg">
            <Heading level={2}>
              Pixels connected with your Twitch account
            </Heading>
            <p>
              Here you can find all the Pixels you have placed through Twitch
              Charity or PayPal donations using the same email address.
            </p>

            <div className="mt-6">
              {!session.data?.user ? (
                <MessageBox>
                  <p className="mb-4">
                    You need to be logged in to view and edit your Pixels!
                  </p>

                  <LoginWithTwitchButton />
                </MessageBox>
              ) : (
                <EditMyPixels user={session.data.user} />
              )}
            </div>
          </Section>

          {/* Grow the last section to cover the page */}
          <Section
            className="grow"
            containerClassName="space-y-4 text-lg max-w-screen-lg"
          >
            <Heading level={2}>Pixels through PayPal donations</Heading>

            <p>
              Here you can search for more Pixels unlocked through PayPal
              donations by providing the exact donation info (Full name and
              email address).
            </p>

            <EditPayPalPixels />
          </Section>
        </>
      </PixelSyncProviderProvider>
    </>
  );
};

export default MyPixelsPage;

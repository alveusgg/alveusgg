import { type NextPage } from "next";
import { useSession } from "next-auth/react";

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
        title="Rename your Pixels | Alveus Research & Recovery Institute"
        description="View and edit your unlocked pixels."
        image={buildingHeroImage.src}
        noindex
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        containerClassName="flex flex-wrap gap-4 justify-between items-end"
      >
        <div>
          <Heading>Alveus Research & Recovery Institute My Pixels</Heading>
        </div>
        <Button
          href="/institute/pixels"
          dark
          className="inline-flex items-center gap-2"
        >
          <IconArrowRight className="size-5 -scale-x-100" />
          Explore the Completed Mural
        </Button>
      </Section>

      <Section containerClassName="space-y-4 text-lg max-w-screen-lg">
        <Heading level={2}>Pixels connected with your Twitch account</Heading>

        <div className="mt-6">
          {!session.data?.user ? (
            <MessageBox>
              <p className="mb-4">
                You need to be logged in to view and edit pixels connected to
                your Twitch account.
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
          Search for pixels to rename using the exact PayPal donation
          information used to unlock them.
        </p>

        <EditPayPalPixels />
      </Section>
    </>
  );
};

export default MyPixelsPage;

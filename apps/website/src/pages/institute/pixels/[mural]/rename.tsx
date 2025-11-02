import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import murals from "@/data/murals";

import { typeSafeObjectEntries } from "@/utils/helpers";

import { PixelProvider } from "@/hooks/pixels";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import SubNav from "@/components/content/SubNav";
import { EditMyPixels } from "@/components/institute/EditMyPixels";
import { EditPayPalPixels } from "@/components/institute/EditPayPalPixels";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import { MessageBox } from "@/components/shared/MessageBox";

import IconArrowRight from "@/icons/IconArrowRight";

import buildingHeroImage from "@/assets/institute/hero/building.png";

import type { InstitutePixelsPageProps } from "./index";

export { getStaticPaths, getStaticProps } from "./index";

const links = typeSafeObjectEntries(murals).map(([muralId, muralData]) => ({
  href: `/institute/pixels/${muralId}/rename`,
  name: muralData.name,
}));

const PixelsRenamePage: NextPage<InstitutePixelsPageProps> = ({ muralId }) => {
  const session = useSession();
  const mural = murals[muralId];

  return (
    <PixelProvider muralId={muralId}>
      <Meta
        title={`Rename your Pixels | ${mural.name} | Alveus Research & Recovery Institute`}
        description={`View and rename your unlocked pixels of ${mural.name}.`}
        image={buildingHeroImage.src}
        noindex
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        containerClassName="flex flex-col gap-4 lg:flex-row lg:gap-8 items-start lg:items-center"
      >
        <div className="shrink grow text-balance">
          <Heading>Alveus Research & Recovery Institute {mural.name}</Heading>
          <p className="text-xl">Rename Your Pixels</p>
        </div>
        <Button
          href={`/institute/pixels/${muralId}`}
          dark
          className="flex items-center gap-2 text-nowrap"
        >
          <IconArrowRight className="size-5 -scale-x-100" />
          Explore the Mural
        </Button>
      </Section>

      <SubNav links={links} className="z-20" />

      <Section containerClassName="space-y-4 text-lg">
        <Heading level={2}>Pixels connected with your Twitch account</Heading>

        <div className="mt-6">
          {!session.data?.user ? (
            <MessageBox>
              <p className="mb-4">
                You need to be logged in to view and rename pixels connected to
                your Twitch account.
              </p>

              <LoginWithTwitchButton />
            </MessageBox>
          ) : (
            <EditMyPixels
              key={muralId}
              muralId={muralId}
              user={session.data.user}
            />
          )}
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="grow" containerClassName="space-y-4 text-lg">
        <Heading level={2}>Pixels through PayPal donations</Heading>

        <p>
          Search for pixels to rename using the exact PayPal donation
          information used to unlock them.
        </p>

        <EditPayPalPixels key={muralId} muralId={muralId} />
      </Section>
    </PixelProvider>
  );
};

export default PixelsRenamePage;

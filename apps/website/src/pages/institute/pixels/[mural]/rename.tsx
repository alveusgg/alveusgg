import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import murals from "@/data/murals";

import { trpc } from "@/utils/trpc";

import { PixelProvider } from "@/hooks/pixels";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import { formatPixelRenameLockDuration } from "@/components/institute/EditPixelForm";
import { RenameMethodCards } from "@/components/institute/rename/RenameMethodCards";
import {
  RenameMethodContent,
  type RenameMethodState,
} from "@/components/institute/rename/RenameMethodContent";
import { RenameMuralPicker } from "@/components/institute/rename/RenameMuralPicker";
import {
  RenameStep,
  RenameStepsLayout,
} from "@/components/institute/rename/RenameStep";
import {
  type RenameMethodId,
  renameMethodIds,
  useRenameMethod,
} from "@/components/institute/rename/methods";

import IconArrowRight from "@/icons/IconArrowRight";

import buildingHeroImage from "@/assets/institute/hero/building.png";

import type { InstitutePixelsPageProps } from "./index";

export { getStaticPaths, getStaticProps } from "./index";

const PixelsRenamePage: NextPage<InstitutePixelsPageProps> = ({ muralId }) => {
  const session = useSession();
  const neonDonor = trpc.donations.getNeonDonor.useQuery();
  const router = useRouter();
  const mural = murals[muralId];

  const user = session.data?.user;
  const isNeonEnabled = neonDonor.data?.isEnabled ?? false;
  const isNeonLoggedIn = neonDonor.data?.isLoggedIn ?? false;

  const available = renameMethodIds.filter(
    (id) => id !== "website" || isNeonEnabled,
  );
  const loggedIn = ([] as RenameMethodId[]).concat(
    user ? ["twitch"] : [],
    isNeonLoggedIn ? ["website"] : [],
  );
  const { selected, select } = useRenameMethod({ available, loggedIn });

  const status: Partial<Record<RenameMethodId, string>> = {
    twitch: user ? `Logged in as ${user.name ?? "anonymous"}` : undefined,
    website: isNeonLoggedIn ? "Logged in with your donor account" : undefined,
  };
  const state: RenameMethodState = {
    user,
    neon: {
      isEnabled: isNeonEnabled,
      isLoggedIn: isNeonLoggedIn,
      hasLoginFailed: router.query.neonLogin === "failed",
    },
  };

  return (
    <PixelProvider muralId={muralId}>
      <Meta
        title={`Rename Your Pixels | ${mural.name} | Alveus Research & Recovery Institute`}
        description={`View and rename your unlocked pixels on the ${mural.name} mural.`}
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
          <p className="mt-2 text-alveus-tan/80">
            Each pixel can be renamed once every{" "}
            {formatPixelRenameLockDuration()}.
          </p>
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

      {/* Grow the last section to cover the page */}
      <Section className="grow" containerClassName="space-y-12 text-lg">
        <RenameStep number={1} title="Which mural are your pixels on?">
          <RenameMuralPicker muralId={muralId} method={selected} />
        </RenameStep>

        <RenameStep number={2} title="How did you unlock your pixels?">
          <p className="max-w-3xl">
            Every pixel is linked to the donation that unlocked it, so start
            with how you donated.
          </p>

          <RenameMethodCards
            methods={available}
            selected={selected}
            status={status}
            onSelect={select}
          />
        </RenameStep>

        {selected ? (
          <RenameMethodContent
            key={selected}
            method={selected}
            muralId={muralId}
            state={state}
          />
        ) : (
          <RenameStepsLayout confirm={null} rename={null} />
        )}
      </Section>
    </PixelProvider>
  );
};

export default PixelsRenamePage;

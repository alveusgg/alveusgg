import type {
  InferGetServerSidePropsType,
  NextPage,
  NextPageContext,
} from "next";
import { getSession } from "next-auth/react";

import { scopeGroups } from "@/data/twitch";

import LiveCamControls from "@/components/admin/ptz/LiveCamControls";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import ProvideAuth from "@/components/shared/LoginWithExtraScopes";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const isAuthed = session?.user?.id !== undefined;
  const hasRole = session?.user?.roles.includes("ptzControl");
  const hasScopes = scopeGroups.chat.every((scope) =>
    session?.user?.scopes.includes(scope),
  );

  return { props: { isAuthed, hasRole, hasScopes } };
}

const PTZPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ isAuthed, hasRole, hasScopes }) => {
  return (
    <>
      <Meta title="Live Cam Controls" description="" />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark className="py-8">
        <Heading className="text-center">Live Cam Controls</Heading>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="grow">
        {(!isAuthed || (hasRole && !hasScopes)) && (
          <div className="flex flex-row items-center justify-center">
            <ProvideAuth scopeGroup="chat" />
          </div>
        )}

        {isAuthed && !hasRole && (
          <div className="flex flex-row items-center justify-center">
            <p className="text-lg">
              You do not have permission to access this page. Please contact an
              admin if you believe this is a mistake.
            </p>
          </div>
        )}

        {isAuthed && hasRole && hasScopes && <LiveCamControls />}
      </Section>
    </>
  );
};

export default PTZPage;

import type {
  InferGetServerSidePropsType,
  NextPage,
  NextPageContext,
} from "next";
import { getSession } from "next-auth/react";

import { env } from "@/env";

import { scopeGroups } from "@/data/twitch";

import { createJWT, signJWT } from "@/utils/jwt";

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

  if (
    !isAuthed ||
    !hasRole ||
    !hasScopes ||
    !env.CF_STREAM_KEY_ID ||
    !env.CF_STREAM_KEY_JWK ||
    !env.CF_STREAM_LOLA_VIDEO_ID ||
    !env.CF_STREAM_HOST
  ) {
    return { props: { isAuthed, hasRole, hasScopes } };
  }

  const expiresTimeInSeconds = 60 * 60 * 48;
  const expiresIn = Math.floor(Date.now() / 1000) + expiresTimeInSeconds;
  const token = createJWT(
    {
      alg: "RS256",
      kid: env.CF_STREAM_KEY_ID,
    },
    {
      sub: env.CF_STREAM_LOLA_VIDEO_ID,
      kid: env.CF_STREAM_KEY_ID,
      exp: expiresIn,
      accessRules: [
        {
          type: "any",
          action: "allow",
        },
      ],
    },
  );

  const jwt = await signJWT(token, env.CF_STREAM_KEY_JWK);

  return {
    props: {
      isAuthed,
      hasRole,
      hasScopes,
      url: `https://${env.CF_STREAM_HOST}/${jwt}/webRTC/play`,
    },
  };
}

const PTZPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ isAuthed, hasRole, hasScopes, url }) => {
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

        {isAuthed && hasRole && hasScopes && <LiveCamControls url={url} />}
      </Section>
    </>
  );
};

export default PTZPage;

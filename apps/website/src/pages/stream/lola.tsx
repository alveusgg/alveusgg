import type {
  InferGetServerSidePropsType,
  NextPage,
  NextPageContext,
} from "next";
import { getSession } from "next-auth/react";

import { env } from "@/env";

import invariant from "@/utils/invariant";
import { createJWT, signJWT } from "@/utils/jwt";

import LiveCamFeed from "@/components/admin/ptz/LiveCamFeed";
import Meta from "@/components/content/Meta";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";

export async function getServerSideProps(context: NextPageContext) {
  invariant(env.CF_STREAM_KEY_ID, "CF_STREAM_KEY_ID is not set");
  invariant(env.CF_STREAM_KEY_JWK, "CF_STREAM_KEY_JWK is not set");
  invariant(env.CF_STREAM_LOLA_VIDEO_ID, "CF_STREAM_LOLA_VIDEO_ID is not set");
  invariant(env.CF_STREAM_HOST, "CF_STREAM_HOST is not set");

  const session = await getSession(context);
  const isAuthed = session?.user?.id !== undefined;
  const hasRole = session?.user?.roles.includes("ptzControl");

  if (!isAuthed || !hasRole) {
    return { props: { isAuthed, hasRole } };
  }

  const expiresTimeInSeconds = 60 * 5;
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
      url: `https://${env.CF_STREAM_HOST}/${jwt}/webRTC/play`,
    },
  };
}

const LolaPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ hasRole, isAuthed, url }) => {
  return (
    <>
      <Meta title="Low-Latency Video Stream" description="" />

      {/* Grow the last section to cover the page */}
      <main className="grow">
        {!isAuthed && (
          <div className="flex flex-row items-center justify-center">
            <LoginWithTwitchButton />
          </div>
        )}

        {isAuthed &&
          (!hasRole ? (
            <div className="flex flex-row items-center justify-center">
              <p className="text-lg">
                You do not have permission to access this page. Please contact
                an admin if you believe this is a mistake.
              </p>
            </div>
          ) : (
            url && (
              <div className="h-screen w-screen">
                <LiveCamFeed url={url} />
              </div>
            )
          ))}
      </main>
    </>
  );
};

export default LolaPage;

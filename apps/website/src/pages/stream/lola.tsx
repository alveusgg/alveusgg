import type {
  InferGetServerSidePropsType,
  NextPage,
  NextPageContext,
} from "next";
import { getSession } from "next-auth/react";

import LiveCamFeed from "@/components/admin/ptz/LiveCamFeed";
import Meta from "@/components/content/Meta";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const isAuthed = session?.user?.id !== undefined;
  const hasRole = session?.user?.roles.includes("ptzControl");

  return { props: { isAuthed, hasRole } };
}

const PTZPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ hasRole, isAuthed }) => {
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
            <div className="h-screen w-screen">
              <LiveCamFeed />
            </div>
          ))}
      </main>
    </>
  );
};

export default PTZPage;

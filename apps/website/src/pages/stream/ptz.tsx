import type { NextPage } from "next";
import { useSession } from "next-auth/react";

import LiveCamControls from "@/components/admin/ptz/LiveCamControls";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";

const PTZPage: NextPage = () => {
  const session = useSession();
  const isAuthed = session?.status === "authenticated";
  const hasRole = isAuthed && session.data?.user?.roles.includes("ptzControl");

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
            <LiveCamControls />
          ))}
      </Section>
    </>
  );
};

export default PTZPage;

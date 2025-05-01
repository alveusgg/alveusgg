import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";

import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import {
  Button,
  secondaryButtonClasses,
} from "@/components/shared/form/Button";
import { ShowAndTellEntryForm } from "@/components/show-and-tell/ShowAndTellEntryForm";
import { ShowAndTellNavigation } from "@/components/show-and-tell/ShowAndTellNavigation";

import showAndTellHeader from "@/assets/show-and-tell/header.png";

const ShowAndTellSubmitPage: NextPage = () => {
  const session = useSession();
  const [isAnonymous, setIsAnonymous] = useState(false);

  const showForm = isAnonymous || session?.status === "authenticated";

  return (
    <>
      <Meta
        title="Submit Post | Show and Tell"
        description="Share any conservation and wildlife-related activities with the Alveus community that you've been up to."
        image={showAndTellHeader.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-12"
        containerClassName="flex flex-wrap gap-y-8 gap-x-4 justify-between lg:flex-nowrap"
      >
        <div className="w-full grow lg:w-auto">
          <Heading level={1}>Show and Tell: Submit Post</Heading>
          <p className="text-lg">
            Inspired by Alveus streams and the community? Share any conservation
            and wildlife-related activities with the community that you&apos;ve
            been up to.
          </p>
          <p className="mt-4 text-sm italic">
            All posts will be reviewed by the moderation team before being shown
            on the website. Posts will be public for anyone to see on the
            website, and may also be shown during Alveus streams.
          </p>
        </div>

        <ShowAndTellNavigation />
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="grow">
        <Heading level={2}>Your submission</Heading>

        {session?.status !== "authenticated" && !isAnonymous && (
          <div>
            <p>
              Please log in if you would like to edit or keep track of your
              posts:
            </p>

            <div className="my-4 flex flex-row items-center justify-center">
              <div className="flex-1">
                <LoginWithTwitchButton />
              </div>
              <div className="px-6 text-center">or</div>
              <div className="flex-1">
                <Button
                  className={secondaryButtonClasses}
                  onClick={() => setIsAnonymous(true)}
                >
                  Continue anonymously
                </Button>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <ShowAndTellEntryForm action="create" isAnonymous={isAnonymous} />
        )}
      </Section>
    </>
  );
};

export default ShowAndTellSubmitPage;

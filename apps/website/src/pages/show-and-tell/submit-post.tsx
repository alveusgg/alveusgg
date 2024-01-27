import { useState } from "react";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import { Button, secondaryButtonClasses } from "@/components/shared/Button";
import { ShowAndTellEntryForm } from "@/components/show-and-tell/ShowAndTellEntryForm";
import { PageNavigation } from "@/components/shared/PageNavigation";
import Meta from "@/components/content/Meta";

import { showAndTellNavItems } from ".";

const ShowAndTellSubmitPage: NextPage = () => {
  const session = useSession();
  const [isAnonymous, setIsAnonymous] = useState(false);

  const showForm = isAnonymous || session?.status === "authenticated";

  return (
    <>
      <Meta title="Submit - Show and Tell" />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-12"
        containerClassName="flex flex-wrap gap-4 justify-between"
      >
        <div className="w-full lg:w-3/5">
          <Heading level={1}>Show and Tell: Submit Post</Heading>
          <p className="text-lg">
            Has stream helped you become more environmental conscious? Please
            share with the community any of your conservation or wildlife
            related activities. (These will be public and viewed on stream)
          </p>
        </div>
        <PageNavigation navItems={showAndTellNavItems} />
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
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

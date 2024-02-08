import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { trpc } from "@/utils/trpc";

import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import { MessageBox } from "@/components/shared/MessageBox";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";

import { ShowAndTellNavigation } from "@/components/show-and-tell/ShowAndTellNavigation";
import { ShowAndTellEntryForm } from "@/components/show-and-tell/ShowAndTellEntryForm";

const EditShowAndTellPage: NextPage = () => {
  const session = useSession();
  const router = useRouter();
  const { postId } = router.query;
  const getMyPost = trpc.showAndTell.getMyEntry.useQuery(String(postId), {
    enabled: Boolean(postId),
  });

  return (
    <>
      <Meta title="Edit Post - Show and Tell" />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-12"
        containerClassName="flex flex-wrap gap-4 justify-between"
      >
        <div className="w-full lg:w-3/5">
          <Heading level={1}>Show and Tell: Edit Post</Heading>
          <p className="text-lg">
            Community submissions of their conservation and wildlife related
            activities.
          </p>
        </div>
        <ShowAndTellNavigation />
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <Heading level={2}>Your submission</Heading>

        {session?.status !== "authenticated" && (
          <div>
            <p>
              Please log in if you would like to edit or keep track of your
              posts:
            </p>

            <div className="my-4 flex flex-row items-center justify-center">
              <div className="flex-1">
                <LoginWithTwitchButton />
              </div>
            </div>
          </div>
        )}

        {session?.status === "authenticated" && (
          <>
            {getMyPost.isLoading && <p>Loading...</p>}
            {getMyPost.isError && (
              <MessageBox variant="failure">
                {getMyPost.error.message}
              </MessageBox>
            )}
            {getMyPost.data && (
              <ShowAndTellEntryForm action="update" entry={getMyPost.data} />
            )}
          </>
        )}
      </Section>
    </>
  );
};

export default EditShowAndTellPage;

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
import { ShowAndTellEntry } from "@/components/show-and-tell/ShowAndTellEntry";

import showAndTellHeader from "@/assets/show-and-tell/header.png";

const PreviewShowAndTellPage: NextPage = () => {
  const session = useSession();
  const router = useRouter();
  const { postId } = router.query;
  const getMyPost = trpc.showAndTell.getMyEntry.useQuery(String(postId), {
    enabled: Boolean(postId),
  });

  return (
    <>
      <Meta
        title="Preview Post | Show and Tell"
        description="Sign in and preview your previously submitted post, sharing your conservation and wildlife-related activities."
        image={showAndTellHeader.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-12"
        containerClassName="flex flex-wrap gap-y-8 gap-x-4 justify-between lg:flex-nowrap"
      >
        <div className="w-full flex-grow lg:w-auto">
          <Heading level={1}>Show and Tell: Preview Post</Heading>
          <p className="text-lg">
            {session?.status === "authenticated"
              ? "Preview"
              : "Sign in and preview"}{" "}
            your previously submitted post, sharing your conservation and
            wildlife-related activities.
          </p>
        </div>
        <ShowAndTellNavigation />
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
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
              <ShowAndTellEntry
                entry={getMyPost.data}
                isPresentationView={false}
              />
            )}
          </>
        )}
      </Section>
    </>
  );
};

export default PreviewShowAndTellPage;

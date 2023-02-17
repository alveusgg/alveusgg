import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import { trpc } from "@/utils/trpc";
import { ShowAndTellNavigation } from "@/components/show-and-tell/ShowAndTellNavigation";
import { MessageBox } from "@/components/shared/MessageBox";
import { ShowAndTellEntryForm } from "@/components/show-and-tell/ShowAndTellEntryForm";

const EditShowAndTellPage: NextPage = () => {
  const router = useRouter();
  const { postId } = router.query;
  const getMyPost = trpc.showAndTell.getMyEntry.useQuery(String(postId), {
    enabled: Boolean(postId),
  });

  return (
    <>
      <Head>
        <title>Edit Post - Show and Tell | Alveus.gg</title>
      </Head>

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
        {getMyPost.isLoading && <p>Loading...</p>}
        {getMyPost.isError && (
          <MessageBox variant="failure">{getMyPost.error.message}</MessageBox>
        )}
        {getMyPost.data && (
          <ShowAndTellEntryForm action="update" entry={getMyPost.data} />
        )}
      </Section>
    </>
  );
};

export default EditShowAndTellPage;

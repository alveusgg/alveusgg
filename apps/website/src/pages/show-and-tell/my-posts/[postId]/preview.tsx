import type { NextPage } from "next";
import { useRouter } from "next/router";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import { trpc } from "@/utils/trpc";
import { MessageBox } from "@/components/shared/MessageBox";
import { ShowAndTellEntry } from "@/components/show-and-tell/ShowAndTellEntry";
import { PageNavigation } from "@/components/shared/PageNavigation";

import { showAndTellNavItems } from "../..";

const PreviewShowAndTellPage: NextPage = () => {
  const router = useRouter();
  const { postId } = router.query;
  const getMyPost = trpc.showAndTell.getMyEntry.useQuery(String(postId), {
    enabled: Boolean(postId),
  });

  return (
    <>
      <Meta title="Preview Post - Show and Tell" />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-12"
        containerClassName="flex flex-wrap gap-4 justify-between"
      >
        <div className="w-full lg:w-3/5">
          <Heading level={1}>Show and Tell: Preview Post</Heading>
          <p className="text-lg">
            Community submissions of their conservation and wildlife related
            activities.
          </p>
        </div>
        <PageNavigation navItems={showAndTellNavItems} />
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        {getMyPost.isLoading && <p>Loading...</p>}
        {getMyPost.isError && (
          <MessageBox variant="failure">{getMyPost.error.message}</MessageBox>
        )}
        {getMyPost.data && (
          <ShowAndTellEntry entry={getMyPost.data} isPresentationView={false} />
        )}
      </Section>
    </>
  );
};

export default PreviewShowAndTellPage;

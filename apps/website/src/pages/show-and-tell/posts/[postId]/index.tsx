import type {
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import { PageNavigation } from "@/components/shared/PageNavigation";
import { getPostById } from "@/server/db/show-and-tell";
import Meta from "@/components/content/Meta";
import { ShowAndTellEntry } from "@/components/show-and-tell/ShowAndTellEntry";

import { showAndTellNavItems } from "../../";

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const postId = String(params?.postId || "");
  if (postId === "") return { notFound: true };

  const post = await getPostById(postId, undefined, "published");
  if (!post) return { notFound: true };

  return {
    props: {
      post,
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [], // Do we want to prerender some posts?
    fallback: "blocking",
  };
}

const ShowAndTellEntryPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ post }) => {
  return (
    <>
      <Meta title={`Show and Tell - ${post.title}`} />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-12"
        containerClassName="flex flex-wrap gap-4 justify-between"
      >
        <div className="w-full lg:w-3/5">
          <Heading level={1}>Show and Tell</Heading>
          <p className="text-lg">
            Community submissions of their conservation and wildlife related
            activities.
          </p>
        </div>
        <PageNavigation navItems={showAndTellNavItems} />
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <ShowAndTellEntry entry={post} isPresentationView={false} />
      </Section>
    </>
  );
};

export default ShowAndTellEntryPage;

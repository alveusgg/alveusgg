import type {
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Link from "next/link";
import Image from "next/image";

import { getPostById } from "@/server/db/show-and-tell";

import IconArrowRight from "@/icons/IconArrowRight";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";

import { ShowAndTellEntry } from "@/components/show-and-tell/ShowAndTellEntry";

import showAndTellPeepo from "@/assets/show-and-tell/peepo.png";
import showAndTellHeader from "@/assets/show-and-tell/header.png";

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
      <Meta
        title={`${post.title} | Show and Tell`}
        description="See what the Alveus community has been up to as they share their conservation and wildlife-related activities, or share your own activities."
        image={showAndTellHeader.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-0"
        containerClassName="flex flex-wrap items-center justify-between"
      >
        <div className="w-full pb-4 pt-8 md:w-3/5 md:py-24">
          <Heading level={1}>Show and Tell</Heading>
          <p className="text-lg">
            See what the Alveus community has been up to as they share their
            conservation and wildlife-related activities.
          </p>

          <p className="text-lg">
            Been up to something yourself? Share your own activities via the{" "}
            <Link href="/show-and-tell/submit-post" className="underline">
              submission page
            </Link>
            .
          </p>

          <p className="mt-8 text-lg">
            <IconArrowRight className="inline-block h-5 w-5 rotate-180" />{" "}
            <Link href="/show-and-tell" className="underline">
              Back to all posts
            </Link>
          </p>
        </div>

        <Image
          src={showAndTellPeepo}
          width={448}
          alt=""
          className="mx-auto w-full max-w-md p-4 pb-16 md:mx-0 md:w-2/5 md:pb-4"
        />
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <ShowAndTellEntry entry={post} isPresentationView={false} />
      </Section>
    </>
  );
};

export default ShowAndTellEntryPage;

import type { NextPage, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";

import DefaultPageLayout from "../components/DefaultPageLayout";

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

const Updates: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({}) => {
  return (
    <>
      <Head>
        <title>Updates | Alveus.gg</title>
      </Head>

      <DefaultPageLayout
        title={<span className="flex gap-4">Updates</span>}
      ></DefaultPageLayout>
    </>
  );
};

export default Updates;

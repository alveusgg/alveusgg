import { type NextPage } from "next";
import Head from "next/head";

import DefaultPageLayout from "../components/DefaultPageLayout";

const About: NextPage = () => {
  return (
    <>
      <Head>
        <title>About | Alveus.gg</title>
      </Head>

      <DefaultPageLayout title="About">
        <p>Lorem ipsum dolor sit amet</p>
      </DefaultPageLayout>
    </>
  );
};

export default About;

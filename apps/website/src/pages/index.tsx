import { type NextPage } from "next";
import Head from "next/head";

import DefaultPageLayout from "../components/DefaultPageLayout";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Alveus.gg</title>
      </Head>

      <DefaultPageLayout title="Home">
        <p>Lorem ipsum dolor sit amet</p>
      </DefaultPageLayout>
    </>
  );
};

export default Home;

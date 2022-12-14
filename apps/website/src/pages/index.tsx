import { type NextPage } from "next";
import Head from "next/head";

import { SiteHead } from "../components/SiteHead";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Alveus.gg</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SiteHead />
      <main></main>
    </>
  );
};

export default Home;

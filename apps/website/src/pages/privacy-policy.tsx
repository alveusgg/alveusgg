import { type NextPage } from "next";
import Head from "next/head";

import DefaultPageLayout from "../components/DefaultPageLayout";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - Alveus.gg</title>
      </Head>

      <DefaultPageLayout title="Privacy Policy">
        <ul className="ml-8 list-disc">
          <li>Twitch Embed</li>
          <li>Twitch Auth</li>
          <li>OneSignal</li>
          <li>Hosting (Vercel, PlanetScale)</li>
        </ul>
      </DefaultPageLayout>
    </>
  );
};

export default Home;

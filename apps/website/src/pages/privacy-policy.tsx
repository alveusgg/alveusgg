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
          <li>
            <a
              href=" https://www.twitch.tv/p/en/legal/privacy-notice/"
              rel="noreferrer"
              target="_blank"
            >
              Twitch (Embed, Auth)
            </a>
          </li>
          <li>
            <a
              href="https://onesignal.com/privacy_policy"
              rel="noreferrer"
              target="_blank"
            >
              OneSignal
            </a>
          </li>
          <li>
            <a
              href="https://vercel.com/legal/privacy-policy"
              rel="noreferrer"
              target="_blank"
            >
              Vercel
            </a>
          </li>

          <li>
            <a
              href="https://planetscale.com/legal/privacy"
              rel="noreferrer"
              target="_blank"
            >
              PlanetScale
            </a>
          </li>
        </ul>
      </DefaultPageLayout>
    </>
  );
};

export default Home;

import { type NextPage } from "next";
import Head from "next/head";

import { TwitchEmbed } from "../components/TwitchEmbed";

const Live: NextPage = () => {
  return (
    <>
      <Head>
        <title>Live | Alveus.gg</title>
      </Head>

      <main>
        <header>
          <h1 className="sr-only">Live stream</h1>
        </header>

        <div>
          <TwitchEmbed />
        </div>
      </main>
    </>
  );
};

export default Live;

import { type NextPage } from "next";
import Head from "next/head";

import { TwitchEmbed } from "../components/TwitchEmbed";
import { Headline } from "../components/shared/Headline";

const Live: NextPage = () => {
  return (
    <>
      <Head>
        <title>Alveus.gg</title>
      </Head>

      <main>
        <header>
          <h1 className="sr-only">Live stream</h1>
        </header>

        <div>
          <TwitchEmbed />

          <div className="border-t border-t-black">
            <div>
              <ul>
                <li>Twitch page</li>
                <li>Stream VODs</li>
                <li>Stream Clips</li>
                <li>Twitch Schedule</li>
                <li></li>
              </ul>
            </div>

            <div>Ambassadors</div>
            <div>
              <Headline>Links</Headline>

              <ul>
                <li>
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://www.alveussanctuary.org/"
                  >
                    Website
                  </a>
                </li>
                <li>
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://www.youtube.com/AlveusSanctuary"
                  >
                    YouTube
                  </a>
                </li>
                <li>
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://www.instagram.com/alveussanctuary/"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://www.tiktok.com/@alveussanctuary"
                  >
                    TikTok
                  </a>
                </li>
                <li>
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://twitter.com/AlveusSanctuary"
                  >
                    Twitter
                  </a>
                </li>
              </ul>
              <div>
                <Headline>About AlveusSanctuary</Headline>
                Alveus is a 501(c)(3) nonprofit organization functioning as a
                wildlife sanctuary & virtual education center, aiming to unite
                online users for conservation! 🌎 Founded by twitch.tv/maya
              </div>
              <div>Donate</div>
              <div>Merch</div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Live;

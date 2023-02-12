import type { NextPage } from "next"
import Head from "next/head"
import Heading from "../components/content/Heading"
import Script from "next/script"
import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import sirenImage from  "../assets/hero/siren.png"
import mileyImage from  "../assets/hero/miley.png"
import ticoImage from  "../assets/hero/tico.png"
import miaImage from  "../assets/hero/mia.png"
import noodleImage from  "../assets/hero/noodle.png"
import nuggetImage from  "../assets/hero/nugget.png"
import Slideshow from "../components/content/Slideshow"

const slides = [
  {
    src: sirenImage,
    alt: "Siren",
  },
  {
    src: mileyImage,
    alt: "Miley",
  },
  {
    src: ticoImage,
    alt: "Tico",
  },
  {
    src: miaImage,
    alt: "Mia",
  },
  {
    src: noodleImage,
    alt: "Noodle",
  },
  {
    src: nuggetImage,
    alt: "Nugget",
  },
];

const Home: NextPage = () => {
  const twitchEmbedId = useId();
  const twitchEmbedRef = useRef<HTMLDivElement>(null);
  const [ twitchEmbedLoaded, setTwitchEmbedLoaded ] = useState(false);
  const [ twitchEmbedPlaying, setTwitchEmbedPlaying ] = useState(false);
  useEffect(() => {
    if (!twitchEmbedLoaded) {
      if (typeof Twitch !== "undefined") setTwitchEmbedLoaded(true);
      return;
    }
    if (!twitchEmbedRef.current) return;

    // Reset the embed (fixes dev hot reload)
    twitchEmbedRef.current.innerHTML = "";

    // Load the embed from Twitch
    // https://dev.twitch.tv/docs/embed/everything
    const embed = new Twitch.Embed(`twitch-embed-${twitchEmbedId}`, {
      width: "100%",
      height: "100%",
      channel: "alveussanctuary",
      layout: "video",
      allowfullscreen: false,
      autoplay: true,
      muted: true,
    });

    // Track when playing, as we disable pointer events on the embed
    embed.addEventListener(Twitch.Embed.VIDEO_PLAY, () => {
      const player = embed.getPlayer();
      console.log("The video is playing", player);
      setTwitchEmbedPlaying(true);
    });
  }, [twitchEmbedId, twitchEmbedLoaded])

  return (
    <>
      <Head>
        <title>Alveus.gg</title>
      </Head>

      {/* Hero, offset to be navbar background */}
      <div className="min-h-[95vh] lg:-mt-40 flex flex-col relative z-0">
        <div className="absolute inset-0 bg-alveus-green -z-10">
          <Slideshow images={slides} />
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>

        <div className="container mx-auto lg:pt-40 flex flex-wrap flex-grow items-center text-white">
          <div className="basis-full lg:basis-1/2 p-4">
            <Heading className="text-5xl">
              Educating the
              {' '}
              <br className="hidden md:block" />
              World from the Web
            </Heading>

            <p className="text-lg mt-8">
              Alveus is a virtual education center following the journeys of our non-releasable exotic ambassadors,
              aiming to educate and spark an appreciation for them and their wild counterparts.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                className="inline-block text-lg px-4 py-2 rounded-full border-2 border-white hover:bg-alveus-tan hover:text-alveus-green hover:border-alveus-tan transition-colors"
                href="https://www.alveussanctuary.org/ambassadors/"
              >
                Meet the Ambassadors
              </Link>
              <Link
                className="inline-block text-lg px-4 py-2 rounded-full border-2 border-white hover:bg-alveus-tan hover:text-alveus-green hover:border-alveus-tan transition-colors"
                href="/live"
              >
                Watch Live
              </Link>
            </div>
          </div>

          <div className="basis-full lg:basis-1/2 p-4">
            <Link className="block rounded-2xl shadow-xl hover:shadow-2xl transition-shadow" href="/live">
              <div
                className={`w-full h-auto aspect-video rounded-2xl overflow-clip ${twitchEmbedPlaying ? "pointer-events-none" : ""}`}
                id={`twitch-embed-${twitchEmbedId}`}
                ref={twitchEmbedRef}
              />
            </Link>
          </div>
        </div>
      </div>

      <Script
        src="https://embed.twitch.tv/embed/v1.js"
        strategy="lazyOnload"
        onLoad={() => setTwitchEmbedLoaded(true)}
      />
    </>
  );
};

export default Home;

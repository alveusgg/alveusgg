import Section from "./Section"
import React from "react"
import Heading from "./Heading"
import IconTwitch from "../../icons/IconTwitch"
import IconInstagram from "../../icons/IconInstagram"
import IconTikTok from "../../icons/IconTikTok"
import IconTwitter from "../../icons/IconTwitter"
import IconYouTube from "../../icons/IconYouTube"

const socials = {
  instagram: {
    link: "https://www.instagram.com/alveussanctuary",
    title: "Instagram",
    icon: IconInstagram,
  },
  tiktok: {
    link: "https://www.tiktok.com/@alveussanctuary",
    title: "TikTok",
    icon: IconTikTok,
  },
  twitter: {
    link: "https://twitter.com/AlveusSanctuary",
    title: "Twitter",
    icon: IconTwitter,
  },
  twitch: {
    link: "https://twitch.tv/alveussanctuary",
    title: "Twitch.tv",
    icon: IconTwitch,
  },
  youtube: {
    link: "https://www.youtube.com/c/AlveusSanctuary",
    title: "YouTube",
    icon: IconYouTube,
  },
};

const Socials = () => (
  <Section dark>
    <div className="flex flex-wrap-reverse items-center">
      <div className="basis-full md:basis-1/2">
        {/* TODO: Image */}
      </div>

      <div className="basis-full md:basis-1/2">
        <Heading level={2}>
          Stay Updated!
        </Heading>

        <p className="my-4">
          follow
          {' '}
          <span className="font-bold">
            @alveussanctuary
          </span>
          {' '}
          on all social platforms to keep up to date!
        </p>

        <ul className="flex flex-wrap gap-4">
          {Object.entries(socials).map(([ key, social ]) => (
            <li key={key}>
              <a
                className="block text-alveus-green hover:text-alveus-tan bg-alveus-tan hover:bg-alveus-green transition-colors p-3 rounded-2xl"
                href={social.link}
                target="_blank"
                rel="noreferrer"
              >
                <social.icon size={24} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </Section>
);

export default Socials;

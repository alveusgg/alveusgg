import Section from "../../content/Section"
import React from "react"
import Heading from "../../content/Heading"
import socialsImage from "../../../assets/socials.png"
import socials from "../../shared/data/socials"

const Socials = () => (
  <Section dark className="pb-0">
    <div className="flex flex-wrap-reverse items-center">
      <div className="basis-full md:basis-1/2 pt-8 md:pt-0 md:pr-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={socialsImage.src}
          alt="TikTok screenshot showing Georgie the frog, and a second photo baby Stompy the emu on a scale"
          className="w-full max-w-lg mx-auto"
        />
      </div>

      <div className="basis-full md:basis-1/2 pb-16 md:py-4">
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

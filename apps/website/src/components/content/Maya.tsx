import Image from "next/image";

import { classes } from "@/utils/classes";

import mayaHigaAlt from "@/assets/people/maya-higa-alt.jpg";
import mayaHiga from "@/assets/people/maya-higa.jpg";

export const MayaImage = ({ className }: { className?: string }) => (
  <div className={classes("z-0 flex items-center justify-center", className)}>
    <Image
      src={mayaHigaAlt}
      alt="Maya Higa, with Winnie the Moo resting her head on Maya's shoulder"
      width={300}
      height={300}
      className="z-10 mr-[-10%] h-auto w-2/5 max-w-64 rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl"
    />
    <Image
      src={mayaHiga}
      alt="Maya Higa"
      width={400}
      height={400}
      className="h-auto w-3/5 max-w-96 rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl"
    />
  </div>
);

export const MayaText = () => (
  <>
    <p>
      Maya Higa is one of the top female streamers on Twitch and has amassed a
      large following on YouTube and other social platforms. She integrates her
      passion for wildlife conservation and education into her content
      regularly, creating some of the most unique content on Twitch. Maya has
      experience as a licensed falconer, wildlife rehabilitator, zookeeper, and
      conservation outreach educator.
    </p>
    <p>
      Her livestreams and videos feature conservation education and charity
      fundraising. She created a conservation podcast in 2019 which aired more
      than 60 episodes and raised more than $92,000 for conservation
      organizations around the globe. In 2021, Maya founded Alveus Sanctuary, a
      non-profit wildlife sanctuary and virtual education center in central
      Texas.
    </p>
  </>
);

// Based on https://en.wikipedia.org/wiki/File:Maya_Higa_Signature.svg
export const MayaSignature = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 343 144"
    className={className}
  >
    <title>Maya Higa</title>
    <path
      fill="currentColor"
      d="M328.567 1.6c-2.1 2-2 2.8.9 11.3 1.3 4.1 2.7 9.4 3.1 12 1.5 11.8-5.6 29.2-16.2 39.7-5.6 5.5-7.5 6.7-13.6 8.5-10.2 3.1-26.9 3.2-35.3.1-7-2.6-12.5-7.6-16-14.6-3.3-6.5-3.2-11.3.5-22.1 4.3-12.8 4-15.5-2.6-19.5-7-4.4-18.7-1.2-28.6 7.9-3.1 2.8-7.5 8-9.7 11.5-3.4 5.5-4.5 6.5-8.3 7.5-2.4.7-6.6 1.3-9.3 1.4-4.4.2-5-.1-5.3-2-.2-1.1 1.1-5.6 2.7-10 4.3-10.9 4-15.4-.8-13.8-1.1.3-5.1 5.2-8.9 10.8-12.3 18.1-20 25.7-26 25.7-2.3 0-2.4-.2-2-4.8.3-2.6 2.4-9.1 4.7-14.6 4.5-10.6 4.9-13.9 1.5-14.4-2.3-.3-5.7 4.1-12.7 17-9.1 16.4-15.6 17.5-10.2 1.8 1.4-4 2.5-8.3 2.5-9.4s-2.3-4.2-5.1-6.9c-4.9-4.7-5.3-4.9-9.8-4.5-11.6 1.1-26.7 13-34 26.7-2.9 5.5-3.3 7-2.8 11.2.3 2.7 1.3 5.9 2.2 7.1 2 3 1.9 4.4-.5 6.8-3.3 3.3-8.2 2.7-11.9-1.5-1.7-2-3.4-4.8-3.8-6.3-1.5-5.2-.6-16.8 2.6-31.8 3.4-16.7 3.8-22.2 1.7-26.3-3.8-7.2-8.8-6.7-18 1.9-3.5 3.3-6.6 6-7 6-.3 0-1.3-1.5-2.2-3.3-5.8-11.4-13-11.5-24.9-.5-3.3 3-7.9 6.5-10.2 7.7-2.4 1.2-4.3 2.3-4.3 2.5 0 3.2-3.7 17.3-6.5 25.1-2.8 7.6-3.8 12.1-4.2 18.7-.5 7.8-.4 8.8 1.2 9.4 4.6 1.8 8.4-5.2 12.5-23.4 1.6-7.2 4.2-16 5.8-19.4 3.7-8.1 11.3-18.1 15.9-20.9 3.5-2.2 3.6-2.2 5-.3 1.2 1.5 1.4 4.3 1 12.9-.4 9.4-1.1 13.4-5.2 27.4-5 17-5.2 21.1-1.3 21.9 2.1.4 3.6-2.7 11.4-23.3 7.9-20.9 11.5-28.1 17.2-34.5l5-5.5.7 2.8c.9 3.5.4 7.8-3.6 28.9-3.2 16.6-3.2 16.7-1.6 23.4 2.9 11.8 9.8 18 19 17.2 2.9-.2 6.8-1.2 8.7-2.1 4.1-2 16-10.9 24.8-18.6l6.2-5.3 4 3.6c4.4 4 6.1 4.3 10.4 2.1 3.8-2 4.3-1.9 8 1 1.7 1.4 4.4 3.6 6 4.8l2.8 2.3-5.5 10.5c-6.3 11.7-8.3 17.8-9.2 27.7-1.2 12.1 2.5 28.9 7.7 34.4 2.5 2.7 3.3 3 6.9 2.5 8.7-1.2 14.8-11.5 17.8-30.4 1.1-6.5 2.9-17.9 4.1-25.3 2.6-16.6 5.6-29 7.4-30.8.7-.8 6.4-2.9 12.6-4.8l11.3-3.4 4.4 4.1c4 3.7 4.8 4 8.1 3.5 2-.4 6.7-2.2 10.4-4 3.8-1.9 7-3 7.3-2.5.4.5 1.2 3 2 5.6 3.2 10.9 11.8 19.6 24.6 25 5.8 2.5 7.6 2.7 18.9 2.8 27.1 0 42.3-9.5 54.2-34 4.4-9.1 6-18.9 4.8-29-1.1-9.1-7.4-20.5-11.4-20.5-.2 0-1.2.7-2 1.6m-86 21.9c1.5 3.7-7.7 16.3-15.6 21.5-5.3 3.5-6.6 3.7-7.5 1-1.9-5.9 6.2-17.1 15.6-21.8 5.2-2.6 6.8-2.7 7.5-.7m-118.2 3.1c4.1 1.6.7 10.4-8.2 21.6-6.9 8.7-9.4 10.6-14.5 11.5-4.7.7-6.3-1.9-4.7-7.6 1.8-6.8 13.5-19.7 22-24.2 4.2-2.2 3.5-2 5.4-1.3m44.8 48c-.4 5.3-4.3 29.2-6.8 41.3-1.9 9-4.5 16.3-6.1 16.8-3.2 1.1-7.3-12.1-7.3-23.9 0-11.6 5.5-25 14.9-35.9 4.3-5.1 5.7-4.6 5.3 1.7"
    />
    <path
      fill="currentColor"
      d="M281.167 14.2c-.7.7-1.2 2.2-1.2 3.5 0 1.9.5 2.3 2.9 2.3 3.3 0 4.6-2.2 3.1-5.1-1.2-2.2-3-2.5-4.8-.7m-16.7 6.2c-2.1 3.2-1.4 5.3 2.1 6.2 4.6 1.2 6-4.5 1.7-7.3-2-1.3-2.3-1.2-3.8 1.1"
    />
  </svg>
);

export const MayaQuote = ({ short = false }: { short?: boolean }) => (
  <figure className="flex flex-col gap-2">
    <blockquote className="font-serif text-2xl text-pretty text-alveus-green-100">
      <p>
        <span>&ldquo;</span>
        {!short && (
          <>
            I love the natural world with my whole heart and entire being.
            <br className="hidden sm:block" />{" "}
          </>
        )}
        All I want is to inspire that same love in others.
        <span>&rdquo;</span>
      </p>
    </blockquote>

    <figcaption className="flex items-start gap-2">
      <MayaSignature className="h-8 text-alveus-green-200" />
      <p className="sr-only">Maya Higa</p>
      <p className="text-xs/loose tracking-widest text-alveus-green-200 uppercase">
        Founder, Alveus Sanctuary
      </p>
    </figcaption>
  </figure>
);

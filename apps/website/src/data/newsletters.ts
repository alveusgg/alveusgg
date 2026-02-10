import { type ImageProps } from "next/image";

import type { PartialDateString } from "@/utils/datetime-partial";

import newsletter20251025 from "@/assets/newsletters/2025-10-25.png";
import newsletter20251111 from "@/assets/newsletters/2025-11-11.png";
import newsletter20260209 from "@/assets/newsletters/2026-02-09.png";

type DateString = PartialDateString & `${number}-${number}-${number}`;

export type Newsletter = {
  date: DateString;
  subject: string;
  sender: string;
  image: ImageProps["src"];
  cta: {
    text: string;
    href: string;
  };
  alt: string[];
};

const newsletters = (
  [
    {
      date: "2026-02-09",
      subject: "a lil alveus 2025 recap :) - 2025 was a massive year!!!!",
      sender: "Maya Higa",
      image: newsletter20260209,
      cta: {
        text: "Unlock a Pixel",
        href: "/institute/pixels/two",
      },
      alt: [
        "'25 REWIND",
        "HELLO EMAIL LISTERS!!!!! Wanted to write another email to highlight some of our 2025 successes. We have so much planned for 2026!!",
        "1. (1/27/25) Rescued AKELA! 2. (3/03/25) Introduced plant ambassadors :D 3. (4/07/25) Pushpop enclosure reveal 4. (6/16/25) Welcomed Eva & Kiwi 5. (7/04/25) Flood damage repair streams (INSANE) 6. (9/04/25) Alveus Adventures Premiere 7. (9/15/25) Rescued Nolie! 8. (10/19/25) ARRI ANNOUNCEMENT 9. (10/19/25) Pixel Project 1 + 2 (2 is still running and you can still get a pixel!) 10. (12/06/25) Nominated + won at The Streamer Awards",
        "Thank you for everything. Thank you in advance for all of your support in 2026 and for your support for ARRI. Plssss continue watching the live cams - that's one of the best ways to support us without donating directly! SEE U IN CHAT <3, maya :)",
      ],
    },
    {
      date: "2025-11-11",
      subject: "hi guys it's maya again :) - we are runnin it back!!!!",
      sender: "Maya Higa",
      image: newsletter20251111,
      cta: {
        text: "Unlock a Pixel",
        href: "/institute/pixels/two",
      },
      alt: [
        "PIXEL PROJECT 2 IS HERE!",
        "HI GUYS it's maya again :) First off - thank you SO much for your support of the original pixel campaign. We raised our goal of $1M in 3 days. (???!!!!) That is so crazy. What's crazier is people have wanted to support ARRI more, so here we are...",
        "PIXEL PROJECT 2 HAS LAUNCHED! We were shocked at how many people said they didn't get a chance to get their own pixel and wanted us to do another mural - so we are doing just that. For every donation of $100, you can unlock a pixel on our new mural. Your pixel will display your username and denote you as one of the vital initial supporters of the Alveus Research + Recovery Institute (ARRI). We are so grateful for your support in helping us build a facility that will help to secure a future for wolves and for our natural world as a whole.",
        "I will never not be amazed at the passion and generosity of this community. Thank you for trusting us. Thank you for being a part of this journey. And thank you for reading!",
        "Hope you have the best day ever! - maya :)",
      ],
    },
    {
      date: "2025-10-25",
      subject:
        "hi guys it's maya :) - this is our biggest announcement ever!!!",
      sender: "Maya Higa",
      image: newsletter20251025,
      cta: {
        text: "Unlock a Pixel",
        href: "/institute/pixels/one",
      },
      alt: [
        "WE NEED YOUR HELP!",
        "Hi guys - it's maya :) I HAVE BIG NEWS! We are launching the Alveus Research & Recovery Institute (ARRI). This is a new facility with 2 main goals: species recovery and advancing conservation technology.",
        "Our work will begin with a endangered species - both icons of North American ecosystems: the Mexican Gray Wolf and the Red Wolf. Our goal is to breed these wolves at ARRI and then reintroduce them to the wild - actively contributing to wild populations and aiding in saving their species. There are currently less than 20 Red Wolves and less than 300 Mexican Gray Wolves left in the wild. we have to act NOW. And we need your help.",
        "We just launched a $1 million capital campaign fundraiser - The Pixel Project. For every $100 donation, you will unlock a pixel on a mural that will be displayed on our website and physically at ARRI. Your pixel will display your username and denote you as one of the 10,000 vital original supporters of ARRI. We need 10,000 of you to make this work!",
        "THANK YOU ALL for everything. You have changed my life and the lives of so many animals already. Now we can change the future of wolves together. - maya :) 10/11/2025",
      ],
    },
  ] as const satisfies Newsletter[]
).toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export default newsletters;

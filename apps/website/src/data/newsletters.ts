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
      alt: [],
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
      alt: [],
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
      alt: [],
    },
  ] as const satisfies Newsletter[]
).toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export default newsletters;

import { type NextPage } from "next";
import Image from "next/image";

import staff from "@/data/staff";

import { classes } from "@/utils/classes";

import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import People from "@/components/content/People";
import RssLink from "@/components/content/RssLink";
import Section from "@/components/content/Section";
import { YouTubeLightbox } from "@/components/content/YouTube";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";

interface Member {
  name: string;
  title: string;
}

const team: Record<string, Member> = {
  jeff: {
    name: "Jeff (@YungJeff)",
    title: "Social Media Manager",
  },
  dion: {
    name: "Dion (@Dionysus1911)",
    title: "Lead Artist",
  },
  paul: {
    name: "Paul (@pjeweb)",
    title: "Open-Source Developer",
  },
  matt: {
    name: "Matt (@MattIPv4)",
    title: "Open-Source Developer",
  },
};

const AboutStaffPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Alveus Staff"
        description="Watch the video to meet some of the team and discover what they do at Alveus in their jobs, or read on to learn more about each of them."
      >
        <RssLink title="Alveus Sanctuary Staff" path="/feeds/staff.xml" />
      </Meta>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-8"
        containerClassName="flex flex-wrap items-center justify-between"
      >
        <div className="flex basis-full flex-col gap-4 pt-4 pb-16 xl:basis-1/2 xl:py-24">
          <Heading className="my-0">Alveus Staff</Heading>
          <p className="text-lg">
            The staff at Alveus all work at our facility in Texas, providing
            care to our animal ambassadors on a daily basis, cleaning enclosures
            and maintaining the property, and ensuring we can provide the best
            online education experience for livestream viewers.
          </p>
          <p className="text-lg">
            Watch the video to meet some of the team and discover what they do
            at Alveus in their jobs, or read on to learn more about each of
            them.
          </p>
        </div>

        <div className="basis-full p-4 pt-8 xl:basis-1/2 xl:pt-4">
          <div className="mx-auto max-w-2xl xl:mr-0">
            <YouTubeLightbox videoId="7DvtjAqmWl8" />

            <Heading level={2} className="text-center">
              Meet the team
            </Heading>
          </div>
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -top-52 -left-8 z-10 hidden h-auto w-1/2 max-w-40 -rotate-45 drop-shadow-md select-none lg:block"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-52 z-10 hidden h-auto w-1/2 max-w-40 drop-shadow-md select-none lg:block 2xl:-bottom-64 2xl:max-w-48"
        />

        <Section className="grow">
          <People people={staff} link />

          <p className="mt-8 mb-4 border-t-2 border-alveus-green-300/25 px-4 pt-8 text-lg">
            The Alveus team is more than just our on-site staff. We have a
            number of folks who help us out remotely with a variety of tasks,
            from social media management to development.
          </p>

          <div className="flex scroll-mt-4 flex-wrap" id="team">
            {Object.entries(team).map(([key, person], _, arr) => (
              <div
                key={key}
                className={classes(
                  "w-full p-4 sm:w-1/2",
                  arr.length === 4 ? "lg:w-1/4" : "lg:w-1/3",
                )}
              >
                <p className="text-lg font-semibold">{person.name}</p>
                <p>{person.title}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
};

export default AboutStaffPage;

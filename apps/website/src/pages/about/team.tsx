import { type NextPage } from "next";
import Image from "next/image";

import staff from "@/data/staff";

import { classes } from "@/utils/classes";

import Heading from "@/components/content/Heading";
import { MayaText } from "@/components/content/Maya";
import Meta from "@/components/content/Meta";
import People from "@/components/content/People";
import RssLink from "@/components/content/RssLink";
import Section from "@/components/content/Section";
import SubNav from "@/components/content/SubNav";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import ellieArmstrongImage from "@/assets/people/ellie-armstrong.png";
import joeSiegristImage from "@/assets/people/joe-siegrist.jpg";
import joelPierreImage from "@/assets/people/joel-pierre.jpg";
import mayaHigaImage from "@/assets/people/maya-higa.jpg";
import micheleRaffinImage from "@/assets/people/michele-raffin.png";
import nickElectricianImage from "@/assets/people/nick-electrician.png";
import sebastianEcheverriImage from "@/assets/people/sebastian-echeverri.png";
import synackImage from "@/assets/people/synack.png";

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
  colton: {
    name: "Colton (@coltonactually)",
    title: "Creative Producer",
  },
  paul: {
    name: "Paul (@pjeweb)",
    title: "Open-Source Developer",
  },
  matt: {
    name: "Matt (@MattIPv4)",
    title: "Open-Source Developer",
  },
  james: {
    name: "James (@strangecyan)",
    title: "Open-Source Developer",
  },
};

const advisors = {
  michele: {
    image: micheleRaffinImage,
    name: "Michele Raffin",
    title: "Advisory Board Member",
    description: (
      <>
        <p>
          Michele Raffin is president of Pandemonium Aviaries, a conservation
          organization dedicated to saving birds. A former high-tech executive,
          Raffin began taking in abandoned and discarded birds fifteen years
          ago, housing them in her backyard a half hour south of San Francisco.
          Raffin is a dedicated avian advocate and a passionate observer of
          birdlife. A certified aviculturist and regular consultant to zoos and
          breeders, Raffin has spoken at the TEDx conference, is the
          conservation columnist for the Avicultural Society of America&apos;s
          Avicultural Bulletin, and has served as co-chair of a large humane
          society and on the board of a companion bird rescue organization.
        </p>
      </>
    ),
  },
  ellie: {
    image: ellieArmstrongImage,
    name: "Ellie Armstrong",
    title: "Advisory Board Member",
    description: (
      <>
        <p>
          Ellie received her PhD from Stanford University in the Biology
          Department in 2021 where she used genomics to study big cats and built
          tools to assist in tracking and identifying illegally traded animals
          and animal products. She is now a post-doctoral fellow with the
          Washington Research Foundation at Washington State University, where
          she has expanded this work to grizzly bears and other Pacific
          Northwest fauna.
        </p>
        <p>
          Previously, Ellie attended the University of California at Berkeley,
          where she received her B.S. in Molecular Environmental Biology, and
          subsequently obtained a M.S. from the University of Hawaii, Hilo.
        </p>
        <p>
          In addition to her work in genetics, Ellie is also a board member and
          science advisor for Tigers in America and is passionate about working
          to end unregulated captive breeding in the United States.
        </p>
        <p>
          In her spare time, Ellie loves to hang out with her dogs, run, play
          video games, and watch Twitch! She&apos;s thrilled to support Alveus
          as they grow.
        </p>
      </>
    ),
  },
  synack: {
    image: synackImage,
    name: "Synack",
    title: "Advisory Board Member",
    description: (
      <>
        <p>
          Nick (Synack) is currently the general manager of the media/gaming
          organization &apos;One True King&apos;, and has been since October of
          2020. Previous experience includes 10 years as an Operations/Project
          manager for a custom software development company, as well as 5 years
          being a treasurer and board member for a non-profit cat rescue and
          low-cost spay/neuter organization. In addition, he has 10 years of
          experience on an advisory board for the business and technology
          department of a local college.
        </p>
      </>
    ),
  },
  sebastian: {
    image: sebastianEcheverriImage,
    name: "Sebastian Echeverri",
    title: "Advisory Board Member",
    description: (
      <>
        <p>
          Sebastian is a spider scientist, wildlife photographer, and educator
          who loves introducing people to wonderfully weird animals. He&apos;s
          been featured on podcasts, news, and TV, including Ologies, NPR, and
          Disney+. Sebastian studies the evolutionary relationship between
          animals&apos; eyes, their environment, and how they use color, shape,
          and movement to talk with each other. For his PhD, he studied why and
          how jumping spiders get their audience&apos;s attention when
          performing their spectacular courtship dances. Currently, he is
          researching the evolution of eye size across tarantulas. To learn more
          about his work, visit www.spiderdaynightlive.com. Sebastian advises
          Alveus on the care and behavior of the sanctuary&apos;s arthropod
          ambassadors.
        </p>
      </>
    ),
  },
  nick: {
    image: nickElectricianImage,
    name: "Nick",
    title: "Advisory Board Member",
    description: (
      <>
        <p>
          Nick has been a master electrician since 1996, he is also part owner
          in a wildlife technology company called Window to Wildlife. He has
          been advising and helping build Alveus&apos; power, internet and cam
          infrastructure since the beginning. Nick donates a lot of his time and
          skills and we are excited to have him on the advisory board.
        </p>
      </>
    ),
  },
};

const directors = {
  maya: {
    image: mayaHigaImage,
    name: "Maya Higa",
    title: "Board Member",
    description: <MayaText />,
  },
  joe: {
    image: joeSiegristImage,
    name: "Joe Siegrist",
    title: "Board Member",
    description: (
      <>
        <p>
          Joe Siegrist resides in Erie, Pennsylvania and is the President of the
          Purple Martin Conservation Association. He has previously conducted
          avian research for the University of Illinois and the Illinois Natural
          History Survey studying Acadian Flycatchers, Northern Bobwhite, and
          Neotropical Migrants in general. In addition to conservation research,
          he has also worked as an educator teaching high school science, a
          zookeeper, a naturalist, and a stay-at-home parent. Joe also serves on
          the board of the North American Bluebird Society and as the board
          chairman of the Erie Bird Observatory.
        </p>
      </>
    ),
  },
  joel: {
    image: joelPierreImage,
    name: "Joel Pierre",
    title: "Board Member",
    description: (
      <>
        <p>
          Joel Pierre resides in Canada and is a Senior Financial Consultant.
          Joel combines his love for Finance and Technology to help build and
          develop systems for rapid growth. Previously Financial Controller at
          Sealion Cargo Inc., Joel demonstrates leadership critical to the
          success of any organization. Graduate of the University of Toronto
          with a Specialist in Philosophy, Joel is perfectly aligned with
          Alveus&apos; core values to educate the world about animals in a new
          and innovative way.
        </p>
      </>
    ),
  },
};

const sectionLinks = [
  { name: "Staff", href: "#staff" },
  { name: "Advisory Board", href: "#advisory-board" },
  { name: "Board of Directors", href: "#board-of-directors" },
];

const AboutTeamPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Alveus Team"
        description="Learn more about the Alveus staff, advisory board, and board of directors."
      >
        <RssLink title="Alveus Sanctuary Staff" path="/feeds/staff.xml" />
      </Meta>

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark className="py-8">
        <Heading className="my-0">Alveus Team</Heading>
      </Section>

      <SubNav links={sectionLinks} className="z-20" />

      <Section className="bg-alveus-green-100 py-16 text-center text-alveus-green-900">
        <Heading level={2} id="staff" link>
          Alveus Staff
        </Heading>
        <p className="mx-auto max-w-2/3 text-lg">
          The staff at Alveus all work at our facility in Texas, providing care
          to our animal ambassadors on a daily basis, cleaning enclosures and
          maintaining the property, and ensuring we can provide the best online
          education experience for livestream viewers.
        </p>
      </Section>

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -top-52 -left-8 z-10 hidden h-auto w-1/2 max-w-40 -rotate-45 drop-shadow-md select-none lg:block"
        />
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-48 drop-shadow-md select-none lg:block"
        />

        <Section>
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

      <Section className="bg-alveus-green-100 py-16 text-center text-alveus-green-900">
        <Heading level={2} id="advisory-board" link>
          Alveus Advisory Board
        </Heading>
        <p className="mx-auto max-w-2/3 text-lg">
          The Alveus advisory board consists of experts in various fields who
          provide guidance and advice to the Alveus team.
        </p>
      </Section>

      <div className="relative">
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-20 z-10 hidden h-auto w-1/2 max-w-48 -scale-x-100 drop-shadow-md select-none lg:block"
        />
        <Section>
          <People people={advisors} columns={2} align="center" />
        </Section>
      </div>

      <Section className="bg-alveus-green-100 py-16 text-center text-alveus-green-900">
        <Heading level={2} id="board-of-directors" link>
          Alveus Board of Directors
        </Heading>
        <p className="mx-auto max-w-2/3 text-lg">
          The Alveus Board of Directors supports and oversees the mission of
          Alveus Sanctuary, ensuring we stay true to our values and goals.
        </p>
      </Section>

      <div className="relative">
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-52 z-10 hidden h-auto w-1/2 max-w-40 drop-shadow-md select-none lg:block 2xl:-bottom-64 2xl:max-w-48"
        />
        <Section>
          <People people={directors} columns={2} align="center" />
        </Section>
      </div>
    </>
  );
};

export default AboutTeamPage;

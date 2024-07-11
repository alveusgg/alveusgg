import { type NextPage } from "next";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import People from "@/components/content/People";
import Meta from "@/components/content/Meta";

import micheleRaffinImage from "@/assets/people/michele-raffin.png";
import ellieArmstrongImage from "@/assets/people/ellie-armstrong.png";
import synackImage from "@/assets/people/synack.png";
import sebastianEcheverriImage from "@/assets/people/sebastian-echeverri.png";
import allisonImage from "@/assets/people/allison.jpg";

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
          conservation columnist for the Avicultural Society of America’s
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
          video games, and watch Twitch! She’s thrilled to support Alveus as
          they grow.
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
          Nick is currently the general manager of the media/gaming organization
          ‘One True King’, and has been since October of 2020. Previous
          experience includes 10 years as an Operations/Project manager for a
          custom software development company, as well as 5 years being a
          treasurer and board member for a non-profit cat rescue and low-cost
          spay/neuter organization. In addition, he has 10 years of experience
          on an advisory board for the business and technology department of a
          local college.
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
          who loves introducing people to wonderfully weird animals. He’s been
          featured on podcasts, news, and TV, including Ologies, NPR, and
          Disney+. Sebastian studies the evolutionary relationship between
          animals’ eyes, their environment, and how they use color, shape, and
          movement to talk with each other. For his PhD, he studied why and how
          jumping spiders get their audience’s attention when performing their
          spectacular courtship dances. Currently, he is researching the
          evolution of eye size across tarantulas. To learn more about his work,
          visit www.spiderdaynightlive.com. Sebastian advises Alveus on the care
          and behavior of the sanctuary’s arthropod ambassadors.
        </p>
      </>
    ),
  },
  allison: {
    image: allisonImage,
    name: "Allison",
    title: "Advisory Board Member",
    description: (
      <>
        <p>
          Allison is an entomologist specializing in public service, education,
          and outreach. She served as the coordinator for an insect zoo for
          several years, where she found her passion for teaching with bugs. Dr.
          Allison now focuses on pollinator conservation, reducing pesticide use
          in the environment, and teaching integrated pest management practices.
        </p>
      </>
    ),
  },
};

const AboutAdvisoryBoardPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Advisory Board"
        description="Meet the Alveus Advisory Board."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark className="py-8">
        <Heading className="text-center">Alveus Advisory Board</Heading>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <People people={advisors} columns={2} align="center" />
      </Section>
    </>
  );
};

export default AboutAdvisoryBoardPage;

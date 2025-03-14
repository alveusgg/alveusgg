import { type NextPage } from "next";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import People from "@/components/content/People";
import Meta from "@/components/content/Meta";
import { MayaText } from "@/components/content/Maya";

import mayaHigaImage from "@/assets/people/maya-higa.jpg";
import joeSiegristImage from "@/assets/people/joe-siegrist.jpg";
import joelPierreImage from "@/assets/people/joel-pierre.jpg";

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
          Sealion Cargo Inc. Joel demonstrates leadership critical to the
          success of any organization. Graduate of the University of Toronto
          with a Specialist in Philosophy, Joel is perfectly aligned with
          Alveus’ core values to educate the world about animals in a new an
          innovative way.
        </p>
      </>
    ),
  },
};

const AboutBoardOfDirectorsPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Board of Directors"
        description="Meet the Alveus Board of Directors."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark className="py-8">
        <Heading className="text-center">Alveus Board of Directors</Heading>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="grow">
        <People people={directors} columns={2} align="center" />
      </Section>
    </>
  );
};

export default AboutBoardOfDirectorsPage;

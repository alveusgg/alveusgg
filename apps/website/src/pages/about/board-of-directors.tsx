import { type NextPage } from "next"
import Head from "next/head"
import React from "react"

import Section from "../../components/content/Section"
import Heading from "../../components/content/Heading"
import People from "../../components/content/People"

import mayaHigaImage from "../../assets/people/maya-higa.jpg"
import joeSiegristImage from "../../assets/people/joe-siegrist.jpg"
import joelPierreImage from "../../assets/people/joel-pierre.jpg"

const directors = {
  maya: {
    image: mayaHigaImage,
    name: 'Maya Higa',
    title: 'Board Member',
    description: <>
      <p>
        Maya Higa is one of the top female streamers on Twitch whose passions include wildlife conservation and
        education which she integrates into her content regularly. Maya is a licensed falconer and wildlife
        conservationist. Her livestreams feature falconry, wildlife rehab, conservation education, and charity
        fundraising. She created a conservation podcast in 2019 which has since aired more than 60 episodes on her
        channel and raised more than $92,000 for wildlife protection organizations around the globe.
      </p>
      <p className="mt-4">
        At the beginning of 2021, Higa founded Alveus Sanctuary, a non-profit wildlife sanctuary and virtual education
        center in central Texas.
      </p>
      <p className="mt-4">
        Among this, Higa’s accomplishments include earning a Bachelor of Science in Agricultural Education and
        Communication at Cal-Poly University at San Luis Obispo, as well as being on the Board of Directors for a
        wildlife rehabilitation center in Central Texas, focusing on raptor rehabilitation and husbandry.
      </p>
    </>,
  },
  joe: {
    image: joeSiegristImage,
    name: 'Joe Siegrist',
    title: 'Board Member',
    description: <>
      <p>
        Joe Siegrist resides in Erie, Pennsylvania and is the President of the Purple Martin Conservation Association.
        He has previously conducted avian research for the University of Illinois and the Illinois Natural History
        Survey studying Acadian Flycatchers, Northern Bobwhite, and Neotropical Migrants in general. In addition to
        conservation research, he has also worked as an educator teaching high school science, a zookeeper, a
        naturalist, and a stay-at-home parent. Joe also serves on the board of the North American Bluebird Society and
        as the board chairman of the Erie Bird Observatory.
      </p>
    </>,
  },
  joel: {
    image: joelPierreImage,
    name: 'Joel Pierre',
    title: 'Board Member',
    description: <>
      <p>
        Joel Pierre resides in Canada and is a Senior Financial Consultant. Joel combines his love for Finance and
        Technology to help build and develop systems for rapid growth. Previously Financial Controller at Sealion Cargo
        Inc. Joel demonstrates leadership critical to the success of any organization. Graduate of the University of
        Toronto with a Specialist in Philosophy, Joel is perfectly aligned with Alveus’ core values to educate the world
        about animals in a new an innovative way.
      </p>
    </>,
  },
};

const AboutBoardOfDirectorsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Board of Directors | Alveus.gg</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Nav background */}
      <div className="hidden lg:block bg-alveus-green-900 h-40 -mt-40" />

      <Section dark className="py-8">
        <Heading className="text-center">
          Alveus Board of Directors
        </Heading>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <People people={directors} sideBySide />
      </Section>
    </>
  )
};

export default AboutBoardOfDirectorsPage

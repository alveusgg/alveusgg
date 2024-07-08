import { type NextPage } from "next";
import Image from "next/image";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import People from "@/components/content/People";
import Meta from "@/components/content/Meta";
import { Lightbox, Preview } from "@/components/content/YouTube";

import connorObrienImage from "@/assets/people/connor-obrien.jpg";
import kaylaJacksonImage from "@/assets/people/kayla-jackson.jpg";
import ellaRocksImage from "@/assets/people/ella-rocks.jpg";
import lindsayBellawImage from "@/assets/people/lindsay-bellaw.jpg";
import srutiJamalapuramImage from "@/assets/people/sruti-jamalapuram.jpg";
import nickImage from "@/assets/people/nick.jpg";
import spaceVoyageImage from "@/assets/people/space-voyage.png";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";

const staff = {
  connor: {
    image: connorObrienImage,
    name: "Connor O'Brien",
    title: "Director of Operations",
    description: (
      <>
        <p>
          Connor has volunteered and worked for many wildlife organizations,
          most notably the American Eagle Foundation and the Alaska Wildlife
          Conservation Center. He has taken his love of conservation and
          technology, combined it, and started helping many conservation
          organizations around the country develop and scale large conservation
          projects.
        </p>
        <p>
          There is no better place to utilize technology for conservation than
          Alveus. Connor believes Alveus will set the standard for online
          education and drive significant impact and reach for conservation
          education online.
        </p>
      </>
    ),
  },
  kayla: {
    image: kaylaJacksonImage,
    name: "Kayla Jackson",
    title: "Director of Animal Care & Training",
    description: (
      <>
        <p>
          Kayla graduated from college with a degree in biology and a desire to
          see the world. Her travels eventually found her in Alaska, where she
          realized that animal care and conservation was a cause worth staying
          for. Since Alaska, she has traveled to Nepal where she developed an
          unparalleled love and respect for vultures. That interest in birds of
          prey took her to Tennessee and the American Eagle Foundation, where
          training became her primary interest and passion. While she
          specializes in caring for and training birds of prey, Kayla is
          dedicated to and eager to learn about any species she can. She
          believes training is an integral part of animal welfare and is excited
          to build relationships with the Alveus ambassadors to showcase their
          personalities and inspire dedication to their wild counterparts across
          an ever-growing online audience.
        </p>
      </>
    ),
  },
  ella: {
    image: ellaRocksImage,
    name: "Ella Rocks",
    title: "Animal Care Coordinator",
    description: (
      <>
        <p>
          Ella started volunteering at a local wildlife rehabilitation center
          during high school. After a year of volunteering, she began working at
          the center as a wildlife care coordinator. As part of her job, Ella
          communicated with the public when they found potentially injured, ill
          or orphaned wildlife. She came to realize how important the education
          part of her job was so that people would know what they can do for
          their local wildlife and when to leave them alone. Ella and Maya met
          at the wildlife rehabilitation center and started an ambassador
          training program after the center received two imprinted non
          releasable American crows. Working with the ambassadors sparked in her
          an interest in animal behavior and training. That interest carries on
          into her work at Alveus where she looks forward to seeing the
          ambassadors assist in educating audiences on what they can do for
          their wild counterparts.
        </p>
      </>
    ),
  },
  lindsay: {
    image: lindsayBellawImage,
    name: "Lindsay Bellaw",
    title: "Animal Care Coordinator",
    description: (
      <>
        <p>
          Lindsay graduated college with her Aquatic Biology degree, and her
          Master&apos;s in Conservation of Marine Predators and Coral Reef
          Conservation and Aquaculture. She always knew animals were her
          passion, and loves to travel as much as she can. This brought her to
          American Eagle Foundation where she grew a love for birds of prey.
          Meeting new people, it also took her to Alaska and the Midwest to work
          with a variety of birds. Since moving to Texas, she has grown to love
          all sorts of animals and loves to learn about them and tell anyone who
          will listen about them!
        </p>
      </>
    ),
  },
  sruti: {
    image: srutiJamalapuramImage,
    name: "Sruti Jamalapuram",
    title: "Animal Care Coordinator",
    description: (
      <>
        <p>
          Sruti graduated with a degree in Wildlife Sciences and a Master&apos;s
          in Biology with a focus on Animal Behavior. As a young volunteer at
          her local zoo, Sruti was fortunate to realize her passion for animal
          behavior, conservation, and environmental education. This passion
          translated to jobs all over the world participating in field research
          and education. This trend continued when she moved to Michigan and
          served as the Mammal Curator for The Creature Conservancy. This
          opportunity channeled her interest in behavior into training where she
          trained with animals both big and small for fear-free veterinary care,
          educational programs, and mental well-being. To further improve her
          training skills, Sruti studied and worked with K9 Turbo Training to
          obtain her certification in professional dog training. She specializes
          in fear and aggression and loves working with families to create a
          training environment that is supportive, engaging, and fun for
          everyone!
        </p>
        <p>
          Building relationships with animals, continuing that relationship
          through time/ training, and sharing that experience with others brings
          her a lot of joy - she is excited to do that alongside the Alveus
          community!
        </p>
      </>
    ),
  },
  nick: {
    image: nickImage,
    name: "Nick",
    title: "Facilities",
    description: (
      <>
        <p>I&apos;m the neighbor.</p>
      </>
    ),
  },
  space: {
    image: spaceVoyageImage,
    name: "SpaceVoyage",
    title: "Production Tech",
    description: (
      <>
        <p>
          Space graduated with a degree in computer science and engineering, and
          puts that to use at Alveus, being responsible for all the live
          broadcasts. When he&apos;s not operating cameras and mixing streams,
          he maintains all the software logic that allows chat moderators to
          control the livestream layout and camera positions, as well as
          building one-off automations to support events that we host.
        </p>
        <p>
          Space started out working remotely for Maya and Alveus,
          behind-the-scenes making sure that everything was working flawlessly.
          He has since moved to Texas to work on-site at Alveus as an employee,
          ensuring you get the best viewing experience possible for our
          educational content.
        </p>
      </>
    ),
  },
};

const team = {
  flip: {
    name: "Flip (@Station3Media)",
    title: "Videographer / Photographer",
  },
  dion: {
    name: "Dion (@Dionysus1911)",
    title: "Illustrator / Animator",
  },
  danny: {
    name: "Danny (@DannyDV)",
    title: "Post Production Manager",
  },
  max: {
    name: "Max (@maxzillajr)",
    title: "Video Editor",
  },
  mik: {
    name: "Mik (@Mik_MWP)",
    title: "Social Media Manager",
  },
  abdullah: {
    name: "Abdullah (@AbdullahMorrison)",
    title: "Open-Source Developer (Twitch Extension)",
  },
  paul: {
    name: "Paul (@pjeweb)",
    title: "Open-Source Developer (Website)",
  },
  matt: {
    name: "Matt (@MattIPv4)",
    title: "Open-Source Developer (Website)",
  },
};

const AboutStaffPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Alveus Staff"
        description="Watch the video to meet some of the team and discover what they do at Alveus in their jobs, or read on to learn more about each of them."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-8"
        containerClassName="flex flex-wrap items-center justify-between"
      >
        <div className="flex basis-full flex-col gap-4 pb-16 pt-4 xl:basis-1/2 xl:py-24">
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
          <Lightbox className="mx-auto max-w-2xl xl:mr-0">
            {({ Trigger }) => (
              <Trigger videoId="7DvtjAqmWl8">
                <Preview videoId="7DvtjAqmWl8" />
                <Heading level={2} className="text-center">
                  Meet the team
                </Heading>
              </Trigger>
            )}
          </Lightbox>
        </div>
      </Section>

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -left-8 -top-52 z-10 hidden h-auto w-1/2 max-w-[10rem] -rotate-45 select-none lg:block"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-52 right-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block 2xl:-bottom-64 2xl:max-w-[12rem]"
        />

        <Section className="flex-grow">
          <People people={staff} columns={2} />

          <p className="mb-4 mt-8 border-t-2 border-alveus-green-300/25 px-4 pt-8 text-lg">
            The Alveus team is more than just our on-site staff. We have a
            number of folks who help us out remotely with a variety of tasks,
            from social media management to development.
          </p>

          <div className="flex flex-wrap">
            {Object.entries(team).map(([key, person]) => (
              <div key={key} className="w-full p-4 sm:w-1/2 lg:w-1/3">
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

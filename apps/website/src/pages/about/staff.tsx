import { type NextPage } from "next";
import Image from "next/image";

import { classes } from "@/utils/classes";

import Heading from "@/components/content/Heading";
import { MayaText } from "@/components/content/Maya";
import Meta from "@/components/content/Meta";
import People, { type Person } from "@/components/content/People";
import Section from "@/components/content/Section";
import { Lightbox, Preview } from "@/components/content/YouTube";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import amandaDenaroFunImage from "@/assets/people/amanda-denaro-fun.jpg";
import amandaDenaroImage from "@/assets/people/amanda-denaro.jpg";
import chandlerFunImage from "@/assets/people/chandler-fun.jpg";
import chandlerImage from "@/assets/people/chandler.jpg";
import coltonHolsteImage from "@/assets/people/colton-holste.jpg";
import connorObrienFunImage from "@/assets/people/connor-obrien-fun.jpg";
import connorObrienImage from "@/assets/people/connor-obrien.jpg";
import danielDoormanImage from "@/assets/people/daniel-doorman.jpg";
import kaylaJacksonImage from "@/assets/people/kayla-jackson.jpg";
import lindsayBellawFunImage from "@/assets/people/lindsay-bellaw-fun.jpg";
import lindsayBellawImage from "@/assets/people/lindsay-bellaw.jpg";
import lukasMeyerImage from "@/assets/people/lukas-meyer.jpg";
import mayaHigaFunImage from "@/assets/people/maya-higa-fun.jpg";
import mayaHigaImage from "@/assets/people/maya-higa.jpg";
import spaceVoyageImage from "@/assets/people/space-voyage.png";
import srutiJamalapuramFunImage from "@/assets/people/sruti-jamalapuram-fun.jpg";
import srutiJamalapuramImage from "@/assets/people/sruti-jamalapuram.jpg";

const staff: Record<string, Person> = {
  maya: {
    image: [mayaHigaImage, mayaHigaFunImage],
    name: "Maya Higa",
    title: "Founder & Executive Director",
    description: (
      <>
        <MayaText />
        <p className="font-serif text-lg font-bold text-alveus-green">
          <span>&ldquo;</span>I love the natural world with my whole heart and
          entire being. All I want is to inspire that same love in others.
          <span>&rdquo;</span>
        </p>
      </>
    ),
  },
  connor: {
    image: [connorObrienImage, connorObrienFunImage],
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
  lindsay: {
    image: [lindsayBellawImage, lindsayBellawFunImage],
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
    image: [srutiJamalapuramImage, srutiJamalapuramFunImage],
    name: "Sruti Jamalapuram",
    title: "Animal Care Coordinator",
    description: (
      <>
        <p>
          Sruti graduated with a degree in Wildlife Sciences and a Master&apos;s
          in Biology with a focus on Animal Behavior. As a young volunteer at
          her local zoo, Sruti was fortunate to realize her passion for animal
          behavior, conservation, and environmental education. This passion
          translated to jobs all over the world, participating in field research
          and education. That trend continued when she moved to Michigan and
          served as the Mammal Curator for The Creature Conservancy. This
          opportunity channeled her interest in behavior into training, where
          she trained with animals both big and small for fear-free veterinary
          care, educational programs, and mental well-being. To further improve
          her training skills, Sruti studied and worked with K9 Turbo Training
          to obtain her certification in professional dog training. She
          specializes in fear and aggression and loves working with families to
          create a training environment that is supportive, engaging, and fun
          for everyone!
        </p>
        <p>
          Building relationships with animals, continuing that relationship
          through time and training, and sharing that experience with others
          brings her a lot of joy - she is excited to do that alongside the
          Alveus community!
        </p>
      </>
    ),
  },
  amanda: {
    image: [amandaDenaroImage, amandaDenaroFunImage],
    name: "Amanda Denaro",
    title: "Animal Care Coordinator",
    description: (
      <>
        <p>
          Amanda knew from a young age that she wanted to work with animals.
          After graduating with a degree in biology she started her career off
          as a zookeeper at Zoo Atlanta gaining the opportunity to work with a
          wide variety of hoofstock, primate, and carnivore species. Her love
          for educating and inspiring people to learn more about the animals in
          her care and their wild counterparts grew as well as her desire to
          build positive relationships with the animals she cared for. When the
          opportunity arose to work at Alveus, Amanda was beyond excited to be
          part such of an amazing online community united in the same goal of
          promoting conservation of our natural world.
        </p>
      </>
    ),
  },
  lukas: {
    image: lukasMeyerImage,
    name: "Lukas Meyer",
    title: "Herpetology & Invert Lead | Habitat Specialist",
    description: (
      <>
        <p>
          Lukas has unique animal, horticulture, and construction experience. He
          is able to combine all three to create amazing ecosystems for the
          Alveus ambassadors. He has worked as Curator of Herpetology at the
          Creature Conservancy, and Habitat Landscape at the Detroit Zoo. Lukas
          is a big fan of plants and reptiles. His favorite ambassador at Alveus
          is Pushpop the Sulcata Tortoise.
        </p>
      </>
    ),
  },
  dan: {
    image: danielDoormanImage,
    name: "Daniel (Dan the Doorman)",
    title: "Facilities Specialist",
    description: (
      <>
        <p>
          Daniel has more than 15 years in the construction industry, working in
          a varied capacity, including: carpentry, drywall, brick, tile,
          plumbing, and more. His most recent job being in access solutions,
          mainly overhead sectional doors. He enjoys tinkering with electronics,
          puzzles, and has a strong appreciation for a good looking door.
        </p>
      </>
    ),
  },
  space: {
    image: spaceVoyageImage,
    name: "SpaceVoyage",
    title: "Director of Production",
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
  colton: {
    image: coltonHolsteImage,
    name: "Colton Holste",
    title: "Creative Producer",
    description: (
      <>
        <p>
          Born and raised in Idaho, Colton studied Media Arts at Boise State
          University before leaving to take on a full-time role managing a
          production studio. There, he created marketing campaigns, public
          television programming, and digital content for a range of clients. In
          the middle of the COVID pandemic (and against all advice), he
          relocated to Texas to launch his own media company, which he still
          runs today. His volunteer work at Alveus Animal Sanctuary eventually
          led to a formal role producing content for the organization, blending
          his passion for storytelling with a deep respect for animals and
          education.
        </p>
        <p className="font-serif text-lg font-bold text-alveus-green">
          <span>&ldquo;</span>Cinema
          <span>&rdquo;</span>
        </p>
      </>
    ),
  },
  chandler: {
    image: [chandlerImage, chandlerFunImage],
    name: "Chandler",
    title: "YouTube Channel Manager",
    description: (
      <>
        <p>I&apos;m the zoomer (W Hunger).</p>
      </>
    ),
  },
};

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
      />

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

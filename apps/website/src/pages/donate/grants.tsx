import { type NextPage } from "next";
import Image, { type StaticImageData } from "next/image";
import { type ReactNode, useMemo } from "react";

import ambassadors from "@alveusgg/data/build/ambassadors/core";
import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";
import { getSpecies } from "@alveusgg/data/build/ambassadors/species";

import collaborations from "@/data/collaborations";
import staff from "@/data/staff";

import { classes } from "@/utils/classes";
import { sortPartialDateString } from "@/utils/datetime-partial";
import {
  type GrantClassificationStat,
  type GrantEnclosureStat,
  getGrantAmbassadorStats,
} from "@/utils/grant-stats";

import Button from "@/components/content/Button";
import Carousel from "@/components/content/Carousel";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import SubNav from "@/components/content/SubNav";
import Transparency from "@/components/content/Transparency";
import { YouTubePreview } from "@/components/content/YouTube";

import IconArrowRight from "@/icons/IconArrowRight";
import IconDocument from "@/icons/IconDocument";
import IconEnvelope from "@/icons/IconEnvelope";
import IconInstagram from "@/icons/IconInstagram";

import arriBuildingImage from "@/assets/grants/arri-building.jpg";
import emuEnclosureImage from "@/assets/grants/emu-enclosure.jpg";
import studioHero from "@/assets/hero/studio.jpg";

const grantContactEmail = "grants@alveussanctuary.org";
const grantEin = "86-1772907";
const emuEnclosureInstagramUrl = "https://www.instagram.com/p/DZGNTYwD8Ba/";

const grantSectionLinks = [
  { name: "Research & Recovery", href: "#arri" },
  { name: "Education", href: "#conservation-education" },
  { name: "Animal Care", href: "#animal-care-and-rescue" },
  { name: "Enclosures", href: "#animal-ambassador-enclosures" },
  { name: "Reach Out", href: "#contact" },
];

const educationShows = [
  {
    key: "conservation-conversations",
    title: "Conservation Conversations",
    image: "https://files.alveus.site/intros/podcast.png",
  },
  {
    key: "animal-care-chats",
    title: "Animal Care Chats",
    image: "https://files.alveus.site/intros/animalcarechats.png",
  },
  {
    key: "animal-quest",
    title: "Animal Quest",
    image: "https://files.alveus.site/intros/animalquest.png",
    href: "/animal-quest",
  },
] as const;

const grantAmbassadorSlides = ["kasi", "akela", "appa"] as const;

const animalCareStaffEntries = Object.entries(staff)
  .filter(([, person]) => person.department === "animalCare")
  .sort(([, a], [, b]) => sortPartialDateString(b.joined, a.joined));

const arriPanel = {
  panelId: "arri",
  title: "Alveus Research and Recovery Institute (ARRI)",
  description:
    "Conservation research and species recovery, starting with Mexican and Red wolves.",
  image: arriBuildingImage,
  imageAlt:
    "Rendering of the Alveus Research & Recovery Institute building with donor recognition signage",
  imageClassName: "object-[45%_40%]",
} as const;

const educationPanel = {
  panelId: "conservation-education",
  title: "Conservation Education Programs",
  description:
    "Free online conservation education through live streams and video series.",
  image: studioHero,
  imageAlt: "The Alveus studio where educational live streams are produced",
} as const;

const animalCarePanel = {
  panelId: "animal-care-and-rescue",
  title: "Animal Care and Rescue",
  description:
    "Rescue, daily care, and enrichment for non-releasable ambassador animals.",
} as const;

const enclosuresPanel = {
  panelId: "animal-ambassador-enclosures",
  title: "Animal Ambassador Enclosures",
  description:
    "Building and maintaining AZA/GFAS-standard habitats for ambassador animals.",
} as const;

const formatLinkedList = (
  items: { label: string; href: string }[],
  renderLink: (item: { label: string; href: string }) => ReactNode,
) => {
  if (items.length === 0) return null;
  if (items.length === 1) {
    const item = items[0];
    if (!item) return null;
    return renderLink(item);
  }

  return items.flatMap((item, index) => {
    const isLast = index === items.length - 1;
    const isSecondLast = index === items.length - 2;

    return [
      <span key={item.href}>{renderLink(item)}</span>,
      isLast ? null : isSecondLast ? " and " : ", ",
    ].filter(Boolean);
  });
};

const LinkedClassifications = ({
  items,
  dark,
}: {
  items: GrantClassificationStat[];
  dark?: boolean;
}) =>
  formatLinkedList(
    items.map(({ name, href }) => ({ label: name.toLowerCase(), href })),
    (item) => (
      <Link key={item.href} href={item.href} dark={dark}>
        {item.label}
      </Link>
    ),
  );

const LinkedEnclosures = ({
  items,
  dark,
}: {
  items: GrantEnclosureStat[];
  dark?: boolean;
}) =>
  formatLinkedList(
    items.map(({ name, href }) => ({ label: name, href })),
    (item) => (
      <Link key={item.href} href={item.href} dark={dark}>
        {item.label}
      </Link>
    ),
  );

const useGrantsCarousels = () => {
  const stats = useMemo(() => getGrantAmbassadorStats(), []);

  const educationShowCarouselItems = useMemo(() => {
    const newestCollaboration = collaborations[0];

    const showSlides = educationShows.map(({ key, title, image, ...show }) => {
      const imageContent = (
        <Image
          src={image}
          alt={title}
          className="aspect-video w-full overflow-hidden rounded-lg bg-alveus-green-100 object-cover shadow-sm transition group-hover/trigger:scale-102 group-hover/trigger:shadow-lg"
          width={320}
          height={180}
          draggable={false}
        />
      );

      return [
        key,
        <figure key={key} className="flex flex-col gap-2">
          {"href" in show && show.href ? (
            <Link
              href={show.href}
              custom
              className="group/trigger block"
              draggable={false}
            >
              {imageContent}
            </Link>
          ) : (
            imageContent
          )}
          <figcaption className="text-center text-sm font-semibold text-alveus-green-800">
            {title}
          </figcaption>
        </figure>,
      ] as const;
    });

    const slides = [
      ...(newestCollaboration
        ? [
            [
              "alveus-collaborations",
              <figure
                key="alveus-collaborations"
                className="flex flex-col gap-2"
              >
                <Link
                  href="/collaborations"
                  custom
                  className="group/trigger block"
                  draggable={false}
                >
                  <YouTubePreview
                    videoId={newestCollaboration.videoId}
                    alt={`Alveus collaboration with ${newestCollaboration.name}`}
                    className="aspect-video h-auto w-full rounded-lg shadow-sm group-hover/trigger:shadow-lg"
                    icon={false}
                  />
                </Link>
                <figcaption className="text-center text-sm font-semibold text-alveus-green-800">
                  Alveus Collaborations Series
                </figcaption>
              </figure>,
            ] as const,
          ]
        : []),
      ...showSlides,
    ];

    return Object.fromEntries(slides);
  }, []);

  const grantAmbassadorCarouselItems = useMemo(
    () =>
      Object.fromEntries(
        grantAmbassadorSlides.map((ambassador) => {
          const { name, story, species: speciesKey } = ambassadors[ambassador];
          const species = getSpecies(speciesKey);
          const images = getAmbassadorImages(ambassador);
          const image = images[0];

          return [
            ambassador,
            <figure key={ambassador} className="flex w-full flex-col gap-2">
              <Image
                src={image.src}
                alt={image.alt}
                placeholder="blur"
                className="aspect-4/3 h-auto w-full overflow-hidden rounded-xl object-cover shadow-md"
                style={{ objectPosition: image.position }}
                width={470}
                draggable={false}
              />
              <figcaption className="text-sm text-pretty text-alveus-green-800 md:px-5">
                <p className="text-base font-semibold">
                  {name}
                  {" – "}
                  <span className="font-medium text-alveus-green-600">
                    {species.name}
                  </span>
                </p>
                <p className="mt-1 text-alveus-green-700">{story}</p>
              </figcaption>
            </figure>,
          ] as const;
        }),
      ),
    [],
  );

  const grantAnimalCareStaffCarouselItems = useMemo(
    () =>
      Object.fromEntries(
        animalCareStaffEntries.map(([key, person]) => {
          const image = Array.isArray(person.image)
            ? person.image[0]
            : person.image;

          return [
            key,
            <figure key={key} className="flex flex-col gap-2">
              <Link
                href={`/about/team#${key}`}
                custom
                className="group/trigger block"
              >
                <Image
                  src={image}
                  alt={person.name}
                  width={320}
                  className="aspect-square h-auto w-full overflow-hidden rounded-2xl bg-alveus-green-100 object-cover shadow-sm transition group-hover/trigger:scale-102 group-hover/trigger:shadow-lg"
                />
              </Link>
              <figcaption className="text-center text-sm text-alveus-green-800">
                <p className="font-semibold">{person.name}</p>
                <p className="mt-0! text-xs text-balance text-alveus-green-700">
                  {person.title}
                </p>
              </figcaption>
            </figure>,
          ] as const;
        }),
      ),
    [],
  );

  return {
    stats,
    educationShowCarouselItems,
    grantAmbassadorCarouselItems,
    grantAnimalCareStaffCarouselItems,
  };
};

const GrantPriorityMedia = ({
  image,
  imageAlt,
  imageClassName,
  media,
}: {
  image?: StaticImageData;
  imageAlt?: string;
  imageClassName?: string;
  media?: ReactNode;
}) => (
  <>
    {media ??
      (image && imageAlt ? (
        <Image
          src={image}
          alt={imageAlt}
          width={470}
          className={classes(
            "h-auto max-h-64 w-full rounded-xl shadow-md sm:max-h-72 lg:max-h-none",
            imageClassName,
          )}
        />
      ) : null)}
  </>
);

const AmbassadorCarouselMedia = ({
  items,
}: {
  items: Record<string, ReactNode>;
}) => (
  <Carousel
    auto={0}
    variant="overlay"
    className="w-full"
    overlayClassName="top-0 aspect-4/3"
    wrapperClassName="min-w-0 gap-3"
    itemClassName="basis-full"
    items={items}
  />
);

const EmuEnclosureMedia = ({ dark }: { dark?: boolean } = {}) => (
  <>
    <Link
      href={emuEnclosureInstagramUrl}
      external
      custom
      className="group relative block overflow-hidden rounded-xl shadow-md transition hover:scale-102 hover:shadow-xl"
    >
      <Image
        src={emuEnclosureImage}
        alt="Emus in the Alveus emu enclosure"
        width={470}
        className="h-auto max-h-64 w-full sm:max-h-72 lg:max-h-none"
      />
      <IconInstagram
        className="absolute top-0 right-0 m-3 text-white opacity-80 drop-shadow-md"
        size={42}
      />
    </Link>
    <figcaption className="mt-2 text-center text-sm">
      <Link
        href={emuEnclosureInstagramUrl}
        external
        custom
        className={classes(
          "underline underline-offset-2 transition-colors",
          dark
            ? "text-alveus-tan decoration-alveus-tan/60 hover:decoration-alveus-tan"
            : "text-alveus-green-700 decoration-alveus-green-700/40 hover:decoration-alveus-green-700",
        )}
      >
        Emu Enclosure, Sponsored by Julien Solomita
      </Link>
    </figcaption>
  </>
);

const GrantCarouselHeading = ({
  dark,
  children,
}: {
  dark?: boolean;
  children: ReactNode;
}) => (
  <p
    className={classes(
      "mb-3 text-xs font-semibold tracking-wider uppercase",
      dark ? "text-alveus-tan/70" : "text-alveus-green-600",
    )}
  >
    {children}
  </p>
);

const EducationProgramsCarousel = ({
  dark,
  items,
}: {
  dark?: boolean;
  items: Record<string, ReactNode>;
}) => (
  <div
    className={classes(
      "w-full",
      dark &&
        "[&_figcaption]:text-alveus-tan/90 [&_figcaption_.text-alveus-green-600]:text-alveus-tan/75 [&_figcaption_.text-alveus-green-700]:text-alveus-tan/75 [&_figcaption_p]:text-alveus-tan/90",
    )}
  >
    <GrantCarouselHeading dark={dark}>Current Programs</GrantCarouselHeading>
    <Carousel
      auto={null}
      className="w-full"
      itemClassName="basis-3/5 shrink-0 snap-start p-2 sm:basis-1/2 md:basis-2/5 lg:basis-1/4"
      items={items}
    />
  </div>
);

const AnimalCareStaffCarousel = ({
  items,
}: {
  items: Record<string, ReactNode>;
}) => (
  <div className="w-full">
    <GrantCarouselHeading>Animal Care Staff</GrantCarouselHeading>
    <Carousel
      auto={0}
      className="w-full"
      itemClassName="basis-2/5 shrink-0 snap-start p-2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
      items={items}
    />
  </div>
);

const ArriPriorityContent = () => (
  <>
    <p>
      Support Alveus as we work to conduct conservation research and recovery
      programs for endangered species. ARRI will focus on three pillars,
      Repopulation, Education, and Innovation. ARRI will launch with a focus on
      breeding and reintroduction into the wild of Mexican Wolves and Red
      Wolves, and move towards supporting additional species as we continue to
      develop the program.
    </p>

    <p>
      As we begin releasing animals we will launch livestreaming cameras in the
      wild and deliver storytelling that will drive attachment to individual
      animals and their species. We will establish research programs that push
      the potential of conservation breeding programs by utilizing the live cam
      model to monitor health and behavior patterns for animals under our care.
    </p>

    <p>
      Our conservation technology lab will work to develop improved and
      cost-effective wildlife trackers, wild den cameras, and wildlife drone
      monitoring systems.
    </p>

    <p>
      Naming and other opportunities for recognition are available to recognize
      you, your company or foundation, or to honor a loved one for major
      donations to the ARRI capital campaign.
    </p>

    <p className="mt-6!">
      <Link href="/institute" className="inline-flex items-center gap-1">
        Learn more about the institute
        <IconArrowRight size={16} />
      </Link>
    </p>
  </>
);

const EducationPriorityContent = ({ dark }: { dark?: boolean }) => (
  <>
    <p>
      Help Alveus produce high quality conservation focused live streams and
      videos. Alveus is unique in that all of our educational programs are
      posted online with no admission fees.
    </p>

    <p>
      Your support will allow us to continue producing programs like the{" "}
      <Link href="/collaborations" dark={dark}>
        Alveus Collaborations Series
      </Link>
      , Conservation Conversations, Animal Care Chats, and{" "}
      <Link href="/animal-quest" dark={dark}>
        Animal Quest
      </Link>
      .
    </p>
  </>
);

const AnimalCarePriorityContent = ({
  stats,
}: {
  stats: ReturnType<typeof getGrantAmbassadorStats>;
}) => (
  <>
    <p>
      Alveus works to rescue non-releasable animals from a variety of situations
      like abuse, neglect or abandonment, the pet trade, injured and orphaned
      wildlife, and more. We currently care for{" "}
      <Link href="/ambassadors">
        {stats.ambassadorCount} non-releasable animals
      </Link>{" "}
      from {stats.speciesCount} species across{" "}
      <LinkedClassifications items={stats.classifications} />, and are working
      on several new rescues of animals in need.
    </p>

    <p>
      As the animal population at the sanctuary grows so does the cost of
      maintaining their enclosures and ensuring they are fed, enriched, and
      provided the best standard of care possible.
    </p>

    <div className="flex flex-col gap-1">
      <p className="mt-2!">Grant funds help us:</p>

      <ul className="ml-6 list-disc space-y-1">
        <li>Rescue new animals and provide ongoing sanctuary care</li>
        <li>
          Purchase food, veterinary care, and supplies to keep animals healthy
        </li>
        <li>Provide enrichment to keep animals active and fulfilled</li>
      </ul>
    </div>
  </>
);

const EnclosuresPriorityContent = ({
  dark,
  stats,
}: {
  dark?: boolean;
  stats: ReturnType<typeof getGrantAmbassadorStats>;
}) => (
  <>
    <p>
      Help Alveus build the best possible enclosures for our rescued animal
      ambassadors. Alveus is constantly working to invest in the quality of our
      enclosures, building them to meet and exceed Association of Zoos and
      Aquariums (AZA) and Global Federation of Animal Sanctuaries (GFAS)
      standards.
    </p>

    <p>
      We would love to discuss our upcoming rescues and their enclosure needs
      with your foundation or corporation. Your support of the construction,
      landscaping, or ongoing maintenance of our enclosures may come with
      opportunities for recognition for you, a loved one, or your foundation or
      company.
    </p>

    <hr className="my-4 border-alveus-green-200" />

    <p>
      We currently maintain {stats.enclosures.length} ambassador enclosures,
      including the <LinkedEnclosures dark={dark} items={stats.enclosures} />.
    </p>
  </>
);

type GrantPrioritySectionProps = {
  dark?: boolean;
  panelId: string;
  title: string;
  description: string;
  image?: StaticImageData;
  imageAlt?: string;
  imageClassName?: string;
  media?: ReactNode;
  fullWidthFooter?: ReactNode;
  children: ReactNode;
};

const GrantPrioritySection = ({
  dark = false,
  panelId,
  title,
  description,
  image,
  imageAlt,
  imageClassName,
  media,
  fullWidthFooter,
  children,
}: GrantPrioritySectionProps) => (
  <Section dark={dark} className="scroll-mt-32 py-12 lg:py-16">
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
      <figure className="order-1 mx-auto w-full max-w-xs lg:order-2 lg:col-span-1 lg:mx-0 lg:max-w-none lg:self-start">
        <GrantPriorityMedia
          image={image}
          imageAlt={imageAlt}
          imageClassName={imageClassName}
          media={media}
        />
      </figure>

      <article className="order-2 lg:order-1 lg:col-span-2">
        <Heading level={3} link id={panelId} className="my-0 scroll-mt-32">
          {title}
        </Heading>
        <p
          className={classes(
            "mt-2 text-lg",
            dark ? "text-alveus-tan/80" : "text-alveus-green-700",
          )}
        >
          {description}
        </p>

        <div
          className={classes(
            "mt-6 flex flex-col gap-4 text-lg/relaxed",
            dark ? "[&_p+p]:mt-4" : "text-alveus-green-900 [&_p+p]:mt-4",
          )}
        >
          {children}
        </div>
      </article>
    </div>

    {fullWidthFooter ? (
      <div
        className={classes(
          "mt-10 border-t pt-8 lg:mt-12",
          dark ? "border-white/15" : "border-alveus-green-300/25",
        )}
      >
        {fullWidthFooter}
      </div>
    ) : null}
  </Section>
);

const GrantsPage: NextPage = () => {
  const {
    stats,
    educationShowCarouselItems,
    grantAmbassadorCarouselItems,
    grantAnimalCareStaffCarouselItems,
  } = useGrantsCarousels();

  return (
    <>
      <Meta
        title="Foundation & Corporate Grants"
        description="Alveus Sanctuary welcomes grant-making foundations, corporations, and family foundations interested in supporting our conservation research, education programs, animal care, and enclosure development."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-8"
        containerClassName="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:gap-12"
      >
        <div className="flex flex-col gap-4 pt-4 pb-8 lg:max-w-4xl lg:py-8 xl:max-w-5xl">
          <Heading className="my-0">Foundation & Corporate Grants</Heading>
          <p className="text-lg/relaxed text-pretty">
            If you know of or are affiliated with a grant-making foundation or
            corporation, or are involved with a family foundation interested in
            supporting Alveus, please{" "}
            <Link
              href="#contact"
              custom
              dark
              className="underline decoration-alveus-tan/40 underline-offset-2 transition-colors hover:decoration-alveus-tan"
            >
              reach out
            </Link>
            !
          </p>
        </div>

        <div className="hidden gap-4 text-sm lg:grid lg:pt-8">
          <div className="rounded-lg border border-white/20 px-4 py-3">
            <p className="font-semibold tracking-wide uppercase opacity-75">
              Tax-exempt status
            </p>
            <p className="mt-1 text-lg font-bold">501(c)(3) nonprofit</p>
          </div>

          <div className="rounded-lg border border-white/20 px-4 py-3">
            <p className="font-semibold tracking-wide uppercase opacity-75">
              EIN
            </p>
            <p className="mt-1 text-lg font-bold">{grantEin}</p>
          </div>
        </div>
      </Section>

      <SubNav links={grantSectionLinks} className="z-20" />

      <Section className="relative z-0 bg-alveus-green-100 py-16 text-center text-alveus-green-900">
        <Heading id="priorities" level={2} link className="scroll-mt-32">
          Current Funding Priorities
        </Heading>

        <p className="mx-auto mt-4 max-w-2/3 text-lg text-pretty text-alveus-green-700">
          As a 501(c)(3) organization, Alveus Sanctuary has several programs and
          upcoming projects in need of funding, including our Animal Care and
          Rescue program, Conservation Education content series, and the Alveus
          Research and Recovery Institute (ARRI), which we are currently raising
          capital funds to support:
        </p>
      </Section>

      <GrantPrioritySection {...arriPanel}>
        <ArriPriorityContent />
      </GrantPrioritySection>

      <GrantPrioritySection
        dark
        {...educationPanel}
        fullWidthFooter={
          <EducationProgramsCarousel dark items={educationShowCarouselItems} />
        }
      >
        <EducationPriorityContent dark />
      </GrantPrioritySection>

      <GrantPrioritySection
        {...animalCarePanel}
        media={<AmbassadorCarouselMedia items={grantAmbassadorCarouselItems} />}
        fullWidthFooter={
          <AnimalCareStaffCarousel items={grantAnimalCareStaffCarouselItems} />
        }
      >
        <AnimalCarePriorityContent stats={stats} />
      </GrantPrioritySection>

      <GrantPrioritySection
        dark
        {...enclosuresPanel}
        media={<EmuEnclosureMedia dark />}
      >
        <EnclosuresPriorityContent dark stats={stats} />
      </GrantPrioritySection>

      <div className="relative flex grow flex-col">
        <Section
          className="relative z-0 bg-alveus-green-100 py-16 text-center text-alveus-green-900"
          containerClassName="max-w-3xl"
        >
          <Heading id="contact" level={2} link className="scroll-mt-32">
            Reach Out
          </Heading>

          <p className="mx-auto mt-4 max-w-2xl text-lg/relaxed text-balance">
            To learn more about these and other programs and projects, <br />
            please contact us at{" "}
            <Link href={`mailto:${grantContactEmail}`}>
              {grantContactEmail}
            </Link>
            .
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              href={`mailto:${grantContactEmail}`}
              filled
              className="inline-flex items-center gap-2 px-6"
            >
              <IconEnvelope className="size-5" />
              {grantContactEmail}
            </Button>

            <Button
              href="/about/annual-reports"
              className="inline-flex items-center gap-2 px-6"
            >
              <IconDocument className="size-5" />
              Annual Reports
            </Button>
          </div>

          <p className="mt-8 text-sm text-alveus-green-700">EIN: {grantEin}</p>
        </Section>

        <Transparency className="grow" />
      </div>
    </>
  );
};

export default GrantsPage;

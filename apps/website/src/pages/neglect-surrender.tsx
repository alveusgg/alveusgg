import { type NextPage } from "next";

import Accordion, { type AccordionItem } from "@/components/content/Accordion";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import SubNav from "@/components/content/SubNav";

const reportingItems: Record<string, AccordionItem> = {
  signs: {
    title: "1. Identifying Signs of Abuse & Neglect",
    description:
      "Learn what indicators point to neglect or intentional cruelty.",
    content: (
      <div className="flex flex-col gap-4 pb-4">
        <p>
          Animal cruelty falls into two main categories:{" "}
          <strong>Neglect</strong> (failure to provide care) and{" "}
          <strong>Intentional Cruelty</strong> (deliberate harm). Look for these
          indicators:
        </p>
        <ul className="ml-6 flex list-disc flex-col gap-2">
          <li>
            <strong>Physical Condition:</strong> Extreme thinness (skeleton
            structure visible), open wounds, limping, matted fur, or untreated
            skin conditions.
          </li>
          <li>
            <strong>Living Conditions:</strong> Lack of adequate care,
            specifically food, water, and confinement in unsanitary
            environments. This includes animals kept on short chains or left in
            hot cars.
          </li>
          <li>
            <strong>Pet Stores (Red Flags):</strong> Lethargic animals,
            discharge from eyes/nose, feces in water bowls, or animals housed
            with sick cage-mates.
          </li>
        </ul>
      </div>
    ),
  },
  whereToReport: {
    title: "2. Where to Report (By Region)",
    description:
      "Find the appropriate authorities and organizations to contact.",
    content: (
      <div className="flex flex-col gap-4 pb-4">
        <Heading level={4} className="my-0 text-xl">
          United States
        </Heading>
        <ul className="ml-6 flex list-disc flex-col gap-2">
          <li>
            <strong>Emergencies:</strong> Call 911 if you witness a violent act
            in progress.
          </li>
          <li>
            <strong>Local Law Enforcement:</strong> Contact your Police
            Department or County Sheriff; they are the primary investigators for
            animal felony laws. The{" "}
            <Link
              href="https://nationallinkcoalition.org/how-do-i-report-suspected-abuse"
              external
            >
              National Link Coalition
            </Link>{" "}
            provides specific contacts for most counties. You can also explore
            local ordinances via{" "}
            <Link href="https://library.municode.com/" external>
              Municode
            </Link>{" "}
            (recommended by the Animal Legal Defense Fund).
          </li>
          <li>
            <strong>Animal Control:</strong> For neglect (no food/water) or
            abandoned animals, contact your local animal control office.
          </li>
          <li>
            <strong>Pet Stores & Commercial Facilities:</strong> Report
            large-scale breeders or exotic animal issues to the{" "}
            <Link
              href="https://www.aphis.usda.gov/awa/regulatory-enforcement/complaint"
              external
            >
              USDA APHIS
            </Link>
            . For sick animals purchased at retail, contact your state&apos;s
            Attorney General or the Better Business Bureau (BBB) and file a
            consumer complaint.
          </li>
          <li>
            <strong>Wildlife Crime:</strong> If you suspect a wildlife crime,
            you can use the{" "}
            <Link href="https://www.fws.gov/wildlife-crime-tips" external>
              US Fish & Wildlife reporting form
            </Link>
            .
          </li>
        </ul>

        <Heading level={4} className="my-0 mt-4 text-xl">
          Canada
        </Heading>
        <ul className="ml-6 flex list-disc flex-col gap-2">
          <li>
            <strong>Provincial Agencies:</strong> Contact dedicated welfare
            services like Ontario PAWS or the BC SPCA, which have the legal
            authority to inspect properties and seize animals in distress.
          </li>
          <li>
            <strong>RCMP or Local Police:</strong> In areas without specialized
            welfare inspectors, the Royal Canadian Mounted Police (RCMP) or
            local municipal police are the primary authorities under the
            Criminal Code of Canada.
          </li>
          <li>
            <strong>Cruelty Legislation:</strong> Reports are often filed under
            the Criminal Code of Canada (federal) or specific Provincial Animal
            Welfare Acts.
          </li>
        </ul>

        <Heading level={4} className="my-0 mt-4 text-xl">
          Global (Rest of World)
        </Heading>
        <ul className="ml-6 flex list-disc flex-col gap-2">
          <li>
            <strong>Identify the National NGO:</strong> In many countries, the
            national SPCA or Humane Society acts as the primary investigator.{" "}
            <Link
              href="https://www.humaneworld.org/en/report-animal-cruelty-contact-form"
              external
            >
              Humane World for Animals
            </Link>{" "}
            also provides an international reporting form.
          </li>
          <li>
            <strong>Local Authorities:</strong> Regardless of specific animal
            laws, physical abuse is often tied to community safety. Local police
            remain the safest first point of contact.
          </li>
          <li>
            <strong>International Advocacy:</strong> If local authorities are
            unresponsive, organizations like World Animal Protection, Four Paws,
            or PETA International may provide resources or contacts for regional
            advocates.
          </li>
        </ul>
      </div>
    ),
  },
  effectiveReport: {
    title: "3. How to Build an Effective Report",
    description: "Ensure your report is factual, detailed, and actionable.",
    content: (
      <div className="flex flex-col gap-4 pb-4">
        <p>
          When contacting authorities, provide as much factual detail as
          possible:
        </p>
        <ol className="ml-6 flex list-decimal flex-col gap-2">
          <li>
            <strong>Exact Location:</strong> A specific address, GPS
            coordinates, or landmarks.
          </li>
          <li>
            <strong>Detailed Observations:</strong> Dates, times, and a
            description of the animal&apos;s condition.
          </li>
          <li>
            <strong>Visual Evidence:</strong> Photos or videos are powerful.{" "}
            <em>Only take photos from public property.</em> Never enter private
            property or attempt to &quot;liberate&quot; an animal yourself, as
            this can result in trespassing charges and make your evidence
            inadmissible in court.
          </li>
          <li>
            <strong>Case Number:</strong> Always ask for an incident or case
            number when you call so you can follow up on the status of the
            investigation.
          </li>
        </ol>
      </div>
    ),
  },
};

const surrenderItems: Record<string, AccordionItem> = {
  rehome: {
    title: "If You Need to Rehome an Animal Held as a Pet",
    description:
      "Protocols to ensure the animal's safety and legal protection.",
    content: (
      <div className="flex flex-col gap-4 pb-4">
        <ul className="ml-6 flex list-disc flex-col gap-2">
          <li>
            <strong>Exhaust All Options:</strong> Contact local rescues for food
            assistance or behavioral training before deciding to surrender.
          </li>
          <li>
            <strong>Rehome Privately:</strong> You are your pet&apos;s best
            advocate. Use verified platforms local to your state or country to
            find a new family directly.
          </li>
          <li>
            <strong>Schedule an Appointment:</strong> Most sanctuaries and
            shelters in the US, Canada, and Europe require a scheduled intake
            and a surrender fee.
          </li>
          <li>
            <strong>Contact Species-Specific Rescues:</strong> Use directories
            like the{" "}
            <Link
              href="https://sanctuaryfederation.org/find-a-sanctuary/"
              external
            >
              Global Federation of Animal Sanctuaries (GFAS)
            </Link>{" "}
            to find accredited, ethical rescues that specialize in your
            animal&apos;s species.
          </li>
          <li>
            <strong>Never Release:</strong> Never release a captive or domestic
            animal into the wild. They may not be able to survive on their own
            and can face risks such as hunger, dehydration, predation, injury,
            or vehicle strikes. Released animals may also contribute to invasive
            species issues that harm native wildlife and local ecosystems.
          </li>
          <li>
            <strong>Never Abandon:</strong> Leaving an animal at a gate or in a
            public space is illegal and life-threatening for the animal.
          </li>
        </ul>
      </div>
    ),
  },
  stray: {
    title: "If You Find a Stray Pet",
    description: "Steps to safely handle and report a lost companion animal.",
    content: (
      <div className="flex flex-col gap-4 pb-4">
        <ul className="ml-6 flex list-disc flex-col gap-2">
          <li>
            <strong>Scan for a Microchip:</strong> Take the animal to any local
            vet or shelter; they will scan for an owner&apos;s contact info for
            free.
          </li>
          <li>
            <strong>File a Report:</strong> Notify your local Animal Control or
            municipal shelter. This is a legal requirement in most regions and
            the best way to reunite a lost pet with its family.
          </li>
          <li>
            <strong>Post Locally:</strong> Post in local community groups on
            Facebook, WhatsApp, etc., to alert neighbors in the area where the
            animal was found.
          </li>
        </ul>
      </div>
    ),
  },
};

const NeglectSurrenderPage: NextPage = () => {
  const navLinks = [
    { name: "Reporting Cruelty", href: "#reporting" },
    { name: "Surrendering a Pet", href: "#surrendering" },
    { name: "Found a Wild Animal?", href: "#wildlife" },
  ];

  return (
    <>
      <Meta
        title="Neglect, Cruelty & Surrender Guide"
        description="Thank you for caring about animals! We provide guidance on how to report cruelty or rehome a pet."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-8"
        containerClassName="flex flex-wrap items-center justify-between"
      >
        <div className="flex basis-full flex-col gap-4 pt-4 pb-16 xl:basis-1/2 xl:py-24">
          <Heading className="my-0">
            Thank you for caring about animals!
          </Heading>

          <p className="text-lg">
            Because we are an educational sanctuary, we cannot take in public
            drop-offs, injured wildlife, or purchase animals from pet stores.
            Please select your situation below for guidance on the best
            protocols to help an animal in need.
          </p>
        </div>
      </Section>

      <SubNav links={navLinks} className="z-20" />

      <Section>
        <Heading id="reporting" level={2} link>
          Reporting Animal Cruelty, Neglect, and Pet Store Concerns
        </Heading>

        <div className="mt-4 mb-6 text-alveus-green-600">
          <p>
            If you suspect an animal is being mistreated, your prompt action can
            be life-saving. Because laws and authorities vary by location, this
            guide is organized to help you reach the right people quickly.
          </p>
        </div>

        <Accordion items={reportingItems} />
      </Section>

      <Section>
        <Heading id="surrendering" level={2} link>
          Surrendering or Finding a Pet
        </Heading>

        <div className="mt-4 mb-6">
          <p>
            If you can no longer care for a pet or have found a stray one,
            please follow these professional protocols to ensure the
            animal&apos;s safety and legal protection.
          </p>
        </div>

        <Accordion items={surrenderItems} />
      </Section>

      <div className="relative flex grow flex-col">
        <Section className="flex grow flex-col items-start justify-center py-16 text-left">
          <Heading id="wildlife" level={2} className="mt-0">
            Did You Find an Injured or Orphaned Wild Animal?
          </Heading>

          <p className="mt-2 mb-6 text-lg">
            If you found native wildlife that might need assistance, check out
            our dedicated guide.
          </p>

          <Button href="/found-animal">
            Click here for our Wildlife Guide
          </Button>
        </Section>
      </div>
    </>
  );
};

export default NeglectSurrenderPage;

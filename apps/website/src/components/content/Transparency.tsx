import Image from "next/image";

import { classes } from "@/utils/classes";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Section from "@/components/content/Section";

import imageCharityNavigatorBadge from "@/assets/charity-navigator-badge.svg";

type TransparencyProps = {
  className?: string;
};

const Transparency = ({ className }: TransparencyProps) => (
  <Section
    dark
    className={classes("bg-alveus-green-900", className)}
    containerClassName="space-y-4"
  >
    <div className="flex flex-col gap-4 md:flex-row-reverse md:items-center md:gap-10">
      <div>
        <Heading id="transparency" level={2} link>
          Platinum rated transparency
        </Heading>

        <p>
          Alveus&apos; transparency has been rated platinum on Candid
          (GuideStar). Candid is a leading source of information on non-profit
          organizations, helping donors and funders make informed decisions
          about their support. Check out our{" "}
          <Link
            href="https://www.guidestar.org/profile/shared/520ab07a-b688-42a0-b9ec-417861b54b13"
            external
            dark
          >
            non-profit profile on Candid
          </Link>
          .
        </p>
      </div>

      <Link
        className="shrink-0"
        external
        custom
        href="https://www.guidestar.org/profile/shared/520ab07a-b688-42a0-b9ec-417861b54b13"
      >
        <Image
          className="size-40"
          src="https://widgets.guidestar.org/prod/v1/pdp/transparency-seal/10965548/svg"
          width={200}
          height={200}
          alt="Platinum Transparency Seal by Candid"
        />
      </Link>
    </div>

    <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-10">
      <div>
        <Heading level={2}>Three-star charity rating</Heading>

        <p>
          Alveus has also attained a three-star rating from Charity Navigator, a
          powerful trust indicator recognizing our commitment to accountability
          and transparency. Charity Navigator is America&apos;s largest and
          most-utilized independent charity evaluator, an unbiased and trusted
          source of information for more than 11 million donors annually.
          Explore our{" "}
          <Link
            href="https://www.charitynavigator.org/ein/861772907"
            external
            dark
          >
            Charity Navigator profile
          </Link>
          .
        </p>
      </div>

      <Link
        className="shrink-0"
        external
        custom
        href="https://www.charitynavigator.org/ein/861772907"
      >
        <Image
          className="size-40"
          src={imageCharityNavigatorBadge}
          width={200}
          height={200}
          alt="Three-Star Charity Rating Badge by Charity Navigator"
        />
      </Link>
    </div>
  </Section>
);

export default Transparency;

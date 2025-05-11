import { type NextPage } from "next";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

import IconArrowRight from "@/icons/IconArrowRight";

const CustomLink = ({
  children,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "custom">) => (
  <Link
    {...props}
    custom
    className="text-alveus-green hover:text-alveus-green-900 hover:underline transition-colors group text-shadow-sm py-1 text-lg"
  >
    {children}
    <IconArrowRight className="inline-block size-4 opacity-0 -ml-4 mr-8 group-hover:ml-1 group-hover:mr-3 group-hover:opacity-100 transition-[margin,opacity] drop-shadow-sm" />
  </Link>
);

const NotFound: NextPage = () => {
  return (
    <>
      <Meta
        title="404 - Page Not Found"
        description="The page you are looking could not be found."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark className="py-8">
        <Heading className="text-center">404 - Page Not Found</Heading>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="grow">
        <Heading level={-1} className="mt-0">
          Oops!
        </Heading>

        <p className="mb-6 text-lg text-balance">
          Sorry, the page you are looking for does not exist. It may have been
          removed, or you may have mistyped the URL.
        </p>

        <p className="mb-2 text-sm text-balance text-alveus-green">
          Here are some links to help you find what you&apos;re looking for:
        </p>

        <ul className="flex max-md:flex-col flex-wrap">
          <li>
            <CustomLink href="/">Home</CustomLink>
          </li>
          <li>
            <CustomLink href="/live">Watch Live Cams</CustomLink>
          </li>
          <li>
            <CustomLink href="/ambassadors">Meet our Ambassadors</CustomLink>
          </li>
          <li>
            <CustomLink href="/animal-quest">Watch Animal Quest</CustomLink>
          </li>
          <li>
            <CustomLink href="/updates">Check the Schedule</CustomLink>
          </li>
          <li>
            <CustomLink href="/donate">Donate to Alveus</CustomLink>
          </li>
          <li>
            <CustomLink href="/about/alveus">About Alveus</CustomLink>
          </li>
        </ul>
      </Section>
    </>
  );
};

export default NotFound;

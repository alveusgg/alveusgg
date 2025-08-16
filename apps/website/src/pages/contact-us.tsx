import { type NextPage } from "next";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

const ContactUsPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Contact Us"
        description="Contact us for any questions or concerns you may have. We are not openly hiring."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section
        className="flex min-h-[85vh] grow"
        containerClassName="flex flex-col items-center text-center text-alveus-green"
      >
        <div className="my-auto flex flex-col items-center">
          <Heading className="text-6xl">Contact Us</Heading>
          <p className="my-3 text-xl font-semibold">
            We are not openly hiring.
          </p>

          <div className="my-6 grid grid-cols-1 justify-center gap-6 lg:my-12 lg:grid-cols-2">
            <p className="text-xl font-semibold">
              For donor inquiries: <br />
              <Link href="mailto:contact@alveussanctuary.org">
                contact@alveussanctuary.org
              </Link>
            </p>

            <p className="text-xl font-semibold">
              For business inquiries: <br />
              <Link href="mailto:alveus@loaded.gg">alveus@loaded.gg</Link>
            </p>

            <p className="text-xl font-semibold">
              For merch inquiries: <br />
              <Link
                href="https://shop.alveussanctuary.org/pages/contact"
                external
              >
                shop.alveussanctuary.org/pages/contact
              </Link>
            </p>

            <p className="text-xl font-semibold">
              For plushie inquiries: <br />
              <Link href="https://youtooz.com/pages/contact-us" external>
                youtooz.com/pages/contact-us
              </Link>
            </p>
          </div>

          <ul className="my-3 flex flex-wrap gap-4">
            <li>
              <Button href="/donate" className="px-6 text-xl">
                Donate
              </Button>
            </li>
            <li>
              <Button href="/po-box" className="px-6 text-xl">
                PO Box
              </Button>
            </li>
          </ul>
        </div>

        <div className="mt-6 text-sm">
          <p>
            For issues with the website or Twitch extension, please open an
            issue on GitHub:{" "}
            <Link
              href="https://github.com/alveusgg/alveusgg/issues/new/choose"
              external
            >
              Website
            </Link>{" "}
            or{" "}
            <Link
              href="https://github.com/alveusgg/extension/issues/new/choose"
              external
            >
              Twitch Extension
            </Link>
          </p>

          <p>
            If you discover a security vulnerability within the website, or any
            of our other open-source projects, please email us:{" "}
            <Link href="mailto:opensource@alveussanctuary.org">
              opensource@alveussanctuary.org
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
};

export default ContactUsPage;

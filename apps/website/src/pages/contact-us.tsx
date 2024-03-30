import { type NextPage } from "next";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Link from "@/components/content/Link";
import Button from "@/components/content/Button";

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
        className="flex min-h-[85vh] flex-grow"
        containerClassName="flex flex-col items-center text-center text-alveus-green"
      >
        <div className="my-auto flex flex-col items-center">
          <Heading className="text-6xl">Contact Us</Heading>
          <p className="my-3 text-xl font-semibold">
            We are not openly hiring.
          </p>

          <p className="my-3 text-xl font-semibold">
            For business inquiries: <br />
            <Link href="mailto:TeamAlveus@unitedtalent.com">
              TeamAlveus@unitedtalent.com
            </Link>
          </p>

          <div className="flex flex-wrap justify-center gap-x-6">
            <p className="my-3 text-xl font-semibold">
              For merch inquiries: <br />
              <Link
                href="https://shop.alveussanctuary.org/pages/contact"
                external
              >
                shop.alveussanctuary.org/pages/contact
              </Link>
            </p>

            <p className="my-3 text-xl font-semibold">
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
            If you discover a security vulnerability within the website or
            Twitch extension, please email us:{" "}
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

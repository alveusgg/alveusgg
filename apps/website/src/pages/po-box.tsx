import type { NextPage } from "next";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

const POBoxPage: NextPage = () => {
  return (
    <>
      <Meta
        title="PO Box"
        description="Want to send something to Alveus, perhaps a gift to support the ambassadors? Here's our PO Box."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section
        className="flex min-h-[85vh] flex-grow"
        containerClassName="flex flex-col items-center text-center text-alveus-green"
      >
        <div className="my-auto flex flex-col items-center">
          <Heading className="text-6xl">PO Box</Heading>

          <p className="my-3 text-xl font-semibold">
            Alveus Sanctuary
            <br />
            500 E Whitestone Blvd #2350
            <br />
            Cedar Park, TX 78613
          </p>

          <p>Use our PO Box to send things to Alveus.</p>
          <p>Perhaps a gift to support the ambassadors?</p>

          <p className="my-3 text-xl font-semibold">
            Please do not send anything to this address that is not intended for
            Alveus.
          </p>

          <ul className="my-3 flex flex-wrap gap-4">
            <li>
              <Button href="/donate" className="px-6 text-xl">
                Donate
              </Button>
            </li>
            <li>
              <Button href="/wishlist" external className="px-6 text-xl">
                Wishlist
              </Button>
            </li>
          </ul>
        </div>

        <div className="mt-6 text-sm">
          <p>
            Need to get in touch with Alveus for other reasons?{" "}
            <Link href="/contact-us">Contact Us</Link>
          </p>
        </div>
      </Section>
    </>
  );
};

export default POBoxPage;

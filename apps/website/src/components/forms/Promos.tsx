import Link from "next/link";

import Heading from "@/components/content/Heading";

export const Promos = () => (
  <div className="-mx-8 flex flex-wrap">
    <div className="flex basis-full flex-col items-start gap-4 px-8 md:basis-1/2">
      <Heading level={2} className="my-0">
        New Merch Available!
      </Heading>

      <p>
        Grab yourself a high-quality t-shirt or hoodie to support Alveus, or a
        plushie of your favorite ambassador! All proceeds go directly into
        Alveus and the support & care of our educational ambassadors.
      </p>

      <Link
        className="mt-auto inline-block rounded-full border-2 border-alveus-tan px-4 py-2 text-lg transition-colors hover:bg-alveus-tan hover:text-alveus-green"
        href="/merch-store"
      >
        Merch Store
      </Link>
    </div>

    <div className="flex basis-full flex-col items-start gap-4 px-8 md:basis-1/2">
      <Heading level={2} className="my-0">
        Get Alveus Notifications!
      </Heading>

      <p>
        Enable push notifications for Alveus streams, events, and more, directly
        to your PC or phone! Never miss a moment at Alveus again, or catch up on
        what you missed.
      </p>

      <Link
        className="mt-auto inline-block rounded-full border-2 border-alveus-tan px-4 py-2 text-lg transition-colors hover:bg-alveus-tan hover:text-alveus-green"
        href="/updates"
      >
        Latest Updates
      </Link>
    </div>
  </div>
);

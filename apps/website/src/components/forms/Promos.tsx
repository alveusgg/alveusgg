import Link from "next/link";

import Heading from "@/components/content/Heading";

export const Promos = () => (
  <div className="flex flex-col flex-wrap gap-12 md:flex-row">
    <div className="flex flex-1 flex-col items-start gap-4">
      <Heading level={2} className="my-0">
        Plushies are available!
      </Heading>

      <p>
        Grab yourself a plushie of your favorite ambassador! All proceeds go
        directly into Alveus and the support & care of our educational
        ambassadors.
      </p>

      <div className="flex flex-wrap gap-4">
        {/*
        <Link
          className="mt-auto inline-block rounded-full border-2 border-alveus-tan px-4 py-2 text-lg transition-colors hover:bg-alveus-tan hover:text-alveus-green"
          href="/merch"
          target="_blank"
          rel="noreferrer"
        >
          Merch Store
        </Link>
        */}

        <Link
          className="mt-auto inline-block rounded-full border-2 border-alveus-tan px-4 py-2 text-lg transition-colors hover:bg-alveus-tan hover:text-alveus-green"
          href="/plushies"
          target="_blank"
          rel="noreferrer"
        >
          Plushies
        </Link>
      </div>
    </div>

    <div className="flex flex-1 flex-col items-start gap-4">
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

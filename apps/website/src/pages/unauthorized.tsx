import type { NextPage } from "next";

import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

const UserUnauthorizedPage: NextPage = () => {
  return (
    <>
      <Meta title="Unauthorized" noindex />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section className="flex-grow">
        <Heading className="my-3 text-3xl text-red-500">Unauthorized</Heading>
        <p className="my-3 text-xl">
          You are not authorized to view this page!
        </p>
      </Section>
    </>
  );
};

export default UserUnauthorizedPage;

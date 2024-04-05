import type { NextPage } from "next";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";

const UserUnauthorizedPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Unauthorized"
        description="You are not authorized to view this page."
      />

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

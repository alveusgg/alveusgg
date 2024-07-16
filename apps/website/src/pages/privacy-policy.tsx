import type { NextPage } from "next";

import privacyPolicy from "@/data/privacy-policy.md";

import Markdown from "@/components/content/Markdown";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

const PrivacyPolicyPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Privacy Policy"
        description="At Alveus Sanctuary Inc., one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Alveus Sanctuary Inc. and how we use it."
        noindex
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <Markdown content={privacyPolicy} />
      </Section>
    </>
  );
};

export default PrivacyPolicyPage;

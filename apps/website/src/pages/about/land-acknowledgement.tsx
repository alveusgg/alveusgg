import { type NextPage } from "next";

import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

const AboutLandAcknowledgementPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Land Acknowledgement"
        description="Alveus Sanctuary acknowledges and respects the traditional and ancestral lands of the Tonkawa, Comanche, Lipan Apache, and other Indigenous communities, recognizing their deep connection to this land and its preservation."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark className="py-8">
        <Heading className="text-center">Land Acknowledgement</Heading>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section
        className="grow"
        containerClassName="space-y-4 text-lg max-w-screen-lg"
      >
        <p>
          We acknowledge that Alveus Sanctuary is situated on the traditional
          and ancestral lands of the Tonkawa, Comanche, Lipan Apache, and other
          Indigenous peoples who have lived on and cared for this land for
          generations.
        </p>

        <p>
          We recognize that treaties intended to protect Indigenous territories
          were often violated, leading to the displacement and profound
          hardships of these communities. We honor the diverse cultures,
          histories, and ongoing contributions of Indigenous peoples in this
          region and beyond.
        </p>

        <p>
          As we continue our commitment for caring for animals and the
          environment, we encourage others to deepen their understanding of this
          land and the histories that shaped it.
        </p>
      </Section>
    </>
  );
};

export default AboutLandAcknowledgementPage;

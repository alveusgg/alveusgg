import Head from "next/head";
import { type InferGetStaticPropsType, type NextPage } from "next";
import React from "react";

import { notEmpty } from "../utils/helpers";
import { type Cam, getAllData } from "../utils/data";
import DefaultPageLayout from "../components/DefaultPageLayout";
import { Headline } from "../components/shared/Headline";
import { AmbassadorCard } from "../components/about/AmbassadorCard";
import { Map } from "../components/about/Map";

export type AboutPageProps = InferGetStaticPropsType<typeof getStaticProps>;

export async function getStaticProps() {
  return {
    props: { ...(await getAllData()) },
  };
}

function Cam({ cam }: { cam: Cam }) {
  return (
    <article className="relative h-[200px] w-[200px] max-w-full flex-shrink-0 overflow-hidden rounded-xl bg-alveus-green shadow-xl">
      <div className="absolute inset-0 z-10 flex flex-col overflow-auto px-6 py-4 text-white">
        <h3 className="text-bold mb-3 font-serif text-lg">{cam.command}</h3>
      </div>
    </article>
  );
}

const AboutPage: NextPage<AboutPageProps> = ({
  ambassadors,
  cams,
  facilities,
  enclosures,
  mapData,
}) => {
  return (
    <>
      <Head>
        <title>About Alveus | Alveus.gg</title>
      </Head>

      <DefaultPageLayout title="About Alveus">
        <Headline>Map of Alveus</Headline>
        <Map
          ambassadors={ambassadors}
          facilities={facilities}
          enclosures={enclosures}
          mapData={mapData}
        />

        <Headline>
          Ambassadors{" "}
          <a
            className="ml-5 font-sans text-base font-normal uppercase opacity-60"
            href="https://www.alveussanctuary.org/ambassadors/"
          >
            See all
          </a>
        </Headline>

        <div className="-mx-4 overflow-x-auto overflow-y-hidden p-4">
          <section className="flex w-full gap-5">
            {ambassadors &&
              Object.keys(ambassadors)
                .filter(notEmpty)
                .map((name) => {
                  const data = ambassadors[name];
                  return (
                    data && <AmbassadorCard key={name} ambassador={data} />
                  );
                })}

            <div className="block w-5">&nbsp;</div>
          </section>
        </div>

        <Headline>Live cams</Headline>
        <div className="-mx-4 overflow-x-auto overflow-y-hidden p-4">
          <section className="flex w-full gap-5">
            {cams &&
              Object.keys(cams)
                .filter(notEmpty)
                .map((name) => {
                  const data = cams[name];
                  return data && <Cam key={name} cam={data} />;
                })}

            <div className="block w-5">&nbsp;</div>
          </section>
        </div>
      </DefaultPageLayout>
    </>
  );
};

export default AboutPage;

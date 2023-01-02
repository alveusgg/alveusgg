import Head from "next/head";
import { type InferGetStaticPropsType, type NextPage } from "next";
import React, { useReducer } from "react";

import { getAllData } from "../utils/data";
import DefaultPageLayout from "../components/DefaultPageLayout";
import { Headline } from "../components/shared/Headline";
import { Map } from "../components/about/Map";
import { Ambassadors } from "../components/about/Ambassadors";
import { InfoDetails } from "../components/about/InfoDetails";
import { Enclosures } from "../components/about/Enclosures";
import { Facilities } from "../components/about/Facilities";

export type AboutPageProps = InferGetStaticPropsType<typeof getStaticProps>;

export async function getStaticProps() {
  return {
    props: { ...(await getAllData()) },
  };
}

type SelectionState = {
  selection?: {
    type: "ambassador" | "enclosure" | "facility";
    name: string;
  };
};

type SelectAction = {
  type: "select";
  payload: SelectionState["selection"];
};

export type SelectionAction = SelectAction;

const reducer = (state: SelectionState, action: SelectionAction) => {
  switch (action.type) {
    case "select":
      return {
        ...state,
        selection: action.payload,
      };
  }

  return state;
};

const AboutPage: NextPage<AboutPageProps> = ({
  ambassadors,
  facilities,
  enclosures,
  mapData,
}) => {
  const [selectionState, dispatchSelection] = useReducer(reducer, {});
  const selectedAmbassador =
    (selectionState.selection?.type === "ambassador" &&
      ambassadors[selectionState.selection.name]) ||
    null;

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
          dispatchSelection={dispatchSelection}
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

        <div className="-mx-4 overflow-x-auto overflow-y-hidden">
          <section className="flex w-full gap-5">
            <Ambassadors
              ambassadors={ambassadors}
              setSelectedAmbassadorName={(name: string | null) =>
                dispatchSelection({
                  type: "select",
                  payload: name ? { type: "ambassador", name } : undefined,
                })
              }
            />
          </section>
        </div>

        <div className="-mx-4 overflow-hidden px-4 md:flex md:flex-row md:gap-10">
          <div className="md:w-[calc(50%-2rem)]">
            <Headline>Enclosures</Headline>

            <div className="-mx-4 overflow-x-auto overflow-y-hidden">
              <section className="flex w-full gap-5">
                <Enclosures
                  enclosures={enclosures}
                  setSelectedEnclosureName={(name: string | null) =>
                    dispatchSelection({
                      type: "select",
                      payload: name ? { type: "enclosure", name } : undefined,
                    })
                  }
                />
              </section>
            </div>
          </div>
          <div className="border-black/20 pl-10 md:w-[calc(50%-2rem)] md:border-l">
            <Headline>Facilities</Headline>

            <div className="-mx-4 overflow-x-auto overflow-y-hidden">
              <section className="flex w-full gap-5">
                <Facilities
                  facilities={facilities}
                  setSelectedFacilityName={(name: string | null) =>
                    dispatchSelection({
                      type: "select",
                      payload: name ? { type: "facility", name } : undefined,
                    })
                  }
                />
              </section>
            </div>
          </div>
        </div>
      </DefaultPageLayout>

      <InfoDetails
        ambassador={selectedAmbassador}
        requestClose={() =>
          dispatchSelection({ type: "select", payload: undefined })
        }
      />
    </>
  );
};

export default AboutPage;

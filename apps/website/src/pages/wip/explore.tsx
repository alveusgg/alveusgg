import Head from "next/head";
import { type InferGetStaticPropsType, type NextPage } from "next";
import React, { useReducer } from "react";

import { getAllData } from "../../utils/data";
import DefaultPageLayout from "../../components/DefaultPageLayout";
import { Headline } from "../../components/shared/Headline";
import { Map } from "../../components/explore/Map";
import { Ambassadors } from "../../components/explore/Ambassadors";
import { InfoDetails } from "../../components/explore/InfoDetails";
import { Enclosures } from "../../components/explore/Enclosures";
import { Facilities } from "../../components/explore/Facilities";
import { LinkBox } from "../../components/shared/LinkBox";

export type AboutPageProps = InferGetStaticPropsType<typeof getStaticProps>;

export async function getStaticProps() {
  return {
    props: { ...(await getAllData()) },
  };
}

export type SelectionState = {
  selection?:
    | {
        type: "ambassador" | "enclosure" | "facility";
        name: string;
      }
    | { type: "ambassadors"; names: Array<string> };
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

  return (
    <>
      <Head>
        <title>Explore Alveus | Alveus.gg</title>
      </Head>

      <DefaultPageLayout title="Explore Alveus">
        <Headline>Map of Alveus</Headline>
        <Map
          ambassadors={ambassadors}
          facilities={facilities}
          enclosures={enclosures}
          mapData={mapData}
          selectionState={selectionState}
          dispatchSelection={dispatchSelection}
        />

        <Ambassadors
          ambassadors={ambassadors}
          setSelectedAmbassadorName={(name: string | null) =>
            dispatchSelection({
              type: "select",
              payload: name ? { type: "ambassador", name } : undefined,
            })
          }
        />

        <div className="-mx-4 overflow-hidden px-4 md:flex md:flex-row md:gap-10">
          <div className="md:w-[calc(50%-2rem)]">
            <Headline>Enclosures</Headline>

            <div className="-mx-4 -mt-2 overflow-x-auto overflow-y-hidden">
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
          <div className="md:w-[calc(50%-2rem)] md:border-l md:border-black/20 md:pl-10">
            <Headline>Facilities</Headline>

            <div className="-mx-4 -mt-2 overflow-x-auto overflow-y-hidden">
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

        <Headline>Learn more</Headline>

        <LinkBox>
          <LinkBox.Link href="https://www.alveussanctuary.org/about-alveus/">
            About Alveus
          </LinkBox.Link>
          <LinkBox.Link href="https://www.alveussanctuary.org/about-maya/">
            About Maya Higa
          </LinkBox.Link>
          <LinkBox.Link href="https://www.alveussanctuary.org/advisory-board/">
            Advisory Board
          </LinkBox.Link>
          <LinkBox.Link href="https://www.alveussanctuary.org/board-of-directors/">
            Board of Directors
          </LinkBox.Link>
          <LinkBox.Link href="https://www.alveussanctuary.org/staff/">
            Staff
          </LinkBox.Link>
          <LinkBox.Link href="https://www.alveussanctuary.org/alveus-annual-report/">
            Annual Reports
          </LinkBox.Link>
        </LinkBox>

        <div className="mb-24"></div>
      </DefaultPageLayout>

      <InfoDetails
        ambassadors={ambassadors}
        facilities={facilities}
        enclosures={enclosures}
        selection={selectionState}
        dispatchSelection={dispatchSelection}
      />
    </>
  );
};

export default AboutPage;

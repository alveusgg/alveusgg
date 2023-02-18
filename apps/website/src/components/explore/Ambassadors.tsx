import React, { useState } from "react";

import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

import { notEmpty } from "../../utils/helpers";
import type {
  Ambassador,
  Ambassadors as AmbassadorsData,
} from "../../server/utils/data";

import { CardSwiper } from "../shared/CardSwiper";
import { Headline } from "../shared/Headline";
import { AmbassadorCard } from "./AmbassadorCard";

export const Ambassadors: React.FC<{
  ambassadors: AmbassadorsData;
  setSelectedAmbassadorName: (name: string) => void;
}> = ({ ambassadors, setSelectedAmbassadorName }) => {
  const [filter, setFilter] = useState("");
  let names = Object.keys(ambassadors).filter(notEmpty);

  if (!ambassadors) {
    return null;
  }

  if (filter.length) {
    const searchTerm = filter.toLowerCase().trim();

    names = names.filter((name) => {
      const data = ambassadors[name];
      if (!data) {
        return false;
      }
      const textValueKeys: Array<keyof Ambassador> = [
        "name",
        "species",
        "scientificName",
        "sex",
        "enclosure",
        "facility",
        "story",
        "conservationMission",
        "iucnStatus",
      ];
      for (const key of textValueKeys) {
        const value = data[key];
        if (
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm)
        ) {
          return true;
        }
      }
      return false;
    });
  }

  return (
    <>
      <div className="flex flex-col items-baseline gap-3 md:flex-row">
        <Headline>Ambassadors</Headline>
        <form className="relative -top-2 md:-bottom-1 md:top-auto">
          <label className="flex items-center gap-2 rounded-lg border border-gray-500 bg-white px-1">
            <MagnifyingGlassIcon className="h-6 w-6" />
            <span className="sr-only">Search term</span>
            <input
              className="bg-white p-0.5"
              name="search"
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.currentTarget.value)}
            />
          </label>
        </form>
      </div>

      <div className="-mx-4 -mt-2 overflow-x-auto overflow-y-hidden">
        <section className="flex w-full gap-5">
          {!names.length && <p className="py-2 px-5">No ambassadors found!</p>}
          <CardSwiper
            className="px-4"
            slideClasses="h-full w-[160px] lg:w-[200px] py-4"
            cards={names.map((name) => {
              const data = ambassadors[name];
              return (
                data && (
                  <AmbassadorCard
                    key={name}
                    ambassador={data}
                    onClick={(e: React.MouseEvent) => {
                      if (e.metaKey || e.shiftKey) {
                        return;
                      }
                      e.preventDefault();
                      setSelectedAmbassadorName(name);
                    }}
                  />
                )
              );
            })}
          />
        </section>
      </div>
    </>
  );
};

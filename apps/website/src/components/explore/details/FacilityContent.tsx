import React from "react";
import Image from "next/image";

import type { Facility } from "../../../server/utils/data";
import { DefinitionItem } from "./DefinitionItem";

export const FacilityContent: React.FC<{
  facility: Facility;
}> = ({ facility }) => {
  return (
    <div className="h-full overflow-y-auto bg-white p-8">
      <div className="space-y-6 pb-16">
        <div>
          {facility.images?.[0] && (
            <div className="block w-full overflow-hidden rounded-lg">
              <Image
                width={800}
                height={400}
                src={facility.images[0].url}
                alt={facility.images[0].alt || ""}
                className="h-auto max-h-[80vh] w-full object-cover"
              />
            </div>
          )}
          <div className="mt-4 flex items-start justify-between">
            <div>
              <h2 className="font-serif text-lg font-medium text-gray-900">
                {facility.label}
              </h2>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-serif font-medium text-gray-900">Information</h3>
          <dl className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
            {facility.costToBuild && (
              <DefinitionItem term="Cost to build">
                {facility.costToBuild}
              </DefinitionItem>
            )}
            {facility.sponsoredBy && (
              <DefinitionItem term="Sponsored by">
                {facility.sponsoredBy}
              </DefinitionItem>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

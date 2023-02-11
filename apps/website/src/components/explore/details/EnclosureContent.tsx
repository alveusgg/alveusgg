import React from "react";
import Image from "next/image";
import { PlusIcon } from "@heroicons/react/20/solid";
import type { Enclosure } from "../../../utils/data";
import { DefinitionItem } from "./DefinitionItem";

export const EnclosureContent: React.FC<{
  enclosure: Enclosure;
}> = ({ enclosure }) => {
  return (
    <div className="h-full overflow-y-auto bg-white p-8">
      <div className="space-y-6 pb-16">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-lg font-medium text-gray-900">
              {enclosure.label}
            </h2>
          </div>
        </div>
        <div>
          {enclosure.images?.[0] && (
            <div className="block w-full overflow-hidden rounded-lg">
              <Image
                width={800}
                height={400}
                src={enclosure.images[0].url}
                alt={enclosure.images[0].alt || ""}
                className="h-auto max-h-[80vh] w-full object-cover"
              />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-serif font-medium text-gray-900">Information</h3>
          <dl className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
            {enclosure.costToBuild && (
              <DefinitionItem term="Cost to build">
                {enclosure.costToBuild}
              </DefinitionItem>
            )}
            {enclosure.sponsoredBy && (
              <DefinitionItem term="Sponsored by">
                {enclosure.sponsoredBy}
              </DefinitionItem>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

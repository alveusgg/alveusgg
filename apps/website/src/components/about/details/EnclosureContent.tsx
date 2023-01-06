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
        <div>
          <h3 className="font-serif font-medium text-gray-900">See also</h3>
          <ul
            role="list"
            className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200"
          >
            <li className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <img
                  src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3&w=1024&h=1024&q=80"
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
                <p className="ml-4 text-sm font-medium text-gray-900">
                  Aimee Douglas
                </p>
              </div>
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-500 focus:ring-indigo-500 ml-6 rounded-md bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Remove
                <span className="sr-only"> Aimee Douglas</span>
              </button>
            </li>
            <li className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixqx=oilqXxSqey&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
                <p className="ml-4 text-sm font-medium text-gray-900">
                  Andrea McMillan
                </p>
              </div>
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-500 focus:ring-indigo-500 ml-6 rounded-md bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Remove
                <span className="sr-only"> Andrea McMillan</span>
              </button>
            </li>
            <li className="flex items-center justify-between py-2">
              <button
                type="button"
                className="focus:ring-indigo-500 group -ml-1 flex items-center rounded-md bg-white p-1 focus:outline-none focus:ring-2"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400">
                  <PlusIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-indigo-600 group-hover:text-indigo-500 ml-4 text-sm font-medium">
                  Share
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

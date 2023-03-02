import React from "react";
import { parse, formatDistanceToNow } from "date-fns";
import Image from "next/image";
import {
  GlobeAltIcon,
  PlayCircleIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { dateFormatter } from "../InfoDetails";
import { DefinitionItem } from "./DefinitionItem";
import type { Ambassador, Enclosures } from "@/server/utils/data";
import type { SelectionAction } from "@/pages/wip/explore";

export const AmbassadorContent: React.FC<{
  enclosures: Enclosures;
  ambassador: Ambassador;
  dispatchSelection: (action: SelectionAction) => void;
}> = ({ ambassador, enclosures, dispatchSelection }) => {
  const dateOfBirth = ambassador?.dateOfBirth
    ? parse(ambassador.dateOfBirth, "yyyy-mm-dd", new Date())
    : null;
  const relatedEnclosureName = ambassador.enclosure;
  const relatedEnclosure =
    relatedEnclosureName && enclosures[relatedEnclosureName];

  return (
    <div className="h-full overflow-y-auto bg-white p-8">
      <div className="space-y-6 pb-16">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-lg font-medium text-gray-900">
              {ambassador.name}
            </h2>
            <p className="text-sm font-medium text-gray-500">
              {ambassador.species} ({ambassador.scientificName})
            </p>
          </div>
        </div>
        <div>
          {ambassador.images?.[0] && (
            <div className="block w-full overflow-hidden rounded-lg">
              <Image
                width={800}
                height={400}
                src={ambassador.images[0].url}
                alt={ambassador.images[0].alt || ""}
                className="h-auto max-h-[80vh] w-full object-cover"
              />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-serif font-medium text-gray-900">Information</h3>
          <dl className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
            <DefinitionItem term="Species">
              {ambassador.scientificName} ({ambassador.species})
            </DefinitionItem>
            <DefinitionItem term="Sex">{ambassador.sex}</DefinitionItem>
            <DefinitionItem term="Age">
              {dateOfBirth ? formatDistanceToNow(dateOfBirth) : "Unknown"}
            </DefinitionItem>
            <DefinitionItem term="Birthday">
              {dateOfBirth ? dateFormatter.format(dateOfBirth) : "Unknown"}
            </DefinitionItem>
            <DefinitionItem term="IUCN Status">
              {ambassador.links?.iucn ? (
                <Link
                  className="flex items-center gap-2 underline"
                  href={ambassador.links?.iucn}
                  target="_blank"
                  rel="noreferrer"
                  title={`Show IUCN Red List entry for ${ambassador.species}`}
                >
                  <LinkIcon className="h-4 w-4" />
                  {ambassador.iucnStatus}
                </Link>
              ) : (
                ambassador.iucnStatus
              )}
            </DefinitionItem>
          </dl>
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Story</h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-500">{ambassador.story}</p>
          </div>
        </div>
        <div>
          <h3 className="font-serif font-medium text-gray-900">
            Conservation Missing
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {ambassador.conservationMission}
            </p>
          </div>
        </div>
        <div>
          <h3 className="font-serif font-medium text-gray-900">See also</h3>
          <ul
            role="list"
            className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200"
          >
            {ambassador.links?.introVideo && (
              <li className="flex items-center justify-between py-3">
                <a
                  href={ambassador.links.introVideo}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center"
                >
                  <PlayCircleIcon className="h-8 w-8" aria-hidden="true" />
                  <p className="ml-4 text-sm font-medium text-gray-900">
                    Show introduction video (YouTube)
                  </p>
                </a>
              </li>
            )}
            {ambassador.links?.website && (
              <li className="flex items-center justify-between py-3">
                <a
                  href={ambassador.links.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center"
                >
                  <GlobeAltIcon className="h-8 w-8" aria-hidden="true" />
                  <p className="ml-4 text-sm font-medium text-gray-900">
                    Show profile on Alveus website
                  </p>
                </a>
              </li>
            )}
            {relatedEnclosure && relatedEnclosureName && (
              <li className="flex items-center justify-between py-3">
                <button
                  onClick={() => {
                    dispatchSelection({
                      type: "select",
                      payload: {
                        type: "enclosure",
                        name: relatedEnclosureName,
                      },
                    });
                  }}
                  className="flex appearance-none items-center text-left"
                >
                  {relatedEnclosure.images?.[0]?.url && (
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg object-cover">
                      <Image
                        src={relatedEnclosure.images?.[0]?.url}
                        fill={true}
                        alt=""
                      />
                    </div>
                  )}
                  <p className="ml-4 text-sm font-medium text-gray-900">
                    {relatedEnclosure.label} (Ambassador enclosure)
                  </p>
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

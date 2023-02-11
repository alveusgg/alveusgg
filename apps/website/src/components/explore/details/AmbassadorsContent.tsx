import React from "react";
import type { Ambassador } from "../../../utils/data";
import Image from "next/image";
import type { SelectionAction } from "../../../pages/wip/explore";

export const AmbassadorsContent: React.FC<{
  ambassadors: Record<string, Ambassador>;
  dispatchSelection: (action: SelectionAction) => void;
}> = ({ ambassadors, dispatchSelection }) => {
  return (
    <div className="h-full overflow-y-auto bg-white p-8">
      <div className="space-y-6 pb-16">
        <div>
          <div className="mt-4 flex items-start justify-between">
            <div>
              <h2 className="font-serif text-lg font-medium text-gray-900">
                Multiple ambassadors
              </h2>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-serif font-medium text-gray-900">Ambassadors</h3>
          <ul
            role="list"
            className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200"
          >
            {Object.keys(ambassadors).map((slug) => {
              const ambassador = ambassadors[slug];
              if (!ambassador) return null;

              const thumb = ambassador.images?.[0]?.url;

              return (
                <li key={slug} className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      dispatchSelection({
                        type: "select",
                        payload: { type: "ambassador", name: slug },
                      })
                    }
                    className="-mx-3 block flex flex-1 items-center p-3 text-left hover:bg-gray-100"
                  >
                    {thumb && (
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg object-cover">
                        <Image src={thumb} fill={true} alt="" />
                      </div>
                    )}
                    <p className="ml-4 text-base font-medium text-gray-900">
                      {ambassador.name}
                      {ambassador.sex && `, ${ambassador.sex}`} <br />(
                      {ambassador.species})
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

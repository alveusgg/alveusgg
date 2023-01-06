import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import type { Ambassadors, Enclosures, Facilities } from "../../utils/data";
import { ptSans, ptSerif } from "../Layout";
import type { SelectionAction, SelectionState } from "../../pages/explore";
import { AmbassadorContent } from "./details/AmbassadorContent";
import { EnclosureContent } from "./details/EnclosureContent";
import { FacilityContent } from "./details/FacilityContent";
import { notEmpty } from "../../utils/helpers";
import { AmbassadorsContent } from "./details/AmbassadorsContent";

export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const InfoDetails: React.FC<{
  ambassadors: Ambassadors;
  enclosures: Enclosures;
  facilities: Facilities;
  selection: SelectionState;
  dispatchSelection: (action: SelectionAction) => void;
}> = ({
  ambassadors,
  enclosures,
  facilities,
  selection,
  dispatchSelection,
}) => {
  let showDetails = false;
  let content = null;
  switch (selection?.selection?.type) {
    case "ambassadors": {
      const selectedAmbassadors = selection.selection.names
        .map((name) => ambassadors[name] && [name, ambassadors[name]])
        .filter(notEmpty);
      if (selectedAmbassadors) {
        showDetails = true;
        content = (
          <AmbassadorsContent
            ambassadors={Object.fromEntries(selectedAmbassadors)}
            dispatchSelection={dispatchSelection}
          />
        );
      }
      break;
    }
    case "ambassador": {
      const ambassador = ambassadors[selection.selection.name];
      if (ambassador) {
        showDetails = true;
        content = (
          <AmbassadorContent
            ambassador={ambassador}
            enclosures={enclosures}
            dispatchSelection={dispatchSelection}
          />
        );
      }
      break;
    }
    case "enclosure": {
      const enclosure = enclosures[selection.selection.name];
      if (enclosure) {
        showDetails = true;
        content = <EnclosureContent enclosure={enclosure} />;
      }
      break;
    }
    case "facility": {
      const facility = facilities[selection.selection.name];
      if (facility) {
        showDetails = true;
        content = <FacilityContent facility={facility} />;
      }
      break;
    }
  }

  const requestClose = () =>
    dispatchSelection({ type: "select", payload: undefined });

  return (
    <Transition.Root show={showDetails} as={Fragment}>
      <Dialog
        as="div"
        className={`relative z-30 ${ptSans.variable} ${ptSerif.variable} font-sans`}
        onClose={requestClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-10 flex max-w-full pr-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <Dialog.Panel className="pointer-events-auto relative mx-auto w-[90vw] max-w-[800px]">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-8 flex pt-4 pr-2 sm:-mr-10 sm:pl-4">
                      <button
                        type="button"
                        className="rounded-md text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={requestClose}
                      >
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>

                  {content}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

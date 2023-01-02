import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import parse from "date-fns/parse";

import type { Ambassador } from "../../utils/data";
import { ptSans, ptSerif } from "../Layout";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const DefinitionItem: React.FC<{
  term: string | JSX.Element;
  children: React.ReactNode;
}> = ({ term, children }) => (
  <div className="flex justify-between py-3 text-sm font-medium">
    <dt className="text-gray-500">{term}</dt>
    <dd className="text-gray-900">{children}</dd>
  </div>
);
const Content: React.FC<{
  ambassador: Ambassador;
}> = ({ ambassador }) => {
  const dateOfBirth = ambassador?.dateOfBirth
    ? parse(ambassador.dateOfBirth, "yyyy-mm-dd", new Date())
    : null;

  return (
    <div className="h-full overflow-y-auto bg-white p-8">
      <div className="space-y-6 pb-16">
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
          <div className="mt-4 flex items-start justify-between">
            <div>
              <h2 className="font-serif text-lg font-medium text-gray-900">
                {ambassador.name}
              </h2>
              <p className="text-sm font-medium text-gray-500">
                {ambassador.species} ({ambassador.scientificName})
              </p>
            </div>

            {/*
              <button
                type="button"
                className="focus:ring-indigo-500 ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2"
              >
                <HeartIcon
                  className="h-6 w-6"
                  aria-hidden="true"
                />
                <span className="sr-only">Favorite</span>
              </button>
              */}
          </div>
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
              {ambassador.iucnStatus}
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
        {ambassador.links?.website && (
          <div>
            <h3 className="font-serif font-medium text-gray-900">See also</h3>
            <a
              href={ambassador.links?.website}
              target="_blank"
              rel="noreferrer"
            >
              Show profile on website
            </a>
          </div>
        )}
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
        <div className="flex">
          <button
            type="button"
            className="focus:ring-indigo-500 ml-3 flex-1 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Previous
          </button>
          <button
            type="button"
            className="focus:ring-indigo-500 ml-3 flex-1 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export const InfoDetails: React.FC<{
  ambassador?: Ambassador | null;
  requestClose: () => void;
}> = ({ ambassador = null, requestClose }) => {
  return (
    <Transition.Root show={ambassador !== null} as={Fragment}>
      <Dialog
        as="div"
        className={`relative z-10 ${ptSans.variable} ${ptSerif.variable} font-sans`}
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

                  {ambassador && <Content ambassador={ambassador} />}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import type { ReactNode } from "react";

import Heading from "@/components/content/Heading";

import IconArrowRight from "@/icons/IconArrowRight";
import IconChevronDown from "@/icons/IconChevronDown";
import IconChevronUp from "@/icons/IconChevronUp";

import Link from "./Link";

export interface AccordionItem {
  title: string;
  description: string;
  content?: ReactNode;
  link?: string;
  linkIsExternal?: boolean;
}

const Accordion = ({ items }: { items: Record<string, AccordionItem> }) => {
  return (
    <>
      {Object.entries(items).map(
        ([key, { title, link, linkIsExternal, description, content }]) => {
          if (content) {
            const heading = (
              <Heading level={3} className="my-0 text-2xl">
                {title}
              </Heading>
            );

            return (
              <Disclosure key={key}>
                {({ open }) => (
                  <>
                    <DisclosureButton className="mt-4 mb-2 flex w-full items-center gap-2 rounded-xl bg-alveus-green-100 px-4 py-2 text-start text-alveus-green-800 transition-colors hover:bg-alveus-green-200">
                      <div className="flex grow flex-wrap items-baseline gap-x-4">
                        {link ? (
                          <Link
                            href={link}
                            external={linkIsExternal}
                            custom
                            className="hover:underline"
                          >
                            {heading}
                          </Link>
                        ) : (
                          heading
                        )}

                        <p>{description}</p>
                      </div>

                      {open ? (
                        <IconChevronUp
                          className="box-content shrink-0 p-1"
                          size={32}
                        />
                      ) : (
                        <IconChevronDown
                          className="box-content shrink-0 p-1"
                          size={32}
                        />
                      )}
                    </DisclosureButton>

                    <DisclosurePanel className="mx-4 mt-2 rounded-xl bg-alveus-green-50 p-4 text-alveus-green-900">
                      {content}
                    </DisclosurePanel>
                  </>
                )}
              </Disclosure>
            );
          }

          if (link) {
            return (
              <Link
                key={key}
                href={link}
                external={linkIsExternal}
                custom
                className="group mt-4 mb-2 flex w-full items-center gap-2 rounded-xl bg-alveus-green-100 px-4 py-2 text-start text-alveus-green-800 transition-colors hover:bg-alveus-green-200"
              >
                <div className="flex grow flex-wrap items-baseline gap-x-4">
                  <Heading
                    level={3}
                    className="my-0 text-2xl group-hover:underline"
                  >
                    {title}
                  </Heading>

                  <p>{description}</p>
                </div>

                <IconArrowRight
                  className="box-content shrink-0 p-1"
                  size={32}
                />
              </Link>
            );
          }

          return (
            <div
              key={key}
              className="mt-4 mb-2 flex w-full items-center gap-2 rounded-xl bg-alveus-green-100 px-4 py-2 text-start text-alveus-green-800"
            >
              <div className="flex grow flex-wrap items-baseline gap-x-4">
                <Heading level={3} className="my-0 text-2xl">
                  {title}
                </Heading>

                <p>{description}</p>
              </div>
            </div>
          );
        },
      )}
    </>
  );
};

export default Accordion;

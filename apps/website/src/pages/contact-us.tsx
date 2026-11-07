import { type NextPage } from "next";
import { type ComponentType, Fragment } from "react";

import { classes } from "@/utils/classes";

import { useCopyToClipboard } from "@/hooks/clipboard";

import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

import { type IconProps } from "@/icons/BaseIcon";
import IconClipboard from "@/icons/IconClipboard";
import IconDollar from "@/icons/IconDollar";
import IconEnvelope from "@/icons/IconEnvelope";
import IconGlobe from "@/icons/IconGlobe";
import IconInformationCircle from "@/icons/IconInformationCircle";
import IconShoppingCart from "@/icons/IconShoppingCart";
import IconUserGroup from "@/icons/IconUserGroup";

type ContactLink = { text: string; href: string };

type ContactCategory = {
  key: string;
  name: string;
  icon: ComponentType<IconProps>;
  // A line of text followed by an email address
  parts: { text: string; email: string }[];
  // Sub-titled halves shown side by side inside the card
  sections?: { title: string; link: ContactLink }[];
  // Buttons shown on the title row
  buttons?: ContactLink[];
};

const categories: ContactCategory[] = [
  {
    key: "donors",
    name: "Donors",
    icon: IconDollar,
    parts: [
      { text: "For donor inquiries:", email: "contact@alveussanctuary.org" },
    ],
    buttons: [
      { text: "Donate", href: "/donate" },
      { text: "PO Box", href: "/po-box" },
    ],
  },
  {
    key: "business",
    name: "Business",
    icon: IconGlobe,
    parts: [{ text: "For business inquiries:", email: "alveus@loaded.gg" }],
  },
  {
    key: "grants",
    name: "Grants",
    icon: IconEnvelope,
    parts: [
      {
        text: "For foundation & corporate grants:",
        email: "grants@alveussanctuary.org",
      },
    ],
    buttons: [{ text: "Funding priorities", href: "/donate/grants" }],
  },
  {
    key: "shop",
    name: "Shop",
    icon: IconShoppingCart,
    parts: [],
    // Full paths, so it is clear the links go to each store's contact page
    sections: [
      {
        title: "Apparel",
        link: {
          text: "shop.alveussanctuary.org/pages/contact",
          href: "https://shop.alveussanctuary.org/pages/contact",
        },
      },
      {
        title: "Plushies",
        link: {
          text: "youtooz.com/pages/contact-us",
          href: "https://youtooz.com/pages/contact-us",
        },
      },
    ],
  },
  {
    key: "collaboration",
    name: "Collaboration",
    icon: IconUserGroup,
    parts: [
      {
        text: "To connect with Maya regarding collaboration or to offer support for Alveus Sanctuary:",
        email: "mayahiga@alveussanctuary.org",
      },
    ],
  },
];

// Six columns on desktop: three cards on top, two wider ones below, so both
// rows are full. Two per row on tablet, with the last card full width
const cardSpans = [
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-3",
  "md:col-span-2 lg:col-span-3",
];

// The site's Link style, a little larger and bold so addresses stand out
const contactLinkClasses = "font-semibold wrap-anywhere sm:text-lg";

// Let long addresses wrap at "@", "." and "/" rather than mid-word
const withBreaks = (text: string, at = /(?=[@./])/) =>
  text.split(at).map((part, idx) => (
    <Fragment key={part + idx.toString()}>
      {idx > 0 && <wbr />}
      {part}
    </Fragment>
  ));

const EmailRow = ({ email }: { email: string }) => {
  const { copy, status } = useCopyToClipboard();
  const message =
    status === "success" ? "Copied" : status === "error" ? "Copy failed" : "";

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`mailto:${email}`}
        className={classes(contactLinkClasses, "min-w-0")}
      >
        {withBreaks(email)}
      </Link>
      <span className="relative shrink-0">
        <button
          type="button"
          onClick={() => copy(email)}
          aria-label="Copy email address"
          className="rounded-lg p-2 text-alveus-green transition-colors hover:bg-alveus-green hover:text-alveus-tan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-green-700 motion-reduce:transition-none"
        >
          <IconClipboard className="size-5" />
        </button>
        {/* Floats above the button so the row never shifts */}
        <span
          aria-hidden="true"
          className={classes(
            "pointer-events-none absolute right-0 bottom-full mb-1 rounded-md bg-alveus-green px-2 py-0.5 text-sm whitespace-nowrap text-alveus-tan transition-opacity motion-reduce:transition-none",
            message ? "opacity-100" : "opacity-0",
          )}
        >
          {message || "Copied"}
        </span>
        <span className="sr-only" aria-live="polite">
          {message}
        </span>
      </span>
    </div>
  );
};

const ContactButtons = ({ links }: { links: ContactLink[] }) => (
  <ul className="flex flex-wrap gap-2">
    {links.map((link) => (
      <li key={link.href}>
        {/* The site's green Button, sized down to sit inside a card */}
        <Button
          href={link.href}
          className="inline-flex items-center gap-2 px-3 py-1 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-green-700"
        >
          {link.text}
        </Button>
      </li>
    ))}
  </ul>
);

const ContactUsPage: NextPage = () => {
  return (
    <>
      <Meta
        title="Contact Us"
        description="Contact us for any questions or concerns you may have. We are not openly hiring."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section className="grow">
        {/* The note sits on the title row from tablet up, below it on phones */}
        <div className="mb-6 flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
          <Heading className="text-5xl">Contact Us</Heading>

          <p
            role="note"
            className="inline-flex items-center gap-2 rounded-lg border border-alveus-green-300 bg-alveus-green-100 px-4 py-2 text-lg font-semibold"
          >
            <IconInformationCircle className="size-5 shrink-0" />
            We are not openly hiring.
          </p>
        </div>

        {/* Cards stretch to the tallest in their row */}
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          {categories.map((category, idx) => (
            <li
              key={category.key}
              id={`contact-${category.key}`}
              className={cardSpans[idx]}
            >
              <Box className="flex h-full flex-col gap-4 p-5">
                {/* Buttons share the title row, right-aligned. When the row is
                    too narrow they wrap below the title rather than squeeze it */}
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                  <div className="flex shrink-0 items-center gap-4">
                    <div className="rounded-xl border-2 border-alveus-green bg-alveus-green p-2 text-alveus-tan">
                      <category.icon size={24} aria-hidden="true" />
                    </div>
                    <Heading level={2} className="my-0">
                      {category.name}
                    </Heading>
                  </div>

                  {category.buttons && (
                    <ContactButtons links={category.buttons} />
                  )}
                </div>

                {category.parts.map((part) => (
                  <div key={part.text} className="flex flex-col gap-1">
                    <p>{part.text}</p>
                    <EmailRow email={part.email} />
                  </div>
                ))}

                {category.sections && (
                  // Equal halves on desktop. On tablet the card is narrow, so
                  // the columns fit their content and the links use the base
                  // size. Links only wrap at "/", keeping each domain whole
                  <div className="grid gap-4 md:grid-cols-[auto_auto] md:justify-start lg:grid-cols-2">
                    {category.sections.map((section) => (
                      <div key={section.title} className="flex flex-col gap-1">
                        <Heading level={3} className="my-0 text-xl">
                          {section.title}
                        </Heading>
                        <Link
                          href={section.link.href}
                          external
                          className={classes(
                            contactLinkClasses,
                            "wrap-normal md:text-base lg:text-lg",
                          )}
                        >
                          {withBreaks(section.link.text, /(?=\/)/)}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </Box>
            </li>
          ))}
        </ul>

        {/* Website and open-source only, so kept as a small note below the
            general contact cards */}
        <div className="mt-10 text-center text-sm">
          <p>
            For issues with the website or Twitch extension, please open an
            issue on GitHub:{" "}
            <Link
              href="https://github.com/alveusgg/alveusgg/issues/new/choose"
              external
            >
              Website
            </Link>{" "}
            or{" "}
            <Link
              href="https://github.com/alveusgg/extension/issues/new/choose"
              external
            >
              Twitch Extension
            </Link>
          </p>

          <p>
            If you discover a security vulnerability within the website, or any
            of our other open-source projects, please email us:{" "}
            <Link href="mailto:opensource@alveussanctuary.org">
              opensource@alveussanctuary.org
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
};

export default ContactUsPage;

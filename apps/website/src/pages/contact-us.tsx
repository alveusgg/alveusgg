import { type NextPage } from "next";
import { type ComponentType, Fragment } from "react";

import { classes } from "@/utils/classes";

import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import CopyToClipboardButton from "@/components/shared/actions/CopyToClipboardButton";

import { type IconProps } from "@/icons/BaseIcon";
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
  className: string;
  parts: { text: string; email: string }[];
  sections?: { title: string; link: ContactLink }[];
  buttons?: ContactLink[];
};

const categories: ContactCategory[] = [
  {
    key: "donors",
    name: "Donors",
    icon: IconDollar,
    className: "lg:col-span-2",
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
    className: "lg:col-span-2",
    parts: [{ text: "For business inquiries:", email: "alveus@loaded.gg" }],
  },
  {
    key: "grants",
    name: "Grants",
    icon: IconEnvelope,
    className: "lg:col-span-2",
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
    className: "lg:col-span-3",
    parts: [],
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
    className: "md:col-span-2 lg:col-span-3",
    parts: [
      {
        text: "To connect with Maya regarding collaboration or to offer support for Alveus Sanctuary:",
        email: "mayahiga@alveussanctuary.org",
      },
    ],
  },
];

const contactLinkClasses = "font-semibold wrap-anywhere sm:text-lg";

const withBreaks = (text: string, at = /(?=[@./])/) =>
  text.split(at).map((part, idx) => (
    <Fragment key={part + idx.toString()}>
      {idx > 0 && <wbr />}
      {part}
    </Fragment>
  ));

const ContactButtons = ({ links }: { links: ContactLink[] }) => (
  <ul className="flex flex-wrap gap-2">
    {links.map((link) => (
      <li key={link.href}>
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

        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          {categories.map((category) => (
            <li
              key={category.key}
              id={`contact-${category.key}`}
              className={category.className}
            >
              <Box className="flex h-full flex-col gap-4 p-5">
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
                    <div className="flex items-center gap-1">
                      <Link
                        href={`mailto:${part.email}`}
                        className={classes(contactLinkClasses, "min-w-0")}
                      >
                        {withBreaks(part.email)}
                      </Link>
                      <CopyToClipboardButton
                        text={part.email}
                        options={{ initialText: "Copy email address" }}
                      />
                    </div>
                  </div>
                ))}

                {category.sections && (
                  <div className="grid gap-4 md:grid-cols-auto-2 md:justify-start lg:grid-cols-2">
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

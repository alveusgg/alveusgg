import { type ComponentType } from "react";

import { typeSafeObjectFromEntries, typeSafeObjectKeys } from "@/utils/helpers";
import { camelToKebab } from "@/utils/string-case";

import { type NavColor } from "@/components/layout/navbar/colors";

import { type IconProps } from "@/icons/BaseIcon";
import IconBuildingLibrary from "@/icons/IconBuildingLibrary";
import IconGift from "@/icons/IconGift";
import IconHeart from "@/icons/IconHeart";
import IconPresentationChartLine from "@/icons/IconPresentationChartLine";

import murals from "./murals";

export type NavStructureLink = {
  title: string;
  link: string;
  external?: boolean;
  /** Shows the link as a larger item, with an icon and description, on desktop */
  icon?: ComponentType<IconProps>;
  description?: string;
};

type NavStructureDropdownBase = {
  title: string;
  /** Makes the title a link, with the dropdown opened separately */
  link?: string;
  color?: NavColor;
};

export type NavStructureLinks = NavStructureDropdownBase & {
  links: Record<string, NavStructureLink>;
};

type NavStructureGroups = NavStructureDropdownBase & {
  groups: Record<string, NavStructureLinks>;
};

export type NavStructureDropdown = NavStructureGroups | NavStructureLinks;

export type NavStructure = {
  [key: string]: NavStructureLink | NavStructureDropdown;
};

export const isNavDropdown = (
  item: NavStructureLink | NavStructureDropdown,
): item is NavStructureDropdown => "links" in item || "groups" in item;

export const mainNavStructure: NavStructure = {
  home: {
    title: "Home",
    link: "/",
  },
  ambassadors: {
    title: "Ambassadors",
    link: "/ambassadors",
  },
  institute: {
    title: "Institute",
    links: {
      institute: {
        title: "Research & Recovery",
        link: "/institute",
      },
      ...typeSafeObjectFromEntries(
        typeSafeObjectKeys(murals).map((key) => [
          `mural-${key}`,
          {
            title: murals[key].name,
            link: `/institute/pixels/${camelToKebab(key)}`,
          },
        ]),
      ),
    },
  },
  explore: {
    title: "Explore",
    groups: {
      content: {
        title: "Content",
        links: {
          updates: {
            title: "Schedule & Updates",
            link: "/updates",
          },
          collaborations: {
            title: "Collaborations",
            link: "/collaborations",
          },
        },
      },
      community: {
        title: "Get Involved",
        links: {
          showAndTell: {
            title: "Show & Tell",
            link: "/show-and-tell",
          },
          pollinatorCensus: {
            title: "Pollinator Census",
            link: "/census",
            external: true,
          },
        },
      },
      series: {
        title: "Series",
        links: {
          animalQuest: {
            title: "Animal Quest",
            link: "/animal-quest",
          },
          bookClub: {
            title: "Alveus Book Club",
            link: "/book-club",
          },
        },
      },
      help: {
        title: "Help",
        links: {
          foundAnimal: {
            title: "Found a Wild Animal?",
            link: "/help/found-animal",
          },
          reportNeglectSurrender: {
            title: "Neglect & Surrender Guide",
            link: "/help/report-neglect-surrender",
          },
        },
      },
    },
  },
  about: {
    title: "About",
    groups: {
      alveus: {
        title: "Organization",
        links: {
          alveus: {
            title: "About Alveus",
            link: "/about",
          },
          staff: {
            title: "Alveus Team",
            link: "/about/team",
          },
          annualReports: {
            title: "Annual Reports",
            link: "/about/annual-reports",
          },
          grants: {
            title: "Grants",
            link: "/donate/grants",
          },
        },
      },
      impact: {
        title: "Work",
        links: {
          ngoCollabs: {
            title: "NGO Collaborations",
            link: "/about/orgs",
          },
          events: {
            title: "Fundraising Events",
            link: "/about/events",
          },
        },
      },
      info: {
        title: "Info",
        links: {
          tech: {
            title: "Tech at Alveus",
            link: "/about/tech",
          },
        },
      },
    },
  },
  shop: {
    title: "Shop",
    links: {
      apparel: {
        title: "Apparel",
        link: "/apparel",
        external: true,
      },
      plushies: {
        title: "Plushies",
        link: "/plushies",
        external: true,
      },
    },
  },
  donate: {
    title: "Donate",
    link: "/donate",
    color: "tan",
    links: {
      donation: {
        title: "Make a Donation",
        link: "/donate",
        icon: IconHeart,
        description: "Give once or set up a recurring gift.",
      },
      wishlist: {
        title: "Wishlist",
        link: "/wishlist",
        icon: IconGift,
        description: "Help buy supplies for the ambassadors.",
      },
      grants: {
        title: "Grants",
        link: "/donate/grants",
        icon: IconBuildingLibrary,
        description: "For foundations and corporate grants.",
      },
      givingBlock: {
        title: "Stock & Crypto",
        link: "/donate/giving-block",
        external: true,
        icon: IconPresentationChartLine,
        description: "Donate via The Giving Block",
      },
    },
  },
};

export const getNavLinks = (
  item: NavStructureLink | NavStructureDropdown,
): NavStructureLink[] => {
  if (!isNavDropdown(item)) return [item];
  if ("links" in item) return Object.values(item.links);

  return Object.values(item.groups).flatMap((group) =>
    Object.values(group.links),
  );
};

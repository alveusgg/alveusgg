import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
  typeSafeObjectKeys,
} from "@/utils/helpers";
import { camelToKebab } from "@/utils/string-case";

import socials from "@/components/shared/data/socials";

import IconAmazon from "@/icons/IconAmazon";

import murals from "./murals";

export type NavStructureLink = {
  title: string;
  link: string;
  external?: boolean;
};

export type NavStructureDropdown = {
  title: string;
  dropdown: {
    [key: string]: NavStructureLink;
  };
};

export type NavStructure = {
  [key: string]: NavStructureLink | NavStructureDropdown;
};

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
    dropdown: {
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
    dropdown: {
      live: {
        title: "Live Cams",
        link: "/live",
        external: true,
      },
      updates: {
        title: "Schedule & Updates",
        link: "/updates",
      },
      animalQuest: {
        title: "Animal Quest",
        link: "/animal-quest",
      },
      collaborations: {
        title: "Collaborations",
        link: "/collaborations",
      },
      showAndTell: {
        title: "Show and Tell",
        link: "/show-and-tell",
      },
      bookClub: {
        title: "Alveus Book Club",
        link: "/book-club",
      },
      foundAnimal: {
        title: "Found an Animal?",
        link: "/found-animal",
      },
    },
  },
  about: {
    title: "About",
    dropdown: {
      alveus: {
        title: "About Alveus",
        link: "/about",
      },
      staff: {
        title: "Alveus Team",
        link: "/about/team",
      },
      ngoCollabs: {
        title: "NGO Collaborations",
        link: "/about/orgs",
      },
      events: {
        title: "Fundraising Events",
        link: "/about/events",
      },
      annualReports: {
        title: "Annual Reports",
        link: "/about/annual-reports",
      },
      tech: {
        title: "Tech at Alveus",
        link: "/about/tech",
      },
    },
  },
  shop: {
    title: "Shop",
    dropdown: {
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
  },
};

export const utilityNavStructure = {
  amazon: {
    link: "/wishlist",
    title: "Amazon Wishlist",
    icon: IconAmazon,
    rel: "noreferrer",
  },
  ...typeSafeObjectFromEntries(
    typeSafeObjectEntries(socials).map(([key, value]) => [
      key,
      {
        ...value,
        rel: "noreferrer me",
      },
    ]),
  ),
};

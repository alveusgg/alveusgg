import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
} from "@/utils/helpers";

import socials from "@/components/shared/data/socials";

import IconAmazon from "@/icons/IconAmazon";

export type NavStructureLink = {
  title: string;
  link: string;
  isExternal?: boolean;
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
  explore: {
    title: "Explore",
    dropdown: {
      live: {
        title: "Live Cams",
        link: "/live",
        isExternal: true,
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
        link: "/about/alveus",
      },
      staff: {
        title: "Alveus Staff",
        link: "/about/staff",
      },
      advisoryBoard: {
        title: "Advisory Board",
        link: "/about/advisory-board",
      },
      boardOfDirectors: {
        title: "Board of Directors",
        link: "/about/board-of-directors",
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
  merch: {
    title: "Merch",
    dropdown: {
      apparel: {
        title: "Apparel",
        link: "/apparel",
        isExternal: true,
      },
      plushies: {
        title: "Plushies",
        link: "/plushies",
        isExternal: true,
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

import { typeSafeObjectFromEntries, typeSafeObjectKeys } from "@/utils/helpers";
import { camelToKebab } from "@/utils/string-case";

import murals from "./murals";

export type NavStructureLink = {
  title: string;
  link: string;
  external?: boolean;
};

export type NavStructureLinks = {
  title: string;
  links: Record<string, NavStructureLink>;
};

type NavStructureGroups = {
  title: string;
  groups: Record<string, NavStructureLinks>;
};

export type NavStructureDropdown = NavStructureGroups | NavStructureLinks;

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
      series: {
        title: "Series",
        links: {
          animalQuest: {
            title: "Animal Quest",
            link: "/animal-quest",
          },
          showAndTell: {
            title: "Show & Tell",
            link: "/show-and-tell",
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
  },
};

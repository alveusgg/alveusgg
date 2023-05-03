import IconAmazon from "@/icons/IconAmazon";
import socials from "@/components/shared/data/socials";

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
    title: "Updates",
    link: "/updates",
  },
  live: {
    title: "Live",
    link: "/live",
    isExternal: true,
  },
  ambassadors: {
    title: "Ambassadors",
    link: "/ambassadors",
  },
  explore: {
    title: "Explore",
    dropdown: {
      animalQuest: {
        title: "Animal Quest",
        link: "/animal-quest",
      },
      showAndTell: {
        title: "Show and Tell",
        link: "/show-and-tell",
      },
      collaborations: {
        title: "Collaborations",
        link: "/collaborations",
      },
      events: {
        title: "Events",
        link: "/events",
      },
    },
  },
  about: {
    title: "About",
    dropdown: {
      alveus: {
        title: "Alveus",
        link: "/about/alveus",
      },
      maya: {
        title: "Maya",
        link: "/about/maya",
      },
      staff: {
        title: "Staff",
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
      annualReports: {
        title: "Annual Reports",
        link: "/about/annual-reports",
      },
      tech: {
        title: "Tech",
        link: "/about/tech",
      },
    },
  },
  donate: {
    title: "Donate",
    link: "/donate",
  },
  merch: {
    title: "Merch",
    link: "/merch-store",
  },
};

export const utilityNavStructure = {
  amazon: {
    link: "/wishlist",
    title: "Amazon Wishlist",
    icon: IconAmazon,
  },
  ...socials,
};

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
        title: "Live",
        link: "/live",
        isExternal: true,
      },
      animalQuest: {
        title: "Animal Quest",
        link: "/animal-quest",
      },
      collaborations: {
        title: "Collaborations",
        link: "/collaborations",
      },
      events: {
        title: "Events",
        link: "/events",
      },
      updates: {
        title: "Updates",
        link: "/updates",
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
      maya: {
        title: "About Maya",
        link: "/about/maya",
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
  more: {
    title: "More",
    dropdown: {
      showAndTell: {
        title: "Show and Tell",
        link: "/show-and-tell",
      },
      foundAnimal: {
        title: "Found an Animal?",
        link: "/found-animal",
      },
    },
  },
  merch: {
    title: "Merch",
    dropdown: {
      //apparel: {
      //  title: "Apparel",
      //  link: "/apparel",
      //  isExternal: true,
      //},
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
  },
  ...socials,
};

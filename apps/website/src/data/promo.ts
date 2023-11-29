interface Promo {
  title: string;
  subtitle: string;
  content: string;
  link: string;
  external: boolean;
  excluded: string[];
}

const promo: Promo | null = {
  title: "Holiday Sweaters & 2024 Calendars",
  subtitle: "Available from December 1st",
  content:
    "Grab yourself an embroidered Holiday sweater and a 2024 calendar featuring a selection of our ambassadors, shipping worldwide and in time for Christmas.",
  link: "/apparel",
  external: true,
  excluded: [],
};

export default promo;

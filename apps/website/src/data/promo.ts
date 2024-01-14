interface Promo {
  title: string;
  subtitle: string;
  content: string;
  link: string;
  external: boolean;
  excluded: string[];
}

const promo: Promo | null = {
  title: "Holiday Sweaters, 2024 Calendars, and more",
  subtitle: "Available Now",
  content:
    "Grab yourself an embroidered Holiday sweater, a 2024 calendar featuring a selection of our ambassadors, or discover more Alveus apparel in the store.",
  link: "/apparel",
  external: true,
  excluded: [],
};

export default promo;

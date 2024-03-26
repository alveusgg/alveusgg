import { convertToSlug } from "@/utils/slugs";

export type Collaboration = {
  name: string;
  slug: string;
  link: string | null;
  date: Date;
  videoId: string;
  vodId?: string;
};

const collaborations: Collaboration[] = (
  [
    {
      name: "Jack Manifold",
      link: "https://www.twitch.tv/jackmanifoldtv",
      date: new Date("2024-03-25"),
      videoId: "GfAxJsrymEo",
      vodId: "3lnIyCsyipE",
    },
    {
      name: "Emily Wang",
      link: "https://www.twitch.tv/emilyywang",
      date: new Date("2024-02-13"),
      videoId: "CE-mNI_5eEI",
    },
    {
      name: "Jinny",
      link: "https://www.twitch.tv/jinnytty",
      date: new Date("2024-02-08"),
      videoId: "lpXtuG87BUM",
      vodId: "c-EoBOEr1_g",
    },
    {
      name: "JaidenAnimations & Alpharad",
      link: null,
      date: new Date("2024-02-02"),
      videoId: "W74Ub2HR1Y4",
      vodId: "U2HqCEr5_e4",
    },
    {
      name: "Cinna",
      link: "https://www.twitch.tv/cinna",
      date: new Date("2024-01-28"),
      videoId: "5YRrm5mDb6o",
      vodId: "URSbZwAqLNE",
    },
    {
      name: "Hasan",
      link: "https://www.twitch.tv/hasanabi",
      date: new Date("2024-01-26"),
      videoId: "E_iO1ZKlHyM",
      vodId: "MnPhxGBoY-I",
    },
    {
      name: "Fanfan",
      link: "https://www.twitch.tv/fanfan",
      date: new Date("2023-11-13"),
      videoId: "qHcy_sBJXmU",
      vodId: "OCf7356WlNo",
    },
    {
      name: "Alluux",
      link: "https://www.twitch.tv/alluux",
      date: new Date("2023-11-05"),
      videoId: "L5r1isGll2I",
      vodId: "x1KMHDgmsR0",
    },
    {
      name: "Filian",
      link: "https://www.twitch.tv/filian",
      date: new Date("2023-10-11"),
      videoId: "WaQcdQBrz0I",
    },
    {
      name: "Trihex",
      link: "https://www.twitch.tv/trihex",
      date: new Date("2023-09-21"),
      videoId: "lxks3skYeO4",
      vodId: "H0gaJrLY5X0",
    },
    {
      name: "Esfand",
      link: "https://www.twitch.tv/esfandtv",
      date: new Date("2023-08-26"),
      videoId: "9aXebCBRonA",
      vodId: "o7nyVU62rf8",
    },
    {
      name: "ExtraEmily",
      link: "https://www.twitch.tv/extraemily",
      date: new Date("2023-06-22"),
      videoId: "maJTBSkgA4Y",
      vodId: "qbxV8xgA7Vg",
    },
    {
      name: "Zoil",
      link: "https://www.twitch.tv/zoil",
      date: new Date("2023-06-13"),
      videoId: "8M_qtYuSrys",
      vodId: "n4KpVaUmrSE",
    },
    {
      name: "PeachJars and Jessica Nigri",
      link: "https://www.twitch.tv/peachjars",
      date: new Date("2023-05-21"),
      videoId: "-HuS6wbpqzQ",
      vodId: "KF4HIypXiyc",
    },
    {
      name: "Squeex",
      link: "https://www.twitch.tv/squeex",
      date: new Date("2023-05-19"),
      videoId: "oUJxCDGQDlY",
      vodId: "dCV8b8LcG-0",
    },
    {
      name: "Caroline Kwan",
      link: "https://www.twitch.tv/carolinekwan",
      date: new Date("2023-05-09"),
      videoId: "H5nV79y-Prg",
      vodId: "4MmCFJadSg8",
    },
    {
      name: "Lacari",
      link: "https://www.twitch.tv/lacari",
      date: new Date("2023-05-02"),
      videoId: "IssAfvy_bmo",
      vodId: "mVOypbE5YNs",
    },
    {
      name: "Daily Dose",
      link: "https://www.youtube.com/@DailyDoseOfInternet",
      date: new Date("2023-04-25"),
      videoId: "M9BBwvR3i-E",
      vodId: "j8GxD4adNyk",
    },
    {
      name: "Graycen",
      link: "https://www.twitch.tv/graycen",
      date: new Date("2023-04-18"),
      videoId: "M3WBnThqRkg",
    },
    {
      name: "Dareon",
      link: "https://www.twitch.tv/dareon",
      date: new Date("2023-04-11"),
      videoId: "kqKnhu5zBIY",
      vodId: "RCzMJs9uDSI",
    },
    {
      name: "YungJeff",
      link: "https://twitter.com/YUNGJEFF",
      date: new Date("2023-04-04"),
      videoId: "BXOEWQZ8C_Y",
    },
    {
      name: "PointCrow",
      link: "https://www.twitch.tv/pointcrow",
      date: new Date("2023-03-24"),
      videoId: "FhmkQkbV42U",
      vodId: "Qz1Iniho9-g",
    },
    {
      name: "Russel",
      link: "https://www.twitch.tv/russel",
      date: new Date("2023-03-20"),
      videoId: "Xizgus_phn4",
      vodId: "OUaYjkkLeFQ",
    },
    {
      name: "Ludwig",
      link: "https://www.youtube.com/@ludwig",
      date: new Date("2023-02-25"),
      videoId: "po1jytjDu4E",
      vodId: "vuLMTU8QHAU",
    },
    {
      name: "Alinity",
      link: "https://www.twitch.tv/alinity",
      date: new Date("2023-02-09"),
      videoId: "bak3RqjCzE0",
      vodId: "XHTEs94Cf4s",
    },
    {
      name: "ConnorEatsPants",
      link: "https://www.twitch.tv/connoreatspants",
      date: new Date("2023-01-25"),
      videoId: "nC8qlK3k96Q",
      vodId: "SMEyEfVlzlM",
    },
    {
      name: "The Botez Sisters",
      link: "https://www.twitch.tv/botezlive",
      date: new Date("2022-08-30"),
      videoId: "QgvNy11kU6E",
    },
    {
      name: "Knut",
      link: "https://www.twitch.tv/knut",
      date: new Date("2022-08-09"),
      videoId: "lFhFx6kf2E4",
    },
    {
      name: "MoistCr1TiKaL",
      link: "https://www.twitch.tv/moistcr1tikal",
      date: new Date("2022-04-30"),
      videoId: "pb7MR59s1Z0",
      vodId: "x-OPvwjGHEU",
    },
    {
      name: "Jack Manifold",
      link: "https://www.twitch.tv/jackmanifoldtv",
      date: new Date("2022-04-21"),
      videoId: "jzyxhnODe2g",
    },
  ] as const
)
  .toSorted((a, b) => b.date.getTime() - a.date.getTime())
  .reduce(
    ({ collaborations, slugs }, collaboration) => {
      let slug = convertToSlug(collaboration.name);

      // Some collaborators may visit multiple times, so append the year if we have a duplicate
      if (slugs.has(slug)) {
        slug = `${slug}-${collaboration.date.getUTCFullYear()}`;
        if (slugs.has(slug))
          throw new Error(`Duplicate collaboration slug: ${slug}`);
      }

      return {
        collaborations: [...collaborations, { ...collaboration, slug }],
        slugs: slugs.add(slug),
      };
    },
    { collaborations: [] as Collaboration[], slugs: new Set<string>() },
  ).collaborations;

export default collaborations;

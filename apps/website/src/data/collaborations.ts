import { type StaticImageData } from "next/image";

import { convertToSlug } from "@/utils/slugs";

import jasonTheWeen from "@/assets/collaborations/jasonTheWeen.png";
import itmeJP from "@/assets/collaborations/itmeJP.png";
import agent00 from "@/assets/collaborations/agent00.png";
import bao from "@/assets/collaborations/bao.png";
import supertf from "@/assets/collaborations/supertf.png";
import julien from "@/assets/collaborations/julien.png";
import fuslie from "@/assets/collaborations/fuslie.png";
import valkyrae from "@/assets/collaborations/valkyrae.png";
import angelskimi from "@/assets/collaborations/angelskimi.png";
import xchocobars from "@/assets/collaborations/xchocobars.png";
import pokimane from "@/assets/collaborations/pokimane.png";
import ariaSaki from "@/assets/collaborations/aria-saki.png";
import hyoon from "@/assets/collaborations/hyoon.png";
import eret from "@/assets/collaborations/eret.png";
import avaKrisTyson from "@/assets/collaborations/ava-kris-tyson.png";
import jackManifold from "@/assets/collaborations/jack-manifold.png";
import emilyWang from "@/assets/collaborations/emily-wang.png";
import jinny from "@/assets/collaborations/jinny.png";
import jaidenAnimations from "@/assets/collaborations/jaiden-animations.png";
import alpharad from "@/assets/collaborations/alpharad.png";
import cinna from "@/assets/collaborations/cinna.png";
import hasanAbi from "@/assets/collaborations/hasan-abi.png";
import fanfan from "@/assets/collaborations/fanfan.png";
import alluux from "@/assets/collaborations/alluux.png";
import filian from "@/assets/collaborations/filian.png";
import trihex from "@/assets/collaborations/trihex.png";
import esfandtv from "@/assets/collaborations/esfandtv.png";
import extraEmily from "@/assets/collaborations/extra-emily.png";
import zoil from "@/assets/collaborations/zoil.png";
import peachJars from "@/assets/collaborations/peach-jars.png";
import jessicaNigri from "@/assets/collaborations/jessica-nigri.png";
import squeex from "@/assets/collaborations/squeex.png";
import carolineKwan from "@/assets/collaborations/caroline-kwan.png";
import lacari from "@/assets/collaborations/lacari.png";
import dailyDose from "@/assets/collaborations/daily-dose.png";
import graycen from "@/assets/collaborations/graycen.png";
import dareon from "@/assets/collaborations/dareon.png";
import yungJeff from "@/assets/collaborations/yung-jeff.png";
import pointCrow from "@/assets/collaborations/point-crow.png";
import russel from "@/assets/collaborations/russel.png";
import ludwig from "@/assets/collaborations/ludwig.png";
import alinity from "@/assets/collaborations/alinity.png";
import connorEatsPants from "@/assets/collaborations/connor-eats-pants.png";
import botzSisters from "@/assets/collaborations/botez-sisters.png";
import knut from "@/assets/collaborations/knut.png";
import moistCr1TiKaL from "@/assets/collaborations/moist-cr1tikal.png";

export type Creator = {
  name: string;
  image: StaticImageData;
  popularity: number;
};

export type Collaboration = {
  name: string;
  slug: string;
  link: string | null;
  date: Date;
  videoId: string;
  vodId?: string;
  creators: Creator[];
};

const collaborations: Collaboration[] = (
  [
    {
      name: "JasonTheWeen",
      link: "https://www.twitch.tv/jasontheween",
      date: new Date("2024-10-08"),
      videoId: "G2MCXSNy6QI",
      creators: [
        {
          name: "JasonTheWeen",
          image: jasonTheWeen,
          popularity: 786_000, // Twitch followers, 2024-10-8
        },
      ],
    },
    {
      name: "itmeJP",
      link: "https://www.twitch.tv/itmejp",
      date: new Date("2024-08-01"),
      videoId: "PWRbtRLy3II",
      vodId: "xrBHoqXGL44",
      creators: [
        {
          name: "itmeJP",
          image: itmeJP,
          popularity: 371_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Agent00",
      link: "https://www.twitch.tv/agent00",
      date: new Date("2024-07-30"),
      videoId: "BiI2YTFXJoY",
      vodId: "KLjwdWb13Hg",
      creators: [
        {
          name: "Agent00",
          image: agent00,
          popularity: 2_000_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Bao The Whale",
      link: "https://www.twitch.tv/bao",
      date: new Date("2024-06-11"),
      videoId: "mOy4_ljLTF0",
      creators: [
        {
          name: "Bao",
          image: bao,
          popularity: 561_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "SuperTF",
      link: "https://www.twitch.tv/supertf",
      date: new Date("2024-06-06"),
      videoId: "6i2LEsEm7U8",
      vodId: "ruHHqlc1PY4",
      creators: [
        {
          name: "SuperTF",
          image: supertf,
          popularity: 658_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Julien",
      link: "https://www.twitch.tv/julien",
      date: new Date("2024-04-25"),
      videoId: "46ECIvC4MUo",
      vodId: "yWtkfbfmNGs",
      creators: [
        {
          name: "Julien",
          image: julien,
          popularity: 760_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Fuslie",
      link: "https://www.youtube.com/@fuslie",
      date: new Date("2024-04-22"),
      videoId: "0pbV-45_5Ow",
      vodId: "TU6IiUrVPRg",
      creators: [
        {
          name: "Fuslie",
          image: fuslie,
          popularity: 903_000, // YouTube subscribers, 2024-10-4
        },
      ],
    },
    {
      name: "Valkyrae",
      link: "https://www.youtube.com/@Valkyrae",
      date: new Date("2024-04-21"),
      videoId: "jZKupTWDw9U",
      vodId: "nt7nbMao9c4",
      creators: [
        {
          name: "Valkyrae",
          image: valkyrae,
          popularity: 4_090_000, // YouTube subscribers, 2024-10-4
        },
      ],
    },
    {
      name: "AngelsKimi",
      link: "https://www.twitch.tv/angelskimi",
      date: new Date("2024-04-20"),
      videoId: "qC7Ifq1rZMc",
      creators: [
        {
          name: "AngelsKimi",
          image: angelskimi,
          popularity: 430_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "xChocoBars",
      link: "https://www.twitch.tv/xchocobars",
      date: new Date("2024-04-19"),
      videoId: "Q8kg4ymp7MY",
      vodId: "WcDYLVD6OC4",
      creators: [
        {
          name: "xChocoBars",
          image: xchocobars,
          popularity: 1_000_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Pokimane, AriaSaki & Hyoon",
      link: "https://www.twitch.tv/pokimane",
      date: new Date("2024-04-18"),
      videoId: "jKovWYZJ-H8",
      vodId: "G45SqJPsrOI",
      creators: [
        {
          name: "Pokimane",
          image: pokimane,
          popularity: 9_300_000, // Twitch followers, 2024-10-4
        },
        {
          name: "AriaSaki",
          image: ariaSaki,
          popularity: 656_000, // Twitch followers, 2024-10-4
        },
        {
          name: "Hyoon",
          image: hyoon,
          popularity: 279_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Eret & Ava",
      link: "https://www.twitch.tv/eret",
      date: new Date("2024-04-09"),
      videoId: "uha66hFP3oM",
      vodId: "uKq6E747zVM",
      creators: [
        {
          name: "Eret",
          image: eret,
          popularity: 1_100_000, // Twitch followers, 2024-10-4
        },
        {
          name: "Ava Kris Tyson",
          image: avaKrisTyson,
          popularity: 426_500, // Twitter followers, 2024-10-4
        },
      ],
    },
    {
      name: "Jack Manifold",
      link: "https://www.twitch.tv/jackmanifoldtv",
      date: new Date("2024-03-25"),
      videoId: "GfAxJsrymEo",
      vodId: "3lnIyCsyipE",
      creators: [
        {
          name: "Jack Manifold",
          image: jackManifold,
          popularity: 1_900_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Emily Wang",
      link: "https://www.twitch.tv/emilyywang",
      date: new Date("2024-02-13"),
      videoId: "CE-mNI_5eEI",
      creators: [
        {
          name: "Emily Wang",
          image: emilyWang,
          popularity: 247_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Jinny",
      link: "https://www.twitch.tv/jinnytty",
      date: new Date("2024-02-08"),
      videoId: "lpXtuG87BUM",
      vodId: "c-EoBOEr1_g",
      creators: [
        {
          name: "Jinny",
          image: jinny,
          popularity: 1_000_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "JaidenAnimations & Alpharad",
      link: null,
      date: new Date("2024-02-02"),
      videoId: "W74Ub2HR1Y4",
      vodId: "U2HqCEr5_e4",
      creators: [
        {
          name: "JaidenAnimations",
          image: jaidenAnimations,
          popularity: 13_800_000, // YouTube subscribers, 2024-10-4
        },
        {
          name: "Alpharad",
          image: alpharad,
          popularity: 3_600_000, // YouTube subscribers, 2024-10-4
        },
      ],
    },
    {
      name: "Cinna",
      link: "https://www.twitch.tv/cinna",
      date: new Date("2024-01-28"),
      videoId: "5YRrm5mDb6o",
      vodId: "URSbZwAqLNE",
      creators: [
        {
          name: "Cinna",
          image: cinna,
          popularity: 411_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Hasan",
      link: "https://www.twitch.tv/hasanabi",
      date: new Date("2024-01-26"),
      videoId: "E_iO1ZKlHyM",
      vodId: "MnPhxGBoY-I",
      creators: [
        {
          name: "HasanAbi",
          image: hasanAbi,
          popularity: 2_700_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Fanfan",
      link: "https://www.twitch.tv/fanfan",
      date: new Date("2023-11-13"),
      videoId: "qHcy_sBJXmU",
      vodId: "OCf7356WlNo",
      creators: [
        {
          name: "Fanfan",
          image: fanfan,
          popularity: 301_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Alluux",
      link: "https://www.twitch.tv/alluux",
      date: new Date("2023-11-05"),
      videoId: "L5r1isGll2I",
      vodId: "x1KMHDgmsR0",
      creators: [
        {
          name: "Alluux",
          image: alluux,
          popularity: 84_900, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Filian",
      link: "https://www.twitch.tv/filian",
      date: new Date("2023-10-11"),
      videoId: "WaQcdQBrz0I",
      creators: [
        {
          name: "Filian",
          image: filian,
          popularity: 2_880_000, // YouTube subscribers, 2024-10-4
        },
      ],
    },
    {
      name: "Trihex",
      link: "https://www.twitch.tv/trihex",
      date: new Date("2023-09-21"),
      videoId: "lxks3skYeO4",
      vodId: "H0gaJrLY5X0",
      creators: [
        {
          name: "Trihex",
          image: trihex,
          popularity: 419_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Esfand",
      link: "https://www.twitch.tv/esfandtv",
      date: new Date("2023-08-26"),
      videoId: "9aXebCBRonA",
      vodId: "o7nyVU62rf8",
      creators: [
        {
          name: "EsfandTV",
          image: esfandtv,
          popularity: 1_400_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "ExtraEmily",
      link: "https://www.twitch.tv/extraemily",
      date: new Date("2023-06-22"),
      videoId: "maJTBSkgA4Y",
      vodId: "qbxV8xgA7Vg",
      creators: [
        {
          name: "ExtraEmily",
          image: extraEmily,
          popularity: 408_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Zoil",
      link: "https://www.twitch.tv/zoil",
      date: new Date("2023-06-13"),
      videoId: "8M_qtYuSrys",
      vodId: "n4KpVaUmrSE",
      creators: [
        {
          name: "Zoil",
          image: zoil,
          popularity: 178_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "PeachJars and Jessica Nigri",
      link: "https://www.twitch.tv/peachjars",
      date: new Date("2023-05-21"),
      videoId: "-HuS6wbpqzQ",
      vodId: "KF4HIypXiyc",
      creators: [
        {
          name: "PeachJars",
          image: peachJars,
          popularity: 744_000, // Twitter followers, 2024-10-4
        },
        {
          name: "Jessica Nigri",
          image: jessicaNigri,
          popularity: 1_470_00, // Twitter followers, 2024-10-4
        },
      ],
    },
    {
      name: "Squeex",
      link: "https://www.twitch.tv/squeex",
      date: new Date("2023-05-19"),
      videoId: "oUJxCDGQDlY",
      vodId: "dCV8b8LcG-0",
      creators: [
        {
          name: "Squeex",
          image: squeex,
          popularity: 222_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Caroline Kwan",
      link: "https://www.twitch.tv/carolinekwan",
      date: new Date("2023-05-09"),
      videoId: "H5nV79y-Prg",
      vodId: "4MmCFJadSg8",
      creators: [
        {
          name: "Caroline Kwan",
          image: carolineKwan,
          popularity: 136_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Lacari",
      link: "https://www.twitch.tv/lacari",
      date: new Date("2023-05-02"),
      videoId: "IssAfvy_bmo",
      vodId: "mVOypbE5YNs",
      creators: [
        {
          name: "Lacari",
          image: lacari,
          popularity: 349_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Daily Dose",
      link: "https://www.youtube.com/@DailyDoseOfInternet",
      date: new Date("2023-04-25"),
      videoId: "M9BBwvR3i-E",
      vodId: "j8GxD4adNyk",
      creators: [
        {
          name: "Daily Dose",
          image: dailyDose,
          popularity: 19_300_000, // YouTube subscribers, 2024-10-4
        },
      ],
    },
    {
      name: "Graycen",
      link: "https://www.twitch.tv/graycen",
      date: new Date("2023-04-18"),
      videoId: "M3WBnThqRkg",
      creators: [
        {
          name: "Graycen",
          image: graycen,
          popularity: 120_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Dareon",
      link: "https://www.twitch.tv/dareon",
      date: new Date("2023-04-11"),
      videoId: "kqKnhu5zBIY",
      vodId: "RCzMJs9uDSI",
      creators: [
        {
          name: "Dareon",
          image: dareon,
          popularity: 67_800, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "YungJeff",
      link: "https://twitter.com/YUNGJEFF",
      date: new Date("2023-04-04"),
      videoId: "BXOEWQZ8C_Y",
      creators: [
        {
          name: "YungJeff",
          image: yungJeff,
          popularity: 40_000, // Twitter followers, 2024-10-4
        },
      ],
    },
    {
      name: "PointCrow",
      link: "https://www.twitch.tv/pointcrow",
      date: new Date("2023-03-24"),
      videoId: "FhmkQkbV42U",
      vodId: "Qz1Iniho9-g",
      creators: [
        {
          name: "PointCrow",
          image: pointCrow,
          popularity: 2_360_000, // YouTube subscribers, 2024-10-4
        },
      ],
    },
    {
      name: "Russel",
      link: "https://www.twitch.tv/russel",
      date: new Date("2023-03-20"),
      videoId: "Xizgus_phn4",
      vodId: "OUaYjkkLeFQ",
      creators: [
        {
          name: "Russel",
          image: russel,
          popularity: 195_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Ludwig",
      link: "https://www.youtube.com/@ludwig",
      date: new Date("2023-02-25"),
      videoId: "po1jytjDu4E",
      vodId: "vuLMTU8QHAU",
      creators: [
        {
          name: "Ludwig",
          image: ludwig,
          popularity: 6_290_000, // YouTube subscribers, 2024-10-4
        },
      ],
    },
    {
      name: "Alinity",
      link: "https://www.twitch.tv/alinity",
      date: new Date("2023-02-09"),
      videoId: "bak3RqjCzE0",
      vodId: "XHTEs94Cf4s",
      creators: [
        {
          name: "Alinity",
          image: alinity,
          popularity: 1_500_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "ConnorEatsPants",
      link: "https://www.twitch.tv/connoreatspants",
      date: new Date("2023-01-25"),
      videoId: "nC8qlK3k96Q",
      vodId: "SMEyEfVlzlM",
      creators: [
        {
          name: "ConnorEatsPants",
          image: connorEatsPants,
          popularity: 696_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "The Botez Sisters",
      link: "https://www.twitch.tv/botezlive",
      date: new Date("2022-08-30"),
      videoId: "QgvNy11kU6E",
      creators: [
        {
          name: "The Botez Sisters",
          image: botzSisters,
          popularity: 1_300_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "Knut",
      link: "https://www.twitch.tv/knut",
      date: new Date("2022-08-09"),
      videoId: "lFhFx6kf2E4",
      creators: [
        {
          name: "Knut",
          image: knut,
          popularity: 412_000, // Twitch followers, 2024-10-4
        },
      ],
    },
    {
      name: "MoistCr1TiKaL",
      link: "https://www.twitch.tv/moistcr1tikal",
      date: new Date("2022-04-30"),
      videoId: "pb7MR59s1Z0",
      vodId: "f3jD-cGA-Ds",
      creators: [
        {
          name: "MoistCr1TiKaL",
          image: moistCr1TiKaL,
          popularity: 16_000_000, // YouTube subscribers, 2024-10-4
        },
      ],
    },
    {
      name: "Jack Manifold",
      link: "https://www.twitch.tv/jackmanifoldtv",
      date: new Date("2022-04-21"),
      videoId: "jzyxhnODe2g",
      creators: [], // Jack has a more recent collaboration
    },
  ] as const satisfies Omit<Collaboration, "slug">[]
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

import type { ImageProps } from "next/image"

import stompyImage1 from "../assets/ambassadors/stompy/01.jpg"
import georgieImage1 from "../assets/ambassadors/georgie/01.jpg"
import ticoImage1 from "../assets/ambassadors/tico/01.jpg"
import mileyImage1 from "../assets/ambassadors/miley/01.jpg"
import miaImage1 from "../assets/ambassadors/mia/01.jpg"
import sirenImage1 from "../assets/ambassadors/siren/01.jpg"
import abbottImage1 from "../assets/ambassadors/abbott/01.png"
import coconutImage1 from "../assets/ambassadors/coconut/01.png"
import oliverImage1 from "../assets/ambassadors/oliver/01.jpg"
import nuggetImage1 from "../assets/ambassadors/nugget/01.jpg"
import henriettaImage1 from "../assets/ambassadors/henrietta/01.jpg"
import henriqueImage1 from "../assets/ambassadors/henrique/01.jpg"
import noodleImage1 from "../assets/ambassadors/noodle/01.jpg"
import patchyImage1 from "../assets/ambassadors/patchy/01.png"
import fennImage1 from "../assets/ambassadors/fenn/01.jpg"
import reedImage1 from "../assets/ambassadors/reed/01.jpg"
import serranoImage1 from "../assets/ambassadors/serrano/01.jpg"
import jalapenoImage1 from "../assets/ambassadors/jalapeno/01.jpg"
import snorkImage1 from "../assets/ambassadors/snork/01.jpg"
import moominImage1 from "../assets/ambassadors/moomin/01.jpg"
import winnieImage1 from "../assets/ambassadors/winnie/01.jpg"
import hankImage1 from "../assets/ambassadors/hank/01.jpg"
import cockroachesImage1 from "../assets/ambassadors/cockroaches/01.jpg"
import martyImage1 from "../assets/ambassadors/marty/01.jpg"
import duckyImage1 from "../assets/ambassadors/ducky/01.jpg"
import bbImage1 from "../assets/ambassadors/bb/01.jpg"
import toasterImage1 from "../assets/ambassadors/toaster/01.jpg"
import tortelliniImage1 from "../assets/ambassadors/tortellini/01.jpg"
import puppyImage1 from "../assets/ambassadors/puppy/01.jpg"
import chipsImage1 from "../assets/ambassadors/chips/01.jpg"
import nillaImage1 from "../assets/ambassadors/nilla/01.jpg"
import momoImage1 from "../assets/ambassadors/momo/01.jpg"
import appaImage1 from "../assets/ambassadors/appa/01.jpg"

type OneToNine = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type ZeroToNine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type DateStringYear = `19${ZeroToNine}${ZeroToNine}` | `20${ZeroToNine}${ZeroToNine}`
type DateStringMonth = `0${OneToNine}` | `1${0 | 1 | 2}`
type DateStringYearMonth = `${DateStringYear}-${DateStringMonth}`
type DateStringDay = `${0}${OneToNine}` | `${1 | 2}${ZeroToNine}` | `3${0 | 1}`
type DateString = `${DateStringYearMonth}-${DateStringDay}`

export const iucnStatuses = {
  EX: "Extinct",
  EW: "Extinct in the Wild",
  CR: "Critically Endangered",
  EN: "Endangered",
  VU: "Vulnerable",
  NT: "Near Threatened",
  LC: "Least Concern",
  DD: "Data Deficient",
  NE: "Not Evaluated",
};

export const iucnFlags = {
  decreasing: "with decreasing population trend",
};

type IUCNStatuses = keyof typeof iucnStatuses
type ICUNFlags = keyof typeof iucnFlags
type IUCNStatus = IUCNStatuses | `${IUCNStatuses}/${ICUNFlags}`

type Image = { src: ImageProps["src"], alt: string }

type Nullable<T> = T | null

export type Ambassador = {
  name: string
  species: string
  scientific: string
  sex: Nullable<"Male" | "Female">
  birth: Nullable<DateStringYear | DateStringYearMonth | DateString>
  arrival: Nullable<DateStringYear | DateStringYearMonth | DateString>
  iucn: IUCNStatus
  story: string
  mission: string
  images: [Image, ...Image[]]
  homepage: Nullable<{ title: string, description: string }>
};

const ambassadors: Record<string, Ambassador> = {
  stompy: {
    name: "Stompy",
    species: "Emu",
    scientific: "Dromaius novaehollandiae",
    sex: "Male",
    birth: "2021-02-14",
    arrival: "2021-04",
    iucn: "LC",
    story: "Stompy was hatched in captivity and Maya hand was raised to be the first Alveus ambassador.",
    mission: "Stopping exotic meat trade, traditional medicine, and over exploitation of animal products in cosmetics.",
    images: [
      { src: stompyImage1, alt: "Stompy the Emu" },
    ],
    homepage: {
      title: "Stompy!",
      description: "He is an ambassador for how the exotic meat trade & use of animal products in cosmetics has affected his species and many others.",
    },
  },
  georgie: {
    name: "Georgie",
    species: "African Bullfrog",
    scientific: "Pyxicephalus adspersus",
    sex: "Male",
    birth: "2021",
    arrival: "2021-04",
    iucn: "LC/decreasing",
    story: "Georgie was part of an educational program at a zoo and was rehomed to Alveus.",
    mission: "He is an ambassador for the wildlife trade and how chytrid fungus is affecting amphibian species worldwide.",
    images: [
      { src: georgieImage1, alt: "Georgie the African Bullfrog" },
    ],
    homepage: {
      title: "Georgie!",
      description: "He is here to teach all about threats to his species and to amphibians worldwide.",
    },
  },
  tico: {
    name: "Tico",
    species: "Blue and Gold Macaw",
    scientific: "Ara ararauna",
    sex: "Female",
    birth: null,
    arrival: "2021-04",
    iucn: "LC/decreasing",
    story: "Tico was rehomed to Alveus as the previous sanctuary’s owner was retiring,",
    mission: "She is an ambassador for how the pet trade has affected her parrot species and many others around the world.",
    images: [
      { src: ticoImage1, alt: "Tico the Blue and Gold Macaw" },
    ],
    homepage: null,
  },
  miley: {
    name: "Miley",
    species: "Catalina Macaw",
    scientific: "Ara ararauna x Ara macao",
    sex: "Female",
    birth: null,
    arrival: "2021-04",
    iucn: "NE",
    story: "Miley was rehomed to Alveus as the previous sanctuary’s owner was retiring.",
    mission: "She is an ambassador for how the pet trade has affected her parrot species and many others around the world.",
    images: [
      { src: mileyImage1, alt: "Miley the Catalina Macaw" },
    ],
    homepage: null,
  },
  mia: {
    name: "Mia",
    species: "African Grey",
    scientific: "Psittacus erithacus",
    sex: "Female",
    birth: null,
    arrival: "2021-04",
    iucn: "EN/decreasing",
    story: "Mia was rehomed to Alveus as the previous sanctuary’s owner was retiring.",
    mission: "She is an ambassador for how the pet trade has affected her parrot species and many others around the world.",
    images: [
      { src: miaImage1, alt: "Mia the African Grey" },
    ],
    homepage: null,
  },
  siren: {
    name: "Siren",
    species: "Blue-fronted Amazon",
    scientific: "Amazona aestiva",
    sex: "Female",
    birth: null,
    arrival: "2021-04",
    iucn: "LC",
    story: "Siren was rehomed to Alveus as the previous sanctuary’s owner was retiring.",
    mission: "She is an ambassador for how the pet trade has affected her parrot species and many others around the world.",
    images: [
      { src: sirenImage1, alt: "Siren the Blue-fronted Amazon" },
    ],
    homepage: null,
  },
  abbott: {
    name: "Abbott",
    species: "American Crow",
    scientific: "Corvus brachyrhynchos",
    sex: "Male",
    birth: "2021",
    arrival: "2021-08",
    iucn: "LC",
    story: "Abbott was brought into a wildlife rehab center as a baby. He imprinted during the rehab process and then was deemed non-releasable.",
    mission: "He is an ambassador for educating people on the misconceptions that wildlife face as well as human-wildlife conflict.",
    images: [
      { src: abbottImage1, alt: "Abbott the American Crow" },
    ],
    homepage: null,
  },
  coconut: {
    name: "Coconut",
    species: "American Crow",
    scientific: "Corvus brachyrhynchos",
    sex: "Male",
    birth: "2021",
    arrival: "2021-08",
    iucn: "LC",
    story: "Coconut was brought into a wildlife rehab center as a baby. He imprinted during the rehab process and then was deemed non-releasable.",
    mission: "He is an ambassador for educating people on the misconceptions that wildlife face as well as human-wildlife conflict.",
    images: [
      { src: coconutImage1, alt: "Coconut the American Crow" },
    ],
    homepage: null,
  },
  oliver: {
    name: "Oliver",
    species: "Olive Egger Chicken",
    scientific: "Gallus gallus domesticus",
    sex: "Male",
    birth: "2022",
    arrival: "2022-05",
    iucn: "NE",
    story: "Oliver was put in the reject/return cage at a local feed store.",
    mission: "He is an ambassador for the agricultural industry and how people can use consumer choice to impact the environment in a positive way.",
    images: [
      { src: oliverImage1, alt: "Oliver the Olive Egger Chicken" },
    ],
    homepage: null,
  },
  nugget: {
    name: "Nugget",
    species: "Ameraucana Chicken",
    scientific: "Gallus gallus domesticus",
    sex: "Female",
    birth: "2019",
    arrival: "2021-04",
    iucn: "NE",
    story: "Nugget was rehomed to Alveus because she was bullied by hens in her previous flock.",
    mission: "She is an ambassador for the agricultural industry and how people can use consumer choice to impact the environment in a positive way.",
    images: [
      { src: nuggetImage1, alt: "Nugget the Ameraucana Chicken" },
    ],
    homepage: null,
  },
  henrietta: {
    name: "Henrietta",
    species: "Jersey Giant Chicken",
    scientific: "Gallus gallus domesticus",
    sex: "Female",
    birth: "2019",
    arrival: null,
    iucn: "NE",
    story: "Henrietta was rehomed from a local farm.",
    mission: "She is an ambassador for the agricultural industry and how people can use consumer choice to impact the environment in a positive way.",
    images: [
      { src: henriettaImage1, alt: "Henrietta the Jersey Giant Chicken" },
    ],
    homepage: null,
  },
  henrique: {
    name: "Henrique",
    species: "Half Dark Brahma, Half Saipan Chicken",
    scientific: "Gallus gallus domesticus",
    sex: "Female",
    birth: "2020",
    arrival: null,
    iucn: "NE",
    story: "Henrique was rehomed from a local farm.",
    mission: "She is an ambassador for the agricultural industry and how people can use consumer choice to impact the environment in a positive way.",
    images: [
      { src: henriqueImage1, alt: "Henrique the Half Drak Brahma, Half Saipan Chicken" },
    ],
    homepage: null,
  },
  noodle: {
    name: "Noodle",
    species: "Carpet Python",
    scientific: "M. spilota mcdowelli",
    sex: "Female",
    birth: null,
    arrival: "2021-04",
    iucn: "LC/decreasing",
    story: "Noodle was part of an educational program at a zoo and was rehomed to Alveus.",
    mission: "She is an ambassador for how the pet trade and habitat loss has affected hers and many other reptile species worldwide.",
    images: [
      { src: noodleImage1, alt: "Noodle the Carpet Python" },
    ],
    homepage: null,
  },
  patchy: {
    name: "Patchy",
    species: "Ball Python",
    scientific: "Python regius",
    sex: "Male",
    birth: "2021-08-15",
    arrival: "2021-10",
    iucn: "NT/decreasing",
    story: "Patchy was rehomed to Alveus from a local breeder after it was discovered that he had a genetic defect and was missing an eye.",
    mission: "He is an ambassador for how the pet trade and habitat loss has affected his and many other reptile species worldwide.",
    images: [
      { src: patchyImage1, alt: "Patchy the Ball Python" },
    ],
    homepage: null,
  },
  fenn: {
    name: "Fenn",
    species: "European Red Fox",
    scientific: "Vulpes vulpes",
    sex: "Male",
    birth: "2020",
    arrival: "2022-11",
    iucn: "LC",
    story: "Fenn was confiscated from the illegal pet trade by California Department of Fish and Wildlife. He was then rehomed to Alveus.",
    mission: "He is an ambassador for the exploitation of wildlife in the pet trade and the fur trade.",
    images: [
      { src: fennImage1, alt: "Fenn the European Red Fox" },
    ],
    homepage: null,
  },
  reed: {
    name: "Reed",
    species: "European Red Fox",
    scientific: "Vulpes vulpes",
    sex: "Male",
    birth: "2019",
    arrival: "2022-11",
    iucn: "LC",
    story: "Reed was orphaned as a wild kit and was rescued to be raised at a zoo to be an educational ambassador. He was then rehomed to Alveus.",
    mission: "He is an ambassador for the exploitation of wildlife in the pet trade and the fur trade.",
    images: [
      { src: reedImage1, alt: "Reed the European Red Fox" },
    ],
    homepage: null,
  },
  serrano: {
    name: "Serrano",
    species: "Domestic Donkey",
    scientific: "Equus africanus asinus",
    sex: "Male",
    birth: null,
    arrival: "2021-05",
    iucn: "NE",
    story: "Rehomed to Alveus from a local equine rescue.",
    mission: "Serrano is an ambassador for the wildlife trade and use of wild animals in traditional medicine.",
    images: [
      { src: serranoImage1, alt: "Serrano the Domestic Donkey" },
    ],
    homepage: null,
  },
  jalapeno: {
    name: "Jalapeño",
    species: "Domestic Donkey",
    scientific: "Equus africanus asinus",
    sex: "Male",
    birth: null,
    arrival: "2021-05",
    iucn: "NE",
    story: "Rehomed to Alveus from a local equine rescue.",
    mission: "Jalapeño is an ambassador for the wildlife trade and use of wild animals in traditional medicine.",
    images: [
      { src: jalapenoImage1, alt: "Jalapeño the Domestic Donkey" },
    ],
    homepage: null,
  },
  snork: {
    name: "Snork",
    species: "Chinchilla",
    scientific: "Chinchilla lanigera",
    sex: "Female",
    birth: "2021",
    arrival: "2021-04",
    iucn: "EN/decreasing",
    story: "Snork was part of an educational program at a zoo and was rehomed to Alveus.",
    mission: "She is an ambassador for the exploitation of wildlife in the fur trade.",
    images: [
      { src: snorkImage1, alt: "Snork the Chinchilla" },
    ],
    homepage: null,
  },
  moomin: {
    name: "Moomin",
    species: "Chinchilla",
    scientific: "Chinchilla lanigera",
    sex: "Male",
    birth: "2017",
    arrival: "2021-04",
    iucn: "EN/decreasing",
    story: "Rehomed from a local pet owner.",
    mission: "He is an ambassador for the exploitation of wildlife in the fur trade.",
    images: [
      { src: moominImage1, alt: "Moomin the Chinchilla" },
    ],
    homepage: {
      title: "Moomin is Movin' In!",
      description: "He is an ambassador for how the fur trade has affected his species and many others.",
    },
  },
  winnieTheMoo: {
    name: "Winnie (The Moo)",
    species: "Red Angus Beef Cow",
    scientific: "Bos (primigenius) taurus",
    sex: "Female",
    birth: "2022-03-22",
    arrival: "2022-04",
    iucn: "NE",
    story: "Winnie came from a cattle operation in Oklahoma.",
    mission: "She is an ambassador for the beef industry and how people can use their consumer choice to impact the environment in a positive way.",
    images: [
      { src: winnieImage1, alt: "Winnie the Red Angus Beef Cow" },
    ],
    homepage: null,
  },
  hankMrMctrain: {
    name: "Hank (The Tank) Mr. McTrain",
    species: "Smokey Ghost Millipede",
    scientific: "Narceus gordanus",
    sex: "Male",
    birth: "2022",
    arrival: "2022-01",
    iucn: "NE",
    story: "Our smokey ghost millipede was born in captivity and ethically sourced.",
    mission: "He is an ambassador for the importance of invertebrates and the misconceptions they face.",
    images: [
      { src: hankImage1, alt: "Hank the Smokey Ghost Millipede" },
    ],
    homepage: null,
  },
  barbaraBakedBean: {
    name: "Barbara / Baked Bean",
    species: "Madagascar Hissing Cockroaches",
    scientific: "Gromphadorhina portentosa",
    sex: null,
    birth: "2022",
    arrival: "2022-01",
    iucn: "NE",
    story: "Our cockroach colony was started with 7 roaches that were part of an educational colony at a school in Pennsylvania.",
    mission: "They are ambassadors for the importance of invertebrates and the misconceptions they face.",
    images: [
      { src: cockroachesImage1, alt: "Barbara the Madagascar Hissing Cockroach" },
    ],
    homepage: null,
  },
  marty: {
    name: "Marty",
    species: "Zebra Isopods",
    scientific: "Armadillidium maculatum",
    sex: null,
    birth: "2022",
    arrival: "2022-01",
    iucn: "NE",
    story: "Our zebra isopods were born in captivity and ethically sourced.",
    mission: "They are ambassadors for the importance of invertebrates and the misconceptions they face.",
    images: [
      { src: martyImage1, alt: "Marty the Zebra Isopods" },
    ],
    homepage: null,
  },
  ducky: {
    name: "Ducky",
    species: "Rubber Ducky Isopods",
    scientific: "Cubaris sp.",
    sex: null,
    birth: "2022",
    arrival: "2022-01",
    iucn: "NE",
    story: "Our rubber ducky isopods were born in captivity and ethically sourced.",
    mission: "They are ambassadors for the importance of invertebrates and the misconceptions they face.",
    images: [
      { src: duckyImage1, alt: "Ducky the Rubber Ducky Isopods" },
    ],
    homepage: null,
  },
  bb: {
    name: "BB",
    species: "Spanish Orange Isopods",
    scientific: "Porcellio scaber",
    sex: null,
    birth: "2022",
    arrival: "2022-01",
    iucn: "NE",
    story: "Our powder orange isopods were born in captivity and ethically sourced.",
    mission: "They are ambassadors for the importance of invertebrates and the misconceptions they face.",
    images: [
      { src: bbImage1, alt: "BB the Spanish Orange Isopods" },
    ],
    homepage: null,
  },
  toasterStrudel: {
    name: "Toaster Strudel",
    species: "Blue-tounged Skink",
    scientific: "Tiliqua scincoides intermedia",
    sex: "Male",
    birth: "2022-07-04",
    arrival: "2022-11",
    iucn: "LC",
    story: "Toaster Strudel was part of an educational program at a zoo and was rehomed to Alveus.",
    mission: "He is an ambassador for how human development and invasive species can affect natural habitats and native species.",
    images: [
      { src: toasterImage1, alt: "Toaster Strudel the Blue-tounged Skink" },
    ],
    homepage: null,
  },
  tortellini: {
    name: "Tortellini",
    species: "Emperor Scorpion",
    scientific: "Pandinus imperator",
    sex: "Male",
    birth: "2022-10-01",
    arrival: "2022-11",
    iucn: "NE",
    story: "Our emperor scorpions were born in captivity and ethically sourced.",
    mission: "He is an ambassador for the importance of invertebrates and the misconceptions they face.",
    images: [
      { src: tortelliniImage1, alt: "Tortellini the Emperor Scorpion" },
    ],
    homepage: null,
  },
  puppy: {
    name: "Puppy",
    species: "Emperor Scorpion",
    scientific: "Pandinus imperator",
    sex: "Male",
    birth: "2022-10-01",
    arrival: "2022-11",
    iucn: "NE",
    story: "Our emperor scorpions were born in captivity and ethically sourced.",
    mission: "He is an ambassador for the importance of invertebrates and the misconceptions they face.",
    images: [
      { src: puppyImage1, alt: "Puppy the Emperor Scorpion" },
    ],
    homepage: null,
  },
  chipsAhoy: {
    name: "Chips Ahoy",
    species: "Rat",
    scientific: "Rattus norvegicus",
    sex: "Female",
    birth: null,
    arrival: "2022-12",
    iucn: "NE",
    story: "Chips Ahoy was bred as a feeder rat for snakes, but she will now live out her full life at Alveus.",
    mission: "She is an ambassadors for how rodenticide use and outdoor cats affect all levels of wildlife.",
    images: [
      { src: chipsImage1, alt: "Chips Ahoy the Rat" },
    ],
    homepage: null,
  },
  nillaWafer: {
    name: "Nilla Wafer",
    species: "Rat",
    scientific: "Rattus norvegicus",
    sex: "Female",
    birth: null,
    arrival: "2022-12",
    iucn: "NE",
    story: "Nilla Wafer was bred as a feeder rat for snakes, but she will now live out her full life at Alveus.",
    mission: "She is an ambassadors for how rodenticide use and outdoor cats affect all levels of wildlife.",
    images: [
      { src: nillaImage1, alt: "Nilla Wafer the Rat" },
    ],
    homepage: null,
  },
  momo: {
    name: "Momo",
    species: "Black Tufted Marmoset",
    scientific: "Callithrix penicillata",
    sex: "Male",
    birth: null,
    arrival: "2022-12",
    iucn: "LC",
    story: "Momo was rescued by Alveus after being surrendered to a veterinarian due to neglect.",
    mission: "He is an ambassador for the exotic pet trade and how it affects primate species worldwide.",
    images: [
      { src: momoImage1, alt: "Momo the Black Tufted Marmoset" },
    ],
    homepage: null,
  },
  appa: {
    name: "Appa",
    species: "Common Marmoset",
    scientific: "Callithrix jacchus",
    sex: "Male",
    birth: null,
    arrival: "2022-12",
    iucn: "LC",
    story: "Appa was rescued by Alveus after being surrendered to a veterinarian due to neglect.",
    mission: "He is an ambassador for the exotic pet trade and how it affects primate species worldwide.",
    images: [
      { src: appaImage1, alt: "Appa the Common Marmoset" },
    ],
    homepage: null,
  },
};

export default ambassadors;

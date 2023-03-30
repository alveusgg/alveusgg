import { isAmbassadorKey, type AmbassadorKey } from "@/data/ambassadors";

export type AnimalQuest = {
  link: string;
  edition: string;
  broadcast: Date;
  ambassadors: Readonly<AmbassadorKey[]>;
};

const animalQuest: Readonly<AnimalQuest[]> = [
  {
    link: "https://www.twitch.tv/videos/1122488911?t=00h02m03s",
    edition: "Chicken Edition",
    broadcast: new Date("2021-08-16"),
    ambassadors: ["oliver", "nugget", "henrique"],
  },
  {
    link: "https://www.twitch.tv/videos/1180894968?t=00h00m27s",
    edition: "Emu Edition",
    broadcast: new Date("2021-10-18"),
    ambassadors: ["stompy"],
  },
  {
    link: "https://www.twitch.tv/videos/1226537529?t=00h00m21s",
    edition: "Snake Edition",
    broadcast: new Date("2021-12-06"),
    ambassadors: ["noodle", "patchy"],
  },
  {
    link: "https://www.twitch.tv/videos/1252271923?t=00h00m59s",
    edition: "African Bullfrog Edition",
    broadcast: new Date("2022-01-03"),
    ambassadors: ["georgie"],
  },
  {
    link: "https://www.twitch.tv/videos/1290623454?t=00h03m48s",
    edition: "Donkey Edition",
    broadcast: new Date("2022-02-07"),
    ambassadors: ["serrano", "jalapeno"],
  },
  {
    link: "https://www.twitch.tv/videos/1421096536?t=00h03m29s",
    edition: "Falcon Edition",
    broadcast: new Date("2022-03-07"),
    ambassadors: [],
  },
  {
    link: "https://www.twitch.tv/videos/1456976498?t=00h00m22s",
    edition: "Blue-fronted Amazon Edition",
    broadcast: new Date("2022-04-15"),
    ambassadors: ["siren"],
  },
  {
    link: "https://www.twitch.tv/videos/1311168738?t=00h04m48s",
    edition: "African Grey Edition",
    broadcast: new Date("2022-05-27"),
    ambassadors: ["mia"],
  },
  {
    link: "https://www.twitch.tv/videos/1517729157?t=00h04m26s",
    edition: "Blue and Gold Macaw Edition",
    broadcast: new Date("2022-06-29"),
    ambassadors: ["tico"],
  },
  {
    link: "https://www.twitch.tv/videos/1551847402?t=00h04m50s",
    edition: "Catalina Macaw Edition",
    broadcast: new Date("2022-07-29"),
    ambassadors: ["miley"],
  },
  {
    link: "https://www.twitch.tv/videos/1579522727?t=00h06m10s",
    edition: "Chinchilla Edition",
    broadcast: new Date("2022-08-31"),
    ambassadors: ["snork", "moomin"],
  },
  {
    link: "https://www.twitch.tv/videos/1732218911?t=00h15m24s",
    edition: "Crow Edition",
    broadcast: new Date("2023-01-04"),
    ambassadors: ["abbott", "coconut"],
  },
  {
    link: "https://www.twitch.tv/videos/1732218911?t=00h15m24s",
    edition: "Blue-tounged Skink Edition",
    broadcast: new Date("2023-01-31"),
    ambassadors: ["toasterStrudel"],
  },
  {
    link: "https://www.twitch.tv/videos/1778305921?t=00h01m44s",
    edition: "Madagascar Hissing Cockroach Edition",
    broadcast: new Date("2023-03-28"),
    ambassadors: ["barbaraBakedBean"],
  },
] as const;

export type AnimalQuestWithEpisode = AnimalQuest & {
  episode: number;
};

export const getAmbassadorEpisode = (
  ambassador: AmbassadorKey | string
): AnimalQuestWithEpisode | undefined => {
  if (!isAmbassadorKey(ambassador)) return undefined;

  for (const [index, quest] of animalQuest.entries()) {
    if (quest.ambassadors.includes(ambassador)) {
      return { ...quest, episode: index + 1 };
    }
  }
};

export default animalQuest;

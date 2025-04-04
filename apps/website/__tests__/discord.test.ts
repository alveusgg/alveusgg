import { expect, test } from "vitest";

import { escapeLinksForDiscord } from "@/utils/escape-links-for-discord";

test("wrapping fully qualified urls", async () => {
  const example = "https://google.com";
  const expected = "<https://google.com>";
  const res = escapeLinksForDiscord(example);

  expect(res).toEqual(expected);
});

test("wrapping multiple qualified urls", async () => {
  const example =
    "http://twitch.tv/alveussanctuary, https://x.com/AlveusSanctuary, https://youtube.com/@AlveusSanctuary";
  const expected =
    "<http://twitch.tv/alveussanctuary>, <https://x.com/AlveusSanctuary>, <https://youtube.com/@AlveusSanctuary>";

  const res = escapeLinksForDiscord(example);

  expect(res).toEqual(expected);
});

test("not wrapping partial urls", async () => {
  const example = "twitch.tv/alveussanctuary";
  const expected = "twitch.tv/alveussanctuary";

  const res = escapeLinksForDiscord(example);

  expect(res).toEqual(expected);
});

test("not wrapping multiple partial urls", async () => {
  const example =
    "twitch.tv/alveussanctuary, x.com/AlveusSanctuary, youtube.com/@AlveusSanctuary";
  const expected =
    "twitch.tv/alveussanctuary, x.com/AlveusSanctuary, youtube.com/@AlveusSanctuary";

  const res = escapeLinksForDiscord(example);

  expect(res).toEqual(expected);
});

test("full message example", async () => {
  const example =
    "We're live at https://twitch.tv/alveussanctuary! Georgie is a big cutie!";
  const expected =
    "We're live at <https://twitch.tv/alveussanctuary>! Georgie is a big cutie!";

  const res = escapeLinksForDiscord(example);

  expect(res).toEqual(expected);
});

test("full stop false", async () => {
  const example = "...beautiful day.we're live at";
  const expected = "...beautiful day.we're live at";

  const res = escapeLinksForDiscord(example);

  expect(res).toEqual(expected);
});

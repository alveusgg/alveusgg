import { z } from "zod";

/** Passed through as-is, for the control API to accept or reject */
export const Camera = z.string().describe("camera:string");

export const Numeric = (name: string) =>
  z.string().min(1).pipe(z.coerce.number<string>()).describe(`${name}:number`);

export const PresetName = (name = "preset") =>
  z.string().toLowerCase().describe(`${name}:string`);

const ON = ["on", "1", "yes"];
const OFF = ["off", "0", "no"];

/** "on"/"off", also accepting the legacy "1"/"0" and "yes"/"no" */
export const Toggle = (name = "mode") =>
  z
    .string()
    .toLowerCase()
    .transform((value, ctx) => {
      if (ON.includes(value)) return "on" as const;
      if (OFF.includes(value)) return "off" as const;
      ctx.addIssue({ code: "custom", message: `Expected on or off` });
      return z.NEVER;
    })
    .describe(`${name}:'on'|'off'`);

/**
 * Durations like "30s", "10m", "1h30m", in seconds. Like the legacy chatbot, a
 * bare number isn't treated as a duration.
 */
export const parseDuration = (value: string) => {
  const match =
    /^(?:(\d+)h(?:ours?|rs?)?)?(?:(\d+)m(?:in(?:ute)?s?)?)?(?:(\d+)s(?:ec(?:ond)?s?)?)?$/i.exec(
      value,
    );
  if (!match || !(match[1] || match[2] || match[3])) return undefined;
  const [, hours = 0, minutes = 0, seconds = 0] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
};

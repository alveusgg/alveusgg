interface BaseArgument {
  name: string;
  required: boolean;
  variadic: boolean;
  prefix?: string;
  suffix?: string;
}

export interface SimpleArgument extends BaseArgument {
  type: "string" | "number";
}

export interface ChoiceArgument extends BaseArgument {
  type: "choice";
  choices: string[];
}

export type Argument = SimpleArgument | ChoiceArgument;
export const isArgument = (arg: unknown): arg is Argument =>
  typeof arg === "object" &&
  arg !== null &&
  "type" in arg &&
  "name" in arg &&
  "required" in arg &&
  "variadic" in arg;

export type Arguments = [Argument, ...Argument[]];
export const isArguments = (args: unknown): args is Arguments =>
  Array.isArray(args) && args.length >= 1 && args.every(isArgument);

export type OverloadedArguments =
  | [Arguments, Arguments, ...Arguments[]]
  | [Arguments, ...Arguments[], []];
export const isOverloadedArguments = (
  args: unknown,
): args is OverloadedArguments =>
  Array.isArray(args) &&
  args.length >= 2 &&
  args.every(
    (arg, idx) =>
      isArguments(arg) || (idx === args.length - 1 && arg.length === 0),
  );

export interface Command {
  description: string;
  category: CommandCategoryId;
  args: [] | Arguments | OverloadedArguments;
}

export type CommandCategoryId = keyof typeof commandCategories;

export interface CommandCategory {
  heading: string;
}

export const commandCategories = {
  Example: {
    heading: "Example",
  },
  PTZ: {
    heading: "PTZ (Pan, Tilt, Zoom)",
  },
  IR: {
    heading: "IR (Infrared)",
  },
  Focus: {
    heading: "Focus",
  },
  Presets: {
    heading: "Presets",
  },
  Audio: {
    heading: "Audio",
  },
  Scenes: {
    heading: "Scenes",
  },
  Sources: {
    heading: "Sources",
  },
  Text: {
    heading: "Text",
  },
  Wheel: {
    heading: "Wheel",
  },
  Notify: {
    heading: "Notify",
  },
  Rounds: {
    heading: "Daily Rounds",
  },
  Feeder: {
    heading: "Feeder",
  },
  Access: {
    heading: "Access Controls",
  },
} as const satisfies Record<string, CommandCategory>;

const commands = {
  /**
   * PTZ
   */
  ptzpan: {
    description: "Change relative pan position",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "angle",
        required: true,
        variadic: false,
      },
    ],
  },
  ptztilt: {
    description: "Change relative tilt position",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "angle",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzzoom: {
    description:
      "Change the relative zoom level of a camera (greater than 100 zooms in, less than 100 zooms out)",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "zoom",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzset: {
    description: "Change relative pan/tilt/zoom combination",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "pan",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "tilt",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "zoom",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzseta: {
    description:
      "Change absolute pan/tilt/zoom, control auto-focus (if supported), change absolute focus (if supported)",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "pan",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "tilt",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "zoom",
        required: true,
        variadic: false,
      },
      {
        name: "mode",
        type: "choice",
        required: false,
        variadic: false,
        choices: ["on", "off"],
      },
      {
        type: "number",
        name: "focus",
        required: false,
        variadic: false,
      },
    ],
  },
  ptzgetinfo: {
    description: "Get current pan/tilt/zoom, auto-focus state and focus",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzmove: {
    description: "Move in a direction",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "choice",
        name: "direction",
        required: true,
        variadic: false,
        choices: [
          "up",
          "down",
          "left",
          "right",
          "upleft",
          "upright",
          "downleft",
          "downright",
        ],
      },
    ],
  },
  ptzspin: {
    description: "Continuous pan/tilt/zoom",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "pan",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "tilt",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "zoom",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzcenter: {
    description: "Center on positions x and y",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "x",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "y",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "zoom",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzclick: {
    description:
      "Move the PTZ camera to a specific location based on your click",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "x",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "y",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "zoom",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzareazoom: {
    description: "Center and zoom on position x and y",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "x",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "y",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "zoom",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzspeed: {
    description: "Change absolute movement speed",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "speed",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzgetspeed: {
    description: "Get absolute movement speed",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
    ],
  },
  ptztracking: {
    description: "Control auto-tracking (if supported)",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "choice",
        name: "mode",
        required: true,
        variadic: false,
        choices: ["on", "off"],
      },
    ],
  },
  ptzdry: {
    description: "Trigger quick dry (if supported)",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
    ],
  },

  /**
   * IR
   */
  ptzir: {
    description: "Control IR sensor/filter (if supported)",
    category: "IR",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "choice",
        name: "mode",
        required: true,
        variadic: false,
        choices: ["on", "off", "auto"],
      },
    ],
  },
  ptzirlight: {
    description: "Control built-in IR light (if supported)",
    category: "IR",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "choice",
        name: "mode",
        required: true,
        variadic: false,
        choices: ["on", "off"],
      },
    ],
  },

  /**
   * Focus
   */
  ptzfocus: {
    description:
      "Change the relative focus distance of a camera (-9999 to 9999)",
    category: "Focus",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "focus",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzfocusa: {
    description: "Set the absolute focus distance of a camera (0 to 9999)",
    category: "Focus",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "focus",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzcfocus: {
    description:
      "Continuous focus change, -100 to 100, 0 means stop (if supported)",
    category: "Focus",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "focus",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzgetfocus: {
    description: "Get current focus (if supported)",
    category: "Focus",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzautofocus: {
    description: "Control auto-focus (if supported)",
    category: "Focus",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        name: "mode",
        type: "choice",
        required: true,
        variadic: false,
        choices: ["on", "off"],
      },
    ],
  },

  /**
   * Presets
   */
  ptzhome: {
    description: "Move a camera to its home position",
    category: "Presets",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzload: {
    description: "Move a camera to a preset position",
    category: "Presets",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "string",
        name: "preset",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzsave: {
    description: "Save current position as a preset",
    category: "Presets",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "string",
        name: "preset",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzremove: {
    description: "Remove a preset position",
    category: "Presets",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "string",
        name: "preset",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzrename: {
    description: "Rename a preset position",
    category: "Presets",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "string",
        name: "old",
        required: true,
        variadic: false,
      },
      {
        type: "string",
        name: "new",
        required: true,
        variadic: false,
      },
    ],
  },
  ptzlist: {
    description:
      "Get all preset positions for a camera, or get the cameras on stream currently",
    category: "Presets",
    args: [
      {
        type: "string",
        name: "camera",
        required: false,
        variadic: false,
      },
    ],
  },
  ptzroam: {
    description: "Roam between multiple preset positions",
    category: "Presets",
    args: [
      [
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
        {
          type: "number",
          name: "seconds",
          required: true,
          variadic: false,
        },
        {
          type: "number",
          name: "speed",
          required: false,
          variadic: false,
        },
        {
          type: "string",
          name: "presets",
          required: true,
          variadic: true,
        },
      ],
      [
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
        {
          type: "choice",
          name: "mode",
          required: true,
          variadic: false,
          choices: ["on", "off"],
        },
      ],
    ],
  },

  /**
   * Audio
   */
  mute: {
    description: "Mute audio for a camera",
    category: "Audio",
    args: [
      [
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
      ],
      [
        {
          type: "choice",
          name: "all",
          required: true,
          variadic: false,
          choices: ["all"],
        },
      ],
      [],
    ],
  },
  unmute: {
    description: "Unmute audio for a camera",
    category: "Audio",
    args: [
      [
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
      ],
      [
        {
          type: "choice",
          name: "all",
          required: true,
          variadic: false,
          choices: ["all"],
        },
      ],
      [],
    ],
  },
  getvolume: {
    description: "Get volume for a camera",
    category: "Audio",
    args: [
      [
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
      ],
      [
        {
          type: "choice",
          name: "all",
          required: true,
          variadic: false,
          choices: ["all"],
        },
      ],
      [],
    ],
  },
  setvolume: {
    description: "Set volume for a camera",
    category: "Audio",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "number",
        name: "volume",
        required: true,
        variadic: false,
      },
    ],
  },
  resetvolume: {
    description: "Reset volumes for all cameras",
    category: "Audio",
    args: [],
  },
  mutemusic: {
    description: "Mute music",
    category: "Audio",
    args: [],
  },
  unmutemusic: {
    description: "Unmute music",
    category: "Audio",
    args: [],
  },
  musicvolume: {
    description: "Set music volume",
    category: "Audio",
    args: [
      {
        type: "number",
        name: "volume",
        required: true,
        variadic: false,
      },
    ],
  },
  nextsong: {
    description: "Skips music to the next song",
    category: "Audio",
    args: [],
  },

  /**
   * Scenes
   */
  customcams: {
    // TODO: Aliases of ccams, ccam
    description: "Set cameras to show in layout",
    category: "Scenes",
    args: [
      {
        type: "string",
        name: "cameras",
        required: true,
        variadic: true,
      },
    ],
  },
  customcamsbig: {
    // TODO: Aliases of ccamsbig, ccamb
    description: "Set cameras to show in layout, with the first being larger",
    category: "Scenes",
    args: [
      {
        type: "string",
        name: "cameras",
        required: true,
        variadic: true,
      },
    ],
  },
  camload: {
    description: "Load a preset camera layout",
    category: "Scenes",
    args: [
      {
        type: "string",
        name: "preset",
        required: true,
        variadic: false,
      },
    ],
  },
  camsave: {
    description: "Save a preset camera layout",
    category: "Scenes",
    args: [
      {
        type: "string",
        name: "preset",
        required: true,
        variadic: false,
      },
    ],
  },
  camlist: {
    description: "Get all preset camera layouts",
    category: "Scenes",
    args: [],
  },
  swap: {
    description: "Swap the layout of cameras currently on stream",
    category: "Scenes",
    args: [
      [
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
      ],
      [
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
        {
          type: "number",
          name: "position",
          required: true,
          variadic: false,
        },
      ],
      [
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
        {
          type: "choice",
          name: "blank",
          required: true,
          variadic: false,
          choices: ["blank"],
        },
      ],
      [
        {
          type: "number",
          name: "position",
          required: true,
          variadic: false,
        },
        {
          type: "number",
          name: "position",
          required: true,
          variadic: false,
        },
      ],
      [
        {
          type: "number",
          name: "position",
          required: true,
          variadic: false,
        },
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
      ],
      [
        {
          type: "number",
          name: "position",
          required: true,
          variadic: false,
        },
        {
          type: "choice",
          name: "blank",
          required: true,
          variadic: false,
          choices: ["blank"],
        },
      ],
      [],
    ],
  },
  piptl: {
    // TODO: Aliases of customcamstl, pipul, and variations thereof
    description:
      "Show two cameras, with the second picture-in-picture top-left",
    category: "Scenes",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
    ],
  },
  piptr: {
    description:
      "Show two cameras, with the second picture-in-picture top-right",
    category: "Scenes",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
    ],
  },
  pipbl: {
    description:
      "Show two cameras, with the second picture-in-picture bottom-left",
    category: "Scenes",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
    ],
  },
  pipbr: {
    description:
      "Show two cameras, with the second picture-in-picture bottom-right",
    category: "Scenes",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
    ],
  },
  showchat: {
    description: "Show Twitch chat overlay (if enabled in the scene)",
    category: "Scenes",
    args: [],
  },
  hidechat: {
    description: "Remove Twitch chat overlay",
    category: "Scenes",
    args: [],
  },
  raidvideo: {
    description: "Show the video to welcome a raid, generally for raids >50",
    category: "Scenes",
    args: [
      {
        type: "choice",
        name: "stop",
        required: false,
        variadic: false,
        choices: ["stop", "off"],
      },
    ],
  },
  crunchvideo: {
    description: "Show the stinger video for Push Pop's crunch cam",
    category: "Scenes",
    args: [
      {
        type: "choice",
        name: "stop",
        required: false,
        variadic: false,
        choices: ["stop", "off"],
      },
    ],
  },
  fix: {
    description: "Tries to fix the stream (used if stream PC/bot is down)",
    category: "Scenes",
    args: [],
  },
  ss: {
    description: "Switches to the provided scene",
    category: "Scenes",
    args: [
      {
        type: "choice",
        name: "scene",
        required: true,
        variadic: false,
        choices: ["server", "brb"],
      },
    ],
  },
  bitrate: {
    description: "Get the current bitrate",
    category: "Scenes",
    args: [],
  },

  /**
   * Sources
   */
  resetcam: {
    description: "Reset a camera feed source",
    category: "Sources",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
    ],
  },
  resetlivecams: {
    description: "Reset the camera layout source",
    category: "Sources",
    args: [],
  },
  resetbackpack: {
    description: "Reset the backpack source",
    category: "Sources",
    args: [],
  },
  resetphone: {
    description: "Reset the phone source",
    category: "Sources",
    args: [],
  },
  brbscreen: {
    description: "Switch the stream to the BRB screen with clips",
    category: "Sources",
    args: [],
  },
  livecams: {
    description: "Switch the stream to the camera layout",
    category: "Sources",
    args: [],
  },
  refresh: {
    description: "Refresh the stream overlay or the extension ambassador data",
    category: "Sources",
    args: [
      {
        type: "choice",
        name: "target",
        required: true,
        variadic: false,
        choices: ["overlay", "extension"],
      },
    ],
  },

  /**
   * Text
   */
  text: {
    description: "Sets, or clears, the text to be displayed on stream",
    category: "Text",
    args: [
      {
        type: "string",
        name: "text",
        required: false,
        variadic: true,
      },
    ],
  },
  disclaimer: {
    description: "Toggle the larger disclaimer text on stream",
    category: "Text",
    args: [
      {
        type: "choice",
        name: "mode",
        required: false,
        variadic: false,
        choices: ["on", "enable", "off", "disable"],
      },
    ],
  },

  /**
   * Wheel
   */
  enablewheel: {
    description: "Enable the wheel overlay and subscription tracking",
    category: "Wheel",
    args: [],
  },
  disablewheel: {
    description: "Disable the wheel overlay and subscription tracking",
    category: "Wheel",
    args: [],
  },
  resetwheel: {
    description: "Reset the wheel overlay and subscription count",
    category: "Wheel",
    args: [],
  },
  resetspins: {
    description: "Reset the wheel spin count",
    category: "Wheel",
    args: [],
  },
  setwheelcount: {
    description: "Set the subscription count for the wheel",
    category: "Wheel",
    args: [
      {
        type: "number",
        name: "count",
        required: true,
        variadic: false,
      },
    ],
  },
  setspins: {
    description: "Set the spin count for the wheel",
    category: "Wheel",
    args: [
      {
        type: "number",
        name: "count",
        required: true,
        variadic: false,
      },
    ],
  },

  /**
   * Notify
   */
  notify: {
    description: "Send a push and discord notification",
    category: "Notify",
    args: [
      {
        type: "string",
        name: "link",
        required: false,
        variadic: false,
      },
      {
        type: "string",
        name: "title",
        required: false,
        variadic: false,
      },
      {
        type: "string",
        name: "sub title",
        required: false,
        variadic: false,
        prefix: "|",
      },
      {
        type: "choice",
        name: "--no-discord",
        required: false,
        variadic: false,
        choices: ["--no-discord"],
      },
      {
        type: "choice",
        name: "--no-push",
        required: false,
        variadic: false,
        choices: ["--no-push"],
      },
      {
        type: "string",
        name: "image url",
        required: false,
        variadic: false,
        prefix: "--image=",
      },
    ],
  },

  /**
   * Rounds
   */
  rounds: {
    description: "Show the rounds overlay",
    category: "Rounds",
    args: [
      {
        type: "choice",
        name: "stop",
        required: false,
        variadic: false,
        choices: ["stop", "off"],
      },
    ],
  },
  check: {
    description: "Toggle a check in the rounds overlay",
    category: "Rounds",
    args: [
      [
        {
          type: "string",
          name: "item",
          required: true,
          variadic: false,
        },
      ],
      [
        {
          type: "choice",
          name: "reset",
          required: true,
          variadic: false,
          choices: ["reset"],
        },
      ],
    ],
  },

  /**
   * Feeder
   */
  feed: {
    description: "Provide basic information on how !feed works",
    category: "Feeder",
    args: [],
  },
  feedpasture: {
    description: "Include in a donation of $5 to feed the pasture animals",
    category: "Feeder",
    args: [],
  },
  feedemu: {
    description: "Include in a donation of $5 to feed the emus",
    category: "Feeder",
    args: [],
  },
  runpasturefeeder: {
    description: "Activate the pasture feeder",
    category: "Feeder",
    args: [],
  },
  runemufeeder: {
    description: "Activate the emu feeder",
    category: "Feeder",
    args: [],
  },
  pasturefeederstatus: {
    description: "Get the status of the pasture feeder",
    category: "Feeder",
    args: [],
  },
  emufeederstatus: {
    description: "Get the status of the emu feeder",
    category: "Feeder",
    args: [],
  },
  disablepasturefeeder: {
    description: "Disable the pasture feeder",
    category: "Feeder",
    args: [],
  },
  disableemufeeder: {
    description: "Disable the emu feeder",
    category: "Feeder",
    args: [],
  },
  enablepasturefeeder: {
    description: "Enable the pasture feeder",
    category: "Feeder",
    args: [],
  },
  enableemufeeder: {
    description: "Enable the emu feeder",
    category: "Feeder",
    args: [],
  },
  pasturefeederqueue: {
    description: "Get the current pasture feeder queue",
    category: "Feeder",
    args: [],
  },
  emufeederqueue: {
    description: "Get the current emu feeder queue",
    category: "Feeder",
    args: [],
  },
  addpasturefeederqueue: {
    description: "Add a feed to the pasture feeder queue",
    category: "Feeder",
    args: [],
  },
  addemufeederqueue: {
    description: "Add a feed to the emu feeder queue",
    category: "Feeder",
    args: [],
  },

  /**
   * Access Controls
   */
  blockuser: {
    description: "Block a user from using the bot",
    category: "Access",
    args: [
      {
        type: "string",
        name: "username",
        required: true,
        variadic: false,
      },
    ],
  },
  unblockuser: {
    description: "Unblock a user from using the bot",
    category: "Access",
    args: [
      {
        type: "string",
        name: "username",
        required: true,
        variadic: false,
      },
    ],
  },
  listblocked: {
    description: "List all blocked users",
    category: "Access",
    args: [],
  },
  removecam: {
    description: "Remove camera from stream and lock controls",
    category: "Access",
    args: [
      {
        type: "string",
        name: "camera",
        required: true,
        variadic: false,
      },
    ],
  },
  lockcam: {
    description:
      "Lock swap controls for users below command sender level for specified camera or all cameras",
    category: "Access",
    args: [
      [
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
      ],
      [
        {
          type: "choice",
          name: "all",
          required: true,
          variadic: false,
          choices: ["all"],
        },
      ],
    ],
  },
  unlockcam: {
    description: "Unlock swap controls for specified camera or all cameras",
    category: "Access",
    args: [
      [
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
      ],
      [
        {
          type: "choice",
          name: "all",
          required: true,
          variadic: false,
          choices: ["all"],
        },
      ],
    ],
  },
  lockptz: {
    description:
      "Lock PTZ controls for users below command sender level for specified camera or all cameras",
    category: "Access",
    args: [
      [
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
      ],
      [
        {
          type: "choice",
          name: "all",
          required: true,
          variadic: false,
          choices: ["all"],
        },
      ],
    ],
  },
  unlockptz: {
    description: "Unlock PTZ controls for specified camera or all cameras",
    category: "Access",
    args: [
      [
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
      ],
      [
        {
          type: "choice",
          name: "all",
          required: true,
          variadic: false,
          choices: ["all"],
        },
      ],
    ],
  },
  lockboth: {
    description:
      "Lock both swap and PTZ controls for users below command sender level for specified camera or all cameras",
    category: "Access",
    args: [
      [
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
      ],
      [
        {
          type: "choice",
          name: "all",
          required: true,
          variadic: false,
          choices: ["all"],
        },
      ],
    ],
  },
  unlockboth: {
    description:
      "Unlock both swap and PTZ controls for specified camera or all cameras",
    category: "Access",
    args: [
      [
        {
          type: "string",
          name: "camera",
          required: true,
          variadic: false,
        },
      ],
      [
        {
          type: "choice",
          name: "all",
          required: true,
          variadic: false,
          choices: ["all"],
        },
      ],
    ],
  },
  listlocked: {
    description: "List all locked cameras and their lock status",
    category: "Access",
    args: [],
  },
  enablesubs: {
    description: "Enable commands for Twitch subscribers",
    category: "Access",
    args: [],
  },
  disablesubs: {
    description: "Disable commands for Twitch subscribers",
    category: "Access",
    args: [],
  },
} as const satisfies Record<string, Command>;

export default commands;

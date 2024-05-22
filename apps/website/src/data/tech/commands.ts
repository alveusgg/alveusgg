interface BaseArgument {
  name: string;
  required: boolean;
  variadic: boolean;
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
  category: string;
  args: [] | Arguments | OverloadedArguments;
}

const commands: Record<string, Command> = {
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
        required: false,
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
        required: false,
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
    description: "Change relative zoom level",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: false,
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
        required: false,
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
        required: false,
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
        required: false,
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
        required: false,
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
  ptzhome: {
    description: "Move to home position",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: false,
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
        required: false,
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
  ptztracking: {
    description: "Control auto-tracking (if supported)",
    category: "PTZ",
    args: [
      {
        type: "string",
        name: "camera",
        required: false,
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
        required: false,
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
        required: false,
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
        required: false,
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
    description: "Change absolute focus (if supported)",
    category: "Focus",
    args: [
      {
        type: "string",
        name: "camera",
        required: false,
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
  ptzfocusr: {
    description: "Change relative focus (if supported)",
    category: "Focus",
    args: [
      {
        type: "string",
        name: "camera",
        required: false,
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
        required: false,
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
        required: false,
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
  ptzload: {
    description: "Move to a preset position",
    category: "Presets",
    args: [
      {
        type: "string",
        name: "camera",
        required: false,
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
        required: false,
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
        required: false,
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
        required: false,
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
    description: "Get all preset positions",
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
          required: false,
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
          required: false,
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
        required: false,
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
    description: "Swap cameras within a layout",
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

  /**
   * Text
   */
  text: {
    description: "Sets the text to be displayed on stream",
    category: "Text",
    args: [
      {
        type: "string",
        name: "text",
        required: true,
        variadic: false,
      },
    ],
  },
  showtext: {
    description: "Shows text on stream",
    category: "Text",
    args: [],
  },
  hidetext: {
    description: "Hides text on stream",
    category: "Text",
    args: [],
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
};

export default commands;

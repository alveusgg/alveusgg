interface BaseArgument {
  name: string;
  required: boolean;
  variadic: boolean;
}

interface SimpleArgument extends BaseArgument {
  type: "string" | "number";
}

interface ChoiceArgument extends BaseArgument {
  type: "choice";
  choices: string[];
}

export type Argument = SimpleArgument | ChoiceArgument;

export interface Command {
  description: string;
  category: string;
  args: Argument[];
}

const commands: Record<string, Command> = {
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
  ptzpan: {
    description: "Change pan position",
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
    description: "Change tilt position",
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
    description: "Change zoom level",
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
    description: "Change pan/tilt/zoom combination",
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
  ptzspeed: {
    description: "Change movement speed",
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
};

export default commands;

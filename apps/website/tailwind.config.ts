import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import { fontFamily } from "tailwindcss/defaultTheme";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";
import plugin from "tailwindcss/plugin";

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      inherit: "inherit",
      current: "currentColor",
      transparent: "transparent",
      black: "#000",
      white: "#fff",
      gray: colors.stone,
      red: {
        DEFAULT: "#8F3B3B",
        50: "#F3E1E1",
        100: "#EDD2D2",
        200: "#E1B5B5",
        300: "#D59898",
        400: "#C97B7B",
        500: "#BD5E5E",
        600: "#AC4646",
        700: "#8F3B3B",
        800: "#682A2A",
        900: "#401A1A",
      },
      yellow: {
        DEFAULT: "#C1A033",
        50: "#FFFFFF",
        100: "#FBF8EF",
        200: "#F2EACF",
        300: "#EADCAE",
        400: "#E1CE8E",
        500: "#D8C06E",
        600: "#D0B24E",
        700: "#C1A033",
        800: "#957C28",
        900: "#69571C",
      },
      green: {
        DEFAULT: "#578F3B",
        50: "#E7F3E1",
        100: "#DBEDD2",
        200: "#C4E1B5",
        300: "#ACD598",
        400: "#95C97B",
        500: "#7EBD5E",
        600: "#68AC46",
        700: "#578F3B",
        800: "#3F682A",
        900: "#27401A",
      },
      blue: {
        DEFAULT: "#3B5A8F",
        50: "#E1E7F3",
        100: "#D2DCED",
        200: "#B5C5E1",
        300: "#98AED5",
        400: "#7B98C9",
        500: "#5E81BD",
        600: "#466CAC",
        700: "#3B5A8F",
        800: "#2A4168",
        900: "#1A2840",
      },
      pink: {
        DEFAULT: "#EC4899",
        50: "#FDEEF6",
        100: "#FBDCEB",
        200: "#F8B7D7",
        300: "#F492C2",
        400: "#F06DAE",
        500: "#EC4899",
        600: "#E4187D",
        700: "#B11261",
        800: "#7F0D45",
        900: "#4C0829",
      },
      "alveus-tan": {
        DEFAULT: "#FAEEE6",
        50: "#FDFAF7",
        100: "#FAEEE6",
        200: "#F1CEB7",
        300: "#E7AE88",
        400: "#DE8F5A",
        500: "#D56F2B",
        600: "#A65621",
        700: "#773E18",
        800: "#49260F",
        900: "#1A0E05",
      },
      "alveus-green": {
        DEFAULT: "#636A60",
        50: "#E9EBE9",
        100: "#DFE1DE",
        200: "#CACEC8",
        300: "#B5BAB3",
        400: "#A0A79E",
        500: "#8C9388",
        600: "#777F73",
        700: "#636A60",
        800: "#484D45",
        900: "#2C2F2B",
      },
      fall: "#834a26",
      carnival: {
        DEFAULT: "#4E1362",
        700: "#390E47",
        800: "#28122f",
      },
      twitch: "#6441a5",
    },
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      fontFamily: {
        sans: ["var(--font-ptsans)", ...fontFamily.sans],
        serif: ["var(--font-ptserif)", ...fontFamily.serif],
      },
      screens: {
        twitchSideBySide: "681px",
      },
      maxWidth: {
        "1/3": "33.333333%",
        "1/2": "50%",
        "2/3": "66.666667%",
      },
      aspectRatio: {
        "4/3": "4 / 3",
      },
      saturate: {
        110: "1.1",
      },
      contrast: {
        115: "1.15",
      },
      transitionProperty: {
        filter: "filter",
      },
      scale: {
        102: "1.02",
      },
      spacing: {
        22: "5.5rem",
      },
      gridTemplateColumns: {
        ...Object.fromEntries(
          Array.from({ length: 12 }, (_, i) => [
            `${i + 1}-auto`,
            `repeat(${i + 1}, auto)`,
          ]),
        ),
      },
    },
  },
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          "animation-delay": (value) => {
            return {
              "animation-delay": value,
            };
          },
        },
        {
          values: theme("transitionDelay"),
        },
      );
    }),
    plugin(
      ({ addBase, addComponents, matchUtilities, theme }) => {
        const generateShadows = (steps = 1) => {
          const classes: string[] = [];
          for (let step = 1; step <= steps; step++) {
            classes.push(
              `0px -${step}px 0px var(--ts-text-stroke-color)`, // top
              `${step}px -${step}px 0px var(--ts-text-stroke-color)`, // top right
              `${step}px 0px 0px var(--ts-text-stroke-color)`, // right
              `${step}px ${step}px 0px var(--ts-text-stroke-color)`, // bottom right
              `0px ${step}px 0px var(--ts-text-stroke-color)`, // bottom
              `-${step}px ${step}px 0px var(--ts-text-stroke-color)`, // bottom left
              `-${step}px 0px 0px var(--ts-text-stroke-color)`, // left
              `-${step}px -${step}px 0px var(--ts-text-stroke-color)`, // top left
            );
          }
          return classes.toString();
        };

        addBase({
          ":root": {
            "--ts-text-stroke-color": "rgb(0, 0, 0)",
          },
        });

        addComponents({
          ".text-stroke": {
            textShadow: generateShadows(),
          },
        });

        matchUtilities(
          {
            "text-stroke": (value) => ({
              "--ts-text-stroke-color": value,
            }),
          },
          {
            values: flattenColorPalette(theme("colors")),
            type: "color",
          },
        );

        matchUtilities(
          {
            "text-stroke": (value) => ({
              textShadow: generateShadows(value),
            }),
          },
          {
            values: theme("textStroke"),
            type: "number",
          },
        );
      },
      { theme: { textStroke: { 1: 1, 2: 2, 3: 3, 4: 4 } } },
    ),
  ],
} satisfies Config;

export default config;

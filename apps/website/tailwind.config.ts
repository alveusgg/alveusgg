import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";
import plugin from "tailwindcss/plugin";
import alveusgg from "@alveusgg/data/src/tailwind";

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  presets: [alveusgg],
  theme: {
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
        const generateShadows = (steps: number = 1) => {
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

import plugin from "tailwindcss/plugin";

const textStroke = plugin(
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
        values: theme("colors"),
        type: "color",
      },
    );

    matchUtilities(
      {
        "text-stroke": (value) => ({
          textShadow: generateShadows(Number(value)),
        }),
      },
      {
        values: theme("fontStroke"),
        type: "number",
      },
    );
  },
  // Use `fontStroke` rather than `textStroke` to avoid internal Tailwind conflicts with `--text-*` being used for `font-size`
  { theme: { fontStroke: { 1: "1", 2: "2", 3: "3", 4: "4" } } },
);

export default textStroke;

/* eslint-disable @typescript-eslint/no-var-requires */
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "alveus-tan": "#faeee6",
        "alveus-green": "#636a60",
        "alveus-gray": "#2d2d2d",
      },
      fontFamily: {
        sans: ["var(--font-ptsans)", ...fontFamily.sans],
        serif: ["var(--font-ptserif)", ...fontFamily.serif],
      },
    },
  },
  plugins: [],
};

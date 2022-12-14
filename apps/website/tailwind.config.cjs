/* eslint-disable @typescript-eslint/no-var-requires */
const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-ptsans)', ...fontFamily.sans],
        serif: ['var(--font-ptserif)', ...fontFamily.serif],
      }
    },
  },
  plugins: [],
};

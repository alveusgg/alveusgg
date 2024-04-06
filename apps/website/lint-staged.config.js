import mainConfig from "../../lint-staged.config.js";

/** @param {string[]} filenames */
const buildBiomeCommand = (filenames) => `biome check --apply ${filenames.join(" ")}`;

const config = {
  ...mainConfig,
  "*.{js,jsx,ts,tsx,cjs}": buildBiomeCommand,
};

export default config;

import mainConfig from "../../lint-staged.config.js";

/** @param {string[]} filenames */
const buildBiomeCommand = (filenames) => `biome check --apply ${filenames.join(" ")}`;

const config = {
  ...mainConfig,
  "*.{mjs,cjs,js,ts}": buildBiomeCommand,
};

export default config;

import mainConfig from "../../lint-staged.config.js";

/** @param {string[]} filenames */
const buildEslintCommand = (filenames) =>
  `pnpm eslint --fix ${filenames.join(" ")}`;

const config = {
  ...mainConfig,
  "*.{mjs,cjs,js,ts}": buildEslintCommand,
};

export default config;

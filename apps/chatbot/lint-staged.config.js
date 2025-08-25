import mainConfig from "../../lint-staged.config.js";

/** @param {string[]} filenames */
const buildEslintCommand = (filenames) =>
  `pnpm eslint --fix --max-warnings 0 ${filenames.join(" ")}`;

const config = {
  ...mainConfig,
  "*.{mjs,cjs,js,ts}": buildEslintCommand,
};

export default config;

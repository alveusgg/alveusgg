import mainConfig from "../../../lint-staged.config.js";

/** @param {string[]} filenames */
const buildEslintCommand = (filenames) =>
  `eslint --fix --max-warnings 0 ${filenames.map((file) => `"${file}"`).join(" ")}`;

const config = {
  ...mainConfig,
  "*.{js,jsx,ts,tsx,cjs}": buildEslintCommand,
};

export default config;

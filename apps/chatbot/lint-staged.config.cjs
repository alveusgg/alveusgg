const mainConfig = require("../../lint-staged.config.js");

const buildEslintCommand = (filenames) =>
  `pnpm eslint --fix ${filenames.join(" ")}`;

module.exports = {
  ...mainConfig,
  "*.{js,jsx,ts,tsx}": buildEslintCommand,
};

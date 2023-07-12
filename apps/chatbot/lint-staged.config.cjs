const mainConfig = require("../../lint-staged.config.js");

const buildEslintCommand = (filenames) =>
  `pnpm eslint --fix ${filenames.join(" ")}`;

module.exports = {
  ...mainConfig,
  "*.{mjs,cjs,js,ts}": buildEslintCommand,
};

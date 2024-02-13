const mainConfig = require("../../lint-staged.config.js");

const buildEslintCommand = (filenames) =>
  `next lint --fix ${filenames.map((file) => `--file ${file}`).join(" ")}`;

module.exports = {
  ...mainConfig,
  "*.{js,jsx,ts,tsx,cjs,mjs}": buildEslintCommand,
};

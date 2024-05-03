import mainConfig from "../../lint-staged.config.js";

/** @param {string[]} filenames */
const buildEslintCommand = (filenames) =>
  `next lint --fix ${filenames.map((file) => `--file ${file}`).join(" ")}`;

const config = {
  ...mainConfig,
  "*.{js,jsx,ts,tsx,cjs}": buildEslintCommand,
  "schema.prisma": "prisma format",
};

export default config;

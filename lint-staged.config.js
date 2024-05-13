/** @param {string[]} filenames */
const buildBiomeCommand = (filenames) =>
  `biome check --apply ${filenames.join(" ")}`;

const config = {
  "*.{js,jsx,ts,tsx,cjs,json}": buildBiomeCommand,
};

export default config;

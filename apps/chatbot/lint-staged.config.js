/** @param {string[]} filenames */
const buildBiomeCommand = (filenames) => `biome check --apply ${filenames.join(" ")}`;

const config = {
  "*.{mjs,cjs,js,ts}": buildBiomeCommand,
};

export default config;

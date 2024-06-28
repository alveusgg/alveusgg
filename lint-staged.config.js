/** @param {string[]} filenames */
const buildBiomeCommand = (filenames) =>
  `biome check --no-errors-on-unmatched --apply ${filenames.join(" ")}`;

const config = {
  "*": buildBiomeCommand,
};

export default config;

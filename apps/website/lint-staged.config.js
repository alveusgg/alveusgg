/** @param {string[]} filenames */
const buildBiomeCommand = (filenames) =>
  `biome check --no-errors-on-unmatched --apply ${filenames.join(" ")}`;

const config = {
  "schema.prisma": "prisma format",
  "*": buildBiomeCommand,
};

export default config;

/** @param {string[]} filenames */
const buildBiomeCommand = (filenames) =>
  `biome check --apply ${filenames.join(" ")}`;

const config = {
  "schema.prisma": "prisma format",
  "*.{js,jsx,ts,tsx,cjs}": buildBiomeCommand,
};

export default config;

/** @param {string[]} filenames */
const buildBiomeCommand = (filenames) => `pnpm biome check --apply --vcs-client-kind=git --vcs-enabled=true --vcs-use-ignore-file=true --vcs-default-branch=master --files-ignore-unknown=true ${filenames.join(" ")}`;

const config = {
  "*.{js,jsx,ts,tsx,cjs}": buildBiomeCommand,
};

export default config;

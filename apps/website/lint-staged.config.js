import mainConfig from "../../lint-staged.config.js";

// By default, even if we use --file, `next lint` will also use eslint.dirs in our config
// So, we pass a non-existent --dir in so it uses that instead of the config value
// It will then filter out any directory/file that doesn't exist before linting
// https://github.com/vercel/next.js/blob/v15.3.1/packages/next/src/cli/next-lint.ts#L76-L91
/** @param {string[]} filenames */
const buildEslintCommand = (filenames) =>
  `next lint --fix --dir !. ${filenames.map((file) => `--file ${file}`).join(" ")}`;

const config = {
  ...mainConfig,
  "*.{js,jsx,ts,tsx,cjs}": buildEslintCommand,
};

export default config;

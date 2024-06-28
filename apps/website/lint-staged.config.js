import mainConfig from "../../lint-staged.config.js";

const config = {
  ...mainConfig,
  "schema.prisma": "prisma format",
};

export default config;

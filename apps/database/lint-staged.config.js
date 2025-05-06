import mainConfig from "../../lint-staged.config.js";

const config = {
  ...mainConfig,
  "prisma/schema.prisma": ["prisma validate", "prisma format"],
};

export default config;

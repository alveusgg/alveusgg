// @ts-check
import eslint from "@eslint/js";
import prettiereslint from "eslint-config-prettier";
import { flatConfigs as importXPluginConfigs } from "eslint-plugin-import-x";
import globals from "globals";
import tseslint, { configs as tseslintConfigs } from "typescript-eslint";

export default tseslint.config(
  {
    name: "eslint/recommended",
    ...eslint.configs.recommended,
  },
  ...tseslintConfigs.recommended,
  {
    name: "typescript-eslint/tsconfig",
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  importXPluginConfigs.recommended,
  importXPluginConfigs.typescript,
  {
    name: "import-x/custom",
    rules: {
      "import-x/order": [
        "warn",
        {
          pathGroups: [
            {
              pattern: "@/**",
              group: "external",
              position: "after",
            },
          ],
        },
      ],
    },
    settings: {
      "import-x/resolver": {
        typescript: {
          project: import.meta.dirname,
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
      "import-x/ignore": ["^cloudflare:"],
    },
  },
  {
    name: "import-x/cloudflare-override",
    rules: {
      "import-x/no-unresolved": [
        "error",
        {
          ignore: ["^cloudflare:"],
        },
      ],
    },
  },
  {
    name: "prettier/config",
    ...prettiereslint,
  },
  {
    name: "custom/rules",
    rules: {
      "no-empty": [
        "error",
        {
          allowEmptyCatch: true,
        },
      ],
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn", // or "error"
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "react/prop-types": "off",
    },
  },
);

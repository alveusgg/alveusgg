// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettiereslint from "eslint-config-prettier";

import importXPlugin from "eslint-plugin-import-x";

export default tseslint.config(
  {
    name: "eslint/recommended",
    ...eslint.configs.recommended,
  },
  // eslint-disable-next-line import-x/no-named-as-default-member
  ...tseslint.configs.recommended,
  {
    name: "typescript-eslint/tsconfig",
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  importXPlugin.flatConfigs.recommended,
  importXPlugin.flatConfigs.typescript,
  {
    name: "import-x/order",
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
    },
  },
  {
    name: "custom/cjs",
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
    languageOptions: {
      parserOptions: {
        sourceType: "commonjs",
      },
    },
  },
);

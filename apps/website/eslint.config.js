// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettiereslint from "eslint-config-prettier";

import importXPlugin from "eslint-plugin-import-x";
// @ts-expect-error - no types
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
// @ts-expect-error - no types
import hooksPlugin from "eslint-plugin-react-hooks";
import tailwindPlugin from "eslint-plugin-tailwindcss";

import globals from "globals";

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
      globals: {
        ...globals.browser,
        ...globals.node,
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
  /** @type {import("eslint").Linter.Config} */
  ({
    name: "react/recommended",
    // @ts-expect-error - incorrect types
    ...reactPlugin.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
  }),
  /** @type {import("eslint").Linter.Config} */
  ({
    name: "react/jsx-runtime",
    // @ts-expect-error - incorrect types
    ...reactPlugin.configs.flat["jsx-runtime"],
  }),
  {
    name: "react-hooks/recommended",
    plugins: {
      "react-hooks": hooksPlugin,
    },
    rules: hooksPlugin.configs.recommended.rules,
  },
  {
    name: "next/core-web-vitals",
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    name: "prettier/config",
    ...prettiereslint,
  },
  ...tailwindPlugin.configs["flat/recommended"],
  {
    name: "custom/ignores",
    ignores: ["public/*", ".next/*"],
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
  {
    name: "custom/sw",
    files: ["src/sw/**/*"],
    languageOptions: {
      parserOptions: {
        project: "./src/sw/tsconfig.json",
      },
    },
  },
);

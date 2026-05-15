// @ts-check
import { fileURLToPath } from "node:url";

import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import prettiereslint from "eslint-config-prettier";
import betterTailwindcssPlugin from "eslint-plugin-better-tailwindcss";
import { getDefaultSelectors } from "eslint-plugin-better-tailwindcss/defaults";
import { SelectorKind } from "eslint-plugin-better-tailwindcss/types";
import { flatConfigs as importXPluginConfigs } from "eslint-plugin-import-x";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
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
        ...globals.browser,
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
    settings: {
      "import-x/resolver": {
        typescript: {
          project: import.meta.dirname,
        },
      },
    },
  },
  {
    name: "react/recommended",
    ...reactPlugin.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    name: "react/jsx-runtime",
    ...reactPlugin.configs.flat["jsx-runtime"],
  },
  {
    name: "react-hooks/recommended",
    ...hooksPlugin.configs.flat.recommended,
  },
  {
    name: "next/core-web-vitals",
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      // FIXME: https://github.com/vercel/next.js/issues/86504
      // eslint-disable-next-line import-x/no-named-as-default-member
      ...nextPlugin.configs.recommended.rules,
      // eslint-disable-next-line import-x/no-named-as-default-member
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    name: "prettier/config",
    ...prettiereslint,
  },
  {
    name: "better-tailwindcss/recommended",
    files: ["**/*.{js,jsx,cjs,mjs,ts,tsx}"],
    plugins: {
      "better-tailwindcss": betterTailwindcssPlugin,
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles/tailwind.css",
        selectors: [
          ...getDefaultSelectors(),
          {
            kind: SelectorKind.Callee,
            name: "^classes$",
            match: [{ type: "strings" }],
          },
        ],
      },
    },
    rules: {
      ...betterTailwindcssPlugin.configs.recommended.rules,
      // Rely on prettier-plugin-tailwindcss for ordering (eslint breaks interpolated classes)
      "better-tailwindcss/enforce-consistent-class-order": "off",
      "better-tailwindcss/no-unknown-classes": [
        "error",
        {
          // Custom component classes defined in src/styles/tailwind.css
          ignore: [
            "^alveus-ugc$",
            "^alveus-community-map$",
            "^alveus-rte$",
            "^html:transparent$",
          ],
        },
      ],
    },
  },
  {
    name: "custom/ignores",
    ignores: ["dist/", "public/*", ".next/*", "next-env.d.ts"],
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
      "react-hooks/set-state-in-effect": "off",
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
        projectService: true,
        tsconfigRootDir: fileURLToPath(new URL("./src/sw", import.meta.url)),
      },
    },
  },
);

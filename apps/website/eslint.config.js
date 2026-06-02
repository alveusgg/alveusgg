// @ts-check
import { fileURLToPath } from "node:url";

import eslintReact from "@eslint-react/eslint-plugin";
import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import prettiereslint from "eslint-config-prettier";
import betterTailwindcssPlugin from "eslint-plugin-better-tailwindcss";
import { getDefaultSelectors } from "eslint-plugin-better-tailwindcss/defaults";
import { SelectorKind } from "eslint-plugin-better-tailwindcss/types";
import { flatConfigs as importXPluginConfigs } from "eslint-plugin-import-x";
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
    name: "@eslint-react/recommended-typescript",
    ...eslintReact.configs["recommended-typescript"],
  },
  // Turn off whole rule categories we don't enforce (naming conventions, DOM
  // attribute checks, Web API effect-cleanup checks). These are opinions the
  // previous eslint-plugin-react setup never imposed.
  {
    name: "@eslint-react/disable-naming-convention",
    ...eslintReact.configs["disable-naming-convention"],
  },
  {
    name: "@eslint-react/disable-dom",
    ...eslintReact.configs["disable-dom"],
  },
  {
    name: "@eslint-react/disable-web-api",
    ...eslintReact.configs["disable-web-api"],
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
      // Rely on prettier for line wrapping (the rule and prettier disagree)
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
      "better-tailwindcss/no-unknown-classes": "error",
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
      "react-hooks/set-state-in-effect": "off",
      // Opinion rules from @eslint-react we don't enforce (the previous
      // eslint-plugin-react setup didn't have equivalents).
      "@eslint-react/set-state-in-effect": "off",
      "@eslint-react/use-state": "off",
      "@eslint-react/no-use-context": "off",
      "@eslint-react/no-context-provider": "off",
      "@eslint-react/no-children-map": "off",
      "@eslint-react/no-clone-element": "off",
      "@eslint-react/no-unnecessary-use-prefix": "off",
      "@eslint-react/purity": "off",
      // Index keys are only used here for static/fixed-length lists (diagrams,
      // skeletons, placeholders) where the index is the stable identity; lists
      // backed by real data already use proper keys.
      "@eslint-react/no-array-index-key": "off",
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

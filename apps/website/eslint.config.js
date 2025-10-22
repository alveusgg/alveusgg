// @ts-check
import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import prettiereslint from "eslint-config-prettier";
import { flatConfigs as importXPluginConfigs } from "eslint-plugin-import-x";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
// FIXME: https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/325
// FIXME: https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/384
// import tailwindPlugin from "eslint-plugin-tailwindcss";
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
      // FIXME: @next/eslint-plugin-next returns rule values as `string` rather than `RuleLevel` (`SeverityString`)
      // FIXME: @next/eslint-plugin-next claims to export `configs` but does not as it is a CommonJS module
      // FIXME: https://github.com/vercel/next.js/issues/81695

      .../** @type Record<string, NonNullable<import('typescript-eslint').ConfigWithExtends["rules"]>[string]> */ (
        // eslint-disable-next-line import-x/no-named-as-default-member
        nextPlugin.configs.recommended.rules
      ),
      .../** @type Record<string, NonNullable<import('typescript-eslint').ConfigWithExtends["rules"]>[string]> */ (
        // eslint-disable-next-line import-x/no-named-as-default-member
        nextPlugin.configs["core-web-vitals"].rules
      ),
    },
  },
  {
    name: "prettier/config",
    ...prettiereslint,
  },
  // ...tailwindPlugin.configs["flat/recommended"],
  {
    name: "tailwindcss/custom",
    rules: {
      // Rely on prettier for ordering (eslint breaks interpolated classes)
      "tailwindcss/classnames-order": "off",
    },
  },
  {
    name: "custom/ignores",
    ignores: ["public/*", ".next/*", "next-env.d.ts"],
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
        project: "./src/sw/tsconfig.json",
      },
    },
  },
);

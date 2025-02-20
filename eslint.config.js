import globals from "globals";
import js from "@eslint/js";
import vitest from "eslint-plugin-vitest";

export default [
  { ignores: ["dist", ".parcel-cache", "node_modules"] },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.node, ...globals.browser },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },

    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": [
        "error",
        { vars: "all", args: "after-used", ignoreRestSiblings: false },
      ],
      "no-undef": "warn",
    },
  },
  {
    files: ["tests/**"],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
];

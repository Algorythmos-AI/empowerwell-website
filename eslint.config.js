import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default defineConfig(
  {
    ignores: ["dist/**", ".astro/**", "node_modules/**", ".vercel/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs["jsx-a11y-strict"],
  {
    files: ["**/*.tsx"],
    plugins: { "jsx-a11y": jsxA11y, "react-hooks": reactHooks },
    languageOptions: { globals: globals.browser },
    rules: {
      ...jsxA11y.flatConfigs.strict.rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: ["scripts/**/*.{js,mjs}", "*.config.{js,mjs,ts}"],
    languageOptions: { globals: globals.node },
  },
  {
    // role="list" is kept on styled <ul>s on purpose: Safari/VoiceOver drops list semantics when
    // list-style is removed (Tailwind preflight does this), so the explicit role is not redundant.
    files: ["**/*.astro", "**/*.tsx"],
    rules: {
      "astro/jsx-a11y/no-redundant-roles": ["error", { ul: ["list"] }],
      "jsx-a11y/no-redundant-roles": ["error", { ul: ["list"] }],
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
);

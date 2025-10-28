import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import vitest from "eslint-plugin-vitest";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // === Ignorer globalement les dossiers à exclure ===
  {
    ignores: [
      "dist",
      "dev-dist",
      "__tests__/**",
      "__mocks__/**",
      "coverage/**",
      "vite.config.js",
    ],
  },

  // === Configuration principale pour les fichiers sources ===
  {
    files: ["**/*.{js,jsx}"],
    ignores: ["__tests__/**", "__mocks__/**", "coverage/**"],

    extends: [
      js.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],

    plugins: {
      "jsx-a11y": jsxA11y,
      vitest: vitest,
    },

    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.vitest, // permet à ESLint de reconnaître vi, test, expect, etc.
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },

    rules: {
      // === Bonnes pratiques générales ===
      "no-unused-vars": ["warn", { varsIgnorePattern: "^[A-Z_]" }],
      "no-console": "off",

      // === React Hooks ===
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // === Accessibilité (JSX-A11Y) ===
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/aria-role": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/tabindex-no-positive": "warn",
    },
  },
]);

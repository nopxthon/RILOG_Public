// eslint.config.mjs
import next from "eslint-config-next";
import globals from "globals";

export default [
  {
    ignores: ["dist", ".next"], // folder build diabaikan
  },
  next(), // bawaan Next.js (sudah termasuk React + Hooks rules)
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        React: true, // supaya JSX tidak error
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },
];

import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", ".meridian/**", "skills-workspace/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
  },
];

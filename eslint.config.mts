import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import prettier from "eslint-config-prettier";

const jsTsVueFiles = ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"];

export default [
  { 
    files: jsTsVueFiles,
    languageOptions: { 
      globals: globals.node,
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    } 
  },
  { files: jsTsVueFiles, ...js.configs.recommended },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: jsTsVueFiles,
  })),
  ...pluginVue.configs["flat/essential"].map((config) => ({
    ...config,
    files: ["**/*.vue"],
  })),
  { files: jsTsVueFiles, ...prettier },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: { 
        parser: tseslint.parser, 
        sourceType: "module",
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".vue"],
      },
    },
  },
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/gfm",
    rules: { ...markdown.configs.recommended.rules },
  },
  {
    files: ["**/*.css"],
    ignores: ["src/assets/styles/**"],
    plugins: { css },
    language: "css/css",
    rules: {
      ...css.configs.recommended.rules,
      // Tailwind v4 usa @theme e @apply, que não fazem parte da spec CSS padrão.
      // O linter CSS puro não os reconhece; a validação real dessas diretivas
      // é feita pelo próprio build do Tailwind, não pelo ESLint.
      "css/no-invalid-at-rules": "off",
      // Variáveis do @theme (--duration-focus, etc.) são geradas em build-time
      // pelo Tailwind, então o linter estático não consegue resolvê-las.
      "css/no-invalid-properties": "off",
      // Nesting (&[data-focused] { ... }) é usado propositalmente e suportado
      // pelo pipeline de build (PostCSS/Tailwind), mesmo não sendo baseline em todos navegadores.
      "css/use-baseline": "off",
    },
  },
];
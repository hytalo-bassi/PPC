import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    coverage: {
      provider: "v8",

      reporter: ["text", "text-summary", "json", "json-summary", "html"],

      reportsDirectory: "./coverage",

      include: ["src/**/*.{ts,js,vue}"],

      exclude: [
        "node_modules/",
        "src/tests/**",
        "src/**/*.test.js",
        "src/**/*.spec.js",
        "**/*.config.js",
        "**/mock/**",
        "src/index.ts",
      ],

      thresholds: {
        lines: 50,
        functions: 45,
        branches: 60,
        statements: 50,

        perFile: true,
      },

      clean: true,
      skipFull: false,
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});

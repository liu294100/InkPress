import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  css: {
    postcss: { plugins: [] },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.{test,spec,prop}.{ts,tsx}"],
    server: {
      deps: {
        inline: ["fast-check"],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/**/types.ts"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "fast-check": resolve(__dirname, "./node_modules/fast-check/lib/fast-check.js"),
    },
  },
});

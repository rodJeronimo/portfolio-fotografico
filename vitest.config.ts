import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    // TODO: remover quando as primeiras suites (M0+) existirem — ver TASK-0012.
    passWithNoTests: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: ["**/*.config.*", "**/.next/**", "tests/e2e/**"],
    },
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
});

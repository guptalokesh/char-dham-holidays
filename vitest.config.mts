import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Integration tests share one Postgres database; running test files in
    // parallel causes cross-file data races (one file's cleanup deletes
    // another's fixtures mid-run).
    fileParallelism: false,
    // e2e/ holds Playwright specs, run via `npm run test:e2e`, not Vitest.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
});

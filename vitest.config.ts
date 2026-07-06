import { defineConfig } from "vitest/config";

// Standalone Vitest config. It intentionally does NOT extend vite.config.ts so
// the Cloudflare/vinext build plugins never load during unit tests — the lib/
// domain modules are pure TypeScript and only need a node environment.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});

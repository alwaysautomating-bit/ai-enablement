import { defineConfig } from "vitest/config";

export default defineConfig({
  // Capture tests start a SAME Python process; the 5s default is too tight on a busy machine.
  test: { testTimeout: 30_000 },
});

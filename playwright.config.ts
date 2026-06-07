import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: BASE_URL,
  },
  // Boot the app in offline demo mode so e2e never needs a network call or
  // an API key — the deterministic fallback report is asserted in CI.
  webServer: {
    command: `DEMO_MODE=1 npm run dev -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120000,
    env: {
      DEMO_MODE: "1",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

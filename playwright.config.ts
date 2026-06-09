import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  // Generous per-test timeout: the dev server compiles the dynamic route on the
  // first navigation, which can take longer than the 30s default on a cold boot.
  timeout: 60000,
  expect: { timeout: 10000 },
  use: {
    baseURL: BASE_URL,
    // Standard flags for CI / containerised chromium: avoid the small default
    // /dev/shm (a common cause of renderer crashes in sandboxes) and the OS
    // sandbox that isn't available there.
    launchOptions: {
      args: ["--disable-dev-shm-usage", "--no-sandbox"],
    },
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

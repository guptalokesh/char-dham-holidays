import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

const envResult = loadEnv({ path: path.resolve(__dirname, ".env.e2e") });
const e2eEnv = { ...process.env, ...envResult.parsed };

const PORT = 3100;
const SMTP_PORT = 2525;
const EMAILS_DIR = "/tmp/e2e-emails";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  globalSetup: "./e2e/global-setup.ts",
  webServer: [
    {
      command: "npx next dev -p 3100",
      port: PORT,
      reuseExistingServer: false,
      timeout: 60_000,
      env: { ...e2eEnv, PORT: String(PORT) },
    },
    {
      command: "npx tsx e2e/fake-smtp-server.ts",
      port: SMTP_PORT,
      reuseExistingServer: false,
      timeout: 20_000,
      env: {
        ...e2eEnv,
        FAKE_SMTP_PORT: String(SMTP_PORT),
        FAKE_SMTP_OUTPUT_DIR: EMAILS_DIR,
      },
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

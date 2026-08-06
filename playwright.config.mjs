import { defineConfig, devices } from "@playwright/test";

// 127.0.0.1 rather than localhost so the dev-mode default is exercised; individual
// tests force the deployed code path with "?dev=0".
const BASE_URL = "http://127.0.0.1:8080";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 2 : undefined,
	reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],

	use: {
		baseURL: BASE_URL,
		trace: "on-first-retry"
	},

	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } }
	],

	webServer: {
		// The editor fetches its locale JSON over XHR, so it must be served over
		// HTTP - opening editor.html as a file:// URL will not work.
		command: "npx http-server . -p 8080 -c-1 --silent",
		url: `${BASE_URL}/editor.html`,
		reuseExistingServer: !process.env.CI,
		timeout: 60_000
	}
});

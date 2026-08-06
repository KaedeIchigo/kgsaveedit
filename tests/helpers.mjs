import { expect } from "@playwright/test";

/** Locales the editor advertises, mirroring KGConfig.statics.locales in editor/e-config.js. */
export const LOCALES = ["br", "cz", "de", "es", "fr", "ja", "pl", "ru", "zh", "zht"];

/**
 * Tabs the deployed (non-dev) editor is expected to render, in order.
 *
 * Note the literal "&amp;" in the first entry: tabName holds a raw HTML
 * fragment (it is injected as innerHTML), so the entity is the real stored
 * value, not a test artefact. Asserting the decoded form here would be wrong.
 */
export const EXPECTED_TABS = [
	"Options &amp; Settings", "Bonfire", "Village", "Science", "Workshop", "Trade",
	"Religion", "Space", "Time", "Challenges", "Achievements", "Stats", "Extras"
];

/**
 * Attaches listeners that collect anything the page reports as broken.
 *
 * This matters more than usual here: the editor loads its modules through
 * $.getScript and resolves i18n keys through $I, and both fail *quietly* -
 * a missing module or a missing translation key surfaces only as a
 * console error, never as a thrown exception or a failed assertion.
 *
 * @returns {string[]} live array, appended to as problems occur
 */
export function collectProblems(page) {
	const problems = [];

	page.on("console", (msg) => {
		if (msg.type() === "error") {
			problems.push(`console.error: ${msg.text()}`);
		}
	});
	page.on("pageerror", (err) => {
		problems.push(`pageerror: ${err.message}`);
	});
	page.on("requestfailed", (req) => {
		problems.push(`requestfailed: ${req.url()} (${req.failure()?.errorText})`);
	});

	return problems;
}

/**
 * Navigates to the editor and waits for it to finish booting.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} query e.g. "?dev=0" to force the deployed code path
 */
export async function openEditor(page, query = "?dev=0") {
	const problems = collectProblems(page);

	await page.goto(`/editor.html${query}`);

	// gamePage is assigned in initEditor(), which only runs after every module
	// in the loader chain has been fetched and executed.
	await page.waitForFunction(
		() => Boolean(window.gamePage && window.gamePage.tabs && window.gamePage.tabs.length),
		null,
		{ timeout: 60_000 }
	);

	return problems;
}

/** Reads the editor's current tab titles. */
export function getTabNames(page) {
	return page.evaluate(() => window.gamePage.tabs.map((t) => t.tabName));
}

/**
 * Asserts nothing was reported as broken, surfacing the actual messages on
 * failure rather than a bare count.
 */
export function expectNoProblems(problems, context = "") {
	expect(problems, `${context}\n${problems.join("\n")}`).toEqual([]);
}

import { test, expect } from "@playwright/test";
import { openEditor, getTabNames, LOCALES } from "./helpers.mjs";

test.describe("localisation", () => {
	test("English UI resolves every tab label", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// $I() returns "$" + key for anything it cannot resolve, so a leading "$"
		// is the tell-tale of a missing translation rather than a crash.
		const unresolved = (await getTabNames(page)).filter((n) => n.startsWith("$"));
		expect(unresolved).toEqual([]);
	});

	// Each locale pulls res/i18n/<lang>.json, res/i18n/crowdin/<lang>.json and
	// editor/i18n/<lang>.json. A malformed or truncated file in any of those
	// shows up only as a console error, so this is the guard for the whole set.
	for (const locale of LOCALES) {
		test(`${locale} loads and renders without errors`, async ({ page }) => {
			const problems = await openEditor(page, "?dev=0");

			await page.evaluate((lang) => window.i18nLang.updateLanguage(lang), locale);
			await page.waitForFunction(
				(lang) => window.i18nLang.getLanguage() === lang && window.i18nLang.isLoaded(lang),
				locale,
				{ timeout: 30_000 }
			);

			const unresolved = (await getTabNames(page)).filter((n) => n.startsWith("$"));

			expect(unresolved, `${locale}: unresolved i18n keys`).toEqual([]);
			expect(problems, `${locale} reported problems:\n${problems.join("\n")}`).toEqual([]);
		});
	}

	test("locale choice is persisted to storage", async ({ page }) => {
		await openEditor(page, "?dev=0");

		await page.evaluate(() => window.i18nLang.updateLanguage("de"));
		await page.waitForFunction(() => window.i18nLang.getLanguage() === "de");

		const stored = await page.evaluate(() => window.LCstorage["KGCalc.Language"]);
		expect(stored).toBe("de");
	});
});

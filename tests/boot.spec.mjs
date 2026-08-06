import { test, expect } from "@playwright/test";
import { openEditor, getTabNames, expectNoProblems, EXPECTED_TABS } from "./helpers.mjs";

test.describe("boot", () => {
	test("deployed path boots with no errors and no dev assets", async ({ page }) => {
		const problems = await openEditor(page, "?dev=0");

		expect(await getTabNames(page)).toEqual(EXPECTED_TABS);

		const state = await page.evaluate(() => ({
			jsondiffpatch: typeof window.jsondiffpatch,
			devModeDeclared: Boolean(window.classes?.KGSaveEdit?.DevMode),
			devTabAttached: Boolean(window.gamePage.devMode),
			devCss: Boolean(document.querySelector('link[href="dev/html.css"]'))
		}));

		expect(state).toEqual({
			jsondiffpatch: "undefined",
			devModeDeclared: false,
			devTabAttached: false,
			devCss: false
		});

		expectNoProblems(problems, "deployed boot reported problems:");
	});

	test("every editor module loads and registers its classes", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// If any module in the $.getScript chain silently failed, its classes would
		// be missing while the page still looked fine.
		const missing = await page.evaluate(() => {
			const expected = [
				"core", "UI", "SaveEdit", "AchievementMeta", "KGConfig"
			];
			return expected.filter((name) => !window.classes?.KGSaveEdit?.[name]);
		});

		expect(missing).toEqual([]);
	});

	test("editorVersion is taken from the gameVersionSpan element", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const { editorVersion, spanText, gameVersion } = await page.evaluate(() => ({
			editorVersion: window.editorVersion,
			spanText: document.getElementById("gameVersionSpan").textContent,
			gameVersion: window.gamePage.version
		}));

		// Single source of truth: bump the span in editor.html and everything follows.
		expect(editorVersion).toBe(spanText);
		expect(gameVersion).toBe(spanText);
		expect(editorVersion).toMatch(/^\d+(\.\d+)+/);
	});
});

test.describe("dev mode", () => {
	test("dev path attaches the Dev tab and restores define()", async ({ page }) => {
		const problems = await openEditor(page, "?dev=1");

		expect(await getTabNames(page)).toEqual([...EXPECTED_TABS, "Dev"]);

		const state = await page.evaluate(() => ({
			jsondiffpatch: typeof window.jsondiffpatch,
			devTabAttached: Boolean(window.gamePage.devMode),
			devCss: Boolean(document.querySelector('link[href="dev/html.css"]')),
			// The loader hides define() while the UMD bundles load; if it failed to
			// put it back, dojo's module system would be broken for everything after.
			defineType: typeof window.define,
			defineAmd: Boolean(window.define && window.define.amd)
		}));

		expect(state).toEqual({
			jsondiffpatch: "object",
			devTabAttached: true,
			devCss: true,
			defineType: "function",
			defineAmd: true
		});

		expectNoProblems(problems, "dev boot reported problems:");
	});

	test("dev mode defaults on for loopback hosts", async ({ page }) => {
		await openEditor(page, "");
		expect(await getTabNames(page)).toContain("Dev");
	});

	test.describe("query parameter parsing", () => {
		// Guards the opt-in/opt-out contract, including near-misses that must not
		// accidentally enable dev tooling on a deployed copy.
		const cases = [
			["?dev", true], ["?dev=1", true], ["?dev=true", true], ["?a=1&dev", true],
			["?dev=0", false], ["?dev=false", false]
		];

		for (const [query, shouldBeDev] of cases) {
			test(`"${query}" -> dev ${shouldBeDev ? "on" : "off"}`, async ({ page }) => {
				await openEditor(page, query);
				const names = await getTabNames(page);
				expect(names.includes("Dev")).toBe(shouldBeDev);
			});
		}
	});
});

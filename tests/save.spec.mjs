import { test, expect } from "@playwright/test";
import { openEditor, expectNoProblems } from "./helpers.mjs";

test.describe("save round-trip", () => {
	test("export -> import preserves edited values", async ({ page }) => {
		const problems = await openEditor(page, "?dev=0");

		const result = await page.evaluate(() => {
			const g = window.gamePage;

			g.resPool.get("catnip").value = 12345;
			g.resPool.get("wood").value = 678;
			g.calendar.year = 77;

			const compressed = g.exportSave(true);

			// Clear, then restore from the exported string.
			g.resPool.get("catnip").value = 0;
			g.resPool.get("wood").value = 0;
			g.calendar.year = 0;

			const imported = g.importSave(compressed);

			return {
				compressedType: typeof compressed,
				imported,
				catnip: g.resPool.get("catnip").value,
				wood: g.resPool.get("wood").value,
				year: g.calendar.year
			};
		});

		expect(result).toEqual({
			compressedType: "string",
			imported: true,
			catnip: 12345,
			wood: 678,
			year: 77
		});

		expectNoProblems(problems, "save round-trip reported problems:");
	});

	test("exported payload is valid LZ-compressed JSON", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const shape = await page.evaluate(() => {
			const g = window.gamePage;
			g.resPool.get("catnip").value = 999;

			const parsed = JSON.parse(
				window.LZString.decompressFromBase64(g.exportSave(true))
			);

			return {
				hasSaveVersion: typeof parsed.saveVersion !== "undefined",
				hasResources: Array.isArray(parsed.resources),
				hasGame: typeof parsed.game === "object",
				catnip: parsed.resources.find((r) => r.name === "catnip")?.value
			};
		});

		expect(shape).toEqual({
			hasSaveVersion: true,
			hasResources: true,
			hasGame: true,
			catnip: 999
		});
	});

	test("malformed save data is rejected without throwing", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// Save data is user-supplied, so bad input must fail closed rather than
		// take the page down. importSave() catches internally and reports via its
		// return value: false when nothing could be decompressed, "ERROR" when
		// decoding or parsing failed.
		const outcomes = await page.evaluate(() => {
			const g = window.gamePage;
			const attempts = ["", "not-a-save", "{}", "[]", "null", "!!!!"];

			return attempts.map((data) => {
				try {
					return { data, result: String(g.importSave(data)), threw: false };
				} catch (e) {
					return { data, result: String(e), threw: true };
				}
			});
		});

		for (const outcome of outcomes) {
			expect(outcome.threw, `importSave(${JSON.stringify(outcome.data)}) threw`).toBe(false);
			expect(
				["false", "ERROR"],
				`importSave(${JSON.stringify(outcome.data)}) -> ${outcome.result}`
			).toContain(outcome.result);
		}
	});

	test("known quirk: any base64 JSON object imports as a blank save", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// Documented characterisation, not an endorsement. decompressSave() base64-
		// decodes first, so *any* valid base64 JSON object parses, resets state and
		// reports success - meaning a wrong-but-well-formed file reads as "imported"
		// while silently wiping the editor. Captured here so that if the import path
		// is tightened during the game-version work, this test fails loudly and the
		// change is a deliberate one.
		const result = await page.evaluate(() => {
			// btoa('{"not":"a save"}')
			return String(window.gamePage.importSave("eyJub3QiOiJhIHNhdmUifQ=="));
		});

		expect(result).toBe("true");
	});

	test("a save containing a hasOwnProperty key does not break import", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// Regression guard for the Object.prototype.hasOwnProperty.call fixes:
		// save data is user-controlled, so a key named "hasOwnProperty" must not
		// shadow the method and take down parsing.
		const outcome = await page.evaluate(() => {
			const g = window.gamePage;
			const parsed = JSON.parse(
				window.LZString.decompressFromBase64(g.exportSave(true))
			);
			parsed.hasOwnProperty = "not a function";

			const payload = window.LZString.compressToBase64(JSON.stringify(parsed));

			try {
				return { result: String(g.importSave(payload)), threw: false };
			} catch (e) {
				return { result: String(e), threw: true };
			}
		});

		expect(outcome.threw).toBe(false);
	});
});

import { test, expect } from "@playwright/test";
import { openEditor } from "./helpers.mjs";

/**
 * Content and balance changes between Kittens Game 1.5.0.3 and 1.6.1.6.
 * Values are read from nuclear-unicorn/kittensgame, not from editor behaviour.
 */

test.describe("1.6 content", () => {
	test("the three zebra upgrades exist and resolve", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// These were beta-only when 1.5 was ported, which is why they used to be
		// listed as unhandled save data in the Extras tab.
		const r = await page.evaluate(() =>
			["zebraTrappers", "reforgedOutposts", "rangefinders"].map((id) => {
				const u = window.gamePage.workshop.getZebraUpgrade(id);
				const label = String(u?.label ?? "");
				return { id, found: Boolean(u), unresolved: !label || label.startsWith("$") };
			}));

		expect(r.filter((x) => !x.found).map((x) => x.id)).toEqual([]);
		expect(r.filter((x) => x.unresolved).map((x) => x.id)).toEqual([]);
	});

	test("zebra upgrades round-trip through a save", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const r = await page.evaluate(() => {
			const g = window.gamePage;
			const ids = ["zebraTrappers", "reforgedOutposts", "rangefinders"];
			ids.forEach((id) => {
				const u = g.workshop.getZebraUpgrade(id);
				u.researched = true;
				u.unlocked = true;
			});
			const save = g.exportSave(true);
			ids.forEach((id) => { g.workshop.getZebraUpgrade(id).researched = false; });
			g.importSave(save);
			return ids.map((id) => g.workshop.getZebraUpgrade(id).researched);
		});

		expect(r).toEqual([true, true, true]);
	});

	test("Dark Paracosm is enabled on main", async ({ page }) => {
		await openEditor(page, "?dev=0");
		const flag = await page.evaluate(() => window.gamePage.featureFlags.DARK_PARACOSM);
		expect(flag.main).toBe(true);
	});
});

test.describe("1.5/1.6 balance corrections", () => {
	// Each of these drifted from the game and was caught by a price audit rather
	// than by a player report.
	const BASE_PRICES = [
		["bld.get", "biolab", { science: 1500, slab: 100, alloy: 25, plastic: 15 }],
		["bld.get", "aiCore", { antimatter: 125, science: 500000, microchip: 25 }],
		["workshop.getCraft", "microchip", { plastic: 50, gold: 1000, spice: 750 }],
		["workshop.getCraft", "compedium", { science: 9000, manuscript: 55 }],
		["science.get", "antimatter", { science: 500000, relic: 1, antimatter: 1 }]
	];

	for (const [accessor, id, expected] of BASE_PRICES) {
		test(`${id} base prices match the game`, async ({ page }) => {
			await openEditor(page, "?dev=0");

			const prices = await page.evaluate(({ path, name }) => {
				const g = window.gamePage;
				const owner = path.split(".").slice(0, -1).reduce((o, k) => o?.[k], g);
				const fn = path.split(".").reduce((o, k) => o?.[k], g);
				const item = fn.call(owner, name);
				const out = {};
				for (const p of item.prices || []) out[p.name] = p.val;
				return out;
			}, { path: accessor, name: id });

			expect(prices).toEqual(expected);
		});
	}

	test("staged buildings carry the game's stage prices", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const r = await page.evaluate(() => {
			const g = window.gamePage;
			const grab = (bld, stage) => {
				const out = {};
				for (const p of g.bld.get(bld).stages[stage].prices || []) out[p.name] = p.val;
				return out;
			};
			return { dataCenter: grab("library", 1), hydroplant: grab("aqueduct", 1) };
		});

		// Data Centers gained microchips in 1.6.1.6; hydroplant's gear cost was
		// simply never ported.
		expect(r.dataCenter).toEqual({ steel: 100, concrate: 10, microchip: 5 });
		expect(r.hydroplant).toEqual({ titanium: 2500, concrate: 100, gear: 5 });
	});
});

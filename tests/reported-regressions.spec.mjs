import { test, expect } from "@playwright/test";
import { openEditor } from "./helpers.mjs";

/**
 * Player-reported divergences from the live game. Every expected value is taken
 * from nuclear-unicorn/kittensgame, not from the editor's own behaviour.
 */

test.describe("achievement stars", () => {
	// AchievementsManager.load() only restores starUnlocked when the achievement
	// declares hasStar, so anything the game stars but the editor did not lost
	// its star on export - the same silent-data-loss shape as the warehouse stage.
	const STARRED = [
		"spaceOddity", "jupiterAscending", "youMonster", "serenity", "utopiaProject",
		"cathammer", "eternalBacchanalia", "challenger", "betterSafeThanSorry"
	];

	test("every achievement the game stars is starred here", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const starred = await page.evaluate(() =>
			window.gamePage.achievements.achievements.filter((a) => a.hasStar).map((a) => a.name));

		expect(starred.sort()).toEqual([...STARRED].sort());
	});

	test("stars survive an export/import round-trip", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const result = await page.evaluate((names) => {
			const g = window.gamePage;
			names.forEach((n) => {
				const a = g.achievements.get(n);
				a.unlocked = true;
				a.starUnlocked = true;
			});
			const save = g.exportSave(true);
			names.forEach((n) => {
				const a = g.achievements.get(n);
				a.unlocked = false;
				a.starUnlocked = false;
			});
			g.importSave(save);
			return names.map((n) => ({ name: n, star: g.achievements.get(n).starUnlocked }));
		}, STARRED);

		expect(result.filter((r) => !r.star)).toEqual([]);
	});

	test("marking hasStar without a starCondition would throw", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// AchievementMeta.update() calls starCondition() unconditionally whenever
		// hasStar is set, so the two must always be declared together.
		const missing = await page.evaluate(() =>
			window.gamePage.achievements.achievements
				.filter((a) => a.hasStar && typeof a.starCondition !== "function")
				.map((a) => a.name));

		expect(missing).toEqual([]);
	});
});

test.describe("sorrow", () => {
	test("caps at 17 plus blsLimit", async ({ page }) => {
		await openEditor(page, "?dev=0");
		const max = await page.evaluate(() => window.gamePage.resPool.get("sorrow").getMaxValue());
		expect(max).toBe(17);
	});
});

test.describe("spaceport pricing", () => {
	test("starchart cost climbs on its own steeper ratio", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// The Spaceport is a deliberate starchart sink: starchart alone is
		// multiplied by 1.35^val, on top of the usual 1.15^val.
		const prices = await page.evaluate(() => {
			const w = window.gamePage.bld.get("warehouse");
			w.set("stage", 1);
			const read = (val) => {
				w.val = val;
				const p = w.getPrices();
				return {
					starchart: p.find((x) => x.name === "starchart").val,
					titanium: p.find((x) => x.name === "titanium").val
				};
			};
			return { at0: read(0), at3: read(3) };
		});

		expect(prices.at0.starchart).toBeCloseTo(100000, 6);
		expect(prices.at3.starchart).toBeCloseTo(100000 * Math.pow(1.15, 3) * Math.pow(1.35, 3), 4);
		// Everything else keeps the ordinary ratio.
		expect(prices.at3.titanium).toBeCloseTo(10000 * Math.pow(1.15, 3), 6);
	});
});

test.describe("temporal press", () => {
	async function withCompletions(page, on) {
		return page.evaluate((n) => {
			const g = window.gamePage;
			const raw = JSON.parse(window.LZString.decompressFromBase64(g.exportSave(true)));
			raw.challenges = raw.challenges || {};
			const list = (raw.challenges.challenges || []).filter((c) => c.name !== "1000Years");
			list.push({ name: "1000Years", on: n, val: n, unlocked: true, researched: n > 0 });
			raw.challenges.challenges = list;
			g.importSave(window.LZString.compressToBase64(JSON.stringify(raw)));
			g.update();
			const tp = g.time.getCFU("temporalPress");
			return { priceRatio: tp.priceRatio, automation: tp.isAutomationEnabled, on: tp.getOn() };
		}, on);
	}

	test("price ratio keeps improving to 90 completions, then floors at 1.01", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// The editor floored at 1.05, which stopped the discount at 50.
		expect((await withCompletions(page, 50)).priceRatio).toBeCloseTo(1.05, 6);
		expect((await withCompletions(page, 90)).priceRatio).toBeCloseTo(1.01, 6);
		expect((await withCompletions(page, 200)).priceRatio).toBeCloseTo(1.01, 6);
	});

	test("automation unlocks only from the second completion", async ({ page }) => {
		await openEditor(page, "?dev=0");
		expect((await withCompletions(page, 1)).automation).toBeNull();
		expect((await withCompletions(page, 2)).automation).toBe(false);
	});

	test("has no build cap, so the on field is usable", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// limitBuild: 0 clamped getOn() to zero, leaving no usable input.
		const r = await page.evaluate(() => {
			const tp = window.gamePage.time.getCFU("temporalPress");
			tp.val = 10;
			tp.on = 7;
			return { limitBuild: tp.limitBuild, on: tp.getOn() };
		});

		expect(r.limitBuild).toBeUndefined();
		expect(r.on).toBe(10);
	});

	test("isAutomationEnabled round-trips instead of being forced false", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const r = await page.evaluate(() => {
			const g = window.gamePage;

			// Automation only exists once 1000Years has been completed twice; below
			// that the game deliberately forces the flag back to null, so the
			// round-trip is only meaningful with the feature actually unlocked.
			const ch = g.challenges.getChallenge("1000Years");
			ch.val = 2;
			ch.on = 2;
			ch.researched = true;

			const tp = g.time.getCFU("temporalPress");
			tp.val = 5;
			tp.isAutomationEnabled = true;

			const save = g.exportSave(true);
			const raw = JSON.parse(window.LZString.decompressFromBase64(save));
			const saved = raw.time.cfu.find((c) => c.name === "temporalPress");

			tp.isAutomationEnabled = false;
			g.importSave(save);
			g.update();

			return { saved: saved.isAutomationEnabled, restored: g.time.getCFU("temporalPress").isAutomationEnabled };
		});

		expect(r.saved).toBe(true);
		expect(r.restored).toBe(true);
	});
});

test.describe("energy", () => {
	test("production and consumption ratios are applied", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// Tooltips previously showed raw wattage: no darkNova bonus on producers,
		// no energy-challenge reduction on consumers.
		const r = await page.evaluate(() => {
			const g = window.gamePage;
			const base = {
				prod: g.resPool.getEnergyProductionRatio(),
				cons: g.resPool.getEnergyConsumptionRatio()
			};

			const dn = g.religion.getTU("darkNova");
			dn.val = 5;
			dn.on = 5;
			const ec = g.challenges.getChallenge("energy");
			ec.val = 10;
			ec.on = 10;
			ec.active = false;
			g.calculateAllEffects();
			g.update();

			return {
				base,
				prod: g.resPool.getEnergyProductionRatio(),
				cons: g.resPool.getEnergyConsumptionRatio()
			};
		});

		expect(r.base.prod).toBe(1);
		expect(r.base.cons).toBe(1);
		expect(r.prod).toBeCloseTo(1 + 5 * 0.02, 6);
		expect(r.cons).toBeCloseTo(1 - 10 * 0.02, 6);
	});

	test("chronoforge upgrades recalculate their effects on update", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// Only blastFurnace used to recalculate, because its own action called
		// calculateEffects; nothing invoked it for the others.
		const called = await page.evaluate(() => {
			const g = window.gamePage;
			const hits = [];
			g.time.cfu.forEach((c) => {
				if (typeof c.calculateEffects === "function" && !c.__probed) {
					const orig = c.calculateEffects;
					c.calculateEffects = function (...args) {
						hits.push(c.name);
						return orig.apply(this, args);
					};
					c.__probed = true;
				}
			});
			g.update();
			return [...new Set(hits)].sort();
		});

		expect(called).toContain("temporalPress");
		expect(called).toContain("blastFurnace");
	});
});

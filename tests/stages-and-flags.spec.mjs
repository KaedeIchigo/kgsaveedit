import { test, expect } from "@playwright/test";
import { openEditor } from "./helpers.mjs";

/**
 * Feature flag values as shipped in Kittens Game 1.5.0.3 (game.js featureFlags).
 *
 * These are asserted as *data* rather than through getFeatureFlag(), on purpose.
 * getFeatureFlag() short-circuits to true for localhost/127.0.0.1/file:, and the
 * whole suite runs on 127.0.0.1 - so a behavioural test would pass no matter what
 * these values said. That blind spot is exactly how MAUSOLEUM_PACTS sat at
 * main:false long after the game enabled it, silently zeroing every pact effect
 * for anyone using a deployed copy.
 */
const EXPECTED_FLAGS = {
	VILLAGE_MAP: { beta: true, main: false },
	SPACE_EXPL: { beta: false, main: false },
	MAUSOLEUM_PACTS: { beta: true, main: true },
	QUEUE: { beta: true, main: true },
	QUEUE_REDSHIFT: { beta: true, main: true },
	UNICORN_TEARS_CHALLENGE: { beta: true, main: true },
	DARK_PARACOSM: { beta: true, main: false }
};

test.describe("feature flags", () => {
	test("match the values shipped by the game", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const actual = await page.evaluate(() => window.gamePage.featureFlags);

		for (const [flag, expected] of Object.entries(EXPECTED_FLAGS)) {
			expect(actual[flag], `featureFlags.${flag} missing`).toBeTruthy();
			expect(
				{ beta: actual[flag].beta, main: actual[flag].main },
				`featureFlags.${flag} drifted from the game`
			).toEqual(expected);
		}
	});

	test("pact effects contribute once the pacts flag is on", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// PactMeta.getEffect() returns 0 outright when MAUSOLEUM_PACTS is false,
		// which is what stopped pacts reaching production per tick.
		const result = await page.evaluate(() => {
			const g = window.gamePage;
			const pact = g.religion.pacts.find((p) => p.name === "pactOfCleansing");
			pact.val = 4;
			pact.on = 4;
			return {
				flagOn: g.getFeatureFlag("MAUSOLEUM_PACTS"),
				perPact: pact.effects.pactGlobalResourceRatio,
				contributed: pact.getEffect("pactGlobalResourceRatio")
			};
		});

		expect(result.flagOn).toBe(true);
		expect(result.contributed).toBeCloseTo(result.perPact * 4, 10);
	});
});

test.describe("warehouse stages", () => {
	test("exposes both stages with the right labels", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const info = await page.evaluate(() => {
			const w = window.gamePage.bld.get("warehouse");
			return {
				stageCount: w.stages?.length ?? 0,
				stageNames: (w.stages || []).map((s) => s.stageName),
				stageLabels: (w.stages || []).map((s) => s.label)
			};
		});

		expect(info.stageCount).toBe(2);
		expect(info.stageNames).toEqual(["warehouse", "spaceport"]);
		// The reported bug: a staged Spaceport displayed as "Warehouse".
		expect(info.stageLabels).toEqual(["Warehouse", "Spaceport"]);
	});

	test("renders the stage label, not the building id", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const domText = await page.evaluate(() => {
			const w = window.gamePage.bld.get("warehouse");
			w.set("stage", 1);
			window.gamePage.update();
			return w.nameNode ? w.nameNode.textContent.trim() : null;
		});

		expect(domText).toContain("Spaceport");
	});

	test("stage survives an export/import round-trip", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// BuildingMeta.load() only restores `stage` when the building declares a
		// stages array. While warehouse had none, a save with a Spaceport came
		// back as a plain Warehouse - silent data loss, not just a bad label.
		const result = await page.evaluate(() => {
			const g = window.gamePage;
			const w = g.bld.get("warehouse");
			w.val = 7;
			w.on = 7;
			w.set("stage", 1);

			const save = g.exportSave(true);
			const raw = JSON.parse(window.LZString.decompressFromBase64(save));
			const inSave = raw.buildings.find((b) => b.name === "warehouse");

			w.set("stage", 0);
			w.val = 0;
			w.on = 0;

			const imported = g.importSave(save);
			const after = g.bld.get("warehouse");

			return {
				savedStage: inSave.stage,
				imported,
				stage: after.stage,
				val: after.val
			};
		});

		expect(result).toEqual({ savedStage: 1, imported: true, stage: 1, val: 7 });
	});

	test("every staged building in the game is staged here too", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// Guards the general form of the warehouse bug: the game gained a stage and
		// the editor did not follow, so the stage was dropped on load.
		const staged = await page.evaluate(() => {
			const g = window.gamePage;
			return ["pasture", "aqueduct", "library", "warehouse", "amphitheatre"]
				.map((n) => ({ name: n, stages: g.bld.get(n)?.stages?.length ?? 0 }))
				.filter((b) => b.stages < 2)
				.map((b) => b.name);
		});

		expect(staged).toEqual([]);
	});
});

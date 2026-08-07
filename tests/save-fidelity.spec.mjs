import { test, expect } from "@playwright/test";
import { openEditor } from "./helpers.mjs";

/**
 * The game's saveData.game block must survive an export/import round-trip
 * untouched. Reported via the dev tab's save diff, which showed the editor
 * dropping half of game.opts and inventing keys of its own.
 */

/** Round-trips a save and reports what changed in its `game` block. */
async function roundTripGameBlock(page, mutate) {
	return page.evaluate((mutateSrc) => {
		const g = window.gamePage;
		const raw = JSON.parse(window.LZString.decompressFromBase64(g.exportSave(true)));
		raw.game = raw.game || {};

		// eslint-disable-next-line no-new-func
		new Function("game", mutateSrc)(raw.game);

		const before = JSON.parse(JSON.stringify(raw.game));
		g.importSave(window.LZString.compressToBase64(JSON.stringify(raw)));
		const after = JSON.parse(window.LZString.decompressFromBase64(g.exportSave(true))).game;

		const lost = [];
		const added = [];
		const changed = [];
		const walk = (a, b, prefix) => {
			Object.keys(a).forEach((k) => {
				if (!(k in b)) lost.push(prefix + k);
				else if (typeof a[k] !== "object" && JSON.stringify(a[k]) !== JSON.stringify(b[k])) {
					changed.push(`${prefix}${k}: ${a[k]} -> ${b[k]}`);
				}
			});
			Object.keys(b).forEach((k) => {
				if (!(k in a)) added.push(prefix + k);
			});
		};
		walk(before, after, "");
		walk(before.opts || {}, after.opts || {}, "opts.");

		return { lost, added, changed, after };
	}, `(${mutate.toString()})(game)`);
}

test.describe("game block round-trip", () => {
	test("keeps opts entries the editor has no UI for", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// game.opts is open-ended - the game declares only notation and batchSize
		// and lets settings.js add the rest - so a whitelist silently discarded
		// these five.
		const r = await roundTripGameBlock(page, (game) => {
			game.opts = Object.assign({}, game.opts || {}, {
				fontSize: 14,
				hodl: false,
				ksEnabled: false,
				useSwipeNavigation: false,
				useWorkers: true,
				notation: "si",
				batchSize: 10
			});
		});

		expect(r.lost, "keys dropped by the round-trip").toEqual([]);
		expect(r.changed, "values altered by the round-trip").toEqual([]);
		expect(r.after.opts.fontSize).toBe(14);
		expect(r.after.opts.useSwipeNavigation).toBe(false);
	});

	test("preserves startedWithoutChronospheres", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// Dropping it downgrades a player's jupiterAscending star, since the game
		// uses this flag to decide whether the starred variant was earned.
		const r = await roundTripGameBlock(page, (game) => {
			game.startedWithoutChronospheres = true;
		});

		expect(r.after.startedWithoutChronospheres).toBe(true);
		expect(r.lost).toEqual([]);
	});

	test("does not write the legacy top-level useWorkers", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// settings.js migrates game.useWorkers into game.opts.useWorkers on load,
		// so emitting the legacy key overwrites the player's real setting.
		const r = await roundTripGameBlock(page, (game) => {
			game.opts = Object.assign({}, game.opts || {}, { useWorkers: true });
		});

		expect("useWorkers" in r.after).toBe(false);
		expect(r.after.opts.useWorkers).toBe(true);
	});

	test("emits the same key set the game does", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const keys = await page.evaluate(() => {
			const g = window.gamePage;
			return Object.keys(JSON.parse(window.LZString.decompressFromBase64(g.exportSave(true))).game).sort();
		});

		// Mirrors saveData.game in game.js. forceShowLimits is deliberately gone:
		// it no longer exists anywhere in the game.
		expect(keys).toEqual([
			"cheatMode", "colorScheme", "deadKittens", "ironWill", "isCMBREnabled",
			"karmaKittens", "karmaZebras", "lastBackup", "opts",
			"startedWithoutChronospheres", "unlockedSchemes"
		]);
	});
});

import { test, expect } from "@playwright/test";
import { openEditor } from "./helpers.mjs";

/**
 * Regressions reported by players comparing the editor's production figures
 * against a live game. Every expectation here is derived from religion.js in
 * nuclear-unicorn/kittensgame, not from the editor's own behaviour.
 */

/** Puts the editor in a known pact state: given tier, all pacts at 1, no debt. */
async function setupPacts(page, transcendenceTier) {
	return page.evaluate((tier) => {
		const g = window.gamePage;
		g.religion.transcendenceTier = tier;
		const zu = g.religion.getZU("blackPyramid");
		zu.val = 1;
		zu.on = 1;
		g.religion.necrocornDeficit = 0;
		g.religion.pacts
			.filter((p) => p.name.startsWith("pactOf"))
			.forEach((p) => { p.val = 1; p.on = 1; });
		g.calculateAllEffects();
		g.update();
		return {
			resourceRatio: g.getEffect("pyramidGlobalResourceRatio"),
			perYearRatio: g.getEffect("pyramidPerYearRatio"),
			craftRatio: zu.effects.craftRatio,
			universalKnowHow: zu.effects.UniversalKnowHow,
			timeRatio: zu.effects.timeRatio
		};
	}, transcendenceTier);
}

test.describe("black pyramid pact scaling", () => {
	test("scales by (transcendenceTier - 24), matching the game", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// pactOfCleansing contributes pactGlobalResourceRatio: 0.0005 per pact.
		// The editor previously used (tier - 25), losing one whole multiple of
		// every pact effect at any tier above 25.
		const atTier31 = await setupPacts(page, 31);
		expect(atTier31.resourceRatio).toBeCloseTo(0.0005 * (31 - 24), 10);

		const atTier40 = await setupPacts(page, 40);
		expect(atTier40.resourceRatio).toBeCloseTo(0.0005 * (40 - 24), 10);
	});

	test("the modifier floors at 1 below tier 25", async ({ page }) => {
		await openEditor(page, "?dev=0");
		const low = await setupPacts(page, 10);
		expect(low.resourceRatio).toBeCloseTo(0.0005, 10);
	});

	test("re-exports pactOfArcane and pactOfChronicler effects", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// These ride on prefixEffectNames / the PerYearRatio simple name, none of
		// which the editor declared - so both pacts contributed exactly nothing.
		const r = await setupPacts(page, 31);
		const modifier = 31 - 24;

		expect(r.perYearRatio, "pactOfChronicler pactPerYearRatio").toBeCloseTo(0.003 * modifier, 10);
		expect(r.craftRatio, "pactOfArcane pactcraftRatio").toBeCloseTo(0.001 * modifier, 10);
		expect(r.universalKnowHow, "pactOfArcane pactUniversalKnowHow").toBeCloseTo(0.1 * modifier, 10);
		expect(r.timeRatio, "pactOfChronicler pacttimeRatio").toBeCloseTo(0.1 * modifier, 10);
	});
});

test.describe("necrocorn debt penalty", () => {
	test("follows the game's formula rather than a hardcoded /50", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const results = await page.evaluate(() => {
			const g = window.gamePage;
			const read = (deficit) => {
				g.religion.necrocornDeficit = deficit;
				return g.religion.getDebtPenaltyRatio();
			};
			// The editor tracks the fractured state on the manager rather than on
			// the pact's val/on, which is what PactMeta.getOn("fractured") reads.
			g.religion.isFractured = false;

			const out = {
				noDebt: read(0),
				half: read(25),
				atFracture: read(50),
				beyondFracture: read(80)
			};

			g.religion.isFractured = true;
			out.withFracturedPact = read(0);
			g.religion.isFractured = false;
			return out;
		});

		expect(results.noDebt).toBe(1);
		expect(results.half).toBeCloseTo(0.5, 10);
		expect(results.atFracture).toBe(0);
		expect(results.beyondFracture).toBe(0);
		// The fractured pact means maximum debt regardless of the deficit value.
		expect(results.withFracturedPact).toBe(0);
	});
});

test.describe("holy genocide", () => {
	test("activeHG is returned directly, not squared", async ({ page }) => {
		await openEditor(page, "?dev=0");

		// calculateEffects assigns activeHolyGenocide into effects.activeHG, so the
		// generic "effectValue * activeHolyGenocide" path squared it.
		const r = await page.evaluate(() => {
			const g = window.gamePage;
			const hg = g.religion.getTU("holyGenocide");
			hg.val = 5;
			hg.on = 5;
			g.religion.activeHolyGenocide = 3;
			g.calculateAllEffects();
			g.update();
			return {
				activeHG: hg.getEffect("activeHG"),
				maxKittensRatio: hg.getEffect("maxKittensRatio"),
				simScalingRatio: hg.getEffect("simScalingRatio")
			};
		});

		expect(r.activeHG).toBe(3);
		expect(r.maxKittensRatio).toBeCloseTo(-0.01 * 3, 10);
		expect(r.simScalingRatio).toBeCloseTo(0.02 * 3, 10);
	});
});

test.describe("policy effects", () => {
	// The 1.5 policy port originally carried prices and exclusions but no
	// effects, so every one of them was inert.
	const WITH_EFFECTS = {
		griffinRelationsScouts: { hunterRatio: 0.5 },
		siphoning: { smallDebtPunishmentExemption: 5, repayDebtOnNecrocornGeneration: 1 },
		upfrontPayment: { pactNecrocornUpfrontCost: 2 },
		nagaRelationsMasons: null,
		dragonRelationsAstrologers: null
	};

	test("ported policies declare the game's effects", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const actual = await page.evaluate((names) => {
			const g = window.gamePage;
			const out = {};
			for (const n of names) {
				const p = g.science.getPolicy(n);
				out[n] = p ? p.effects || null : "MISSING";
			}
			return out;
		}, Object.keys(WITH_EFFECTS));

		for (const [name, expected] of Object.entries(WITH_EFFECTS)) {
			expect(actual[name], `${name} not found`).not.toBe("MISSING");
			expect(actual[name], `${name} has no effects`).toBeTruthy();
			if (expected) {
				for (const [key, val] of Object.entries(expected)) {
					expect(actual[name][key], `${name}.${key}`).toBeCloseTo(val, 10);
				}
			}
		}
	});

	test("siphoning's exemption actually reaches the debt calculation", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const r = await page.evaluate(() => {
			const g = window.gamePage;
			const siphoning = g.science.getPolicy("siphoning");
			g.religion.isFractured = false;
			g.religion.necrocornDeficit = 4;

			siphoning.researched = false;
			g.calculateAllEffects();
			const without = g.religion.getDebtPenaltyRatio();

			siphoning.researched = true;
			g.calculateAllEffects();
			const withPolicy = g.religion.getDebtPenaltyRatio();

			return { without, withPolicy };
		});

		// A deficit of 4 is punished without the policy, and fully exempt with it
		// (smallDebtPunishmentExemption: 5).
		expect(r.without).toBeLessThan(1);
		expect(r.withPolicy).toBe(1);
	});
});

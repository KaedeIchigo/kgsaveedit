import { test, expect } from "@playwright/test";
import { openEditor, expectNoProblems } from "./helpers.mjs";

/**
 * Content added to Kittens Game between 1.4.9.0 (where upstream stopped) and
 * 1.5.0.3, grouped by the accessor used to look each item up in the editor.
 *
 * Deliberately excluded: worship, epiphany and necrocornDeficit. The game
 * derives those in getPseudoResources() from religion state and never writes
 * them to a save, so a save editor has nothing to edit.
 */
const CONTENT = {
	resources: { get: "resPool.get", ids: ["plastic", "microchip"] },
	buildings: { get: "bld.get", ids: ["stasisPod"] },
	crafts: { get: "workshop.getCraft", ids: ["plastic", "microchip"] },
	upgrades: {
		get: "workshop.get",
		ids: ["prospecting", "petri", "freightfulExchange", "transportSuperposition",
			"tachyonModerator", "alicornStable"]
	},
	zebraUpgrades: { get: "workshop.getZebraUpgrade", ids: ["bloodstoneInstitute"] },
	religionUpgrades: { get: "religion.getRU", ids: ["frescoes"] },
	transcendenceUpgrades: { get: "religion.getTU", ids: ["darkParacosm"] },
	challenges: { get: "challenges.getChallenge", ids: ["unicornTears"] },
	perks: { get: "prestige.getPerk", ids: ["ambassadors", "treaties", "alicornmancy"] },
	jobs: { get: "village.getJob", ids: ["ambassador"] },
	achievements: {
		get: "achievements.get",
		ids: ["sadnessAbyss", "veryLargeArray", "eternalBacchanalia", "challenger",
			"betterSafeThanSorry"]
	},
	badges: {
		get: "achievements.getBadge",
		ids: ["sequenceBreak", "fantasticFurColor", "whatYearIsIt", "tardis",
			"wheredThisComeFrom", "lostDates", "buffet", "newHome",
			"betterSafeThanSorry", "soLongAndThanksForAllTheHay"]
	}
};

const POLICIES = [
	"dragonRelationsAstrologers", "dragonRelationsDynamicists", "dragonRelationsPhysicists",
	"griffinRelationsMachinists", "griffinRelationsMetallurgists", "griffinRelationsScouts",
	"lizardRelationsDiplomats", "lizardRelationsEcologists", "lizardRelationsPriests",
	"nagaRelationsArchitects", "nagaRelationsCultists", "nagaRelationsMasons",
	"sharkRelationsBotanists", "sharkRelationsMerchants", "sharkRelationsScribes",
	"spiderRelationsChemists", "spiderRelationsGeologists", "spiderRelationsPaleontologists",
	"scientificCommunism", "siphoning", "upfrontPayment", "feedingFrenzy"
];

test.describe("Kittens Game 1.5 content", () => {
	for (const [group, { get, ids }] of Object.entries(CONTENT)) {
		test(`${group} exist and resolve their labels`, async ({ page }) => {
			await openEditor(page, "?dev=0");

			const results = await page.evaluate(({ path, wanted }) => {
				const fn = path.split(".").reduce((o, k) => o?.[k], window.gamePage);
				const owner = path.split(".").slice(0, -1).reduce((o, k) => o?.[k], window.gamePage);
				return wanted.map((id) => {
					const item = fn.call(owner, id);
					const label = String(item?.label ?? item?.title ?? "");
					// $I() returns "$" + key when a translation is missing, so a
					// leading "$" means the item exists but has no string for it.
					return { id, found: Boolean(item), label, unresolved: label.startsWith("$") };
				});
			}, { path: get, wanted: ids });

			expect(results.filter((r) => !r.found).map((r) => r.id)).toEqual([]);
			expect(results.filter((r) => r.unresolved).map((r) => r.id)).toEqual([]);
		});
	}

	test("all 22 new policies exist and resolve", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const results = await page.evaluate((wanted) => wanted.map((id) => {
			const p = window.gamePage.science.getPolicy(id);
			const label = String(p?.label ?? "");
			return { id, found: Boolean(p), unresolved: label.startsWith("$") || !label };
		}), POLICIES);

		expect(results.filter((r) => !r.found).map((r) => r.id)).toEqual([]);
		expect(results.filter((r) => r.unresolved).map((r) => r.id)).toEqual([]);
	});

	test("no item anywhere in the UI has an unresolved label", async ({ page }) => {
		const problems = await openEditor(page, "?dev=0");

		// Catches missing translation keys across the whole dataset at once,
		// which is the failure mode a locale refresh is most likely to cause.
		const bad = await page.evaluate(() => {
			const g = window.gamePage;
			const out = [];
			const scan = (cat, arr) => (arr || []).forEach((o) => {
				const v = String(o?.label ?? o?.title ?? "");
				if (v.startsWith("$")) out.push(`${cat}:${o.name}`);
			});
			scan("resource", g.resPool.resources);
			scan("upgrade", g.workshop.upgrades);
			scan("craft", g.workshop.crafts);
			scan("zebraUpgrade", g.workshop.zebraUpgrades);
			scan("policy", g.science.policies);
			scan("tech", g.science.techs);
			scan("religionUpgrade", g.religion.religionUpgrades);
			scan("transcendenceUpgrade", g.religion.transcendenceUpgrades);
			scan("pact", g.religion.pacts);
			scan("perk", g.prestige.perks);
			scan("job", g.village.jobs);
			scan("challenge", g.challenges.challenges);
			scan("achievement", g.achievements.achievements);
			scan("badge", g.achievements.badges);
			return out;
		});

		expect(bad).toEqual([]);
		expectNoProblems(problems, "boot reported problems:");
	});

	test("new content survives a save round-trip", async ({ page }) => {
		await openEditor(page, "?dev=0");

		const result = await page.evaluate(() => {
			const g = window.gamePage;

			g.resPool.get("plastic").value = 4242;
			g.resPool.get("microchip").value = 77;
			g.bld.get("stasisPod").val = 3;
			g.science.getPolicy("feedingFrenzy").researched = true;
			g.prestige.getPerk("alicornmancy").researched = true;

			const save = g.exportSave(true);

			g.resPool.get("plastic").value = 0;
			g.resPool.get("microchip").value = 0;
			g.bld.get("stasisPod").val = 0;
			g.science.getPolicy("feedingFrenzy").researched = false;
			g.prestige.getPerk("alicornmancy").researched = false;

			const imported = g.importSave(save);

			return {
				imported,
				plastic: g.resPool.get("plastic").value,
				microchip: g.resPool.get("microchip").value,
				stasisPod: g.bld.get("stasisPod").val,
				feedingFrenzy: g.science.getPolicy("feedingFrenzy").researched,
				alicornmancy: g.prestige.getPerk("alicornmancy").researched
			};
		});

		expect(result).toEqual({
			imported: true,
			plastic: 4242,
			microchip: 77,
			stasisPod: 3,
			feedingFrenzy: true,
			alicornmancy: true
		});
	});

	test("declared target version matches the ported content", async ({ page }) => {
		await openEditor(page, "?dev=0");
		const version = await page.evaluate(() => window.editorVersion);
		expect(version).toBe("1.5.0.3");
	});
});

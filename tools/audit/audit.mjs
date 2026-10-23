/**
 * Parity audit: diffs this editor against a checkout of Kittens Game itself.
 *
 * The editor hand-duplicates the game's data and maths, so every upstream
 * balance change is a silent divergence until somebody notices it in-game.
 * This compares the two sources directly - ids, prices, feature flags, save
 * shapes - so drift is found by running a command rather than by a player
 * reporting it.
 *
 *   npm run audit -- ../kittensgame
 *
 * Exits non-zero when anything diverges, so CI can gate on it.
 */
import { read, blockFor, entryNames, objectFor, topLevelKeys, stripComments } from "./lib.mjs";

const GAME = process.argv[2];
const EDITOR = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

if (!GAME) {
	console.error("usage: npm run audit -- <path-to-kittensgame-checkout>");
	process.exit(2);
}

// Comments are stripped so entries disabled upstream are not counted as live.
const strip = (t) => (t === null ? null : stripComments(t));
const gj = (f) => strip(read(GAME + "/js/" + f));
const gRoot = (f) => strip(read(GAME + "/" + f));
const ej = (f) => strip(read(EDITOR + "/editor/" + f));

if (gj("buildings.js") === null) {
	console.error("not a Kittens Game checkout: " + GAME);
	process.exit(2);
}

let failures = 0;
const ok = (t, d) => console.log("  ok   " + t + (d ? "  " + d : ""));
const bad = (t, d) => {
	failures++;
	console.log("  FAIL " + t + "\n       " + String(d).split("\n").join("\n       "));
};

const LISTS = [
	["buildings",        "buildings.js",    /^\tbuildingsData\s*:\s*\[/m,         "e-buildings.js", /^\s*buildingsData\s*:\s*\[/m],
	["resources",        "resources.js",    /^\tresourceData\s*:\s*\[/m,          "e-resources.js", /^\s*resourceData\s*:\s*\[/m],
	["upgrades",         "workshop.js",     /^\tupgrades\s*:\s*\[/m,              "e-upgrades.js",  /^\s*upgradeData\s*:\s*\[/m],
	["crafts",           "workshop.js",     /^\tcrafts\s*:\s*\[/m,                "e-upgrades.js",  /^\s*craftData\s*:\s*\[/m],
	["zebraUpgrades",    "workshop.js",     /^\tzebraUpgrades\s*:\s*\[/m,         "e-upgrades.js",  /^\s*zebraUpgradesData\s*:\s*\[/m],
	["techs",            "science.js",      /^\ttechs\s*:\s*\[/m,                 "e-tech.js",      /^\s*techData\s*:\s*\[/m],
	["policies",         "science.js",      /^\tpolicies\s*:\s*\[/m,              "e-tech.js",      /^\s*policiesData\s*:\s*\[/m],
	["zigguratUpgrades", "religion.js",     /^\tzigguratUpgrades\s*:\s*\[/m,      "e-religion.js",  /^\s*zigguratUpgradesData\s*:\s*\[/m],
	["religionUpgrades", "religion.js",     /^\treligionUpgrades\s*:\s*\[/m,      "e-religion.js",  /^\s*religionUpgradesData\s*:\s*\[/m],
	["transcendence",    "religion.js",     /^\ttranscendenceUpgrades\s*:\s*\[/m, "e-religion.js",  /^\s*transcendenceUpgradesData\s*:\s*\[/m],
	["pacts",            "religion.js",     /^\tpacts\s*:\s*\[/m,                 "e-religion.js",  /^\s*pactsData\s*:\s*\[/m],
	["challenges",       "challenges.js",   /^[ \t]*challenges\s*:\s*\[/m,            "e-misc.js",      /^\s*challengesData\s*:\s*\[/m],
	["perks",            "prestige.js",     /^\s*perks\s*:\s*\[/m,                "e-prestige.js",  /^\s*perksData\s*:\s*\[/m],
	["achievements",     "achievements.js", /^[ \t]*achievements\s*:\s*\[/m,          "e-stats.js",     /^\s*achievementsData\s*:\s*\[/m],
	["badges",           "achievements.js", /^[ \t]*badges\s*:\s*\[/m,                "e-stats.js",     /^\s*badgesData\s*:\s*\[/m],
	["stats",            "stats.js",        /stats\s*:\s*\r?\n\s*\[/,             "e-stats.js",     /^\s*statsData\s*:\s*\[/m],
	["jobs",             "village.js",      /^\tjobs\s*:\s*\[/m,                  "e-village.js",   /^\s*jobsData\s*:\s*\[/m],
	["biomes",           "village.js",      /^\tbiomes\s*:\s*\[/m,                "e-village.js",   /^\s*biomesData\s*:\s*\[/m],
	["chronoforge",      "time.js",         /^\tchronoforgeUpgrades\s*:\s*\[/m,   "e-time.js",      /^\s*cfuData\s*:\s*\[/m],
	["voidSpace",        "time.js",         /^\s*voidspaceUpgrades\s*:\s*\[/m,    "e-time.js",      /^\s*vsuData\s*:\s*\[/m],
	["spacePrograms",    "space.js",        /^\tprograms\s*:\s*\[/m,              "e-space.js",     /^\s*programData\s*:\s*\[/m],
	["planets",          "space.js",        /^\tplanets\s*:\s*\[/m,               "e-space.js",     /^\s*planetData\s*:\s*\[/m]
];

console.log("\ncontent ids");
const blocks = {};
for (const [label, gFile, gRe, eFile, eRe] of LISTS) {
	const gb = blockFor(gj(gFile), gRe, "[", "]");
	const eb = blockFor(ej(eFile), eRe, "[", "]");
	if (gb === null || eb === null) {
		bad(label, "data block not found (" + (gb === null ? "game" : "editor") + ")");
		continue;
	}
	blocks[label] = { gb, eb };
	const g = entryNames(gb);
	const e = entryNames(eb);
	const missing = g.filter((x) => !e.includes(x));
	const extra = e.filter((x) => !g.includes(x));
	if (missing.length || extra.length) {
		bad(label, [
			missing.length ? "missing: " + missing.join(", ") : "",
			extra.length ? "extra: " + extra.join(", ") : ""
		].filter(Boolean).join("\n"));
	} else {
		ok(label, String(g.length));
	}
}

/** Top-level price list of an entry; "DYNAMIC" when any value is computed. */
function literalPrices(src) {
	if (!src) return null;
	const m = /prices\s*:\s*\[/.exec(src);
	if (!m) return [];
	const start = src.indexOf("[", m.index);
	let d = 0, i = start;
	for (; i < src.length; i++) {
		if (src[i] === "[") d++;
		else if (src[i] === "]") { d--; if (d === 0) break; }
	}
	const body = src.slice(start + 1, i);
	if (/val\s*:\s*[^,\s}]*[A-Za-z_]/.test(body)) return "DYNAMIC";
	return [...body.matchAll(/name\s*:\s*"([A-Za-z0-9_]+)"\s*,\s*val\s*:\s*([0-9.eE+-]+)/g)]
		.map((p) => p[1] + ":" + Number(p[2])).sort();
}

console.log("\nprices");
let compared = 0, dynamic = 0, priceDiffs = 0;
for (const [label, pair] of Object.entries(blocks)) {
	for (const id of entryNames(pair.gb)) {
		const g = literalPrices(objectFor(pair.gb, id));
		const e = literalPrices(objectFor(pair.eb, id));
		if (e === null) continue; // absent from the editor: reported by the id check
		if (g === "DYNAMIC" || e === "DYNAMIC") { dynamic++; continue; }
		compared++;
		if (JSON.stringify(g) !== JSON.stringify(e)) {
			priceDiffs++;
			bad(label + "/" + id, "game:   " + g.join("  ") + "\neditor: " + e.join("  "));
		}
	}
}
if (priceDiffs === 0) ok("base prices", compared + " compared, " + dynamic + " computed skipped");

/** Per-stage price lists, which the scan above cannot see. */
function stagePrices(src) {
	if (!src) return null;
	const m = /stages\s*:\s*\[/.exec(src);
	if (!m) return null;
	const start = src.indexOf("[", m.index);
	let d = 0, i = start;
	for (; i < src.length; i++) {
		if (src[i] === "[") d++;
		else if (src[i] === "]") { d--; if (d === 0) break; }
	}
	const body = src.slice(start + 1, i);
	const stages = [];
	let depth = 0, cur = "";
	for (const ch of body) {
		if (ch === "{") { depth++; if (depth === 1) { cur = ""; continue; } }
		if (ch === "}") { depth--; if (depth === 0) { stages.push(cur); continue; } }
		if (depth >= 1) cur += ch;
	}
	return stages.map((st) => {
		const pm = /prices\s*:\s*\[([^\]]*)\]/.exec(st);
		if (!pm) return [];
		return [...pm[1].matchAll(/name\s*:\s*"([A-Za-z0-9_]+)"\s*,\s*val\s*:\s*([0-9.eE+-]+)/g)]
			.map((x) => x[1] + ":" + Number(x[2])).sort();
	});
}

if (blocks.buildings) {
	let stageCompared = 0, stageDiffs = 0;
	for (const id of entryNames(blocks.buildings.gb)) {
		const g = stagePrices(objectFor(blocks.buildings.gb, id));
		const e = stagePrices(objectFor(blocks.buildings.eb, id));
		if (!g || !e) continue;
		for (let k = 0; k < Math.max(g.length, e.length); k++) {
			stageCompared++;
			if (JSON.stringify(g[k]) !== JSON.stringify(e[k])) {
				stageDiffs++;
				bad("stage " + id + "[" + k + "]",
					"game:   " + (g[k] || []).join("  ") + "\neditor: " + (e[k] || []).join("  "));
			}
		}
	}
	if (stageDiffs === 0) ok("stage prices", stageCompared + " compared");
}

console.log("\ncross-cutting");

// Feature flags gate whole subsystems: a stale value silently zeroes everything
// behind it, which is how pacts once contributed nothing to production.
function flagsOf(txt) {
	const body = blockFor(txt, /featureFlags\s*:\s*\{/) || "";
	const out = {};
	for (const m of body.matchAll(/([A-Z_][A-Z0-9_]*)\s*:\s*\{([^}]*)\}/g)) {
		out[m[1]] = { beta: /beta\s*:\s*true/.test(m[2]), main: /main\s*:\s*true/.test(m[2]) };
	}
	return out;
}
{
	const g = flagsOf(gRoot("game.js"));
	const e = flagsOf(ej("e-main.js"));
	const problems = [];
	for (const [k, v] of Object.entries(g)) {
		if (!e[k]) problems.push(k + ": missing (game beta:" + v.beta + " main:" + v.main + ")");
		else if (e[k].beta !== v.beta || e[k].main !== v.main) {
			problems.push(k + ": game beta:" + v.beta + " main:" + v.main +
				" | editor beta:" + e[k].beta + " main:" + e[k].main);
		}
	}
	if (problems.length) bad("featureFlags", problems.join("\n"));
	else ok("featureFlags", String(Object.keys(g).length));
}

// Effects missing from the editor's table render as raw identifiers in tooltips.
{
	const g = topLevelKeys(blockFor(gRoot("game.js"), /effectMeta\s*:\s*\{/));
	const e = topLevelKeys(blockFor(ej("e-main.js"), /effectMeta\s*:\s*\{/));
	const en = JSON.parse(read(EDITOR + "/res/i18n/en.json"));
	const missing = g.filter((k) => !e.includes(k));
	// Only entries with a title key are worth porting: without one they would
	// render "$effectsMgr.statics.<name>.title", worse than the raw identifier.
	const portable = missing.filter((k) => en["effectsMgr.statics." + k + ".title"]);
	if (portable.length) bad("effectMeta", portable.length + " portable missing: " + portable.join(", "));
	else ok("effectMeta", g.length + " in game, " + missing.length + " untranslatable and skipped");
}

// The editor only restores a star for an achievement it knows is starred.
{
	const starredIn = (txt, startRe, endRe, markers) => {
		const out = [];
		let on = false, cur = null;
		for (const ln of txt.split(/\r?\n/)) {
			if (!on) { if (startRe.test(ln)) on = true; continue; }
			if (endRe.test(ln)) break;
			const n = /^\s*name\s*:\s*"([A-Za-z0-9]+)"/.exec(ln);
			if (n) { cur = { name: n[1], star: false }; out.push(cur); continue; }
			if (cur && markers.some((m) => ln.includes(m))) cur.star = true;
		}
		return out.filter((a) => a.star).map((a) => a.name).sort();
	};
	const g = starredIn(gj("achievements.js"), /^[ \t]*achievements\s*:/m, /^[ \t]*badges\s*:/m,
		["starDescription", "starCondition"]);
	const e = starredIn(ej("e-stats.js"), /^\s*achievementsData\s*:/m, /^\tbadgesData\s*:/m, ["hasStar"]);
	const missing = g.filter((n) => !e.includes(n));
	if (missing.length) bad("starred achievements", "missing hasStar: " + missing.join(", "));
	else ok("starred achievements", String(g.length));
}

// A building that gains a stage upstream loses that stage on load here.
{
	const stagedIn = (txt) => {
		const out = new Set();
		let cur = null;
		for (const ln of txt.split(/\r?\n/)) {
			const n = /^\s*name\s*:\s*"([A-Za-z0-9]+)"/.exec(ln);
			if (n) cur = n[1];
			if (/^\s*stages\s*:\s*\[/.test(ln) && cur) out.add(cur);
		}
		return [...out];
	};
	const g = stagedIn(gj("buildings.js"));
	const e = stagedIn(ej("e-buildings.js"));
	const missing = g.filter((b) => !e.includes(b));
	if (missing.length) bad("staged buildings", "missing stages: " + missing.join(", "));
	else ok("staged buildings", g.join(", "));
}

// Unknown console filters surface in the Extras tab as unhandled save data.
{
	const g = topLevelKeys(blockFor(gRoot("core.js"), /filters\s*:\s*\{/));
	const e = topLevelKeys(blockFor(ej("e-misc.js"), /filtersData\s*:\s*\{/));
	const missing = g.filter((f) => !e.includes(f));
	if (missing.length) bad("console filters", "missing: " + missing.join(", "));
	else ok("console filters", String(g.length));
}

// Inventing or dropping keys in the game block corrupts a player's settings.
{
	const keysOf = (txt) => {
		const b = blockFor(txt, /saveData\.game\s*=\s*\{/);
		return b ? [...b.matchAll(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/gm)].map((m) => m[1]).sort() : null;
	};
	const g = keysOf(gRoot("game.js"));
	const e = keysOf(ej("e-main.js"));
	if (!g || !e) bad("saveData.game", "block not found");
	else {
		const missing = g.filter((k) => !e.includes(k));
		const extra = e.filter((k) => !g.includes(k));
		if (missing.length || extra.length) {
			bad("saveData.game keys", "missing: " + (missing.join(", ") || "-") +
				" | extra: " + (extra.join(", ") || "-"));
		} else {
			ok("saveData.game keys", String(g.length));
		}
	}
}

// The one change that would make this a format migration rather than a port.
{
	const v = (t) => (/saveVersion\s*:\s*(\d+)/.exec(t) || [])[1];
	const g = v(gRoot("game.js"));
	const e = v(ej("e-main.js"));
	if (g === e) ok("saveVersion", g);
	else bad("saveVersion", "game " + g + ", editor " + e + " - save format changed");
}

console.log("\n" + (failures === 0
	? "PASS - editor matches the game"
	: failures + " divergence(s) found") + "\n");
process.exit(failures === 0 ? 0 : 1);

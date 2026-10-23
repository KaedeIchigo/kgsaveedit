import { readFileSync, existsSync } from "node:fs";


/** Removes block and line comments so disabled entries are not counted as live. */
export function stripComments(text) {
	let out = "", i = 0;
	const n = text.length;
	while (i < n) {
		const c = text[i], d = text[i + 1];
		if (c === '"' || c === "'" || c === "`") {
			const q = c;
			out += c; i++;
			while (i < n) {
				if (text[i] === "\\") { out += text[i] + (text[i + 1] || ""); i += 2; continue; }
				out += text[i];
				if (text[i] === q) { i++; break; }
				i++;
			}
			continue;
		}
		if (c === "/" && d === "*") {
			i += 2;
			while (i < n && !(text[i] === "*" && text[i + 1] === "/")) i++;
			i += 2; out += " "; continue;
		}
		if (c === "/" && d === "/") {
			while (i < n && text[i] !== "\n") i++;
			continue;
		}
		out += c; i++;
	}
	return out;
}

export const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);

/** Brace-matched object literal for `name: "<id>"` within text. */
export function objectFor(text, id) {
	const m = new RegExp(String.raw`name\s*:\s*"` + id + `"`).exec(text);
	if (!m) return null;
	let start = m.index;
	while (start > 0 && text[start] !== "{") start--;
	let depth = 0, i = start;
	for (; i < text.length; i++) {
		if (text[i] === "{") depth++;
		else if (text[i] === "}") { depth--; if (depth === 0) break; }
	}
	return text.slice(start, i + 1);
}

/** Brace-matched body of `<key>: {` or `<key>: [`. */
export function blockFor(text, keyRe, open = "{", close = "}") {
	const m = keyRe.exec(text);
	if (!m) return null;
	const start = text.indexOf(open, m.index + m[0].length - 1);
	if (start < 0) return null;
	let depth = 0, i = start;
	for (; i < text.length; i++) {
		if (text[i] === open) depth++;
		else if (text[i] === close) { depth--; if (depth === 0) break; }
	}
	return text.slice(start + 1, i);
}

/** Top-level `"key": {` names inside an object body (depth-aware). */
export function topLevelKeys(body) {
	const keys = [];
	let d = 0;
	const re = /"([A-Za-z0-9_]+)"\s*:\s*\{|\{|\}/g;
	let t;
	while ((t = re.exec(body)) !== null) {
		if (t[1] !== undefined) { if (d === 0) keys.push(t[1]); d++; }
		else if (t[0] === "{") d++;
		else d--;
	}
	return keys;
}

/** `name: "x"` ids inside an array body, at brace-depth 1 only. */
export function entryNames(body) {
	const names = [];
	let d = 0;
	const re = /\{|\}|name\s*:\s*"([A-Za-z0-9_]+)"/g;
	let t;
	while ((t = re.exec(body)) !== null) {
		if (t[0] === "{") d++;
		else if (t[0] === "}") d--;
		else if (d === 1) names.push(t[1]);
	}
	return names;
}

export function diff(label, game, editor) {
	const missing = game.filter((x) => !editor.includes(x));
	const extra = editor.filter((x) => !game.includes(x));
	return { label, game: game.length, editor: editor.length, missing, extra };
}

export function report(rows) {
	let issues = 0;
	for (const r of rows) {
		const bad = r.missing.length || r.extra.length;
		if (bad) issues++;
		console.log(`\n${bad ? "FAIL" : "ok  "}  ${r.label.padEnd(30)} game:${String(r.game).padStart(4)} editor:${String(r.editor).padStart(4)}`);
		if (r.missing.length) console.log(`        missing from editor (${r.missing.length}): ${r.missing.join(", ")}`);
		if (r.extra.length) console.log(`        only in editor (${r.extra.length}): ${r.extra.join(", ")}`);
	}
	return issues;
}

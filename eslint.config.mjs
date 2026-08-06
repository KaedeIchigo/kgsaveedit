import js from "@eslint/js";
import globals from "globals";

export default [
	{
		// Vendored third-party libraries and minified bundles are not ours to lint.
		ignores: [
			"lib/**",
			"dev/*.min.js",
			"node_modules/**"
		]
	},

	js.configs.recommended,

	{
		files: ["**/*.js"],
		languageOptions: {
			// The editor ships as plain <script> tags with no build step, so
			// everything is classic (non-module) script scope.
			ecmaVersion: 2022,
			sourceType: "script",
			globals: {
				...globals.browser,
				...globals.jquery
			}
		},
		linterOptions: {
			reportUnusedDisableDirectives: "warn"
		},
		rules: {
			// The codebase is ES5-era and uses `var` throughout. Modernising that is a
			// separate, testable change - not something lint should churn on today.
			"no-var": "off",

			eqeqeq: ["warn", "smart"],
			"no-unused-vars": ["warn", { args: "none" }],
			"no-console": "off",
			curly: ["warn", "all"],
			semi: ["error", "always"],
			quotes: ["warn", "double", { avoidEscape: true }],

			// Indentation is left to .editorconfig. Every module body sits at column 0
			// inside a top-level `require([], function () { ... })` wrapper, which is
			// the author's deliberate style; enforcing `indent` would reformat ~18.5k
			// lines and destroy `git blame` for no functional gain.
			indent: "off",

			"no-trailing-spaces": "warn",
			"eol-last": ["warn", "always"]
		}
	},

	{
		// Tooling and tests are modern Node ESM, unlike the editor source.
		files: ["**/*.mjs"],
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: "module",
			globals: {
				...globals.node,
				// Callbacks handed to page.evaluate() are serialised and run inside
				// the browser, so these files legitimately reference both realms.
				...globals.browser
			}
		},
		rules: {
			"no-var": "error",
			eqeqeq: ["error", "smart"]
		}
	}
];

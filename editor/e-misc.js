/* global require, dojo, classes, $I, num */

require(["dojo/on"], function (on) {
"use strict";

dojo.declare("classes.KGSaveEdit.OptionsTab", classes.KGSaveEdit.UI.Tab, {
	options: [
		{
			name: "useWorkers",
			descKey: "ui.option.workers"
		}, {
			name: "forceHighPrecision",
			descKey: "ui.option.force.high.precision",
			src: "game.opts"
		}, {
			name: "usePerSecondValues",
			descKey: "ui.option.use.per.second.values",
			src: "game.opts"
		}, {
			name: "usePercentageResourceValues",
			descKey: "ui.option.use.percentage.resource.values",
			src: "game.opts"
		}, {
			name: "showNonApplicableButtons",
			descKey: "ui.option.show.non.applicable.buttons",
			src: "game.opts"
		}, {
			name: "usePercentageConsumptionValues",
			descKey: "ui.option.use.percentage.consumption.values",
			src: "game.opts"
		}, {
			name: "highlightUnavailable",
			descKey: "ui.option.highlight.unavailable",
			src: "game.opts"
		}, {
			name: "hideSell",
			descKey: "ui.option.hide.sell",
			src: "game.opts"
		}, {
			name: "hideDowngrade",
			descKey: "ui.option.hide.downgrade",
			src: "game.opts"
		}, {
			name: "hideBGImage",
			descKey: "ui.option.hide.bgimage",
			src: "game.opts"
		}, {
			name: "tooltipsInRightColumn",
			descKey: "ui.option.tooltips.right",
			src: "game.opts",
			class: "bottom-margin"
		}, {
			name: "noConfirm",
			descKey: "ui.option.no.confirm",
			src: "game.opts"
		}, {
			name: "IWSmelter",
			descKey: "ui.option.iw.smelter",
			src: "game.opts"
		}, {
			name: "disableTelemetry",
			descKey: "ui.option.disable.telemetry"
		}, {
			name: "enableRedshift",
			descKey: "ui.option.enable.redshift",
			src: "game.opts"
		}, {
			name: "disablePollution",
			descKey: "ui.option.pollution",
			src: "game.opts"
		}, {
			name: "enableRedshiftGflops",
			desc: "Enable offline gflops production",
			// descKey: "ui.option.enable.redshiftGflops",
			src: "game.opts"
		}, {
			name: "batchSize",
			descKey: "ui.option.batch.size",
			type: "int",
			parseFn: function (val) {
				return Math.max(Math.min(val, 9999), 1) || 10;
			},
			src: "game.opts"
		}, {
			name: "forceLZ",
			descKey: "ui.option.force.lz",
			src: "game.opts"
		}, {
			name: "compressSaveFile",
			descKey: "ui.option.compress.savefile",
			src: "game.opts",
			class: "bottom-margin"
		}, {
			name: "isCMBREnabled",
			desc: "Global donate bonus enabled",
			class: "hidden"
		}, {
			name: "ironWill",
			descKey: "challendge.ironWill.label",
			inputHandler: function () {
				this.game.calculateAllEffects();
			}
		}, {
			name: "cheatMode",
			descKey: "KGSaveEdit.opts.cheatMode",
			class: "bottom-margin"
		}
	],
	scheme: null,
	schemesData: [
		{name: "default"},
		{name: "dark"},
		{name: "grassy"},
		{name: "sleek"},
		{name: "black"},
		{name: "wood"},
		{name: "bluish"},
		{name: "grayish"},
		{name: "greenish"},
		{name: "tombstone"},
		{name: "spooky"},
		{
			name: "gold",
			condition: function (game) {
				return game.bld.get("mint").val >= 24;
			}
		}, {
			name: "space",
			condition: function (game) {
				return game.space.getProgram("sattelite").val >= 24;
			}
		}, {
			name: "school",
			condition: function (game) {
				return game.bld.get("academy").val >= 68;
			}
		}, {
			name: "fluid",
			condition: function (game) {
				return game.space.getProgram("hydrofracturer").val >= 10;
			}
		}, {
			name: "vessel",
			condition: function (game) {
				return game.space.getProgram("researchVessel").val >= 20;
			}
		}, {
			name: "minimalist",
			condition: function (game) {
				return game.bld.get("warehouse").val >= 10;
			}
		}, {
			name: "oil",
			condition: function (game) {
				return game.bld.get("oilWell").val >= 73;
			}
		}, {
			name: "unicorn",
			condition: function (game) {
				return game.religion.getZU("unicornUtopia").val >= 1;
			}
		}, {
			name: "anthracite",
			condition: function (game) {
				return game.bld.get("mine").val >= 92;
			}
		}, {
			name: "chocolate",
			condition: function (game) {
				return game.bld.get("brewery").val >= 10;
			}
		}, {
			name: "vintage",
			condition: function (game) {
				return game.time.getVSU("chronocontrol").val >= 1;
			}
		}, {
			name: "computer",
			condition: function (game) {
				var bld = game.bld.get("library");
				return bld.stage === 1 && bld.val >= 100;
			}
		}, {
			name: "arctic",
			condition: function (game) {
				return game.space.getBuilding("cryostation").val >= 10;
			}
		}, {
			name: "cyber",
			condition: function (game) {
				return game.bld.get("aiCore").val >= 5;
			}
		}, {
			name: "factory",
			condition: function (game) {
				return game.bld.get("factory").val >= 20;
			}
		}, {
			name: "catnip",
			condition: function (game) {
				return game.bld.get("field").val >= 56;
			}
		}, {
			name: "dune",
			condition: function (game) {
				return game.space.getBuilding("spiceRefinery").val >= 10;
			}
		}
	],
	schemes: null,

	notations: ["si", "e", "sie"],

	tabName: "Options &amp; Settings",

	constructor: function () {
		this.i18nKeys = {tabName: "KGSaveEdit.opts.tab"};

		this.schemes = [];
		for (var i = 0; i < this.schemesData.length; i++) {
			var scheme = new classes.KGSaveEdit.GenericItem(this.game, this.schemesData[i]);
			this.schemes.push(scheme);
		}
	},

	renderTabBlock: function () {
		var game = this.game;

		dojo.place(game.calendar.domNode, this.tabBlockNode);

		// schemes
		var panel = game._createPanel(this.tabBlockNode, {
			id: "colorSchemePanel",
			class: "bottom-margin"
		}, $I("KGSaveEdit.opts.colorScheme.header"), true);
		var table = dojo.create("table", {id: "colorSchemeBlock"}, panel.content);

		for (var i = 0; i < this.schemes.length; i++) {
			var scheme = this.schemes[i];
			scheme.unlocked = !scheme.condition;

			var tr = dojo.create("tr", {
				innerHTML: '<td class="schemeName">' + $I("opts.theme." + scheme.name) + "</td><td></td><td></td>",
				class: "schemeRow"
			}, table);
			scheme.domNode = tr;
			scheme.nameNode = tr.children[0];

			var input = game._createCheckbox($I("KGSaveEdit.opts.colorScheme.active"), tr.children[1]);
			input.cbox.type = "radio";
			input.cbox.name = "colorScheme";
			scheme.activeNode = input.cbox;

			if (game.colorScheme === scheme.name || scheme.name === "default") {
				scheme.activeNode.checked = true;
			}

			if (scheme.condition) {
				game._createCheckbox($I("KGSaveEdit.label.unlocked"), tr.children[2], scheme, "unlocked");
			}
		}

		panel = game._createPanel(this.tabBlockNode, {
			id: "optionsPanel",
			class: "bottom-margin"
		}, $I("menu.options"), true);

		var div = dojo.create("div", {
			class: "bottom-margin",
			innerHTML: $I("KGSaveEdit.opts.notation") + " "
		}, panel.content);

		var select = dojo.create("select", null, div);
		for (i = 0; i < this.notations.length; i++) {
			var notation = this.notations[i];
			dojo.create("option", {value: notation, innerHTML: $I("opts.notation." + notation)}, select);
		}
		select.defaultVal = "si";
		game._pairInput(select, game.opts, "notation");
		game.setSelectByValue(select, game.opts.notation || select.defaultVal);

		on(select, "change", function () {
			game.opts.notation = this.value || this.defaultVal;
			game._refreshAbbrInputs();
			game.update();
		});

		game.opts.notationNode = select;

		for (i = 0; i < this.options.length; i++) {
			var option = this.options[i];
			var ref = option.src === "game.opts" ? game.opts : game;

			div = dojo.create("div", {
				"data-option-name": option.name
			}, panel.content);

			var desc = option.desc || "";
			if (option.descKey) {
				desc = $I(option.descKey);
			}
			desc = desc.split("<br>")[0]; // trim off 'need to reload' part for web workers at least

			if (option.type === "int") {
				div.textContent = " ";
				dojo.create("span", {innerHTML: desc}, div);
				input = game._createInput({class: "integerInput"}, div, ref, option.name, "first");
				if (option.parseFn) {
					input.parseFn = option.parseFn;
				}

			} else {
				input = game._createCheckbox(desc, div, ref, option.name).cbox;
			}

			if (option.inputHandler) {
				input.handler = option.inputHandler;
			}

			if (option.class) {
				div.className = option.class;
			}
		}

		// misc stuff like dead Kittens & Karma
		table = dojo.create("table", {class: "bottom-margin"}, this.tabBlockNode);

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.opts.lastBackup") + "</td><td></td>"
		}, table);
		game._createTimeInput(null, tr.children[1], game, "lastBackup");

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("pollution.label") + "</td><td>ppm</td>"
		}, table);
		input = this.game._createInput({class: "abbrInput"}, tr.children[1], game.bld, "cathPollution", "first");
		input.displayFn = function (value) {
			return game.getDisplayValueExt((value / game.bld.getPollutionLevelBase()) * 100);
		};

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.opts.deadKittens") + "</td><td></td>"
		}, table);
		game._createInput({class: "integerInput"}, tr.children[1], game, "deadKittens");

		tr = dojo.create("tr", {innerHTML: "<td>karmaKittens</td><td>&nbsp; &harr; &nbsp;</td>"}, table);
		var td = tr.children[1];

		game._createInput({id: "karmaKittensNode", class: "abbrInput"},
			td, game, "karmaKittens", "first");
		game.karmaKittensKarma = game._createInput({class: "abbrInput"}, td);
		dojo.place(document.createTextNode(" " + $I("resources.karma.title")), td);

		game.karmaKittensNode.handler = function () {
			var value = game.getUnlimitedDR(this.parsedValue, 5);
			game.setInput(game.karmaKittensKarma, value, true);
			game.resPool.get("karma").set("value", value, true);
		};

		game.karmaKittensKarma.parseFn = function (value) {
			return game.getKarma(game.getKarmaKittens(value), 5);
		};
		game.karmaKittensKarma.handler = function () {
			game.resPool.get("karma").set("value", this.parsedValue, true);
			game.setInput(game.karmaKittensNode, game.getKarmaKittens(this.parsedValue), true);
		};

		tr = dojo.create("tr", {innerHTML: "<td>karmaZebras</td><td><td>"}, table);
		game._createInput({class: "integerInput"}, tr.children[1], game, "karmaZebras");

		dojo.place(game.console.domNode, this.tabBlockNode);

		dojo.place(game.telemetry.domNode, this.tabBlockNode);
	},

	updateTab: function () {
		var colorScheme = "default";
		var unlockedSchemes = [];
		for (var i = 0; i < this.schemes.length; i++) {
			var scheme = this.schemes[i];

			if (scheme.condition) {
				var conditionMet = scheme.condition(this.game);
				scheme.set("unlocked", conditionMet || scheme.unlockedNode.prevChecked, true);
				this.game.toggleDisabled(scheme.unlockedNode, conditionMet);
			}

			dojo.toggleClass(scheme.domNode, "spoiler", !scheme.unlocked);

			if (scheme.activeNode.checked) {
				colorScheme = scheme.name;
			}
			if (scheme.unlocked) {
				unlockedSchemes.push(scheme.name);
			}
		}
		this.game.colorScheme = colorScheme;
		this.game.unlockedSchemes = unlockedSchemes;
	},

	load: function (saveData) {
		var unlockedSchemes = [];
		if (saveData.game && saveData.game.unlockedSchemes) {
			unlockedSchemes = saveData.game.unlockedSchemes;
		}

		var colorScheme = this.game.colorScheme || "default";
		var setColorScheme = false;

		for (var i = this.schemes.length - 1; i >= 0; i--) {
			var scheme = this.schemes[i];
			scheme.set("unlocked", !scheme.condition || unlockedSchemes.indexOf(scheme.name) > -1);
			if (!setColorScheme && (scheme.name === colorScheme || scheme.name === "default")) {
				scheme.activeNode.checked = true;
				setColorScheme = true;
			}
		}
	}
});


dojo.declare("classes.KGSaveEdit.Calendar", classes.KGSaveEdit.TooltipItem, {
	game: null,

	seasons: [
		{
			name: "spring",
			modifiers: {"catnip": 1.5}
		}, {
			name: "summer",
			modifiers: {"catnip": 1.0}
		}, {
			name: "autumn",
			modifiers: {"catnip": 1.0}
		}, {
			name: "winter",
			modifiers: {"catnip": 0.25}
		}
	],

	cycleYearColors: [
		"#a00000",
		"#dba901",
		"#14cd61",
		"#01a9db",
		"#9a2efe"
	],

	cycles: [
		{
			name: "charon",
			glyph: "&#9049;",
			effects: {
				"moonOutpost-unobtainiumPerTickSpace": 0.9,
				"entangler-gflopsConsumption":         2
			},
			festivalEffects: {
				"catnip":   1.5,
				"wood":     1.5,
				"minerals": 1.5
			}
		}, {
			name: "umbra",
			glyph: "&#9062;",
			effects: {
				"hydrofracturer-oilPerTickAutoprodSpace": 0.75,
				"planetCracker-uraniumPerTickSpace":      0.9,
				"hrHarvester-energyProduction":           1.5
			},
			festivalEffects: {
				"coal":     1.5,
				"iron":     1.5,
				"titanium": 1.5,
				"gold":     1.5
			}
		}, {
			name: "yarn",
			glyph: "&#9063;",
			effects: {
				"hydroponics-catnipRatio":                  2,
				"researchVessel-starchartPerTickBaseSpace": 0.5
			},
			festivalEffects: {
				"culture": 2
			}
		}, {
			name: "helios",
			glyph: "&#8978;",
			effects: {
				"cryostation-woodMax":        0.9,
				"cryostation-mineralsMax":    0.9,
				"cryostation-coalMax":        0.9,
				"cryostation-ironMax":        0.9,
				"cryostation-titaniumMax":    0.9,
				"cryostation-oilMax":         0.9,
				"cryostation-uraniumMax":     0.9,
				"cryostation-unobtainiumMax": 0.9,
				"sunlifter-energyProduction": 1.5
			},
			festivalEffects: {
				"faith":    2,
				"unicorns": 1.25
			}
		}, {
			name: "cath",
			glyph: "&#9022;",
			effects: {
				"spaceStation-scienceRatio":             1.5,
				"sattelite-observatoryRatio":            2,
				"sattelite-starchartPerTickBaseSpace":   2,
				"spaceBeacon-starchartPerTickBaseSpace": 0.1,
				"spaceElevator-prodTransferBonus":       2
			},
			festivalEffects: {
				"manpower": 2
			}
		}, {
			name: "redmoon",
			titleKey: "space.planet.moon.label",
			glyph: "&#9052;",
			effects: {
				"moonOutpost-unobtainiumPerTickSpace": 1.2,
				"entangler-gflopsConsumption":         0.5
			},
			festivalEffects: {
				"unobtainium": 2
			}
		}, {
			name: "dune",
			glyph: "&#9067;",
			effects: {
				"hydrofracturer-oilPerTickAutoprodSpace": 1.5,
				"planetCracker-uraniumPerTickSpace":      1.1,
				"hrHarvester-energyProduction":           0.75
			},
			festivalEffects: {
				"uranium": 2
			}
		}, {
			name: "piscine",
			glyph: "&#9096;",
			effects: {
				"hydroponics-catnipRatio":                  0.5,
				"researchVessel-starchartPerTickBaseSpace": 1.5
			},
			festivalEffects: {
				"science": 2
			}
		}, {
			name: "terminus",
			glyph: "&#9053;",
			effects: {
				"cryostation-woodMax":        1.2,
				"cryostation-mineralsMax":    1.2,
				"cryostation-coalMax":        1.2,
				"cryostation-ironMax":        1.2,
				"cryostation-titaniumMax":    1.2,
				"cryostation-oilMax":         1.2,
				"cryostation-uraniumMax":     1.2,
				"cryostation-unobtainiumMax": 1.2,
				"sunlifter-energyProduction": 0.5
			},
			festivalEffects: {
				"oil": 2
			}
		}, {
			name: "kairo",
			glyph: "&#8483;",
			effects: {
				"spaceStation-scienceRatio":             0.75,
				"sattelite-observatoryRatio":            0.75,
				"sattelite-starchartPerTickBaseSpace":   0.75,
				"spaceBeacon-starchartPerTickBaseSpace": 5,
				"spaceElevator-prodTransferBonus":       0.5
			},
			festivalEffects: {
				"starchart": 5
			}
		}
	],

	ticksPerDay: 10,
	daysPerSeason: 100,
	seasonsPerYear: null,
	yearsPerCycle: null,
	darkFutureBeginning: 40000,

	refYear: 0, //to be used to calculate millennium paragon

	season: 0,
	cycle: 0,
	cycleYear: 0,

	day: 0,
	year: 0,

	weather: null, //warm / cold

	festivalDays: 0,
	futureSeasonTemporalParadox: -1,

	domNode: null,
	cycleEffectsNode: null,

	cryptoPrice: 1000,

	getCurSeason: function () {
		if (this.game.challenges.isActive("winterIsComing")) {
			return this.seasons[3]; //eternal winter
		}
		return this.seasons[this.season];
	},

	getWeatherMod: function (res) {
		var season = this.getCurSeason();
		var mod = season.modifiers[res.name] || 1;

		if (res.name !== "catnip") {
			return mod;
		}

		if (this.game.science.getPolicy("communism").owned() && season.name === "winter" && this.weather === "cold") {
			return 0;
		}

		if (this.weather == "warm") {
			mod +=  0.15;
		} else if (this.weather == "cold") {
			mod += -0.15;
		}
		if (this.game.challenges.getChallenge("winterIsComing").on && this.weather === "cold") {
			mod *= 1 + this.game.getLimitedDR(this.game.getEffect("coldHarshness"), 1);
		}
		if (this.getCurSeason().name == "spring") {
			mod *= (1 + this.game.getLimitedDR(this.game.getEffect("springCatnipRatio"), 2));
		}
		return mod;
	},

	constructor: function (game) {
		this.game = game;

		this.seasonsPerYear = this.seasons.length;
		this.yearsPerCycle = this.cycleYearColors.length;
	},

	getSeasonTitle: function (season) {
		var hasCome = this.game.challenges.isActive("winterIsComing");
		var titleSeason = this.seasons[hasCome ? 3 : season];
		var title = $I("calendar.season." + titleSeason.name);
		if (hasCome) {
			if (season == 0) {      title += " I"; }
			else if (season == 1) { title += " II"; }
			else if (season == 2) { title += " III"; }
			else if (season == 3) { title += " IV"; }
		}

		return title;
	},

	render: function () {
		var self = this;
		var game = self.game;

		var i, len;

		var panel = game._createPanel(null, {
			id: "calendarPanel",
			class: "bottom-margin"
		}, $I("KGSaveEdit.opts.calendar.header"), true);
		self.domNode = panel.panel;
		var table = dojo.create("table", {id: "calendarBlock"}, panel.content);

		var tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.opts.calendar.year") + "</td><td></td>"
		}, table);
		var td = tr.children[1];
		game._createInput({id: "yearNode", class: "integerInput"},
			td, self, "year");

		dojo.place(document.createTextNode(" \u00A0"), td); //insert &nbsp; equivalent

		self.millenniumParagonSpan = dojo.create("a", {
			id: "millenniumParagonSpan",
			href: "#",
			class: "hidden",
			innerHTML: "(+0 paragon)"
		}, td);

		on(self.millenniumParagonSpan, "click", function () {
			var millennia = Math.floor(Math.max(self.year - self.refYear, 0) / 1000);
			if (millennia > 0) {
				var paragon = game.resPool.get("paragon");
				paragon.set("value", paragon.value + millennia);
				var paragonStat = game.stats.getStat("totalParagon");
				paragonStat.set("val", paragonStat.val + millennia);

				var karmaKittensGain = game.religion.pactsMilleniumKarmaKittens(millennia);
				if (karmaKittensGain > 0) {
					var karma = game.resPool.get("karma");
					karma.set("value", game.getKarma(game.karmaKittens + karmaKittensGain));
				}
				self.refYear = self.year;
			}
			game.update();
		});

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.opts.calendar.cycle") + "</td><td> &nbsp;" + $I("KGSaveEdit.opts.calendar.year") + " </td>"
		}, table);

		self.cycleNode = dojo.create("select", {id: "cycleNode"}, tr.children[1], "first");
		self.cycleNode.defaultVal = 0;

		for (i = 0, len = self.cycles.length; i < len; i++) {
			var cycle = self.cycles[i];
			cycle.title = $I(cycle.titleKey || "space.planet." + cycle.name + ".label");

			dojo.create("option", {
				value: i,
				innerHTML: cycle.glyph + " " + cycle.title
			}, self.cycleNode);
		}

		on(self.cycleNode, "change", function () {
			self.cycle = self.cycleNode.selectedIndex;
			game.calculateAllEffects();
			game.update();
		});

		game._createInput({id: "cycleYearNode", class: "integerInput shortInt"},
			tr.children[1], self, "cycleYear");

		self.cycleEffectsNode = tr;
		self.registerTooltip(self.cycleEffectsNode);

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.opts.calendar.season") + "</td><td></td>"
		}, table);
		self.seasonNode = dojo.create("select", {id: "seasonNode"}, tr.children[1]);
		self.seasonNode.defaultVal = 0;

		for (i = 0, len = self.seasons.length; i < len; i++) {
			var season = self.seasons[i];
			season.optionNode = dojo.create("option", {
				value: i,
				innerHTML: self.getSeasonTitle(i)
			}, self.seasonNode);
		}

		on(self.seasonNode, "change", function () {
			self.season = self.seasonNode.selectedIndex;
			game.calculateAllEffects();
			game.update();
		});

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.opts.calendar.weather") + "</td><td></td>"
		}, table);
		var select = dojo.create("select", {
			id: "weatherSel",
			innerHTML: '<option value="">---</option><option value="warm">' + $I("calendar.weather.warm") + '</option><option value="cold">' + $I("calendar.weather.cold") + "</option>"
		}, tr.children[1]);
		select.defaultVal = "";
		game._pairInput(select, self, "weather");

		on(select, "change", function () {
			self.weather = this.value || null;
			game.update();
		});

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.opts.calendar.day") + "</td><td></td>"
		}, table);
		var input = game._createInput({id: "dayNode"}, tr.children[1], self, "day");

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.opts.calendar.festivalDays") + "</td><td></td>"
		}, table);
		game._createInput({id: "festivalDaysNode", class: "integerInput abbrInput"},
			tr.children[1], self, "festivalDays");

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.opts.calendar.paradoxTimer") + "</td><td></td>",
			title: $I("KGSaveEdit.opts.calendar.paradoxTimer.title")
		}, table);

		input = game._createInput({id: "futureSeasonTemporalParadoxNode", class: "integerInput"},
			tr.children[1], self, "futureSeasonTemporalParadox");
		input.minValue = -1;

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.opts.cryptoPrice") + "</td><td></td>"
		}, table);

		input = game._createInput({id: "cryptoPriceNode"}, tr.children[1], self, "cryptoPrice");
		input.minValue = Number.MIN_VALUE;
	},

	cycleEffectsBasics: function (effects, building_name) {
		if (this.game.prestige.getPerk("numerology").owned()) {
			var list_effects_cycle = this.cycles[this.cycle].effects;

			for (var effect in effects) {
				var effect_cycle = building_name + "-" + effect;
				if (typeof list_effects_cycle[effect_cycle] !== "undefined") {
					effects[effect] *= list_effects_cycle[effect_cycle];
				}
			}
		}

		return effects;
	},

	cycleEffectsFestival: function (effects) {
		if (this.game.prestige.getPerk("numeromancy").owned() && this.game.calendar.festivalDays) {
			var list_festivalEffects_cycle = this.cycles[this.cycle].festivalEffects;

			for (var effect in effects) {
				var effect_cycle = effect;
				if (typeof list_festivalEffects_cycle[effect_cycle] !== "undefined") {
					effects[effect] *= list_festivalEffects_cycle[effect_cycle];
					effects[effect] *= 1 + this.game.getEffect("festivalRatio");
				}
			}
		}

		return effects;
	},

	listCycleEffects: function (tooltip, effects) {
		var game = this.game;

		for (var effect in effects) {
			var effectItemNode = dojo.create("div", null, tooltip);

			var effectMeta = game.getEffectMeta(effect);
			var effectTitle = effectMeta.title + ":";

			dojo.create("span", {
				innerHTML: effectTitle,
				class: "tooltipCycleEffectTitle"
			}, effectItemNode);

			var effectMod = effects[effect] > 1 ? "+" : "";
			effectMod += ((effects[effect] - 1) * 100).toFixed(0) + "%";

			dojo.create("span", {
				innerHTML: effectMod,
				class: "tooltipCycleEffectMod"
			}, effectItemNode);

			dojo.create("span", {
				innerHTML: "&nbsp;",
				class: "clear"
			}, effectItemNode);
		}
	},

	trueYear: function () {
		return (this.day / this.daysPerSeason + this.season) / this.seasonsPerYear + this.year - this.game.time.flux;
	},

	darkFutureYears: function (withImpedance) {
		var darkFutureActualBeginning = this.darkFutureBeginning + (withImpedance ? this.game.getEffect("timeImpedance") : 0);
		return this.year - darkFutureActualBeginning;
	},

	getTooltip: function (node) {
		var haveNumerology = this.game.prestige.getPerk("numerology").owned();
		if (node !== this.cycleEffectsNode || !haveNumerology) {
			return;
		}

		var cycle = this.cycles[this.cycle];

		var tooltip = dojo.byId("tooltipBlock");
		tooltip.className = "";

		var cycleSpan = dojo.create("div", {
			innerHTML: cycle.title + " (Year " + this.cycleYear + ")",
			class: "center clear"
		}, tooltip);

		// Cycle Effects
		if (haveNumerology) {
			dojo.addClass(cycleSpan, "tooltipCycleTitle");

			cycleSpan = dojo.create("div", {
				innerHTML: "Cycle Effects:",
				class: "center tooltipCycleSpacer"
			}, tooltip);

			this.listCycleEffects(tooltip, cycle.effects);
		}

		if (this.game.prestige.getPerk("numeromancy").owned() && this.festivalDays > 0) {
			// Cycle Festival Effects
			cycleSpan = dojo.create("div", {
				innerHTML: $I("cycle.effects.festival.title"),
				class: "center"
			}, tooltip);

			this.listCycleEffects(tooltip, cycle.festivalEffects);
		}
	},

	update: function () {
		var millennia = Math.floor(Math.max(this.year - this.refYear, 0) / 1000);
		var paragonStr = "---";
		if (millennia > 0) {
			paragonStr = $I("KGSaveEdit.opts.calendar.millenniumParagon", [millennia]);
			var karmaKittensGain = this.game.religion.pactsMilleniumKarmaKittens(millennia);
			if (karmaKittensGain > 0) {
				paragonStr += ", " + $I("KGSaveEdit.opts.calendar.millenniumKarmaKittens", [this.game.getDisplayValueExt(karmaKittensGain)]);
			}
		}
		this.millenniumParagonSpan.innerHTML = "(" + paragonStr  + ")";
		dojo.toggleClass(this.millenniumParagonSpan, "hidden", !millennia);

		this.dayNode.minValue = -10 - this.game.getEffect("temporalParadoxDay");
		this.set("day", this.day); //refresh value

		for (var i = this.seasons.length - 1; i >= 0; i--) {
			this.seasons[i].optionNode.innerHTML = this.getSeasonTitle(i);
		}
	},

	save: function (saveData) {
		saveData.calendar = this.game.filterMetaObj(this, ["year", "day", "season", "weather",
			"festivalDays", "cycle", "cycleYear", "futureSeasonTemporalParadox", "cryptoPrice"]);
		saveData.calendar.weather = saveData.calendar.weather || null;
	},

	load: function (saveData) {
		if (!saveData.calendar) {
			return;
		}
		var data = saveData.calendar;

		this.game.loadMetaFields(this, data, ["year", "day", "weather", "festivalDays"]);
		this.game.setSelectByValue(this.seasonNode, data.season);
		this.season = this.seasonNode.selectedIndex;
		this.game.setSelectByValue(this.cycleNode, data.cycle);
		this.cycle = this.cycleNode.selectedIndex;
		this.set("cycleYear", data.cycleYear || 0);
		this.set("futureSeasonTemporalParadox", data.futureSeasonTemporalParadox || -1);
		this.set("cryptoPrice", data.cryptoPrice || 1000);

		this.refYear = this.year;
	}
});


dojo.declare("classes.KGSaveEdit.Console", classes.KGSaveEdit.core, {
	game: null,
	domNode: null,

	filtersData: {
		"astronomicalEvent":  {},
		"hunt":               {},
		"trade":              {},
		"craft":              {},
		"workshopAutomation": {},
		"meteor":             {},
		"ivoryMeteor":        {},
		"unicornRift":        {},
		"unicornSacrifice":   {},
		"alicornRift":        {},
		"alicornSacrifice":   {},
		"alicornCorruption":  {},
		"tcShatter":          {},
		"tcRefine":           {},
		"faith":              {},
		"elders":             {}
	},

	filters: null,

	constructor: function (game) {
		this.game = game;

		this.filters = {};
		for (var tag in this.filtersData) {
			this.filtersData[tag] = dojo.mixin({enabled: true, unlocked: false}, this.filtersData[tag]);
			this.filters[tag] = new classes.KGSaveEdit.GenericItem(game, this.filtersData[tag]);
		}
	},

	render: function () {
		var game = this.game;

		var panel = game._createPanel(null, {
			id: "logFiltersPanel",
			class: "bottom-margin"
		}, $I("KGSaveEdit.console.filter.header"), true);
		this.domNode = panel.panel;
		var table = dojo.create("table", {id: "logFiltersBlock"}, panel.content);

		for (var tag in this.filters) {
			var filter = this.filters[tag];

			var title = filter.title;
			if (!title) {
				title = $I("console.filter." + tag);
			}

			var tr = dojo.create("tr", {
				class: "logFilter",
				innerHTML: "<td>" + title + "</td><td></td>"
			}, table);
			game._createCheckbox($I("KGSaveEdit.label.unlocked"), tr.children[1], filter, "unlocked");
			game._createCheckbox($I("KGSaveEdit.opts.msgfilter.enabled"), tr.children[1], filter, "enabled");
		}
	},

	save: function (saveData) {
		var saveFilters = {};
		for (var tag in this.filters) {
			saveFilters[tag] = this.game.filterMetaObj(this.filters[tag], ["enabled", "unlocked"]);
		}

		saveData.console = {
			filters: saveFilters
		};
	},

	load: function (saveData) {
		var saveFilters = saveData && saveData.console && saveData.console.filters ? saveData.console.filters : {};
		for (var tag in saveFilters) {
			var filter = this.filters[tag];
			if (filter) {
				var saveFilter = saveFilters[tag];
				filter.set("unlocked", Boolean(saveFilter.unlocked));
				filter.set("enabled", Boolean(saveFilter.enabled));
			} else {
				this.game.extrasTab.storeExtraData("console.filters", saveFilters[tag], tag, true);
			}
		}
	}
});


dojo.declare("classes.KGSaveEdit.DiplomacyManager", [classes.KGSaveEdit.UI.Tab, classes.KGSaveEdit.Manager], {
	raceData: [
		{
			name: "lizards",
			embassyPrices: [{
				name: "culture", val: 100
			}]
		}, {
			name: "sharks",
			embassyPrices: [{
				name: "culture", val: 100
			}]
		}, {
			name: "griffins",
			embassyPrices: [{
				name: "culture", val: 1000
			}]
		}, {
			name: "nagas",
			embassyPrices: [{
				name: "culture", val: 500
			}],
			hidden: true
		}, {
			name: "zebras",
			embassyPrices: [{
				name: "culture", val: 25000
			}],
			hidden: true
		}, {
			name: "spiders",
			embassyPrices: [{
				name: "culture", val: 5000
			}],
			hidden: true
		}, {
			name: "dragons",
			embassyPrices: [{
				name: "culture", val: 7500
			}],
			hidden: true
		}, {
			name: "leviathans",
			hidden: true,
			energy: 0,
			duration: 0
		}
	],

	tabName: "Trade",
	leaderBonuses: ["merchant"],
	races: null,
	racesByName: null,

	constructor: function () {
		this.i18nKeys = {tabName: "tab.name.trade"};
		this.registerMetaItems(this.raceData, classes.KGSaveEdit.DiplomacyRaceMeta, "races");
	},

	renderTabBlock: function () {
		this.diplomacyBlock = dojo.create("table", {id: "diplomacyBlock"}, this.tabBlockNode);

		for (var i = 0, len = this.races.length; i < len; i++) {
			var race = this.races[i];

			race.domNode = dojo.create("tr", {
				class: "tradeRace",
				innerHTML: "<td>" + $I("trade.race." + race.name) + "</td><td></td><td></td>"
			}, this.diplomacyBlock);
			race.nameNode = race.domNode.children[0];

			this.game._createCheckbox($I("KGSaveEdit.label.unlocked"), race.domNode.children[1], race, "unlocked");
			this.game._createCheckbox($I("KGSaveEdit.trade.collapsed"), race.domNode.children[1], race, "collapsed");
			this.game._createCheckbox($I("trade.embassy.pinned"), race.domNode.children[1], race, "pinned");
			if (race.embassyPrices) {
				race.embassySpan = dojo.create("span", {
					innerHTML: $I("KGSaveEdit.trade.embassyLevel") + " "
				}, race.domNode.children[2]);

				this.game._createInput({class: "integerInput"}, race.embassySpan, race, "embassyLevel");
				race.registerTooltip(race.embassySpan);
				race.registerHighlight(race.embassySpan);
			}
		}

		race = this.get("leviathans");
		var node = race.domNode.children[2];
		node.textContent = $I("KGSaveEdit.trade.elders.daysRemaining") + " ";
		this.game._createInput({class: "integerInput"}, node, race, "duration");
		dojo.place(document.createTextNode(" " + $I("KGSaveEdit.trade.elders.energy") + " "), node);
		this.game._createInput({class: "integerInput"}, node, race, "energy");
		dojo.place(document.createTextNode(" / "), node);
		race.energyMaxSpan = dojo.create("span", {innerHTML: "5"}, node);
	},

	get: function (name) {
		var race = this.racesByName[name];
		if (name && !race) {
			console.error("Race not found", name);
		}
		return race;
	},

	getTabName: function () {
		var name = this.tabName;
		if (this.get("leviathans").unlocked) {
			name += $I("common.warning");
		}
		return name;
	},

	hasUnlockedRaces: function () {
		for (var i = this.races.length - 1; i >= 0; i--) {
			if (this.races[i].unlocked) {
				return true;
			}
		}
		return false;
	},

	getVisible: function () {
		return this.hasUnlockedRaces();
	},

	update: function () {
		for (var i = this.races.length - 1; i >= 0; i--) {
			var race = this.races[i];
			dojo.toggleClass(race.nameNode, "spoiler", !race.unlocked);
		}

		race = this.get("leviathans");
		var markerCap = Math.floor((this.game.religion.getZU("marker").getEffectiveValue(this.game) * 5 + 5) *
			(1 + this.game.getEffect("leviathansEnergyModifier")));
		race.energyMaxSpan.textContent = markerCap;

		if (race.energy > markerCap) {
			race.set("energy", markerCap);
		}
	},

	save: function (saveData) {
		saveData.diplomacy = {
			races: this.game.filterMetadata(this.races, ["name", "embassyLevel", "unlocked", "collapsed", "energy", "duration", "pinned"], function (saveRace) {
				saveRace.energy = saveRace.energy || 0;
				saveRace.duration = saveRace.duration || 0;
			})
		};
	},

	load: function (saveData) {
		if (saveData.diplomacy) {
			this.loadMetadata(saveData, "diplomacy.races", "get", function (race, saveRace) {
				race.set("unlocked", Boolean(saveRace.unlocked));
				race.set("embassyLevel", saveRace.embassyLevel || 0);
				race.set("collapsed", Boolean(saveRace.collapsed));
				race.set("pinned", Boolean(saveRace.pinned));
				race.set("duration", saveRace.duration || 0);
				race.set("energy", saveRace.energy || 0);
			}, true);
		}
	}
});


dojo.declare("classes.KGSaveEdit.DiplomacyRaceMeta", classes.KGSaveEdit.MetaItem, {
	constructor: function () {
		this.unlocked = Boolean(this.unlocked);
		this.embassyLevel = 0;
		this.collapsed = Boolean(this.collapsed);
		this.pinned = false;
		this.duration = 0;
		this.energy = 0;
	},

	getPrices: function () {
		if (!this.embassyPrices) {
			return;
		}

		var prices = dojo.clone(this.embassyPrices);
		var priceCoeficient = 1;
		priceCoeficient -= this.game.getEffect("embassyCostReduction");
		for (var i = 0; i < prices.length; i++) {
			prices[i].val *= priceCoeficient * Math.pow(1.15, this.embassyLevel);
		}
		return prices;
	},

	getTooltip: function (node) {
		if (node !== this.embassySpan || !this.embassyPrices) {
			return;
		}

		var tooltip = dojo.byId("tooltipBlock");
		tooltip.className = "button_tooltip";

		dojo.create("div", {
			class: "tooltipDesc tooltipDescBottom",
			innerHTML: $I("trade.embassy.desc")
		}, tooltip);

		this.game.renderPrices(tooltip, this.getPrices());
	}
});


dojo.declare("classes.KGSaveEdit.ChallengesManager", [classes.KGSaveEdit.UI.Tab, classes.KGSaveEdit.Manager], {
	challengesData: [
		{
			name: "ironWill",
			unlocked: true,
			invisible: true
		}, {
			name: "winterIsComing",
			unlocked: true,
			effects: {
				"springCatnipRatio":    0.05,
				"summerSolarFarmRatio": 0.05,
				"coldChance":           0,
				"coldHarshness":        0
			},
			calculateEffects: function (self) {
				if (self.active) {
					self.effects["springCatnipRatio"] =    0;
					self.effects["summerSolarFarmRatio"] = 0;
					self.effects["coldChance"] =           0.05;
					self.effects["coldHarshness"] =       -0.02;
				} else {
					self.effects["springCatnipRatio"] =    0.05;
					self.effects["summerSolarFarmRatio"] = 0.05;
					self.effects["coldChance"] =           0;
					self.effects["coldHarshness"] =        0;
				}
			},
			checkCompletionCondition: function (game) {
				return game.space.getPlanet("helios").reached;
			},
			upgrades: {buildings: ["pasture"]}
		}, {
			name: "anarchy",
			unlocked: true,
			effects: {
				"masterSkillMultiplier": 0.2,
				"kittenLaziness":        0
			},
			calculateEffects: function (self) {
				if (self.active) {
					self.effects["masterSkillMultiplier"] = 0;
					self.effects["kittenLaziness"] =        0.05;
				} else {
					self.effects["masterSkillMultiplier"] = 0.2;
				}
			},
			checkCompletionCondition: function (game) {
				return game.bld.get("aiCore").owned();
			}
		}, {
			name: "energy",
			requires: function (game) {
				return game.resPool.energyCons !== 0 || game.resPool.energyProd !== 0;
			},
			upgrades: {
				buildings: ["library", "biolab", "calciner", "oilWell", "factory", "accelerator", "chronosphere", "aiCore"],
				spaceBuilding: ["sattelite", "spaceStation", "moonOutpost", "moonBase", "orbitalArray", "containmentChamber"],
				voidSpace: ["chronocontrol"]
			},
			effects: {
				"energyConsumptionRatio":   -0.02,
				"energyConsumptionIncrease": 0
			},
			calculateEffects: function (self) {
				if (self.active) {
					self.effects["energyConsumptionRatio"] =    0;
					self.effects["energyConsumptionIncrease"] = 0.1;
				} else {
					self.effects["energyConsumptionRatio"] =   -0.02;
					self.effects["energyConsumptionIncrease"] = 0;
				}
			},
			checkCompletionCondition: function (game) {
				return (
					(game.bld.get("pasture").owned() && game.bld.get("pasture").stage === 1) &&
					(game.bld.get("aqueduct").owned() && game.bld.get("aqueduct").stage === 1) &&
					game.bld.get("steamworks").owned() &&
					game.bld.get("magneto").owned() &&
					game.bld.get("reactor").owned() &&
					(game.space.getBuilding("sattelite").owned() && game.workshop.get("solarSatellites").owned()) &&
					game.space.getBuilding("sunlifter").owned() &&
					game.space.getBuilding("tectonic").owned() &&
					game.space.getBuilding("hrHarvester").owned()
				);
			}
		}, {
			name: "atheism",
			requires: {tech: ["voidSpace"]},
			effects: {
				"faithSolarRevolutionBoost": 0.1,
				"cultureMaxChallenge":       0,
				"scienceMaxChallenge":       0,
				"manpowerMaxChallenge":      0,
				"challengeHappiness":        0
			},
			calculateEffects: function (self) {
				if (self.active) {
					self.effects["faithSolarRevolutionBoost"] = 0;
					self.effects["cultureMaxChallenge"] =      -250;
					self.effects["scienceMaxChallenge"] =      -500;
					self.effects["challengeHappiness"] =       -0.5;
					self.effects["manpowerMaxChallenge"] =     -125;
				} else {
					self.effects["faithSolarRevolutionBoost"] = 0.1;
					self.effects["cultureMaxChallenge"] =       0;
					self.effects["scienceMaxChallenge"] =       0;
					self.effects["challengeHappiness"] =        0;
					self.effects["manpowerMaxChallenge"] =      0;
				}
			},
			reserveDelay: true
		}, {
			name: "1000Years",
			// requires shattering a time crystal to unlock and to complete so
			// unlocks: {chronoforge: ["temporalPress"]},
			upgrades: {chronoforge: ["temporalPress"]},
			effects: {
				"shatterCostReduction":        -0.02,
				"shatterCostIncreaseChallenge": 0,
				"shatterVoidCost":              0,
				"temporalPressCap":             0
			},
			calculateEffects: function (self) {
				if (self.active) {
					self.effects["shatterCostReduction"] =         0;
					self.effects["shatterCostIncreaseChallenge"] = 0.5;
					self.effects["shatterVoidCost"] =              0.4;
					self.effects["temporalPressCap"] =             0;
				} else {
					self.effects["shatterCostReduction"] =        -0.02;
					self.effects["shatterCostIncreaseChallenge"] = 0;
					self.effects["shatterVoidCost"] =              0;
					self.effects["temporalPressCap"] =             5;
				}
			}
		}, {
			name: "blackSky",
			requires: function (game) {
				var elders = game.diplomacy.get("leviathans");
				return elders.unlocked && elders.duration > 0; // game only checks unlocked but
			},
			effects: {
				"corruptionBoostRatioChallenge": 0.1
			},
			calculateEffects: function (self) {
				if (self.active) {
					self.effects["corruptionBoostRatioChallenge"] = 0;
				} else {
					self.effects["corruptionBoostRatioChallenge"] = 0.1;
				}
			},
			checkCompletionCondition: function (game) {
				return game.space.getBuilding("spaceBeacon").val > (game.challenges.getChallenge("blackSky").on || 0);
			}
		}, {
			name: "pacifism",
			// requires sending a lot of hunters at once
			effects: {
				"alicornPerTickRatio":  0.1,
				"tradeKnowledge":       1,
				"weaponEfficency":      0,
				"policyFakeBought":     0,
				"embassyFakeBought":    0,
				"steamworksFakeBought": 0
			},
			calculateEffects: function (self) {
				if (self.active) {
					self.effects["alicornPerTickRatio"] =  0;
					self.effects["tradeKnowledge"] =       0;
					self.effects["weaponEfficency"] =     -0.1; //after 10 completions weapons WILL be useles; no LDR >:3
					self.effects["policyFakeBought"] =     1;
					self.effects["embassyFakeBought"] =    1;
					self.effects["steamworksFakeBought"] = Math.floor(1.5 * self.on || 1) / (self.on || 1);
				} else {
					self.effects["alicornPerTickRatio"] =  0.1;
					self.effects["tradeKnowledge"] =       1;
					self.effects["weaponEfficency"] =      0;
					self.effects["policyFakeBought"] =     0;
					self.effects["embassyFakeBought"] =    0;
					self.effects["steamworksFakeBought"] = 0;
				}
				// game.upgradeItems(self.upgrades); // don't need the game's hack
			},
			upgrades: {upgrades: ["compositeBow", "crossbow", "railgun"]}
		}, {
			//Added in Kittens Game 1.5.x, behind the UNICORN_TEARS_CHALLENGE flag.
			//Only the flat ziggurat effect is modelled here. While active, the game
			//also scales bonfire/science/workshop prices and several caps through
			//getLimitedDR() against per-effect LDR limits; reproducing that here
			//would mean porting the game's diminishing-returns maths, and getting it
			//subtly wrong would show players numbers that do not match their game.
			//The editor's job is editing the saved on/active/unlocked values, which
			//this supports fully - the game recalculates the rest on load.
			name: "unicornTears",
			effects: {
				"zigguratIvoryPriceRatio": -0.003
			},
			upgrades: {upgrades: ["alicornStable"]}
		}, {
			name: "postApocalypse",
			requires: {transcendenceUpgrades: ["holyGenocide"]},
			effects: {
				"arrivalSlowdown":    0, //additive with pollution
				"cryochamberSupport": 1
			},
			calculateEffects: function (self) {
				if (self.active) {
					self.effects["arrivalSlowdown"] =    10;
					self.effects["cryochamberSupport"] = 1; //this is a quick fix for cryochamber cap when resetting into PA; does not make PA easier so it's ok
				} else {
					self.effects["arrivalSlowdown"] =    0;
					self.effects["cryochamberSupport"] = 1;
				}
			},
			checkCompletionCondition: function (game) {
				return game.bld.cathPollution == 0;
			},
			flavor: true
		}
	],

	challenges: null,
	challengesByName: null,

	tabName: "Challenges",
	getVisible: function () {
		return this.game.prestige.getPerk("adjustmentBureau").owned();
	},

	constructor: function () {
		this.i18nKeys = {tabName: "tab.name.challenges"};
		this.reserveKittens = [];

		this.registerMetaItems(this.challengesData, classes.KGSaveEdit.ChallengeMeta, "challenges");

		this.addMeta(this.challenges);
	},

	getChallenge: function (name) {
		var challenge = this.challengesByName[name];
		if (name && !challenge) {
			console.error("Challenge not found", name);
		}
		return challenge;
	},

	isActive: function (name) {
		return this.getChallenge(name).active;
	},

	renderTabBlock: function () {
		this.challengesBlock = dojo.create("table", {
			id: "challengesBlock",
			innerHTML: '<tr><th colspan="3">' + $I("challendge.panel.label") + "</th></tr>"
		}, this.tabBlockNode);
	},

	render: function () {
		this.domNodeHeader = this.challengesBlock.children[0];

		for (var i = 0, len = this.challenges.length; i < len; i++) {
			var challenge = this.challenges[i];
			challenge.render();
			dojo.place(challenge.domNode, this.challengesBlock);
		}
	},

	update: function () {
		this.game.callMethods(this.challenges, "update");
		dojo.toggleClass(this.domNodeHeader, "spoiler", !this.game.prestige.getPerk("adjustmentBureau").owned());

		this.updateTabMarker();
	},

	updateTabMarker: function () {
		var hasNew = false;
		for (var i = this.challenges.length - 1; i >= 0; i--) {
			if (this.challenges[i].won) {
				hasNew = true;
				break;
			}
		}
		this.game._toggleNewMarker(this.tabWrapper, hasNew);
	},

	save: function (saveData) {
		saveData.challenges = {
			challenges: this.game.filterMetadata(this.challenges, ["name", "researched", "on", "unlocked", "active"]),
			reserves: {
				reserveKittens: this.game.village.saveReserveKittens(),
				reserveResources: this.game.resPool.getReserves()
			}
		};
	},

	load: function (saveData) {
		var challengeData = saveData.challenges;
		if (challengeData) {
			this.loadMetadata(saveData, "challenges.challenges", "getChallenge", function (challenge, saveChallenge) {
				var researched = saveChallenge.researched ? 1 : 0;
				challenge.set("on", Math.max(num(saveChallenge.on), researched));
				challenge.set("unlocked", Boolean(saveChallenge.unlocked));
				challenge.set("active", Boolean(saveChallenge.active));
			}, true);

			if (challengeData.currentChallenge) {
				var challenge = this.getChallenge(challengeData.currentChallenge);
				if (challenge) {
					challenge.set("active", true);
				}
			}

			var reservesData = challengeData.reserves;
			if (reservesData) {
				this.game.village.loadReserveKittens(reservesData.reserveKittens || []);
				this.game.resPool.setReserves(reservesData.reserveResources);
			}
		}
	}
});


dojo.declare("classes.KGSaveEdit.ChallengeMeta", classes.KGSaveEdit.MetaItem, {
	unlocked: false,
	researched: false,
	active: false,
	on: 0,

	isNew: false,

	constructor: function () {
		this.defaultUnlocked = this.unlocked;
		this.i18nKeys = {
			label: "challendge." + this.name + ".label",
			description: "challendge." + this.name + ".desc",
			effectDesc: "challendge." + this.name + ".effect.desc"
		};
		if (this.flavor) {
			this.i18nKeys.flavor = "challendge." + this.name + ".flavor";
		}
	},

	handler: function () {
		this.game.calculateAllEffects();
	},

	owned: function () {
		return this.on > 0 && !this.active;
	},

	getEffect: function (effectName) {
		var effects = this.getEffects();
		return num(effects[effectName]) * this.on;
	},

	getName: function () {
		var name = this.label || this.name;
		if (this.active || this.name === this.game.challenges.active) {
			name = $I("challendge.btn.name.current", [name]);
		} else if (this.on > 0) {
			name = $I("challendge.btn.name.complete", [name]);
		}
		// if (this.pending) {
		// 	name += " (" + $I("challendge.pending") + ")";
		// }
		if (this.on) {
			name += " (" + this.on + ")";
		}
		return name;
	},

	getDescription: function () {
		var msgChronosphere = "";
		// if (this.game.bld.get("chronosphere").owned()) {
		// 	msgChronosphere = this.name === "ironWill" ? $I("challendge.btn.chronosphere.with.ironWill.desc") : $I("challendge.btn.chronosphere.desc");
		// }
		return (this.description || "") + $I("challendge.btn.desc", [this.effectDesc, msgChronosphere]);
	},

	getTooltip: function () {
		var tooltip = dojo.byId("tooltipBlock");
		tooltip.className = "challenge_tooltip";

		tooltip.innerHTML = this.getDescription();
	},

	render: function () {
		var self = this;
		self.seti18n();

		var tr = dojo.create("tr", {
			class: "challengeNode",
			innerHTML: '<td class="nameNode">' + (self.label || self.name) + "</td><td></td><td>&nbsp;" +
				$I("KGSaveEdit.challenge.completions") + " </td>"
		});
		self.domNode = tr;

		if (self.invisible) {
			dojo.addClass(tr, "hidden");
		}

		self.nameNode = tr.children[0];

		self.game._createCheckbox($I("KGSaveEdit.label.unlocked"), tr.children[1], self, "unlocked");
		self.game._createCheckbox($I("KGSaveEdit.challenge.active"), tr.children[1], self, "active");
		self.game._createInput({class: "integerInput"}, tr.children[2], self, "on");

		dojo.place(document.createTextNode(" "), tr.children[2]);

		self.completeNode = self.game._createButton({value: $I("KGSaveEdit.challenge.complete"), class: "invisible"}, tr.children[2], function () {
			if (self.active) {
				self.set("on", self.on + 1);
				self.set("active", false);
			}
			self.game.calculateAllEffects();
			self.game.update();
		});

		self.registerTooltip(self.domNode);
	},

	update: function () {
		this.researched = this.on > 0;
		var req = this.game.checkRequirements(this, this.defaultUnlocked);
		this.unlocked = req || this.unlockedNode.prevChecked;
		this.unlockedNode.checked = this.unlocked;
		this.game.toggleDisabled(this.unlockedNode, req);
		dojo.toggleClass(this.nameNode, "spoiler", !this.unlocked);

		this.won = false;
		if (this.active && this.checkCompletionCondition) {
			this.won = this.checkCompletionCondition(this.game);
		}

		dojo.toggleClass(this.completeNode, "invisible", !this.won);
		this.game._toggleNewMarker(this.nameNode, this.won);
	}
});


dojo.declare("classes.KGSaveEdit.ui.Toolbar", null, {
	game: null,
	icons: null,

	constructor: function (game) {
		this.game = game;
		this.icons = [];

		this.addIcon(new classes.KGSaveEdit.ui.toolbar.ToolbarPollution(game));
		this.addIcon(new classes.KGSaveEdit.ui.toolbar.ToolbarHappiness(game));
		this.addIcon(new classes.KGSaveEdit.ui.toolbar.ToolbarEnergy(game));
	},

	addIcon: function (icon) {
		this.icons.push(icon);
	},

	render: function (container) {
		dojo.empty(container);
		this.game.callMethods(this.icons, "render", container);
	},

	update: function () {
		this.game.callMethods(this.icons, "update");
	}
});


dojo.declare("classes.KGSaveEdit.ui.ToolbarIcon", classes.KGSaveEdit.TooltipItem, {
	game: null,
	container: null,

	iconClass: null,

	constructor: function (game) {
		this.game = game;
	},

	render: function (container) {
		this.container = dojo.create("span", {
			className: "toolbarIcon" + (this.iconClass ? " " + this.iconClass : "")
		}, container);

		this.registerTooltip(this.container);
		return this.container;
	},

	update: function () { },

	getTooltipOffset: function (node) {
		var pos = dojo.position(node);
		return {
			left: pos.x,
			top: 5
		};
	}
});


dojo.declare("classes.KGSaveEdit.ui.toolbar.ToolbarPollution", classes.KGSaveEdit.ui.ToolbarIcon, {
	iconClass: "pollutionIcon",

	update: function () {
		var hasEcology = this.game.science.get("ecology").owned();
		dojo.toggleClass(this.container, "hidden", this.game.disablePollution || (this.game.bld.cathPollution <= 100000 && !hasEcology));
		this.container.innerHTML = '<span class="pollutionText">' + (hasEcology ? (" " + this.getPollutionMod()) : "") + "</span>";
	},

	getTooltip: function () {
		var tooltip = dojo.byId("tooltipBlock");
		tooltip.className = "";
		var game = this.game;

		var html = "";
		var eqPol = game.bld.getEquilibriumPollution();
		var eqPolLvl = game.bld.getPollutionLevel(eqPol);
		var pollution = game.bld.cathPollution;
		var polLvl = game.bld.getPollutionLevel();
		var polLvlShow = game.bld.getPollutionLevel(pollution * 2);
		if (polLvl >= 4) {
			html += $I("pollution.level1") + "<br/>" + $I("pollution.level2") + "<br/>" + $I("pollution.level3", [game.getDisplayValueExt(game.villageTab.getVillageTitle(), false, false, 0)]) + "<br/>" + $I("pollution.level4");
		} else if (polLvlShow === 3) {
			html += $I("pollution.level1") + "<br/>" + $I("pollution.level2") + "<br/>" + $I("pollution.level3", [game.getDisplayValueExt(game.villageTab.getVillageTitle(), false, false, 0)]);
		} else if (polLvlShow === 2) {
			html += $I("pollution.level1") + "<br/>" + $I("pollution.level2");
		} else if (polLvlShow === 1) {
			html += $I("pollution.level1");
		} else {
			html = $I("pollution.level0");
		}

		var warnLvl = game.bld.getPollutionLevel(pollution * 4);
		if (warnLvl >= 1 && warnLvl <= 4 && warnLvl > polLvlShow && warnLvl <= eqPolLvl) {
			html += "<br/>" + $I("pollution.level" + warnLvl + ".warning");
		}
		if (pollution * 1.5 <= eqPol || eqPolLvl > polLvl) {
			html += "<br/>" + $I("pollution.increasing");
		} else if (pollution >= 0 && game.bld.cathPollutionPerTick <= 0 && eqPolLvl <= polLvl) {
			html += "<br/>" + $I("pollution.cleaning");
		} else if (eqPolLvl === polLvl && eqPol > 0) {
			html += "<br/>" + $I("pollution.equilibrium");
		} else {
			html += "<br/>" + $I("pollution.pristine");
		}
		html += "<br/>CO₂: " + (game.science.get("ecology").owned() ? this.getPollutionMod() : $I("pollution.unspecified"));

		tooltip.innerHTML = html;
	},

	getPollutionMod: function () {
		return this.game.getDisplayValueExt((this.game.bld.cathPollution / this.game.bld.getPollutionLevelBase()) * 100) + "ppm";
	}
});


dojo.declare("classes.KGSaveEdit.ui.toolbar.ToolbarHappiness", classes.KGSaveEdit.ui.ToolbarIcon, {
	iconClass: "happiness",

	update: function () {
		dojo.toggleClass(this.container, "hidden", this.game.village.getKittens() <= 5);
		this.container.innerHTML = '<span class="happinessText">' + Math.floor(this.game.village.happiness * 100) + "%</span>";
		dojo.addClass(this.container, "coral");
	},

	getTooltip: function () {
		var tooltip = dojo.byId("tooltipBlock");
		tooltip.className = "";

		var base = this.game.getEffect("happiness");
		//var population = this.game.village.getKittens() * 2;
		var html = $I("village.happiness.base") + ": 100%<br>" +
			$I("village.happiness.buildings") + ": +" + (Math.floor(base)) + "%<br>";

		//----------------------
		var resHappiness = 0;
		var resources = this.game.resPool.resources;
		var happinessPerLuxury = 10;
		//philosophy epicurianism effect
		happinessPerLuxury += this.game.getEffect("luxuryHappinessBonus");
		var consumableLuxuryBonus = this.game.getEffect("consumableLuxuryHappiness");
		for (var i = resources.length - 1; i >= 0; i--) {
			var res = resources[i];
			if (res.type !== "common" && res.owned()) {
				if (res.name !== "elderBox" || !this.game.resPool.get("wrappingPaper").owned()) {
					resHappiness += happinessPerLuxury;
				}
				if (resources[i].type === "uncommon") {
					resHappiness += consumableLuxuryBonus;
				}
			}
		}
		html += $I("village.happiness.rare.resources") + ": +" + this.game.getDisplayValueExt(resHappiness, false, false, 0) + "%<br>";
		//---------------------
		var karma = this.game.resPool.get("karma");
		if (karma.value > 0) {
			html += $I("village.happiness.karma") + ": +" + this.game.getDisplayValueExt(karma.value, false, false, 0) + "%<br>";
		}

		if (this.game.calendar.festivalDays > 0) {
			var festivalHappinessEffect = 30 * (1 + this.game.getEffect("festivalRatio"));
			html += $I("village.happiness.festival") + ": +" + this.game.getDisplayValueExt(festivalHappinessEffect, false, false, 0) + "%<br>";
		}

		var unhappiness = this.game.village.getUnhappiness() / (1 + this.game.getEffect("unhappinessRatio"));
		var unhappinessReduction = unhappiness * this.game.getEffect("unhappinessRatio", true);
		var environmentEffect = this.game.village.getEnvironmentEffect();
		var challengeEffect = this.game.getEffect("challengeHappiness");

		html += $I("village.happiness.penalty") + ": -" + this.game.getDisplayValueExt(unhappiness + unhappinessReduction, false, false, 0) + "%<br>";

		html += "* " + $I("village.happiness.penalty.base") + ": -" + this.game.getDisplayValueExt(unhappiness, false, false, 0) + "%<br>";
		html += "* " + $I("village.happiness.penalty.mitigated") + ": " + this.game.getDisplayValueExt(-unhappinessReduction, false, false, 0) + "%<br>";
		html += $I("village.happiness.environment") + ": " + this.game.getDisplayValueExt(environmentEffect, false, false, 0) + "%<br>";
		if (challengeEffect) {
			html += $I("village.happiness.challenges") + ": " + this.game.getDisplayValueExt(challengeEffect, false, false, 0) + "%<br>";
		}

		var overpopulation = this.game.village.getKittens() - this.game.village.maxKittens;
		if (overpopulation > 0) {
			html += $I("village.happiness.overpopulation") + ": -" + overpopulation * 2 + "%<br>";
		}

		tooltip.innerHTML = html;
	}
});


dojo.declare("classes.KGSaveEdit.ui.toolbar.ToolbarEnergy", classes.KGSaveEdit.ui.ToolbarIcon, {
	iconClass: "energy",

	update: function () {
		dojo.toggleClass(this.container, "hidden", !this.game.science.get("electricity").owned());

		var resPool = this.game.resPool;
		var energy = resPool.energyProd - resPool.energyCons;
		this.container.innerHTML = '<span class="energyText">' + this.game.getDisplayValueExt(energy) + "Wt</span>";

		dojo.toggleClass(this.container, "warning", energy < 0);
		dojo.toggleClass(this.container, "warningWinter", energy >= 0 && resPool.energyWinterProd < resPool.energyCons);
	},

	getTooltip: function () {
		var tooltip = dojo.byId("tooltipBlock");
		tooltip.className = "";

		var resPool = this.game.resPool;
		var energy = resPool.energyProd - resPool.energyCons;

		var penalty = "";
		if (energy < 0) {
			var delta = this.game.resPool.getEnergyDelta();
			penalty = "<br><br>" + $I("navbar.energy.penalty") + '<span class="red">-' + Math.floor((1 - delta) * 100) + "%</span>";
		}

		//TODO i18n these when the game fixes them
		tooltip.innerHTML = 'Production: <span class="green">' +
			this.game.getDisplayValueExt(resPool.energyProd, true, false) +
			"Wt</span>" + '<br>Consumption: <span style="color:#d00000;">-' +
			this.game.getDisplayValueExt(resPool.energyCons) +
			"Wt</span>" + penalty;
	}
});


dojo.declare("classes.KGSaveEdit.Telemetry", null, {
	game: null,
	guid: null,
	warnOnNewGuid: false,

	domNode: null,

	constructor: function (game) {
		this.game = game;
		this.guid = this.generateGuid();
	},

	render: function () {
		var self = this;

		self.domNode = dojo.create("div", {
			"id": "telemetryNode",
			class: "bottom-margin",
			innerHTML: $I("KGSaveEdit.opts.saveID") + ': <span class="monospace">' + self.guid + "</span> &nbsp;"
		});

		self.guidNode = self.domNode.children[0];

		this.game._createButton(
			{value: $I("KGSaveEdit.opts.saveID.new")}, self.domNode, function () {
				if (!self.warnOnNewGuid || confirm($I("KGSaveEdit.opts.saveID.new.confirm"))) {
					self.setGuid();
				}
			}
		);
	},

	setGuid: function (guid) {
		this.warnOnNewGuid = Boolean(guid);
		this.guid = guid || this.generateGuid();
		if (this.domNode) {
			this.guidNode.innerHTML = this.guid;
		}
	},

	// See https://www.ietf.org/rfc/rfc4122.txt, section 4.4
	generateGuid: function () {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			return (c == "x" ? 16 * Math.random() | 0 : 4 * Math.random() | 8).toString(16);
		});
	},

	save: function (data) {
		data["telemetry"] = {
			guid: this.guid
		};
	},

	load: function (data) {
		var guid;
		if (data["telemetry"]) {
			guid = data["telemetry"].guid;
		}
		this.setGuid(guid);
	}
});


dojo.declare("classes.KGSaveEdit.Server", classes.KGSaveEdit.core, {
	game: null,

	motdContentPrevious: null,

	constructor: function (game) {
		this.game = game;
	},

	save: function (saveData) {
		saveData.server = {
			motdContent: this.motdContentPrevious
		};
	}
});


dojo.declare("classes.KGSaveEdit.VoidManager", classes.KGSaveEdit.Manager, {
	voidUpgradesData: [
		{
		name: "spaceCathedral",
		label: "Space Cathedral",
		description: "TBD.",
		prices: [
			{name: "relic", val: 1}
		],
		researched: false
		}
	],

	voidUpgrades: null,
	voidUpgradesByName: null,

	faction: null,

	constructor: function () {
		this.registerMetaItems(this.voidUpgradesData, classes.KGSaveEdit.GenericItem, "voidUpgrades");
	},

	getVU: function (name) {
		var vu = this.voidUpgradesByName[name];
		if (name && !vu) {
			console.error("Void upgrade not found", name);
		}
		return vu;
	},

	save: function (saveData) {
		saveData.void = {
			vu: this.game.filterMetadata(this.voidUpgrades, ["name", "val", "on", "unlocked"]),
			faction: this.faction
		};
	},

	load: function (saveData) {
		if (!saveData.void) {
			return;
		}

		this.faction = saveData.void.faction || null;
	}
});


});

/* global dojo, require, classes, $I, num */

require(["dojo/on"], function () {
"use strict";

dojo.declare("classes.KGSaveEdit.TimeManager", [classes.KGSaveEdit.UI.Tab, classes.KGSaveEdit.Manager], {
	flux: 0, /* Amount of years skipped by CF time jumps */
	heat: 0,
	timestamp: null,
	isAccelerated: false,

	testShatter: 0, //temporary

	cfu: null,
	cfuByName: null,
	vsu: null,
	vsuByName: null,

	cfuData: [
		{
			name: "temporalBattery",
			prices: [
				{name: "timeCrystal", val: 5}
			],
			effects: {
				"temporalFluxMax": 750
			},
			priceRatio: 1.25,
			unlocked: true
		}, {
			name: "blastFurnace",
			prices: [
				{name: "timeCrystal", val: 25},
				{name: "relic",       val: 5}
			],
			priceRatio: 1.25,
			heat: 0,
			effects: {
				"heatPerTick": 0.02,
				"heatMax":     100
			},
			// isAutomationEnabled: false,
			unlocked: true,
			// unlocks: {chronoforge: ["timeBoiler"]},
			calculateEffects: function (self, game) {
				self.effects["heatMax"] = 100 + game.getEffect("heatMaxExpansion");
			},
			action: function (self, game) { // sigh
				self.calculateEffects(self, game);
			}
		}, {
			name: "timeBoiler",
			prices: [
				{name: "timeCrystal", val: 25000}
			],
			priceRatio: 1.25,
			requires: {chronoforge: ["blastFurnace"]},
			effects: {
				"heatMaxExpansion":  10,
				"energyConsumption": 1
			},
			togglable: true,
			upgrades: {chronoforge: ["blastFurnace"]},
			// TODO Actually "action" is almost always just updating effects (unclear from the name), better separate the 2 concerns: update effects (can be done several times per tick) and perform specific action (only once per tick!)
			// TODO Separation of concerns currently done only for AI Core and Time Boilers (REQUIRED by non-proportional effect!), will be systematized later
			updateEffects: function (self) {
				// TB #1: 10; Total:  10; Average: 10
				// TB #2: 30; Total:  40; Average: 20
				// TB #3: 50; Total:  90; Average: 30
				// TB #4: 90; Total: 160; Average: 40
				// etc.
				var on = self.getOn();
				self.effects["heatMaxExpansion"] = 10 * on;
				self.effects["energyConsumption"] = on;
			},
			action: function (self, game) {
				self.updateEffects(self, game);
			}
		}, {
			name: "temporalAccelerator",
			desc2: true,
			prices: [
				{name: "timeCrystal", val: 10},
				{name: "relic",       val: 1000}
			],
			priceRatio: 1.25,
			upgrades: {chronoforge: ["temporalImpedance"]},
			effects: {
				"timeRatio": 0.05
			},
			// isAutomationEnabled: false,
			unlocked: true
		}, {
			name: "temporalImpedance",
			prices: [
				{name: "timeCrystal", val: 100},
				{name: "relic",       val: 250}
			],
			priceRatio: 1.05,
			requires: function (game) {
				return game.calendar.darkFutureYears() >= 0;
			},
			effects: {
				"timeImpedance": 1000
			},
			calculateEffects: function (self, game) {
				self.effects["timeImpedance"] = Math.round(1000 * (1 + game.getEffect("timeRatio")));
			},
			showUnlocked: true
		}, {
			name: "ressourceRetrieval",
			prices: [
				{name: "timeCrystal", val: 1000}
			],
			priceRatio: 1.3,
			limitBuild: 100,
			requires: {"tech": ["paradoxalKnowledge"]},
			effects: {
				"shatterTCGain": 0.01
			}
		}, {
			name: "temporalPress",
			prices: [
				{name: "timeCrystal", val: 100},
				{name: "void", val: 10}
			],
			priceRatio: 1.1,
			//No limitBuild: the game commented out both its cap and the
			//temporalPressCap assignment. Keeping limitBuild at 0 here clamped
			//getOn() to zero, which is why the "on" field had no usable input.
			requires: {challenges: ["1000Years"]},
			effects: {
				"shatterYearBoost":  0,
				"energyConsumption": 5
			},
			//null until automation is actually unlocked, matching the game.
			isAutomationEnabled: null,
			calculateEffects: function (self, game) {
				//Two or more completions of 1000Years - or a blazar above 2 - unlock
				//the automation toggle.
				if (game.challenges.getChallenge("1000Years").on > 1 || game.religion.getTU("blazar").val > 2) {
					if (self.isAutomationEnabled === null || self.isAutomationEnabled === undefined) {
						self.isAutomationEnabled = false;
					}
				} else {
					self.isAutomationEnabled = null;
				}

				self.effects["shatterYearBoost"] = (self.isAutomationEnabled) ? 5 * game.calendar.yearsPerCycle : game.calendar.yearsPerCycle; //25 or 5 currently
				//The game floors this at 1.01, so the discount keeps improving for
				//90 completions; flooring at 1.05 stopped it at 50.
				self.priceRatio = Math.max(1.01, 1.1 - game.challenges.getChallenge("1000Years").on * 0.001);
			},
			unlocked: false
		}, {
			//Added in Kittens Game 1.5.x, unlocked by the tachyonModerator upgrade.
			//Hard-capped at 25 (5 seconds of delay).
			name: "controlledDelay",
			prices: [
				{name: "timeCrystal", val: 1},
				{name: "gear",        val: 10}
			],
			priceRatio: 1, //affordable scaling
			limitBuild: 25,
			effects: {
				"energyConsumption": 0.75
			},
			delayTicks: 0,
			isAutomationEnabled: false,
			unlocked: false
		}
	],

	vsuData: [
		{
			name: "cryochambers",
			prices: [
				{name: "karma",       val: 1},
				{name: "timeCrystal", val: 2},
				{name: "void",        val: 100}
			],
			priceRatio: 1.25,
			limitBuild: 0,
			// unlocks: {tabs: ["village"]},
			requires: {tech: ["voidSpace"]},
			effects: {
				"maxKittens": 1
			},
			calculateEffects: function (self, game) {
				self.limitBuild = game.bld.get("chronosphere").getOn() + game.getEffect("cryochamberSupport");
			}
		}, {
			name: "usedCryochambers",
			prices: [],
			priceRatio: 1.25,
			limitBuild: 0,
			effects: {}
		}, {
			name: "voidHoover",
			prices: [
				{name: "antimatter",  val: 1000},
				{name: "timeCrystal", val: 10},
				{name: "void",        val: 250}
			],
			priceRatio: 1.25,
			requires: {upgrades: ["voidAspiration"]},
			effects: {
				"temporalParadoxVoid": 1
			}
		}, {
			name: "voidRift",
			prices: [
				{name: "void", val: 75}
			],
			priceRatio: 1.3,
			requires: {upgrades: ["voidAspiration"]},
			effects: {
				"umbraBoostRatio":     0.1,
				"globalResourceRatio": 0.02
			},
			upgrades: {spaceBuilding: ["hrHarvester"]}
		}, {
			name: "chronocontrol",
			prices: [
				{name: "temporalFlux", val: 3000},
				{name: "timeCrystal",  val: 30},
				{name: "void",         val: 500}
			],
			priceRatio: 1.25,
			// unlocks: {upgrades: ["turnSmoothly"]},
			requires: {tech: ["paradoxalKnowledge"]},
			effects: {
				"temporalParadoxDay": 1,
				"energyConsumption":  15
			},
			togglable: true,
			calculateEffects: function (self, game) {
				self.effects = {
					"temporalParadoxDay": 1 + game.getEffect("temporalParadoxDayBonus"),
					"energyConsumption": 15
				};
			}
		}, {
			name: "voidResonator",
			prices: [
				{name: "timeCrystal", val: 1000},
				{name: "relic",       val: 10000},
				{name: "void",        val: 50}
			],
			priceRatio: 1.25,
			requires: {tech: ["paradoxalKnowledge"]},
			effects: {
				"voidResonance": 0.1
			}
		}
	],

	tabName: "Time",
	getVisible: function () {
		return this.game.science.get("calendar").owned() || this.getVSU("usedCryochambers").owned();
	},

	effectsBase: {
		"heatPerTick":     0.01,
		"heatMax":         100,
		"temporalFluxMax": 60 * 10 * 5  //10 minutes (5 == this.game.ticksPerSecond)
	},

	getEffectBase: function (name) {
		return num(this.effectsBase[name]);
	},

	constructor: function () {
		this.timestamp = this.game.lastBackup || Date.now();
		this.i18nKeys = {tabName: "tab.name.time"};

		this.registerMetaItems(this.cfuData, classes.KGSaveEdit.CFUMeta, "cfu", function (cfu) {
			cfu.i18nKeys = {
				label: "time.cfu." + cfu.name + ".label",
				description: "time.cfu." + cfu.name + ".desc"
			};
			if (cfu.desc2) {
				cfu.i18nKeys.desc2 = "time.cfu." + cfu.name + ".desc2";
			}
		});
		this.registerMetaItems(this.vsuData, classes.KGSaveEdit.VSUMeta, "vsu", function (vsu) {
			vsu.i18nKeys = {
				label: "time.vsu." + vsu.name + ".label",
				description: "time.vsu." + vsu.name + ".desc"
			};
		});

		this.addMeta(this.cfu);
		this.addMeta(this.vsu);
	},

	get: function (name) {
		return this.getCFU(name);
	},

	getCFU: function (name) {
		var upgrade = this.cfuByName[name];
		if (name && !upgrade) {
			console.error("Chronoforge upgrade not found", name);
		}
		return upgrade;
	},

	getVSU: function (name) {
		var upgrade = this.vsuByName[name];
		if (name && !upgrade) {
			console.error("Voidspace upgrade not found", name);
		}
		return upgrade;
	},

	renderTabBlock: function () {
		var self = this;
		var game = self.game;

		var panel = game._createPanel(self.tabBlockNode, {
			id: "timePanel",
			class: "bottom-margin"
		}, $I("tab.name.time"), true);

		// Timestamp Node
		var div = dojo.create("div", {
			id: "timestampBlock",
			innerHTML: '<span class="nameNode">' + $I("KGSaveEdit.time.timestamp") + "</span> "
		}, panel.content);

		game._createTimeInput({
			id: "timestampNode",
			title: $I("KGSaveEdit.time.timestamp.title")
		}, div, self, "timestamp");

		div = dojo.create("div", null, panel.content);
		game._createCheckbox($I("time.AccelerateTimeBtn.label"), div, self, "isAccelerated");

		div = dojo.create("div", {class: "bottom-margin"}, panel.content);
		game._createCheckbox("testShatter", div, self, "testShatter");

		self.timeBlock = dojo.create("table", {id: "timeBlock"}, panel.content);

		// Energy Node
		var temporalFlux = game.resPool.get("temporalFlux");
		var str = "/" + temporalFlux.maxValue;
		var seconds = temporalFlux.value / this.game.ticksPerSecond;
		str += " (" + (seconds < 1 ? "0s" : this.game.toDisplaySeconds(seconds)) + " / " + this.game.toDisplaySeconds(temporalFlux.maxValue / this.game.ticksPerSecond) + ")";

		var tr = dojo.create("tr", {
			innerHTML: '<td><span class="nameNode">' + $I("time.flux") + "</span></td><td></td><td>" + str + "</td>"
		}, self.timeBlock);

		// dojo.place(temporalFlux.valueNode, tr.children[1]);

		var input = game._createInput({
			id: "energyNode",
			class: "integerInput"
		}, tr.children[1], self);
		self.temporalFluxNode = input;

		input.handler = function () {
			temporalFlux.set("value", this.parsedValue, true);
		};

		self.energyMaxBlock = tr.children[2];

		// Flux Node
		tr = dojo.create("tr", {
			innerHTML: '<td><span class="nameNode">' + $I("KGSaveEdit.time.flux") + "</span></td><td></td><td></td>",
			title: $I("KGSaveEdit.time.flux.title")
		}, self.timeBlock);

		input = game._createInput({
			id: "fluxNode",
			class: "abbrInput"
		}, tr.children[1], self, "flux");
		input.minValue = -Number.MAX_VALUE;

		// Heat Node
		tr = dojo.create("tr", {
			innerHTML: '<td><span class="nameNode">' + $I("time.heat") + "</span></td><td></td><td></td>"
		}, self.timeBlock);

		self.heatNameNode = tr.children[0].children[0];

		input = game._createInput({id: "heatNode"}, tr.children[1], self, "heat");
		self.heatBlock = tr.children[2];

		panel = game._createPanel(self.tabBlockNode, {
			id: "cfuPanel",
			class: "bottom-margin"
		}, $I("workshop.chronoforge.label"), true);

		self.chronoforgeBlock = dojo.create("table", {id: "cfuBlock"}, panel.content);
		self.chronoforgeHeader = panel.header;

		for (var i = 0; i < self.cfu.length; i++) {
			var item = self.cfu[i];
			item.render();
			dojo.place(item.domNode, self.chronoforgeBlock);
		}

		panel = game._createPanel(self.tabBlockNode, {
			id: "vsuPanel",
			class: "bottom-margin"
		}, $I("science.voidSpace.label"), true);

		self.voidspaceBlock = dojo.create("table", {id: "vsuBlock"}, panel.content);

		self.voidspaceHeader = panel.header;

		for (i = 0; i < self.vsu.length; i++) {
			item = self.vsu[i];
			item.render();
			item.afterRender(); //workaround for strictmode
			dojo.place(item.domNode, self.voidspaceBlock);
		}
	},

	update: function () {
		var hasChronoforge = this.game.workshop.get("chronoforge").owned();
		var temporalFlux = this.game.resPool.get("temporalFlux");
		var str = "/" + temporalFlux.maxValue;

		this.game.callMethods(this.cfu, "update");
		this.game.callMethods(this.vsu, "update");

		var seconds = temporalFlux.value / this.game.ticksPerSecond;
		str += " (" + (seconds < 1 ? "0" + $I("unit.s") : this.game.toDisplaySeconds(seconds)) +
			" / " + this.game.toDisplaySeconds(temporalFlux.maxValue / this.game.ticksPerSecond) + ")";
		this.energyMaxBlock.innerHTML = str;

		var heatMax = this.game.getEffect("heatMax");
		str = "/" + heatMax;
		var heatPerSecond = this.game.getEffect("heatPerTick") * this.game.ticksPerSecond;
		seconds = this.game.time.heat / heatPerSecond;
		str += " (" + (seconds < 1 ? "0" + $I("unit.s") : this.game.toDisplaySeconds(seconds)) +
			" / " + this.game.toDisplaySeconds(heatMax / heatPerSecond) + ")";

		this.heatBlock.innerHTML = str;

		dojo.toggleClass(this.heatNameNode, "spoiler", !hasChronoforge);
		dojo.toggleClass(this.chronoforgeHeader, "spoiler", !hasChronoforge);
		dojo.toggleClass(this.voidspaceHeader, "spoiler",
			!this.game.science.get("voidSpace").owned() && !this.getVSU("usedCryochambers").owned());
	},

	save: function (saveData) {
		saveData.time = {
			timestamp: this.timestamp,
			flux: this.flux,
			heat: this.heat,
			testShatter: this.testShatter ? 1 : 0,
			isAccelerated: this.isAccelerated,
			cfu: this.game.mapMethods(this.cfu, "save"),
			vsu: this.game.mapMethods(this.vsu, "save")
		};
	},

	load: function (saveData) {
		if (!saveData.time) {
			return;
		}

		var data = saveData.time;
		this.game.loadMetaFields(this, data, ["flux", "heat", "testShatter", "isAccelerated", "timestamp"]);

		this.loadMetadata(data, "cfu", "getCFU", null, true);
		this.loadMetadata(data, "vsu", "getVSU", null, true);

		if (data.usedCryochambers) {
			this.loadMetadata(data, "usedCryochambers", "getVSU", null, true);
		}
	}
});


dojo.declare("classes.KGSaveEdit.CFUMeta", classes.KGSaveEdit.MetaItemStackable, {
	upgradeType: "chronoforge",
	unlocked: false,

	priceRatio: 1.25,

	constructor: function () {
		this.defaultUnlocked = this.unlocked;
	},

	getName: function () {
		var label = this.label;
		if (this.owned()) {
			label += " (" + this.val + ")";
		}
		if (this.heatNode) {
			label += " [" + this.heat.toFixed(0) + "%]";
		}
		return label;
	},

	getPrices: function () {
		var prices = this.prices ? dojo.clone(this.prices) : [];
		var priceRatio = this.priceRatio || 1.25;

		var pricesDiscount = this.game.getLimitedDR((this.game.getEffect(this.name + "CostReduction")), 1);
		var priceModifier = 1 - pricesDiscount;

		for (var i = 0; i < prices.length; i++) {
			var resPriceDiscount = this.game.getEffect(prices[i].name + "CostReduction");
			resPriceDiscount = this.game.getLimitedDR(resPriceDiscount, 1);
			var resPriceModifier = 1 - resPriceDiscount;
			prices[i].val *= Math.pow(priceRatio, this.val) * resPriceModifier * priceModifier;
			if (prices[i].name === "karma" && this.name === "cryochambers") {
				prices[i].val -= prices[i].val * this.game.getLimitedDR(0.01 * this.game.prestige.getBurnedParagonRatio(), 1.0);
			}
		}
		return prices;
	},

	render: function () {
		this.seti18n();

		var tr = dojo.create("tr", {
			// class: "building",
			innerHTML: "<td></td><td></td><td></td>"
		});
		this.domNode = tr;

		this.nameNode = dojo.create("span", {
			class: "nameNode",
			innerHTML: this.getName()
		}, tr.children[0]);

		if (this.togglable) {
			this.onNodeSpan = dojo.create("span", {innerHTML: " / "}, this.domNode.children[1]);

			this.game._createInput({
				class: "integerInput ownedInput",
				title: $I("KGSaveEdit.buildings.on.title")
			}, this.onNodeSpan, this, "on", "first");
		}

		this.game._createValInput({
			title: $I("KGSaveEdit.buildings.val.title")
		}, tr.children[1], this);

		if (Object.prototype.hasOwnProperty.call(this, "heat")) {
			dojo.place(document.createTextNode(" " + $I("time.heat") + " "), tr.children[1]);
			var input = this.game._createInput(null, tr.children[1], this, "heat");
			input.minValue = -Number.MAX_VALUE;
			input.displayFn = function (value) {
				return value.toFixed(0) + "%";
			};
		}

		if (Object.prototype.hasOwnProperty.call(this, "isAutomationEnabled")) {
			this.game._createCheckbox($I("btn.aon.tooltip"), tr.children[2], this, "isAutomationEnabled");
		}

		if (this.showUnlocked) {
			this.game._createCheckbox($I("KGSaveEdit.label.unlocked"), tr.children[2], this, "unlocked");
		}

		this.registerHighlight(this.domNode); // MetaItem
		this.registerTooltip(this.domNode); // ToolTip
	},

	update: function () { // if researched
		var unlocked = this.game.checkRequirements(this, this.defaultUnlocked);
		if (this.unlockedNode) {
			this.game.toggleDisabled(this.unlockedNode, unlocked);
			unlocked = this.unlockedNode.prevChecked || unlocked;
		}
		this.set("unlocked", unlocked);
		dojo.toggleClass(this.nameNode, "spoiler", !this.unlocked);

		this.updateEnabled();

		//Chronoforge and void-space upgrades only got their effects recalculated
		//if their own action happened to do it. blastFurnace does; temporalPress
		//and temporalImpedance do not, so those never picked up changes such as
		//the temporal press price ratio falling as 1000Years completions mount.
		//The space tab already recalculates this way on update.
		if (this.calculateEffects) {
			this.calculateEffects(this, this.game);
		}

		if (this.action) {
			this.action(this, this.game);
		}

		if (this.name === "usedCryochambers") {
			dojo.addClass(this.nameNode, "btnDisabled");
		}
	},

	save: function () {
		//Same field list the game writes for cfu. isAutomationEnabled used to be
		//hardcoded to false for blastFurnace and omitted everywhere else, so any
		//automation the player had enabled was discarded on export.
		var saveData = this.game.filterMetaObj(this,
			["name", "val", "on", "heat", "delayTicks", "unlocked", "isAutomationEnabled"]);
		saveData.on = this.getOn();
		return saveData;
	},

	load: function (saveData) {
		this.set("val", num(saveData.val));
		this.set("on", num(saveData.on));
		this.set("unlocked", Boolean(saveData.unlocked) || this.defaultUnlocked);

		if (this.heatNode) {
			this.set("heat", num(saveData.heat));
		}
		if (Object.prototype.hasOwnProperty.call(this, "delayTicks")) {
			this.delayTicks = num(saveData.delayTicks);
		}
		if (Object.prototype.hasOwnProperty.call(this, "isAutomationEnabled")) {
			//Preserve null (feature not yet unlocked) rather than coercing to false,
			//which is the distinction the game itself keeps.
			this.set("isAutomationEnabled",
				saveData.isAutomationEnabled === null || saveData.isAutomationEnabled === undefined ?
					null : Boolean(saveData.isAutomationEnabled));
		}
	}
});


dojo.declare("classes.KGSaveEdit.VSUMeta", classes.KGSaveEdit.CFUMeta, {
	upgradeType: "voidSpace",

	//workaround for strictmode
	afterRender: function () {
		dojo.addClass(this.domNode.children[1], "rightAlign");
	},

	getName: function () {
		var label = this.get("label");
		if (this.owned()) {
			var on = this.getOn();
			if (this.togglable || (this.name === "cryochambers" && on < this.val)) {
				return label + " (" + on + "/" + this.val + ")";
			}
			return label + " (" + this.val + ")";
		}
		return label;
	},

	save: function () {
		var saveData = this.game.filterMetaObj(this, ["name", "val", "on"]);
		saveData.on = this.getOn();
		return saveData;
	}
});


});

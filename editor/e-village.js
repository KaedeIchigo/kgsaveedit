/* global dojo, require, classes, $I, num */

require(["dojo/on"], function (on) {
"use strict";

dojo.declare("classes.KGSaveEdit.VillageManager", [classes.KGSaveEdit.UI.Tab, classes.KGSaveEdit.Manager], {
	jobsData: [
		{
			name: "woodcutter",
			unlocked: true,
			modifiers: {
				"wood": 0.018
			},
			flavor: "village.woodcutter.flavor"
		}, {
			name: "farmer",
			requires: {tech: ["agriculture"]},
			modifiers: {
				"catnip": 1
			}
		}, {
			name: "scholar",
			requires: {buildings: ["library"]},
			modifiers: {},
			calculateEffects: function (self, game) {
				var modifiers = {
					"science": 0.035
				};

				if (game.workshop.get("astrophysicists").owned()) {
					modifiers["starchart"] = 0.0001; //i'm not entirely sure if it is too little or too much
				}

				self.modifiers = modifiers;
			}
		}, {
			name: "hunter",
			requires: {tech: ["archery"]},
			modifiers: {
				"manpower": 0.06
			},
			flavor: true
		}, {
			name: "miner",
			requires: {buildings: ["mine"]},
			modifiers: {
				"minerals": 0.05
			},
			flavor: true
		}, {
			name: "priest",
			requires: function (game) {
				return /* !game.challenges.isActive("atheism") && */ game.science.get("theology").owned();
			},
			modifiers: {
				"faith": 0.0015
			}
		}, {
			name: "geologist",
			requires: {tech: ["archeology"]},
			modifiers: {},
			calculateEffects: function (self, game) {
				var coal = 0.015;
				var gold = 0;

				if (game.workshop.get("miningDrill").owned()) {
					coal += 0.010;
					gold += 0.0005;
				}
				if (game.workshop.get("unobtainiumDrill").owned()) {
					coal += 0.015;
					gold += 0.0005;
				}
				if (game.workshop.get("geodesy").owned()) {
					coal += 0.0075;
					gold += 0.0008;
				} else {
					// Drills don't add gold before geodesy.
					gold = 0;
				}

				var modifiers = {
					"coal": coal
				};
				if (gold > 0) {
					modifiers["gold"] = gold;
				}

				self.modifiers = modifiers;
			}
		}, {
			name: "engineer",
			requires: {tech: ["mechanization"]},
			modifiers: {}
		}, {
			//Added in Kittens Game 1.5.x, unlocked by the "ambassadors" perk.
			//The game scales this job's culture/spice upkeep with headcount and
			//caps its slots from embassy count; those are runtime calculations the
			//editor does not reproduce, so only the flat modifiers are listed.
			name: "ambassador",
			modifiers: {
				"tradeVolume":                   0.0007,
				"embassyEffectCap":              0.00133,
				"tradeBlueprintChance":          0.00008,
				"tradeSpiceChance":              0.00009,
				"tradeNormalResChance":          0.00003,
				"cultureConsumptionAmbassadors": 20,
				"spiceConsumptionAmbassadors":   0.8
			}
		}
	],

	traits: [
		{name: "scientist"},
		{name: "manager"},
		{name: "engineer"},
		{name: "merchant"},
		{name: "wise"},
		{name: "metallurgist"},
		{name: "chemist"},
		{name: "none"}
	],
	traitsByName: null,

	jobs: null,
	jobsByName: null,

	tabName: "Village",
	leaderBonuses: ["manager"],
	getVisible: function () {
		return this.game.resPool.get("kittens").owned() || this.game.resPool.get("zebras").owned() ||
			this.game.bld.get("hut").owned() || this.game.time.getVSU("usedCryochambers").owned();
	},

	onTabOpen: function () {
		this.setAllKittenNames(true);
	},

	leader: null,

	happiness: 1,
	catnipPerKitten: -0.85,

	maxJobSkill: 20001, // kittens' skill cap, for late game save compression

	kittens: null, // current kittens
	generatedKittens: null, // generated kittens
	censusKittens: null, // subset of kittens, used for census
	censusPage: 1, // current census page
	censusPageMax: 1, // highest census page
	kittensPerPage: 10,

	hadKittenHunters: false,

	reserveKittens: null,
	generatedReserveKittens: null,

	selectedKittens: null,

	censusReserveKittens: false,

	constructor: function (game) {
		this.jobs = [];
		this.jobsByName = {};
		this.jobNames = [];

		this.kittens = [];
		this.generatedKittens = [];
		this.censusKittens = [];
		this.censusPageKittens = [];
		this.traitsByName = {};

		this.reserveKittens = [];
		this.generatedReserveKittens = [];

		this.selectedKittens = [];

		this.map = new classes.KGSaveEdit.VillageMap(game);
		this.registerEffectNames(this.map.effects);

		for (var i = 0, len = this.jobsData.length; i < len; i++) {
			var job = new classes.KGSaveEdit.JobMeta(game, this.jobsData[i]);
			job.metaObj = this;

			this.jobs.push(job);
			this.jobNames.push(job.name);
			this.jobsByName[job.name] = job;
		}

		for (i = 0, len = this.traits.length; i < len; i++) {
			var trait = this.traits[i];
			this.traitsByName[trait.name] = trait;
		}
	},

	getJob: function (name) {
		var job = this.jobsByName[name];
		// if (name && !job) {
		// 	console.error("Job not found", name);
		// }
		return job;
	},

	getBiome: function (name) {
		var biome = this.map.biomesByName[name];
		if (name && !biome) {
			console.error("Biome not found", name);
		}
		return biome;
	},

	getJobLimit: function (jobName) {
		if (jobName === "engineer") {
			return this.game.bld.get("factory").val;
		} else {
			return 100000;
		}
	},

	getTrait: function (name) {
		return this.traitsByName[name] || this.traitsByName.none;
	},

	getEffect: function (effectName) {
		return this.map.getEffect(effectName);
	},

	// show no leader set as long as you have theocracy set with an inappropriate leader
	// or in other words, remember which kitten was leader if you set and then unset theocracy
	// also handles setting number of kittens lower that the leaders' array index
	// should export as no leader if the leader is not valid
	getLeader: function () {
		var leader = this.leader;
		if (!leader || this.kittens.indexOf(leader) < 0) {
			return null;
		}
		var theocracy = this.game.science.getPolicy("theocracy");
		if (theocracy.owned() && leader.job !== theocracy.requiredLeaderJob) {
			return null;
		}
		return leader;
	},

	showFracturedNames: false,

	renderTabBlock: function () {
		var self = this;
		var game = self.game;

		var i, len, job, trait;

		for (i = self.traits.length - 1; i >= 0; i--) {
			trait = self.traits[i];
			trait.title = $I("village.trait." + trait.name);
		}

		var panel = game._createPanel(self.tabBlockNode, {
			id: "jobsPanel",
			class: "bottom-margin"
		}, $I("village.panel.job"), true);

		var div = dojo.create("div", {
			innerHTML: $I("village.general.free.kittens.label") + ' <span id="freeKittensSpan">0 / 0</span>'
		}, panel.content);
		self.freeKittensSpan = div.children[0];

		self.jobsBlock = dojo.create("table", {id: "jobsBlock"}, panel.content);

		for (i = 0, len = self.jobs.length; i < len; i++) {
			job = self.jobs[i];
			job.render();
			dojo.place(job.domNode, self.jobsBlock);
		}

		div = dojo.create("div", null, panel.content);
		game._createCheckbox($I("KGSaveEdit.village.hadKittenHunters"), div, self, "hadKittenHunters");

		self.map.render();

		panel = game._createPanel(self.tabBlockNode, {id: "censusPanel"}, $I("village.panel.census"), true);

		self.censusBlock = panel.content;
		self.censusBlock.id = "censusBlock";

		self.governmentBlock = dojo.create("div", {
			class: "toggleAnarchy noAnarchy",
			id: "governmentBlock"
		}, self.censusBlock);

		var censusSourceBlock = dojo.create("div", {id: "censusSourceBlock", class: "bottom-margin"}, self.censusBlock);
		var label = dojo.create("label", {innerHTML: $I("KGSaveEdit.village.census.source.villageKittens")}, censusSourceBlock);
		self.censusSourceKittens = dojo.create("input", {
			id: "censusSourceKittens",
			name: "censusSource",
			type: "radio",
			checked: true
		}, label, "first");
		label = dojo.create("label", {innerHTML: $I("KGSaveEdit.village.census.source.reserveKittens")}, censusSourceBlock);
		self.censusSourceReserves = dojo.create("input", {
			id: "censusSourceReserves",
			name: "censusSource",
			type: "radio"
		}, label, "first");
		self.censusReserveKittens = false;

		on(censusSourceBlock, on.selector('input[type="radio"]', "click"), function () {
			var prevCensusReserveKittens = self.censusReserveKittens;
			self.censusReserveKittens = self.censusSourceReserves.checked;
			dojo.toggleClass(self.censusKittensBlock, "showReserves", self.censusReserveKittens);
			if (prevCensusReserveKittens !== self.censusReserveKittens) {
				self.takeCensus();
				self.updateSelectedKittens();
			}
		});

		dojo.place(document.createTextNode(" \u00A0"), censusSourceBlock); //insert &nbsp; equivalent
		self.reserveKittensCountNode = game._createInput({class: "integerInput"}, censusSourceBlock);

		self.showFracturedNamesBlock = dojo.create("span", {
			class: "bottom-margin",
			innerHTML: " &nbsp;"
		}, censusSourceBlock);
		var cbox = game._createCheckbox($I("KGSaveEdit.village.census.showFractured"), self.showFracturedNamesBlock).cbox;
		cbox.handler = function () {
			self.showFracturedNames = this.checked;
			self.setAllKittenNames(true);
		};
		dojo.toggleClass(self.showFracturedNamesBlock, "hidden", !game.getFeatureFlag("MAUSOLEUM_PACTS"));

		self.reserveKittensCountNode.handler = function () {
			self.synchReserveKittens(this.parsedValue);
		};

		self.unassignLeaderBlock = dojo.create("div");

		self.unassignLeaderBtn = dojo.create("span", {
			class: "separated",
			innerHTML: '<a href="#">' + $I("village.btn.unassign") + "</a>"
		}, self.unassignLeaderBlock);

		on(self.unassignLeaderBtn.children[0], "click", function () {
			if (self.leader) {
				self.leader.fireLeader();
				game.update();
			}
		});

		self.unassignLeaderJobBtn = dojo.create("span", {
			class: "separated",
			innerHTML: '<a href="#">' + $I("KGSaveEdit.village.leader.unassignJob") + "</a>"
		}, self.unassignLeaderBlock);

		on(self.unassignLeaderJobBtn.children[0], "click", function () {
			if (self.leader) {
				self.leader.quitJob();
				game.update();
			}
		});

		div = dojo.create("div", {class: "censusLine"}, self.censusBlock);

		self.censusJobFilterNode = dojo.create("select", {
			innerHTML: '<option value="all">' + $I("village.census.filter.all") + "</option>"
		}, div);

		for (i = 0, len = self.jobs.length; i < len; i++) {
			job = self.jobs[i];
			job.filterNode = dojo.create("option", {
				value: job.name,
				innerHTML: job.title
			}, self.censusJobFilterNode);
		}

		self.governmentFilter = dojo.create("option", {
			value: "leader",
			innerHTML: $I("village.census.lbl.leader")
		}, self.censusJobFilterNode);

		self.selectedFilter = dojo.create("option", {
			value: "selected",
			innerHTML: $I("KGSaveEdit.village.census.select.selected")
		}, self.censusJobFilterNode);

		on(self.censusJobFilterNode, "change", function () {
			self.takeCensus();
		});

		self.censusTraitFilterNode = dojo.create("select", {
			innerHTML: '<option value="all">' + $I("village.trait.filter.all") + "</option>"
		}, div);

		for (i = 0, len = self.traits.length; i < len; i++) {
			trait = self.traits[i];
			trait.filterNode = dojo.create("option", {
				value: trait.name,
				innerHTML: trait.title
			}, self.censusTraitFilterNode);
		}

		on(self.censusTraitFilterNode, "change", function () {
			self.takeCensus();
		});

		self.censusPageBlock = dojo.create("span", {
			id: "censusPageBlock",
			class: "floatRight hidden"
		}, div);

		self.censusPageFirst = dojo.create("a", {
			href: "#",
			innerHTML: "&lt;&lt;"
		}, self.censusPageBlock);
		on(self.censusPageFirst, "click", function () {
			game.setInput(self.censusPageNode, 1);
		});

		self.censusPagePrev = dojo.create("a", {
			href: "#",
			innerHTML: "&lt;"
		}, self.censusPageBlock);
		on(self.censusPagePrev, "click", function () {
			game.setInput(self.censusPageNode, self.censusPage - 1);
		});

		var span = dojo.create("span", {innerHTML: $I("KGSaveEdit.village.census.page") + " "}, self.censusPageBlock);

		var input = game._createInput({class: "integerInput"}, span, self, "censusPage");
		input.minValue = 1;
		input.handler = function () { self.renderCensus(); };

		self.censusPageCount = dojo.create("span", null, span);

		self.censusPageNext = dojo.create("a", {
			href: "#",
			innerHTML: "&gt;"
		}, self.censusPageBlock);
		on(self.censusPageNext, "click", function () {
			game.setInput(self.censusPageNode, Math.min(self.censusPage + 1, self.censusPageMax));
		});

		self.censusPageLast = dojo.create("a", {
			href: "#",
			innerHTML: "&gt;&gt;"
		}, self.censusPageBlock);
		on(self.censusPageLast, "click", function () {
			game.setInput(self.censusPageNode, self.censusPageMax);
		});

		self.selectedKittensBlock = dojo.create("div", {
			class: "censusLine",
			innerHTML: "<span>0 kittens selected</span> "
		}, self.censusBlock);

		self.selectedKittensCountSpan = self.selectedKittensBlock.children[0];

		self.massEditStartButton = game._createButton(
			{
				value: $I("KGSaveEdit.village.census.edit"),
				disabled: true
			},
			self.selectedKittensBlock, function () {
				self.showMassEdit();
			}
		);

		self.massEditSelectKittensSpan = dojo.create("span", {
			class: "floatRight",
			innerHTML: $I("KGSaveEdit.village.census.select")
		}, self.selectedKittensBlock);

		self.massEditSelectAllNode = game._createCheckbox($I("KGSaveEdit.village.census.select.all"), self.massEditSelectKittensSpan).cbox;
		on(self.massEditSelectAllNode, "click", function () {
			var kittensList = self.getKittensForCensus();
			self.toggleKittenSelected(kittensList, this.checked);
			self.updateSelectedKittens();
		});

		self.massEditSelectFilterNode = game._createCheckbox($I("KGSaveEdit.village.census.select.filtered"), self.massEditSelectKittensSpan).cbox;
		on(self.massEditSelectFilterNode, "click", function () {
			self.toggleKittenSelected(self.censusKittens, this.checked);
			self.updateSelectedKittens();
		});

		self.massEditSelectPageNode = game._createCheckbox($I("KGSaveEdit.village.census.select.page"), self.massEditSelectKittensSpan).cbox;
		on(self.massEditSelectPageNode, "click", function () {
			self.toggleKittenSelected(self.censusPageKittens, this.checked);
			self.updateSelectedKittens();
		});

		self.censusKittensBlock = dojo.create("div", {class: "toggleAnarchy"}, self.censusBlock);

		self.noCensusKittensBlock = dojo.create("div", {
			class: "ital",
			innerHTML: $I("KGSaveEdit.village.census.empty")
		}, self.censusKittensBlock);

		self.takeCensus(true); // re-render kittens
	},

	renderMassEditNode: function () {
		var self = this;
		var game = self.game;

		self.massEditNode = dojo.create("div", {
			id: "massEditKittensBlock",
			class: "hideSiblings hidden"
		}, self.censusKittensBlock, "first");

		var methodKitten = new classes.KGSaveEdit.Kitten(game);

		dojo.empty(self.massEditNode);

		var div = dojo.create("div", {
			class: "censusLine",
			innerHTML: "<span>Editing 0 kittens</span> &nbsp; <span> &nbsp; </span>" // i18n'd later
		}, self.massEditNode);
		this.massEditHeaderSpan = div.children[0];

		game._createButton(
			{value: $I("KGSaveEdit.village.edit.save")}, div.children[1], function () {
				if (self.massEditKittens()) {
					dojo.addClass(self.massEditNode, "hidden");
					if (self.censusTraitFilterNode.value !== "all" && self.massEditTraitControl.checked) {
						self.takeCensus();
					}
					game.update();
				}
			}, "first"
		);

		game._createButton(
			{value: $I("KGSaveEdit.village.edit.cancel")}, div.children[1], function () {
				dojo.addClass(self.massEditNode, "hidden");
			}
		);

		var table = dojo.create("table", null, self.massEditNode);

		var tr = dojo.create("tr", {
			innerHTML: "<td></td><td>" + $I("KGSaveEdit.village.edit.name") + '</td><td></td><td><a href="#">' + $I("KGSaveEdit.village.edit.random") + "</a> </td>"
		}, table);

		var cbox = dojo.create("input", {
			type: "checkbox",
			class: "massEditKittensPropControl",
			title: $I("KGSaveEdit.village.massedit.editProperty")
		}, tr.children[0]);
		self.massEditNameControl = cbox;

		self.massEditNameNode = game._createInput({class: "textInput"}, tr.children[2]);
		self.massEditNameAllRandom = game._createCheckbox($I("KGSaveEdit.village.massedit.random.all"), tr.children[3]).cbox;
		on(tr.children[3].children[0], "click", function () {
			self.massEditNameNode.value = methodKitten.getRandomName();
		});

		tr = dojo.create("tr", {
			innerHTML: "<td></td><td>" + $I("KGSaveEdit.village.edit.surname") + '</td><td></td><td><a href="#">' + $I("KGSaveEdit.village.edit.random") + "</a> </td>"
		}, table);

		self.massEditSurnameControl = dojo.place(dojo.clone(cbox), tr.children[0]);
		self.massEditSurnameNode = game._createInput({class: "textInput"}, tr.children[2]);
		self.massEditSurnameAllRandom = game._createCheckbox($I("KGSaveEdit.village.massedit.random.all"), tr.children[3]).cbox;
		on(tr.children[3].children[0], "click", function () {
			self.massEditSurnameNode.value = methodKitten.getRandomSurname();
		});

		tr = dojo.create("tr", {
			innerHTML: "<td></td><td>" + $I("KGSaveEdit.village.edit.age") + '</td><td></td><td><a href="#">' + $I("KGSaveEdit.village.edit.random") + "</a> </td>"
		}, table);

		self.massEditAgeControl = dojo.place(dojo.clone(cbox), tr.children[0]);
		self.massEditAgeNode = game._createInput({class: "integerInput"}, tr.children[2], null, null, null, true);
		self.massEditAgeAllRandom = game._createCheckbox($I("KGSaveEdit.village.massedit.random.all"), tr.children[3]).cbox;
		on(tr.children[3].children[0], "click", function () {
			self.massEditAgeNode.value = methodKitten.getRandomAge();
		});

		tr = dojo.create("tr", {
			innerHTML: "<td></td><td>" + $I("KGSaveEdit.village.edit.color") + '</td><td></td><td><a href="#">' + $I("KGSaveEdit.village.edit.random") + "</a> </td>"
		}, table);

		self.massEditColorControl = dojo.place(dojo.clone(cbox), tr.children[0]);
		self.massEditColorNode = methodKitten.renderColorSelect(tr.children[2]);
		self.massEditColorAllRandom = game._createCheckbox($I("KGSaveEdit.village.massedit.random.all"), tr.children[3]).cbox;
		on(self.massEditColorNode, "change", function () {
			this.className = this.options[this.selectedIndex].className;
		});
		on(tr.children[3].children[0], "click", function () {
			game.setSelectByValue(self.massEditColorNode, methodKitten.getRandomColor(), true);
		});

		tr = dojo.create("tr", {
			innerHTML: '<td></td><td class="indentPad">' + $I("KGSaveEdit.village.edit.color") + '</td><td></td><td><a href="#">' + $I("KGSaveEdit.village.edit.random") + "</a> </td>"
		}, table);

		self.massEditVarietyControl = dojo.place(dojo.clone(cbox), tr.children[0]);
		self.massEditVarietyNode = methodKitten.renderVarietySelect(tr.children[2]);
		self.massEditVarietyAllRandom = game._createCheckbox($I("KGSaveEdit.village.massedit.random.all"), tr.children[3]).cbox;
		on(tr.children[3].children[0], "click", function () {
			game.setSelectByValue(self.massEditVarietyNode, methodKitten.getRandomVariety(true));
		});

		tr = dojo.create("tr", {
			innerHTML: "<td></td><td>" + $I("KGSaveEdit.village.edit.rarity") + '</td><td></td><td><a href="#">' + $I("KGSaveEdit.village.edit.random") + "</a> </td>"
		}, table);

		self.massEditRarityControl = dojo.place(dojo.clone(cbox), tr.children[0]);
		self.massEditRarityNode = dojo.create("select", {
			innerHTML: '<option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>'
		}, tr.children[2]);
		self.massEditRarityAllRandom = game._createCheckbox($I("KGSaveEdit.village.massedit.random.all"), tr.children[3]).cbox;
		on(tr.children[3].children[0], "click", function () {
			game.setSelectByValue(self.massEditRarityNode, methodKitten.getRandomRarity());
		});

		tr = dojo.create("tr", {
			innerHTML: "<td></td><td>" + $I("KGSaveEdit.village.edit.trait") + '<td></td><td><a href="#">' + $I("KGSaveEdit.village.edit.random") + "</a> </td>"
		}, table);

		self.massEditTraitControl = dojo.place(dojo.clone(cbox), tr.children[0]);
		self.massEditTraitNode = methodKitten.renderTraitSelect(tr.children[2]);
		self.massEditTraitNode.defaultVal = "none";
		self.massEditTraitAllRandom = game._createCheckbox($I("KGSaveEdit.village.massedit.random.all"), tr.children[3]).cbox;
		on(tr.children[3].children[0], "click", function () {
			game.setSelectByValue(self.massEditTraitNode, methodKitten.getRandomTrait().name);
		});

		tr = dojo.create("tr", {
			class: "noAnarchy",
			innerHTML: "<td></td><td>" + $I("KGSaveEdit.village.edit.rank") + "</td><td></td><td></td>"
		}, table);

		self.massEditRankControl = dojo.place(dojo.clone(cbox), tr.children[0]);
		self.massEditRankNode = game._createInput({class: "integerInput expEdit"}, tr.children[2], null, null, null, true);

		tr = dojo.create("tr", {
			class: "noAnarchy",
			innerHTML: "<td></td><td>" + $I("KGSaveEdit.village.edit.exp") + "</td><td></td><td></td>"
		}, table);

		self.massEditExpControl = dojo.place(dojo.clone(cbox), tr.children[0]);
		self.massEditExpNode = game._createInput({class: "expEdit"}, tr.children[2], null, null, null, true);
		self.massEditExpSetExpected = game._createCheckbox($I("KGSaveEdit.village.massedit.exp.setExpected"), tr.children[3]).cbox;

		table = dojo.create("table", {class: "noAnarchy"}, this.massEditNode);

		var handle = function () {
			var skill = "";
			var exp = this.expNode.parsedValue;
			if (exp > 0) {
				var bonus = "";
				if (this.getBonus) {
					bonus = methodKitten.getSkillBonus(this.name, exp, 0, true);
				}
				skill = bonus + self.getSkillLevel(exp);
			}
			this.skillNode.innerHTML = skill;
		};

		var obj = {getBonus: true};
		tr = dojo.create("tr", {
			innerHTML: '<td></td><td title="' + $I("KGSaveEdit.village.massedit.kittenjob.title") + '">' +
				$I("KGSaveEdit.village.massedit.kittenjob") + '</td><td> <span class="expectedRank"></span></td>'
		}, table);

		obj.controlNode = dojo.place(dojo.clone(cbox), tr.children[0]);
		obj.expNode = this.game._createInput({class: "expEdit"},
			tr.children[2], null, null, "first", true);
		obj.expNode.handler = dojo.hitch(obj, handle);

		obj.skillNode = tr.children[2].children[1];
		self.massEditCurrentJobSkill = obj;

		this.massEditJobs = [];

		for (var i = 0, len = self.jobs.length; i < len; i++) {
			var job = self.jobs[i];
			var massEditJob = {
				name: job.name,
				title: job.title
			};
			tr = dojo.create("tr", {
				innerHTML: "<td></td><td>" + job.title + '</td><td> <span class="expectedRank"></span></td>'
			}, table);

			massEditJob.controlNode = dojo.place(dojo.clone(cbox), tr.children[0]);
			massEditJob.expNode = this.game._createInput({class: "expEdit"},
				tr.children[2], null, null, "first", true);
			massEditJob.expNode.maxValue = self.maxJobSkill;
			massEditJob.expNode.handler = dojo.hitch(massEditJob, handle);

			massEditJob.skillNode = tr.children[2].children[1];

			this.massEditJobs.push(massEditJob);
		}
	},

	showMassEdit: function () {
		var game = this.game;
		var count = this.selectedKittens.length;
		if (!count) {
			return;
		}

		if (this.massEditNode) {
			dojo.place(this.massEditNode, this.censusKittensBlock, "first");

		} else {
			this.renderMassEditNode();
		}

		dojo.removeClass(this.massEditNode, "hidden");

		var header = count === 1 ? $I("KGSaveEdit.village.massedit.header.one") : $I("KGSaveEdit.village.massedit.header.many", [count]);
		this.massEditHeaderSpan.innerHTML = header;

		dojo.query("#massEditKittensBlock table input").forEach(function (input) {
			if (input.type === "checkbox") {
				input.checked = false;
			} else {
				game.setInput(input, input.placeholder || "");
			}
		});

		game.setSelectByValue(this.massEditColorNode, 0, true);
		game.setSelectByValue(this.massEditVarietyNode, 0);
		game.setSelectByValue(this.massEditRarityNode, 0);
		game.setSelectByValue(this.massEditTraitNode, "none");
	},

	massEditKittens: function () {
		var count = this.selectedKittens.length;
		var msg = count === 1 ? $I("KGSaveEdit.village.massedit.confirm.one") : $I("KGSaveEdit.village.massedit.confirm.many", [count]);
		if (
			!this.massEditNode || dojo.hasClass(this.massEditNode, "hidden") ||
			!count || !dojo.query(".massEditKittensPropControl:checked").length ||
			!confirm(msg)
		) {
			return false;
		}

		var setTrait = this.getTrait(this.massEditTraitNode.value);

		for (var i = count - 1; i >= 0; i--) {
			var kitten = this.selectedKittens[i];
			var data = kitten.save(true);

			if (this.massEditNameControl.checked) {
				data.name = this.massEditNameAllRandom.checked ? kitten.getRandomName() : this.massEditNameNode.value;
			}

			if (this.massEditSurnameControl.checked) {
				data.surname = this.massEditSurnameAllRandom.checked ? kitten.getRandomSurname() : this.massEditSurnameNode.value;
			}

			if (this.massEditAgeControl.checked) {
				data.age = this.massEditAgeAllRandom.checked ? kitten.getRandomAge() : this.massEditAgeNode.parsedValue;
			}

			if (this.massEditColorControl.checked) {
				data.color = this.massEditColorAllRandom.checked ? kitten.getRandomColor() : Number(this.massEditColorNode.value) || 0;
			}

			if (this.massEditVarietyControl.checked) {
				data.variety = this.massEditVarietyAllRandom.checked ? kitten.getRandomVariety(data.color) : Number(this.massEditVarietyNode.value) || 0;
			}

			if (this.massEditRarityControl.checked) {
				data.rarity = this.massEditRarityAllRandom.checked ? kitten.getRandomRarity() : Number(this.massEditRarityNode.value) || 0;
			}

			if (this.massEditTraitControl.checked) {
				data.trait = this.massEditTraitAllRandom.checked ? kitten.getRandomTrait() : setTrait;
			}

			if (this.massEditRankControl.checked) {
				data.rank = this.massEditRankNode.parsedValue;
			}

			var setCurrentSkill = this.massEditCurrentJobSkill.controlNode.checked;
			var skillExp = 0;
			var skills = data.skills;

			if (kitten.job && setCurrentSkill) {
				skills[kitten.job] = this.massEditCurrentJobSkill.expNode.parsedValue;
			}

			for (var j = 0; j < this.massEditJobs.length; j++) {
				var massEditJob = this.massEditJobs[j];
				var jobName = massEditJob.name;

				if ((!setCurrentSkill || jobName !== kitten.job) && massEditJob.controlNode.checked) {
					skills[jobName] = massEditJob.expNode.parsedValue;
				}
				skillExp += skills[jobName] || 0;
			}

			if (this.massEditExpControl.checked) {
				var exp = this.massEditExpNode.parsedValue;
				if (this.massEditExpSetExpected.checked) {
					exp = skillExp - this.getRankExpSum(data.rank);
				}
				data.exp = Math.max(exp, 0) || 0;
			}

			kitten.load(data);
		}

		return true;
	},

	addKittens: function (limit) {
		while (this.generatedKittens.length < limit) {
			var kitten = new classes.KGSaveEdit.Kitten(this.game);
			this.generatedKittens.push(kitten);
		}
	},

	addReserveKittens: function (limit) {
		while (this.generatedReserveKittens.length < limit) {
			var kitten = new classes.KGSaveEdit.Kitten(this.game);
			kitten.reserve = true;
			this.generatedReserveKittens.push(kitten);
		}
	},

	getKittens: function () {
		return this.game.resPool.get("kittens").value;
	},

	getKittensForCensus: function () {
		return this.censusReserveKittens ? this.reserveKittens : this.kittens;
	},

	getFreeKittens: function () {
		var workingKittens = 0;
		for (var i = this.jobs.length - 1; i >= 0; i--) {
			workingKittens += this.jobs[i].value;
		}

		var diligentKittens = (this.game.challenges.isActive("anarchy") ?
			Math.round(this.getKittens() * (0.5 - this.game.getLimitedDR(this.game.getEffect("kittenLaziness"), 0.25))) :
			this.getKittens());

		return Math.max(diligentKittens - workingKittens, 0) || 0;
	},

	getFreeEngineers: function () {
		return this.game.workshop.freeEngineers;
	},

	getTabName: function () {
		var title = $I(this.getVillageTitle());
		var kittens = this.getFreeKittens();
		if (kittens > 0) {
			title += " (" + kittens + ")";
		}
		return title;
	},

	getVillageTitle: function () {
		var kittens = this.getKittens();
		if (kittens > 5000) {      return "village.tab.title.elders"; } //you gotta be kitten me
		else if (kittens > 2000) { return "village.tab.title.union"; }
		else if (kittens > 1500) { return "village.tab.title.council"; }
		else if (kittens > 1200) { return "village.tab.title.consortium"; }
		else if (kittens > 1000) { return "village.tab.title.civilisation"; } //all rights reserved, yada yada.
		else if (kittens > 900) {  return "village.tab.title.society"; }
		else if (kittens > 800) {  return "village.tab.title.reich"; }
		else if (kittens > 700) {  return "village.tab.title.federation"; }
		else if (kittens > 600) {  return "village.tab.title.hegemony"; }
		else if (kittens > 500) {  return "village.tab.title.dominion"; }
		else if (kittens > 400) {  return "village.tab.title.imperium"; }
		else if (kittens > 300) {  return "village.tab.title.empire"; }
		else if (kittens > 250) {  return "village.tab.title.megapolis"; }
		else if (kittens > 200) {  return "village.tab.title.metropolis"; }
		else if (kittens > 150) {  return "village.tab.title.city"; }
		else if (kittens > 100) {  return "village.tab.title.town"; }
		else if (kittens > 50) {   return "village.tab.title.smalltown"; }
		else if (kittens > 30) {   return "village.tab.title.settlement"; }
		else if (kittens > 15) {   return "village.tab.title.village"; }
		else if (kittens > 0) {    return "village.tab.title.smallvillage"; }
		return "village.tab.title.outpost";
	},

	getEffectLeader: function (trait, defaultObject) {
		var leader = this.getLeader();
		if (leader && !this.game.challenges.isActive("anarchy")) {
			var leaderRatio = 1;
			if (this.game.science.getPolicy("monarchy").owned()) {
				leaderRatio = 1.95;
			}
			var leaderTrait = leader.trait["name"];
			if (leaderTrait === trait) {
				var burnedParagonRatio = 1 + this.game.prestige.getBurnedParagonRatio();
				// Modify the defautlObject depends on trait
				switch (trait) {
					case "engineer": // Crafting bonus
						defaultObject = 0.05 * burnedParagonRatio * leaderRatio;
						break;
					case "metallurgist": // Crafting bonus for non x-ium metallic stuff (plate, steel, gear, alloy)
						defaultObject = 0.1 * burnedParagonRatio * leaderRatio;
						break;
					case "chemist": // Crafting bonus for "chemical" stuff (concrete, eludium, kerosene, thorium)
						defaultObject = 0.075 * burnedParagonRatio * leaderRatio;
						break;
					/* case "merchant": // Trading bonus
						defaultObject = 0.03 * burnedParagonRatio * leaderRatio;
						break;
					case "manager": // Hunting bonus
						defaultObject = 0.5 * burnedParagonRatio * leaderRatio;
						break; */
					case "scientist": // Science prices bonus
						for (var i = 0; i < defaultObject.length; i++) {
							if (defaultObject[i].name === "science") {
								defaultObject[i].val -= defaultObject[i].val * this.game.getLimitedDR(0.05 * burnedParagonRatio, 1.0); //5% before BP
							}
						}
						break;
					case "wise": // Religion bonus
						for (i = 0; i < defaultObject.length; i++) {
							if (defaultObject[i].name === "faith" || defaultObject[i].name === "gold") {
								defaultObject[i].val -= defaultObject[i].val * this.game.getLimitedDR(0.09 + 0.01 * burnedParagonRatio, 1.0); //10% before BP
							}
						}
						break;
				}

			}
		}
		return defaultObject;
	},

	getResConsumption: function () {
		var kittens = this.getKittens();
		var philosophyLuxuryModifier = (1 + this.game.getEffect("luxuryDemandRatio")) * (1 + ((this.game.calendar.festivalDays) ? this.game.getEffect("festivalLuxuryConsumptionRatio") : 0));
		var res = {
			"catnip": this.catnipPerKitten * kittens,
			"furs":  -0.01 * kittens * philosophyLuxuryModifier,
			"ivory": -0.007 * kittens * philosophyLuxuryModifier,
			"spice": -0.001 * kittens * philosophyLuxuryModifier
		};
		return res;
	},

	getResProduction: function () {
		if (!this.resourceProduction) {
			this.updateResourceProduction(); //lazy synch
		}
		var res = dojo.clone(this.resourceProduction);

		//special hack for iron will mode
		var zebras = this.game.resPool.get("zebras").value;
		if (zebras > 0) {
			res["manpower"] = num(res["manpower"]) + 0.15; //zebras are a bit stronger than kittens
		}
		if (zebras > 1) {
			var zebraPreparations = Math.floor(this.game.getEffect("zebraPreparations"));
			res["manpower"] += this.game.getLimitedDR((zebras.value - 1) * 0.05, 2 + zebraPreparations * 0.05);
		}

		return res;
	},

	updateResourceProduction: function () {
		var res = {};
		var leader = this.getLeader();
		var leaderBonus = leader ? this.getLeaderBonus(leader.rank) : 1;
		var happiness = this.happiness + ((this.happiness - 1) * this.game.getEffect("happinessKittenProductionRatio"));

		for (var i = 0, len = this.kittens.length; i < len; i++) {
			var kitten = this.kittens[i];

			if (!kitten.job) {
				continue;
			}
			var job = this.getJob(kitten.job);
			if (!job /* || (kitten.job === "priest" && this.game.challenges.isActive("atheism")) */) {
				continue;
			}

			var mod = this.getValueModifierPerSkill(kitten.skills[kitten.job] || 0);

			for (var jobResMod in job.modifiers) {
				var diff = job.modifiers[jobResMod] + job.modifiers[jobResMod] * mod;

				if (diff > 0) {
					if (kitten === leader) {
						diff *= leaderBonus;
					} else if (leader) {
						diff *= (1 + (leaderBonus - 1) * this.game.getEffect("boostFromLeader"));
					}
					diff *= happiness; //alter positive resource production from jobs
				}

				if (!res[jobResMod]) {
					res[jobResMod] = diff;
				} else {
					res[jobResMod] += diff;
				}
			}

			if (job.name === "engineer" && typeof(kitten.engineerSpeciality) !== "undefined" && kitten.engineerSpeciality !== null) {
				jobResMod = "ES" + kitten.engineerSpeciality;

				var automationBonus = this.game.getEffect(kitten.engineerSpeciality + "AutomationBonus") || 0;
				diff = 1 + automationBonus;

				var rankDiff = this.game.workshop.getCraft(kitten.engineerSpeciality).tier - kitten.rank;
				if (rankDiff > 0) {
					diff -= diff * rankDiff * 0.15;
				}

				diff += diff * mod;

				if (diff > 0) {
					if (kitten === leader) {
						diff *= leaderBonus;
					} else if (leader) {
						diff *= (1 + (leaderBonus - 1) * this.game.getEffect("boostFromLeader"));
					}
					diff *= happiness;
				}

				if (!res[jobResMod]) {
					res[jobResMod] = diff;
				} else {
					res[jobResMod] += diff;
				}
			}
		}
		this.resourceProduction = res;
	},

	getUnhappiness: function () {
		var populationPenalty = 2;
		if (this.game.science.getPolicy("liberty").owned()) {
			populationPenalty = 1;
		}
		if (this.game.science.getPolicy("fascism").owned()) {
			return 0;
		}
		return (this.getKittens() - 5) * populationPenalty * (1 + this.game.getEffect("unhappinessRatio"));
	},

	getEnvironmentEffect: function () {
		return this.game.getEffect("environmentHappinessBonus") + this.game.getEffect("environmentUnhappiness") + this.game.bld.pollutionEffects["pollutionHappines"];
	},

	updateHappines: function () {
		var happiness = 100;
		var numKittens = this.getKittens();

		var unhappiness = this.getUnhappiness();
		if (numKittens > 5) {
			happiness -= unhappiness; //every kitten takes 2% of production rate if >5
		}

		var enviromentalEffect = this.getEnvironmentEffect();
		var happinessBonus = this.game.getEffect("happiness");
		var challengeHappiness = this.game.getEffect("challengeHappiness");
		happiness += (happinessBonus + enviromentalEffect + challengeHappiness);

		//boost happiness/production by 10% for every uncommon/rare resource
		var resources = this.game.resPool.resources;
		var happinessPerLuxury = 10;
		//philosophy epicurianism effect
		happinessPerLuxury += this.game.getEffect("luxuryHappinessBonus");
		var consumableLuxuryBonus = this.game.getEffect("consumableLuxuryHappiness");
		for (var i = resources.length - 1; i >= 0; i--) {
			var res = resources[i];
			if (res.type !== "common" && res.owned()) {
				if (res.name !== "elderBox" || !this.game.resPool.get("wrappingPaper").owned()) {
					happiness += happinessPerLuxury;
				}
				if (res.type === "uncommon") {
					happiness += consumableLuxuryBonus;
				}
			}
		}

		if (this.game.calendar.festivalDays) {
			happiness += 30 * (1 + this.game.getEffect("festivalRatio"));
		}

		var karma = this.game.resPool.get("karma");
		happiness += karma.value; //+1% to the production per karma point

		var overpopulation = numKittens - this.maxKittens;
		if (overpopulation > 0) {
			var overpopulationPenalty = 2;
			happiness -= overpopulation * overpopulationPenalty;
		}

		if (happiness < 25) {
			happiness = 25;
		}

		this.happiness = happiness / 100;
	},

	toggleKittenSelected: function (kittens, selected) {
		for (var i = kittens.length - 1; i >= 0; i--) {
			kittens[i].set("selected", selected, false, true);
		}
	},

	updateSelectedKittens: function (skipUpdate) {
		if (this.massEditNode) {
			dojo.addClass(this.massEditNode, "hidden");
		}

		var kittensList = this.getKittensForCensus();

		this.selectedKittens = dojo.filter(kittensList, function (kitten) {
			return kitten.selected;
		});

		var count = this.selectedKittens.length;
		var text = count === 1 ? $I("KGSaveEdit.village.census.selectedKittens.one") : $I("KGSaveEdit.village.census.selectedKittens.many", [count]);
		this.selectedKittensCountSpan.innerHTML = text;
		this.massEditStartButton.disabled = count === 0;

		//census includes a call to updateSelectedKittenControls
		if (this.censusJobFilterNode.value === "selected") {
			this.takeCensus();
		} else if (!skipUpdate) {
			this.updateSelectedKittenControls();
		}
	},

	updateSelectedKittenControls: function () {
		var kittensList = this.getKittensForCensus();
		this._updateMassEditSelectCbox(this.massEditSelectAllNode, kittensList.length, this.selectedKittens.length);

		var censusKittensSelected = 0;
		for (var i = this.censusKittens.length - 1; i >= 0; i--) {
			if (this.censusKittens[i].selected) {
				censusKittensSelected++;
			} else if (censusKittensSelected > 0) {
				break;
			}
		}

		this._updateMassEditSelectCbox(this.massEditSelectFilterNode, this.censusKittens.length, censusKittensSelected);

		var pageKittensSelected = 0;
		if (this.censusPageKittens.length === this.censusKittens.length) {
			pageKittensSelected = censusKittensSelected;
		} else {
			for (i = this.censusPageKittens.length - 1; i >= 0; i--) {
				if (this.censusPageKittens[i].selected) {
					pageKittensSelected++;
				} else if (pageKittensSelected > 0) {
					break;
				}
			}
		}

		this._updateMassEditSelectCbox(this.massEditSelectPageNode, this.censusPageKittens.length, pageKittensSelected);
	},

	_updateMassEditSelectCbox: function (cbox, kittensCount, selected) {
		cbox.checked = kittensCount > 0 && selected === kittensCount;
		cbox.indeterminate = kittensCount > 0 && selected > 0 && selected < kittensCount;

		this.game.toggleDisabled(cbox, !kittensCount, "invisible");
	},

	getRankExp: function (rank) {
		return 500 * Math.pow(1.75, rank);
	},

	getRankExpSum: function (rank) {
		var exp = 0;
		for (var i = rank; i > 0; i--) {
			exp += this.getRankExp(i - 1);
		}
		return exp;
	},

	getLeaderBonus: function (rank) {
		var bonus = rank == 0 ? 1.0 : (rank + 1) / 1.4;
		if (this.game.science.getPolicy("authocracy").owned()) {
			bonus *= 2;
		}
		return bonus;
	},

	sortKittens: function (kittens) {
		// var getRankExp = this.getRankExp;
		kittens.sort(function (a, b) {
			// return ((b.rank ? getRankExp(b.rank) : 0) + b.exp) -
				// ((a.rank ? getRankExp(a.rank) : 0) + a.exp);
			return (b.rank - a.rank) || (b.exp - a.exp);
		});
	},

	skillToText: function (value) {
		if (value >= 9000) { return $I("village.skill.master"); }
		if (value >= 5000) { return $I("village.skill.proficient"); }
		if (value >= 2500) { return $I("village.skill.skilled"); }
		if (value >= 1200) { return $I("village.skill.competent"); }
		if (value >= 500)  { return $I("village.skill.adequate"); }
		if (value >= 100)  { return $I("village.skill.novice"); }
		return $I("village.skill.dabbling");
	},

	getSkillExpRange: function (value) {
		if (value >= 20000) { return [20000, value]; }
		if (value >= 9000)  { return [9000, 20000]; }
		if (value >= 5000)  { return [5000, 9000]; }
		if (value >= 2500)  { return [2500, 5000]; }
		if (value >= 1200)  { return [1200, 5000]; }
		if (value >= 500)   { return [500, 1200]; }
		if (value >= 100)   { return [100, 500]; }
		return [0, 100];
	},

	getValueModifierPerSkill: function (value) {
		if (this.game.challenges.isActive("anarchy")) {
			return 0;
		}
		var bonus = 0;
		switch (true) {
			case value < 100:
				break;
			case value < 500:
				bonus = 0.0125;
				break;
			case value < 1200:
				bonus = 0.025;
				break;
			case value < 2500:
				bonus = 0.045;
				break;
			case value < 5000:
				bonus = 0.075;
				break;
			case value < 9000:
				bonus = 0.125;
				break;
			default:
				bonus = 0.1875 * (1 + this.game.getLimitedDR(this.game.getEffect("masterSkillMultiplier"), 4));
		}
		return bonus * (1 + this.game.getEffect("skillMultiplier"));
	},

	getSkillLevel: function (exp) {
		var range = this.getSkillExpRange(exp);
		var prevExp = range[0];
		var nextExp = range[1];

		var expDiff = exp - prevExp;
		var expRequired = nextExp - prevExp;

		var expPercent = exp === nextExp ? 100 : (expDiff / expRequired) * 100;

		return "(" + this.skillToText(exp) + " " + expPercent.toFixed() + "%" + ")";
	},

	assignJobs: function (job, count) {
		var free = this.getFreeKittens();
		var jobObj = this.getJob(job);
		if (!jobObj) {
			return;
		}
		free = Math.min(free, this.getJobLimit(job) - jobObj.value);

		if (count < 0) {
			count = free;
		}
		count = Math.min(Number(count) || 1, free);
		if (count <= 0 /*|| !jobObj.unlocked*/) {
			return;
		}

		var workers = dojo.filter(this.kittens, function (k) {
			return !k.job;
		}).sort(function (a, b) {
			return num(b.skills[job]) - num(a.skills[job]);
		});

		var govern = false;
		for (var i = 0; i < count; i++) {
			var worker = workers[i];
			worker.job = job;
			worker.engineerSpeciality = null;

			jobObj.value++;
			worker.renderInfo();
			if (worker.isLeader) {
				govern = true;
			}
		}

		jobObj.updateCount();

		if (govern) {
			this.renderGovernment();
		}
		if (job === this.censusJobFilterNode.value) {
			this.takeCensus();
		}
	},

	assignCraftJobs: function (craft, amt) {
		var freeKittens = dojo.filter(this.kittens, function (kitten) {
			return kitten.job === "engineer" && !kitten.engineerSpeciality;
		});

		if (this.getLeader() && this.game.workshop.get("register").owned()) {
			freeKittens.sort(function (a, b) { return b.val - a.val; });
			freeKittens.sort(function (a, b) { return b.rank - a.rank; });
		}

		var end = Math.min(freeKittens.length, amt);
		for (var i = 0; i < end; i++) {
			freeKittens[i].engineerSpeciality = craft.name;
		}

		return end;
	},

	unassignJobs: function (job, amt) {
		var jobObj = this.getJob(job);
		if (!jobObj || !jobObj.value) {
			return;
		}
		if (amt < 0) {
			amt = jobObj.value;
		}
		amt = Math.min(Number(amt) || 1, jobObj.value);

		var workers = dojo.filter(this.kittens, function (k) {
			return k.job === job;
		}).sort(function (a, b) {
			return num(a.skills[job]) - num(b.skills[job] || 0);
		});

		var govern = false;
		for (var i = 0; i < amt; i++) {
			var worker = workers[i];
			worker.job = null;
			jobObj.value--;
			worker.renderInfo();

			this.unassignCraftJobIfEngineer(jobObj, worker);

			if (worker.isLeader) {
				govern = true;
			}
		}

		jobObj.updateCount();

		if (govern) {
			this.renderGovernment();
		}
		if (job === this.censusJobFilterNode.value) {
			this.takeCensus();
		}
	},

	unassignCraftJobIfEngineer: function (job, kitten) {
		if (job.name === "engineer" && kitten.engineerSpeciality) {
			var craft = this.game.workshop.getCraft(kitten.engineerSpeciality);
			if (craft && craft.value > 0) {
				craft.set("value", craft.value--);
			}
		}
		kitten.engineerSpeciality = null; //ah sanity checks
	},

	unassignCraftJobs: function (craft, amt) {
		var count = 0;
		for (var i = this.kittens.length - 1; i >= 0 && count < amt; i--) {
			var kitten = this.kittens[i];
			if (kitten.engineerSpeciality === craft.name) {
				kitten.engineerSpeciality = null;
				count++;
			}
		}

		craft.set("value", Math.max(craft.value - count, 0));
	},

	countJobs: function () {
		for (var i = this.jobs.length - 1; i >= 0; i--) {
			this.jobs[i].value = 0;
		}

		for (i = this.kittens.length - 1; i >= 0; i--) {
			var job = this.jobsByName[this.kittens[i].job];
			if (job) {
				job.value++;
			}
		}

		for (i = this.jobs.length - 1; i >= 0; i--) {
			this.jobs[i].updateCount();
		}

		this.countCraftJobs();
	},

	countCraftJobs: function () {
		var crafts = this.game.workshop.craftsByName;
		var specialties = {};
		var count = 0;

		for (var craft in crafts) {
			specialties[craft] = 0;
		}

		for (var i = this.kittens.length - 1; i >= 0; i--) {
			var kitten = this.kittens[i];
			if (kitten.job === "engineer" && kitten.engineerSpeciality in specialties) {
				specialties[kitten.engineerSpeciality]++;
				count++;
			}
		}

		for (craft in crafts) {
			crafts[craft].set("value", specialties[craft]);
		}

		return count;
	},

	synchKittens: function (force) {
		var kittensCount = this.getKittens();
		this.addKittens(kittensCount);

		if (force || this.kittens.length !== kittensCount) {
			this.kittens = this.generatedKittens.slice(0, kittensCount);

			//clear properties from voided kittens
			for (var i = kittensCount; i < this.generatedKittens.length; i++) {
				var genKitten = this.generatedKittens[i];
				genKitten.set("selected", false);
				if (genKitten.job) {
					genKitten.job = null;
					genKitten.render();
				}
			}

			this.updateSelectedKittens(true); //will update buttons after taking the census
			this.countJobs();
			this.renderGovernment();
			this.takeCensus();
		}
	},

	synchReserveKittens: function (kittensCount, force) {
		this.addReserveKittens(kittensCount);

		if (force || this.reserveKittens.length !== kittensCount) {
			this.reserveKittens = this.generatedReserveKittens.slice(0, kittensCount);
			for (var i = kittensCount; i < this.generatedReserveKittens.length; i++) {
				this.generatedReserveKittens[i].set("selected", false);
			}

			if (this.censusReserveKittens) {
				this.updateSelectedKittens(true); //will update buttons after taking the census
				this.takeCensus();
			}
		}
	},

	renderGovernment: function () {
		this.governmentBlock.innerHTML = "";

		var leader = this.leader;
		if (leader && this.kittens.indexOf(leader) < 0) {
			leader = null;
		}

		if (leader) {
			var nextRank = Math.floor(this.getRankExp(leader.rank));

			var name = leader.getGovernName();

			var leaderInfo = "<strong>" + $I("village.census.lbl.leader") + ":</strong> " + name + "<br>exp: " + this.game.getDisplayValueExt(leader.exp);

			if (nextRank > leader.exp) {
				leaderInfo += " (" + Math.floor(leader.exp / nextRank * 100) + "%)";
			}

			if (leader.rank > 0) {
				leaderInfo += "<br><br>" + $I("village.job.bonus") + ": x" + this.getLeaderBonus(leader.rank).toFixed(1) +
				" (" + (leader.job ? this.getJob(leader.job).title : "") + ")";
			}

			var leaderBlock = dojo.create("div", {class: "currentLeader"}, this.governmentBlock);
			var leaderInfoBlock = dojo.create("div", {innerHTML: leaderInfo}, leaderBlock);

			if (this.getLeader() !== leader) {
				dojo.addClass(leaderInfoBlock, "ital");
				var theocracy = this.game.science.getPolicy("theocracy");
				var jobTitle = this.getJob(theocracy.requiredLeaderJob).title;
				var wrongLeaderNotice = dojo.create("div", {innerHTML: $I("msg.policy.wrongLeaderJobDemoted", [theocracy.label, jobTitle])}, leaderBlock);
				this.game._toggleNewMarker(wrongLeaderNotice, true);
			}

			dojo.place(this.unassignLeaderBlock, leaderBlock);
			dojo.toggleClass(this.unassignLeaderJobBtn, "hidden", !this.getJob(leader.job));
		}
	},

	takeCensus: function (refresh) {
		var job = this.censusJobFilterNode.value;
		var trait = this.censusTraitFilterNode.value;

		var censusKittens = [];

		if (job === "leader") { //short-circuit, ignore trait filter
			if (!this.censusReserveKittens && this.leader) {
				censusKittens.push(this.leader);
			}

		} else {
			censusKittens = dojo.filter(this.getKittensForCensus(), function (kitten) {
				if (trait !== "all" && kitten.trait.name !== trait) {
					return false;
				}

				if (job === "all") {
					return true;
				} else if (job === "selected") {
					return kitten.selected;
				} else {
					return kitten.job === job;
				}
			});
		}

		this.sortKittens(censusKittens);

		this.game.setInput(this.censusPageNode, 1, true);
		this.censusKittens = censusKittens;
		this.renderCensus(refresh);
	},

	renderCensus: function (refresh) {
		dojo.empty(this.censusKittensBlock);

		var kittens = this.censusKittens;
		var page = Math.max(num(this.censusPageNode.parsedValue), 1);
		var kittensPerPage = Math.max(Math.floor(this.kittensPerPage), 1) || 10;
		var pageMax = kittensPerPage > 0 ? Math.ceil(kittens.length / kittensPerPage) : 1;
		this.censusPageMax = pageMax;

		if (kittensPerPage > 1) {
			kittens = kittens.slice((page - 1) * kittensPerPage, page * kittensPerPage);
		}
		this.censusPageKittens = kittens;

		if (kittens.length > 0) {
			for (var i = 0, len = kittens.length; i < len; i++) {
				if (!kittens[i].domNode || refresh) {
					kittens[i].render();
				}
				dojo.place(kittens[i].domNode, this.censusKittensBlock);
			}
		} else {
			dojo.place(this.noCensusKittensBlock, this.censusKittensBlock);
		}

		dojo.toggleClass(this.censusPageBlock, "hidden", !kittens.length || kittensPerPage < 1);
		dojo.toggleClass(this.censusPageFirst, "invisible", page <= 1);
		dojo.toggleClass(this.censusPagePrev, "invisible", page <= 1);
		dojo.toggleClass(this.censusPageNext, "invisible", page >= pageMax);
		dojo.toggleClass(this.censusPageLast, "invisible", page >= pageMax);

		this.censusPageCount.innerHTML = " " + $I("KGSaveEdit.village.census.page.limit", [pageMax]);

		this.updateSelectedKittenControls();
	},

	setAllKittenNames: function (force) {
		if (force || (this.showFracturedNames && this === this.game.activeTab)) {
			this.game.callMethods(this.getKittensForCensus(), "setStyledName");
			if (this.leader) {
				this.renderGovernment();
			}
		}
	},

	getMaxKittens: function () {
		return Math.floor(this.game.getEffect("maxKittens"));
	},

	calculateSimMaxKittens: function () {
		var maxKittensRatio = this.game.getEffect("maxKittensRatio");
		var maxKittens = this.getMaxKittens();
		if (!maxKittensRatio) {
			return maxKittens;
		}
		var withRatioMaxKittens = Math.round(maxKittens * (1 + this.game.getLimitedDR(maxKittensRatio, 1)));
		return withRatioMaxKittens;
	},

	update: function () {
		dojo.query(".toggleAnarchy").toggleClass("anarchy", this.game.challenges.isActive("anarchy"));

		this.maxKittens = this.calculateSimMaxKittens();

		dojo.toggleClass(this.massEditSelectKittensSpan, "hidden", !this.kittens.length);

		this.freeKittensSpan.textContent = this.getFreeKittens() + " / " + this.getKittens();
		this.game.callMethods(this.jobs, "update");

		var haveHunter = this.getJob("hunter").value > 0;
		var hadHunters = this.hadKittenHunters || this.hadKittenHuntersNode.prevChecked || haveHunter;
		if (this.hadKittenHuntersNode.checked !== hadHunters) {
			this.game.setCheckbox(this.hadKittenHuntersNode, hadHunters, true, true);
		}
		this.game.toggleDisabled(this.hadKittenHuntersNode, haveHunter);

		this.map.update();

		this.game._toggleNewMarker(this.tabWrapper, this.leader && this.kittens.indexOf(this.leader) > -1 && this.leader !== this.getLeader());

		this.updateHappines();
		this.updateResourceProduction();

		if (this.game.getFeatureFlag("MAUSOLEUM_PACTS")) {
			dojo.removeClass(this.showFracturedNamesBlock, "hidden");
		}

		this.setAllKittenNames();
	},

	save: function (saveData) {
		saveData.village = {
			kittens: this.game.mapMethods(this.kittens, "save"),
			maxKittens: this.maxKittens,
			jobs: this.game.filterMetadata(this.jobs, ["name", "unlocked", "value"]),
			currentBiome: this.map.currentBiome,
			hadKittenHunters: this.hadKittenHuntersNode.checked || this.getJob("hunter").value > 0,
			biomes: this.game.filterMetadata(this.map.biomes, ["name", "unlocked", "level", "cp"]),
			map: this.map.save()
		};
	},

	load: function (saveData) {
		if (!saveData.village) {
			return;
		}

		this.loadMetadata(saveData, "village.jobs", "getJob", function (job, saveJob) {
			job.set("unlocked", saveJob.unlocked);
		});

		var saveKittens = saveData.village.kittens;
		var haveHunter = false;
		if (saveKittens && saveKittens.length > 0) {
			this.addKittens(saveKittens.length);
			for (var i = 0, len = saveKittens.length; i < len; i++) {
				this.generatedKittens[i].load(saveKittens[i] || {});
				haveHunter = haveHunter || this.generatedKittens[i].job === "hunter";
			}
		}

		this.set("hadKittenHunters", haveHunter || Boolean(saveData.hadKittenHunters));

		this.loadMetadata(saveData, "village.biomes", "getBiome", function (biome, saveBiome) {
			biome.set("unlocked", Boolean(saveBiome.unlocked));
			biome.set("level", num(saveBiome.level));
			biome.set("cp", num(saveBiome.cp));
		}, true);

		var biome = this.getBiome(saveData.village.currentBiome);
		this.map.currentBiome = biome ? biome.name : null;
		this.game.setSelectByValue(this.map.currentBiomeNode, this.map.currentBiome || "");

		if (saveData.village.map) {
			this.map.load(saveData.village.map);
		}
	},

	saveReserveKittens: function () {
		return this.game.mapMethods(this.reserveKittens, "save");
	},

	loadReserveKittens: function (saveKittens) {
		if (saveKittens) {
			this.game.setInput(this.reserveKittensCountNode, saveKittens.length, true);
			this.synchReserveKittens(saveKittens.length, true);
			for (var i = 0, len = saveKittens.length; i < len; i++) {
				this.generatedReserveKittens[i].load(saveKittens[i] || {});
			}
		}
	}
});

dojo.declare("classes.KGSaveEdit.JobMeta", classes.KGSaveEdit.MetaItem, {
	upgradeType: "jobs",
	name: "Undefined",
	title: "Undefined",
	unlocked: false,
	modifiers: {},
	value: 0,

	constructor: function () {
		this.i18nKeys = {
			title: "village.job." + this.name,
			description: "village.job." + this.name + ".desc"
		};

		if (this.flavor) {
			this.i18nKeys.flavor = typeof this.flavor === "string" ? this.flavor : "village.job." + this.name + ".flavor";
		}
	},

	render: function () {
		var job = this;
		job.seti18n();

		job.domNode = dojo.create("tr", {
			class: "job",
			innerHTML: '<td class="nameNode">' + (this.title || this.name) + "</td><td></td><td></td>"
		});
		job.nameNode = job.domNode.children[0];

		job.assignedNode = job.game._createInput({class: "integerInput"}, job.domNode.children[1], job);

		job.assignedNode.parseFn = function (value) {
			return Math.min(value, this.game.village.getFreeKittens() + job.value, this.game.village.getJobLimit(job.name));
		};

		job.assignedNode.handler = function () {
			if (this.value > job.value) {
				job.assignJobs(this.parsedValue - job.value);
			} else {
				job.unassignJobs(job.value - this.parsedValue);
			}
			this.parsedValue = job.value;
		};

		job.game._createLinkList(job, job.domNode.children[2], [
			{html: "[+]", value: 1},
			{html: "[+5]", value: 5},
			{html: "[+25]", value: 25},
			{html: $I("btn.all.assign"), value: 100000} //default job limit
		], function (value) {
			this.assignJobs(value);
		});

		job.game._createLinkList(job, job.domNode.children[2], [
			{html: "[-]", value: 1},
			{html: "[-5]", value: 5},
			{html: "[-25]", value: 25},
			{html: $I("btn.all.unassign"), value: 100000}
		], function (value) {
			this.unassignJobs(value);
		});

		job.registerTooltip(job.domNode);

		job.updateCount(); // for rerender
	},

	assignJobs: function (kittens) {
		this.game.village.assignJobs(this.name, kittens);
		this.game.update();
	},

	unassignJobs: function (kittens) {
		this.game.village.unassignJobs(this.name, kittens);
		this.game.update();
	},

	getName: function () {
		return (this.title || this.name);
	},

	getPrices: function () { },

	getEffects: function () {
		return dojo.clone(this.modifiers || {});
	},

	update: function () {
		if (this.value > this.game.village.getJobLimit(this.name)) {
			this.game.setInput(this.assignedNode, this.value); //refresh
		}

		this.unlocked = this.game.checkRequirements(this);
		dojo.toggleClass(this.nameNode, "spoiler", !this.unlocked);
		dojo.toggleClass(this.nameNode, "btnDisabled", !this.unlocked || !this.game.village.getFreeKittens() ||
			this.value >= this.game.village.getJobLimit(this.name));
	},

	updateCount: function () {
		this.game.setInput(this.assignedNode, this.value, true);
	}
});

dojo.declare("classes.KGSaveEdit.Kitten", classes.KGSaveEdit.core, {
	statics: {
		SAVE_PACKET_OFFSET: 100
	},

	names: ["Angel", "Charlie", "Mittens", "Oreo", "Lily", "Ellie", "Amber", "Molly", "Jasper",
			"Oscar", "Theo", "Maddie", "Cassie", "Timber", "Meeko", "Micha", "Tami", "Plato",
			"Bea", "Cedar", "Cleo", "Dali", "Fiona", "Hazel", "Iggi", "Jasmine", "Kali", "Luna",
			"Reilly", "Reo", "Rikka", "Ruby", "Tammy"],
	surnames: ["Smoke", "Dust", "Chalk", "Fur", "Clay", "Paws", "Tails", "Sand", "Scratch", "Berry", "Shadow",
			"Ash", "Bark", "Bowl", "Brass", "Dusk", "Gaze", "Gleam", "Grass", "Moss", "Plaid", "Puff", "Rain",
			"Silk", "Silver", "Speck", "Stripes", "Tingle", "Wool", "Yarn"],

	colors: [
		{color: "brown", title: "None"},
		{color: "cinamon", title: "None"},
		{color: "cream", title: "Coral"},
		{color: "black", title: "Grey"},
		{color: "fawn", title: "Fawn"},
		{color: "white", title: "White"},
		{color: "lilac", title: "Lilac"}
	],

	varieties: [
		{style: "dual", title: "None"},
		{style: "tabby", title: "None"},
		{style: "torbie", title: "Torbie"},
		{style: "calico", title: "Calico"},
		{style: "spots", title: "Spots"}
	],

	game: null,
	village: null,

	selected: false,

	name: "Undefined",
	surname: "Undefined",

	getRandomName: function () {
		return this.names[this.game.rand(this.names.length)];
	},

	getRandomSurname: function () {
		return this.surnames[this.game.rand(this.surnames.length)];
	},

	getRandomAge: function () {
		//kittens tend to be on the younger side with some basic minimal age
		var age = 5 + this.game.rand(10);
		if (this.game.rand(100) < 30) {
			this.age += this.game.rand(30);
		}
		return age;
	},

	getRandomTrait: function () {
		return this.traits[this.game.rand(this.traits.length)];
	},

	getRandomRarity: function () {
		var rarity = 0;
		//5% of kitten to be rarity 1 or 2, and extra 10% on top of it to be extra rare
		if (this.game.rand(100) <= 5) {
			rarity = this.game.rand(2) + 1;
			if (this.game.rand(100) <= 10) {
				rarity += 1;
			}
		}
		return rarity;
	},

	getRandomColor: function () {
		var color = 0;
		//10% of chance to generate one of 6 primary colors (rare colors TBD)
		if (this.game.rand(100) <= 10) {
			color = this.game.rand(6) + 1;
		}
		return color;
	},

	getRandomVariety: function (enable) {
		var variety = 0;
		//10% of chance of colored cat to be one of 5 rare varieties (dual, tabby, torbie, calico, spots)
		if (enable && this.game.rand(100) <= 10) {
			variety = this.game.rand(4) + 1;
		}
		return variety;
	},

	job: null,
	trait: null,

	age: 0,

	skills: null,
	exp: 0,
	rank: 0,

	rarity: 0,   //a growth/skill potential, 0 if none
	color: 0,    //kitten color, the higher the rarer, 0 if none
	variety: 0,  //rare kitten pattern variety

	expectedExp: 0,

	isLeader: false,
	isSenator: false,

	reserve: false,

	constructor: function (game) {
		this.game = game;
		this.village = game.village;
		this.traits = game.village.traits;
		this.traitsByName = game.village.traitsByName;

		this.initialize();

		// this.render();
	},

	initialize: function () {
		this.name = this.getRandomName();
		this.surname = this.getRandomSurname();
		this.trait = this.getRandomTrait();
		this.age = this.getRandomAge();

		this.exp = 0;
		this.rank = 0;

		this.rarity = this.getRandomRarity();
		this.color = this.getRandomColor();
		this.variety = this.getRandomVariety(this.color);

		this.skills = {};
	},

	fireAll: function () {
		if (this.isLeader) {
			this.fireLeader(true);
		}
		if (this.job) {
			this.quitJob();
		}
	},

	reset: function () {
		this.initialize();
		this.fireAll();
	},

	setStyledName: function () {
		this.styledName = this.getStyledName();
		if (this.domNode) {
			this.nameBlock.innerHTML = this.styledName;
		}
	},

	render: function () {
		var self = this;
		self.domNode = dojo.create("div", {class: "kittenBlock"});
		dojo.toggleClass(self.domNode, "reserveKitten", self.reserve);

		self.editBlock = null;

		var block = dojo.create("div", {class: "blockContainer"}, self.domNode);
		var div = dojo.create("div", {class: "kittenSubBlock"}, block);

		var span = dojo.create("span", {
			class: "kittenInfo",
			innerHTML: ", "
		}, div);

		var input = self.game._createCheckbox(" ", span, self, "selected", "first");
		dojo.addClass(self.selectedNode, "kittenSelectCheckbox");
		self.selectedNode.title = "Select kitten";

		self.selectedNode.handler = function () {
			self.game.village.updateSelectedKittens();
		};

		self.nameBlock = input.text;

		self.ageBlock = dojo.create("span", {class: "age"}, span);
		dojo.place(document.createTextNode(" years old, "), span);

		self.traitBlock = dojo.create("span", {class: "trait"}, span);
		self.rankBlock = dojo.create("span", {class: "rank"}, span);

		self.kittenSkillsBlock = dojo.create("div", {class: "kittenSkillsBlock noAnarchy"}, div);

		div = dojo.create("div", {
			class: "kittenSubBlock rightAlign",
			innerHTML: '<div><a href="#">' + $I("KGSaveEdit.village.census.editKitten") + "</a></div>"
		}, block);

		on(div.children[0].children[0], "click", function () {
			self.setEditMode();
		});

		self.quitJobNode = dojo.create("div", {innerHTML: '<a href="#">' + $I("village.btn.unassign.job") + "</a>"}, div);
		on(self.quitJobNode.children[0], "click", function () {
			self.quitJob();
			self.game.update();
		});
		if (!self.village.getJob(self.job)) {
			dojo.addClass(self.quitJobNode, "hidden");
		}

		self.setLeaderNode = dojo.create("div", {
			class: "noAnarchy hideOnReserves",
			innerHTML: '<a href="#" title="Make a leader">&#9734;</a>'
		}, div).children[0];
		on(self.setLeaderNode, "click", function () {
			self.makeLeader();
			self.game.update();
		});
		if (self.isLeader) {
			self.setLeaderNode.innerHTML = "&#9733;";
		}

		self.renderInfo();
	},

	getSkillsSorted: function (withJob) {
		var skills = [];
		var job = this.job;

		for (var skill in this.skills) {
			if (!withJob || skill !== job) {
				skills.push({"name": skill, "val": this.skills[skill]});
			}
		}
		skills.sort(function (a, b) { return b.val - a.val; });

		if (job && withJob) {
			skills.unshift({"name": job, "val": this.skills[job]});
		}
		return skills;
	},

	renderInfo: function () {
		if (!this.domNode) {
			return;
		}
		var kittenJob = this.village.getJob(this.job);

		this.setStyledName();

		dojo.toggleClass(this.quitJobNode, "hidden", !kittenJob);

		this.ageBlock.textContent = this.age;
		this.traitBlock.innerHTML = $I("village.trait." + this.trait.name);

		var rankText = "";
		if (this.rank > 0) {
			rankText = " (rank: " + this.rank + ")";
		}
		this.rankBlock.innerHTML = rankText;

		var skillsText = [];
		var skillsArr = this.getSkillsSorted(true);

		var end = skillsArr.length;
		if (!this.game.editorOptions.showAllKittenSkills) {
			end = Math.min(end, 3);
		}

		for (var i = 0; i < end; i++) {
			var skill = skillsArr[i];
			var exp = num(skill.val);

			if (exp <= 0 && this.job !== skill.name) {
				continue;
			}

			var bonus = this.getSkillBonus(skill.name, exp, this.rank);
			var job = this.village.getJob(skill.name);
			var className = 'class="skill' + (this.job === skill.name ? " currentSkill" : "") + '"';
			skillsText.push("<span " + className + ' title="' + exp.toFixed(2) + '">' + job.title + " " + bonus +
				this.village.getSkillLevel(exp) + "</span>");
		}

		this.kittenSkillsBlock.innerHTML = skillsText.join("<br>");
		this.updateEditJobSkills();
	},

	renderTraitSelect: function (parent, pos) {
		var sel = dojo.create("select", null, parent, pos);

		for (var i = 0; i < this.traits.length; i++) {
			var trait = this.traits[i];
			dojo.create("option", {
				value: trait.name,
				innerHTML: trait.title
			}, sel);
		}
		return sel;
	},

	renderColorSelect: function (parent, pos) {
		var sel = dojo.create("select", null, parent, pos);
		// skip first since it's inaccessible
		for (var i = 1; i < this.colors.length; i++) {
			var obj = this.colors[i];
			dojo.create("option", {
				value: i - 1,
				innerHTML: obj.title,
				class: "color-" + obj.color
			}, sel);
		}
		return sel;
	},

	renderVarietySelect: function (parent, pos) {
		var sel = dojo.create("select", null, parent, pos);
		// skip first since it's inaccessible
		for (var i = 1; i < this.varieties.length; i++) {
			var obj = this.varieties[i];
			dojo.create("option", {
				value: i - 1,
				innerHTML: obj.title,
				class: "variety-" + obj.style
			}, sel);
		}
		return sel;
	},

	renderEditBlock: function () {
		var self = this;
		var game = self.game;
		var village = self.village;

		self.editBlock = dojo.create("div", {class: "kittenEditBlock hideSiblings hidden"}, self.domNode, "first");

		var div = dojo.create("div", {
			class: "censusLine",
			innerHTML: " &nbsp; "
		}, self.editBlock);

		var span = dojo.create("span", {innerHTML: " &nbsp; "}, div);

		game._createButton(
			{value: $I("KGSaveEdit.village.edit.save")}, span, function () {
				var prevTrait = self.trait.name;
				var traitFilter = village.censusTraitFilterNode.value;
				self.saveEdits();
				if (traitFilter !== "all" && prevTrait === traitFilter || self.trait.name === traitFilter) {
					village.takeCensus();
				}
				game.update();
			}, "first"
		);

		game._createButton(
			{value: $I("KGSaveEdit.village.edit.cancel")}, span, function () {
				dojo.addClass(self.editBlock, "hidden");
			}
		);

		self.editCurrentNameNode = dojo.create("span", null, div, "first");

		var table = dojo.create("table", null, self.editBlock);

		var tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.village.edit.name") + '</td><td></td><td><a href="#">' + $I("KGSaveEdit.village.edit.random") + "</a></td>"
		}, table);
		self.editNameNode = game._createInput({class: "textInput"}, tr.children[1]);

		on(tr.children[2].children[0], "click", function () {
			self.editNameNode.value = self.getRandomName();
		});

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.village.edit.surname") + '</td><td></td><td><a href="#">' + $I("KGSaveEdit.village.edit.random") + "</a></td>"
		}, table);
		self.editSurnameNode = game._createInput({class: "textInput"}, tr.children[1]);

		on(tr.children[2].children[0], "click", function () {
			self.editSurnameNode.value = self.getRandomSurname();
		});

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.village.edit.age") + '</td><td></td><td><a href="#">' + $I("KGSaveEdit.village.edit.random") + "</a></td>"
		}, table);
		self.editAgeNode = game._createInput({class: "integerInput"},
			tr.children[1], null, null, null, true);

		on(tr.children[2].children[0], "click", function () {
			game.setInput(self.editAgeNode, self.getRandomAge(), true);
		});

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.village.edit.color") + '</td><td></td><td><a href="#">' + $I("KGSaveEdit.village.edit.random") + "</a></td>"
		}, table);
		self.editColorNode = self.renderColorSelect(tr.children[1]);

		on(self.editColorNode, "change", function () {
			self.editColorNode.className = self.editColorNode.options[self.editColorNode.selectedIndex].className;
		});

		on(tr.children[2].children[0], "click", function () {
			game.setSelectByValue(self.editColorNode, self.getRandomColor(), true);
		});

		tr = dojo.create("tr", {
			innerHTML: '<td class="indentPad">' + $I("KGSaveEdit.village.edit.variety") + '</td><td></td><td><a href="#">' + $I("KGSaveEdit.village.edit.random") + "</a></td>"
		}, table);
		self.editVarietyNode = self.renderVarietySelect(tr.children[1]);

		on(tr.children[2].children[0], "click", function () {
			game.setSelectByValue(self.editVarietyNode, self.getRandomVariety(true));
		});

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.village.edit.rarity") + '</td><td></td><td><a href="#">' + $I("KGSaveEdit.village.edit.random") + "</a></td>"
		}, table);
		self.editRarityNode = dojo.create("select", {
			innerHTML: '<option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>'
		}, tr.children[1]);

		on(tr.children[2].children[0], "click", function () {
			game.setSelectByValue(self.editRarityNode, self.getRandomRarity());
		});

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.village.edit.trait") + '</td><td></td><td><a href="#">' + $I("KGSaveEdit.village.edit.random") + "</a></td>"
		}, table);
		self.editTraitNode = self.renderTraitSelect(tr.children[1], "first");
		self.editTraitNode.defaultVal = "none";

		on(tr.children[2].children[0], "click", function () {
			game.setSelectByValue(self.editTraitNode, self.getRandomTrait().name);
		});

		tr = dojo.create("tr", {
			class: "noAnarchy",
			innerHTML: "<td>" + $I("KGSaveEdit.village.edit.rank") + "</td><td></td><td></td>"
		}, table);
		self.editRankNode = game._createInput({class: "integerInput expEdit"},
			tr.children[1], null, null, null, true);
		self.editRankNode.handler = function () {
			if (self.isLeader && self.job) {
				self.updateEditJobSkills();
			}
		};

		tr = dojo.create("tr", {
			class: "noAnarchy",
			innerHTML: "<td>" + $I("KGSaveEdit.village.edit.exp") + '</td><td></td><td><a href="#" class="hidden">(Expected: 0)</a></td>'
		}, table);
		self.editExpNode = game._createInput({class: "expEdit"},
			tr.children[1], null, null, null, true);

		self.editExpectedExpNode = tr.children[2].children[0];
		on(self.editExpectedExpNode, "click", function () {
			game.setInput(self.editExpNode, self.expectedExp);
			self.setExpectedExp();
		});

		dojo.create("div", {
			class: "noAnarchy",
			innerHTML: "Job skills"
		}, self.editBlock);

		table = dojo.create("table", {class: "noAnarchy"}, self.editBlock);
		self.editJobs = [];

		var handle = function () {
			var skill = "";
			var exp = this.expNode.parsedValue;
			if (exp > 0) {
				var bonus = self.getSkillBonus(this.name, exp, self.editRankNode.parsedValue);
				skill = bonus + village.getSkillLevel(exp);
			}
			this.skillNode.innerHTML = skill;
		};

		for (var i = 0, len = village.jobs.length; i < len; i++) {
			var job = village.jobs[i];
			var editJob = {
				name: job.name,
				title: job.title
			};
			tr = dojo.create("tr", {
				innerHTML: "<td>" + job.title + '</td><td></td><td><span class="expectedRank"></span></td>'
			}, table);

			editJob.titleBlock = tr.children[0];
			editJob.expNode = game._createInput({class: "expEdit"},
				tr.children[1], null, null, null, true);
			editJob.expNode.maxValue = village.maxJobSkill;
			editJob.expNode.handler = dojo.hitch(editJob, handle);

			editJob.skillNode = tr.children[2].children[0];

			self.editJobs.push(editJob);
		}

		on(self.editBlock, "input.expEdit:input", function () {
			self.setExpectedExp();
		});
	},

	getSkillBonus: function (skillName, exp, rank, override) {
		var bonus = "";
		if (override || this.job === skillName) {
			var productionRatio = (1 + this.game.getEffect("skillMultiplier")) / 4;
			var mod = this.village.getValueModifierPerSkill(exp);
			bonus = (mod - 1) * productionRatio;
			if (!override && bonus > 0 && this.isLeader) {
				bonus = (this.village.getLeaderBonus(rank) * (bonus + 1) - 1);
			}
			bonus *= 100;
			bonus = bonus > 0 ? "+" + bonus.toFixed(0) + "% " : "";
		}
		return bonus;
	},

	getStyledName: function (unfractured) {
		if (unfractured || !this.village.showFracturedNames) {
			return ('<span class="name color-' +
				((this.color && this.colors[this.color + 1]) ? this.colors[this.color + 1].color : "none") +
				" variety-" + ((this.variety && this.varieties[this.variety + 1]) ? this.varieties[this.variety + 1].style : "none") +
				'">' + this.name + " " + this.surname +
			"</span>");

		} else {
			if (!this.randTimer) {
				var color_and_variety;
				color_and_variety = this.game.createRandomVarietyAndColor(this.game.rand(76), this.game.rand(76));
				this.fakeColor = color_and_variety[0];
				this.fakeName = this.game.createRandomName() + this.game.createRandomName(1, "    -/_") + this.game.createRandomName();
				this.fakeVariety = color_and_variety[1];
				this.randTimer = 10 + this.game.rand(41);
			} else {
				this.randTimer += -1;
			}
			return ('<span class="name color-' +
				((this.fakeColor && this.colors[this.fakeColor + 1]) ? this.colors[this.fakeColor + 1].color : "none") +
				" variety-" + ((this.fakeVariety && this.varieties[this.fakeVariety + 1]) ? this.varieties[this.fakeVariety + 1].style : "none") +
				'" title="' + this.name + " " + this.surname + '">' +
				(/*"shade"*/this.fakeName) +
			"</span>");
		}
	},

	getGovernName: function () {
		var trait = this.trait || this.traitsByName.none;
		var title = trait.name == "none" ? $I("village.census.trait.none") : trait.title +
			" (" + $I("village.bonus.desc." + trait.name) + ") [" + $I("village.census.rank") + " " + this.rank + "]";
		return this.styledName + " (" + title + ")";
	},

	quitJob: function () {
		var job = this.village.getJob(this.job);
		if (job) {
			this.game.village.unassignCraftJobIfEngineer(job, this);
			job.value--;
			job.updateCount();
		}
		this.job = null;
		this.engineerSpeciality = null;

		this.renderInfo();
		if (this.isLeader) {
			this.village.renderGovernment();
		}
	},

	makeLeader: function (noRender) {
		if (this.reserve || this.isLeader && this.village.leader === this) {
			return;
		}

		var oldLeader = this.village.leader;
		if (oldLeader && oldLeader !== this) {
			oldLeader.isLeader = false;
			if (!noRender) {
				oldLeader.update();
			}
		}

		this.village.leader = this;
		this.isLeader = true;

		if (!noRender) {
			this.renderInfo();
			this.village.renderGovernment();
		}
		if (this.village.governmentFilter.selected) {
			this.village.takeCensus();
		}
		this.update();
	},

	fireLeader: function (noRender) {
		this.isLeader = false;

		if (!noRender) {
			this.update();
		}
		if (this.village.leader === this) {
			this.village.leader = null;
			if (!noRender) {
				this.renderInfo();
				this.village.renderGovernment();
			}
			if (this.village.governmentFilter.selected) {
				this.village.takeCensus();
			}
		}
	},

	setExpectedExp: function () {
		var exp = 0;
		var currExp = this.editExpNode.parsedValue;

		for (var i = this.editJobs.length - 1; i >= 0; i--) {
			exp += this.editJobs[i].expNode.parsedValue;
		}

		exp -= this.village.getRankExpSum(this.editRankNode.parsedValue);
		exp = Math.max(exp, 0) || 0;

		this.expectedExp = exp;
		this.editExpectedExpNode.innerHTML = "(" + $I("KGSaveEdit.village.edit.exp.expected", [exp]) + ")";
		dojo.toggleClass(this.editExpectedExpNode, "hidden", exp <= Math.ceil(currExp));
	},

	setEditMode: function () {
		if (!this.editBlock) {
			this.renderEditBlock();
		}

		this.editCurrentNameNode.innerHTML = $I("KGSaveEdit.village.edit.header", [this.name + " " + this.surname]) + " &nbsp;";

		this.editNameNode.value = this.name;
		this.editSurnameNode.value = this.surname;
		this.game.setInput(this.editAgeNode, this.age);
		this.game.setSelectByValue(this.editColorNode, this.color, true);
		this.game.setSelectByValue(this.editVarietyNode, this.variety);
		this.game.setSelectByValue(this.editRarityNode, this.rarity);
		this.game.setSelectByValue(this.editTraitNode, this.trait.name || this.trait);
		this.game.setInput(this.editRankNode, this.rank, true);
		this.game.setInput(this.editExpNode, this.exp);

		for (var i = this.editJobs.length - 1; i >= 0; i--) {
			var job = this.editJobs[i];
			dojo.toggleClass(job.titleBlock, "bold", job.name === this.job);
			this.game.setInput(job.expNode, num(this.skills[job.name]));
		}

		this.setExpectedExp();
		dojo.removeClass(this.editBlock, "hidden");
	},

	saveEdits: function () {
		var skills = {};
		for (var i = 0, len = this.editJobs.length; i < len; i++) {
			var job = this.editJobs[i];
			var exp = job.expNode.parsedValue;
			if (exp > 0 || job.name === this.job) {
				skills[job.name] = exp;
			}
		}

		this.load({
			name: this.editNameNode.value,
			surname: this.editSurnameNode.value,
			age: this.editAgeNode.parsedValue,
			rank: this.editRankNode.parsedValue,
			exp: this.editExpNode.parsedValue,
			trait: this.editTraitNode.value,
			job: this.job,
			engineerSpeciality: this.engineerSpeciality,
			skills: skills,
			isLeader: this.isLeader,
			color: Number(this.editColorNode.value) || 0,
			variety: Number(this.editVarietyNode.value) || 0,
			rarity: Number(this.editRarityNode.value) || 0
		});

		if (this.isLeader) {
			this.village.renderGovernment();
		}
	},

	update: function () {
		if (this.domNode) {
			this.setLeaderNode.innerHTML = this.isLeader ? "&#9733;" : "&#9734;";
		}
	},

	updateEditJobSkills: function () {
		if (this.editBlock && !dojo.hasClass(this.editBlock, "hidden")) {
			for (var i = this.editJobs.length - 1; i >= 0; i--) {
				var editJob = this.editJobs[i];
				dojo.toggleClass(editJob.titleBlock, "bold", editJob.name === this.job);
				editJob.expNode.handler();
			}
		}
	},

	save: function (forEdit) {
		var isAnarchy = !forEdit && !this.reserve && this.game.challenges.isActive("anarchy");
		var saveKitten = this.game.filterMetaObj(this, ["name", "surname", "trait",
			"age", "color", "variety", "rarity", "skills", "exp", "job", "engineerSpeciality", "rank", "isLeader"]);

		saveKitten.trait = {name: saveKitten.trait.name}; //still in filter above to preserve order

		if (!saveKitten.name && !saveKitten.surname) {
			saveKitten.name = this.getRandomName();
			saveKitten.surname = this.getRandomSurname();
		}

		if (this.reserve || !this.village.getJob(saveKitten.job)) {
			saveKitten.job = null;
		}

		var newSkills = {};

		if (isAnarchy) {
			saveKitten.exp = 0;
			saveKitten.rank = 0;
			saveKitten.isLeader = false;

		} else {
			for (var job in saveKitten.skills) {
				var skill = saveKitten.skills[job];
				if (this.village.getJob(job) && (saveKitten.job === job || skill > 0)) {
					newSkills[job] = Math.min(Math.max(num(skill), 0), this.village.maxJobSkill);
				}
			}
		}

		// if (!forEdit && !this.reserve && this.game.challenges.isActive("atheism")) {
		// 	if (saveKitten.job === "priest") {
		// 		saveKitten.job = null;
		// 	}
		// 	delete newSkills["priest"];
		// }

		saveKitten.skills = newSkills;

		if (!forEdit) {
			if (this.reserve || (this.isLeader && this !== this.village.getLeader())) {
				saveKitten.isLeader = false;
			}

			if (this.game.opts.compressSaveFile) {
				saveKitten = this.compressData(saveKitten);
			} else {
				// don't serialize falsy values
				saveKitten.color = saveKitten.color || undefined;
				saveKitten.variety = saveKitten.variety || undefined;
				saveKitten.rarity = saveKitten.rarity || undefined;
				saveKitten.exp = saveKitten.exp || undefined;
				saveKitten.job = saveKitten.job || undefined;
				saveKitten.engineerSpeciality = saveKitten.engineerSpeciality || undefined;
				saveKitten.rank = saveKitten.rank || undefined;
				saveKitten.isLeader = saveKitten.isLeader || undefined;
				saveKitten.isAdopted = saveKitten.isAdopted || undefined;
			}
		}

		return saveKitten;
	},

	compressData: function (saveKitten) {
		var skills = [];
		var minSkill = Number.MAX_VALUE;
		var maxSkill = -minSkill;
		for (var i = 0; i < this.village.jobNames.length; ++i) {
			var skill = saveKitten.skills[this.village.jobNames[i]] || 0;
			skills[i] = skill;
			minSkill = Math.min(skill, minSkill);
			maxSkill = Math.max(skill, maxSkill);
		}
		if (minSkill == maxSkill) {
			skills = maxSkill;
		}

		var nameIndex = this.names.indexOf(this.name);
		var surnameIndex = this.surnames.indexOf(this.surname);
		// don't serialize falsy values
		var compressedSave = {
			ssn: this._mergeSSN(
				[
					nameIndex > -1 ? nameIndex : 0,
					surnameIndex > -1 ? surnameIndex : 0,
					this.age || this.getRandomAge(),
					this._getTraitIndex(this.trait.name),
					this.color,
					this.variety,
					this.rarity
				],
				this.statics.SAVE_PACKET_OFFSET
			),
			skills: skills || undefined,
			exp: this.exp || undefined,
			job: this.job ? this.village.jobNames.indexOf(this.job) : undefined,
			engineerSpeciality: this.engineerSpeciality || undefined,
			rank: this.rank || undefined,
			isLeader: this.isLeader || undefined,
			isAdopted: this.isAdopted || undefined
		};
		// Custom sur/names
		if (nameIndex <= 0 || surnameIndex <= 0) {
			compressedSave.name = this.name;
			compressedSave.surname = this.surname;
		}
		return compressedSave;
	},

	/**
	 * As the max possible integer in JS is 2^53 ~= 90.07*100^7, with a packet offset of 100 only 7 numbers in 0..99 can be compressed, and the 8th number is limited to 0..89
	 */
	_mergeSSN: function (values) {
		var result = 0;
		for (var i = values.length - 1; i >= 0; i--) {
			result *= this.statics.SAVE_PACKET_OFFSET;
			result += values[i];
		}
		return result;
	},

	_getTraitIndex: function (name) {
		for (var i = this.traits.length - 1; i >= 0; i--) {
			if (this.traits[i].name === name) {
				return i;
			}
		}
	},

	load: function (data) {
		if (this.editBlock) {
			dojo.addClass(this.editBlock, "hidden");
		}

		if (typeof data.ssn !== "undefined") {
			data = this.decompressData(data);
		}

		var wasLeader = this.isLeader;

		this.name               = typeof data.name === "string" ? data.name : this.getRandomName();
		this.surname            = typeof data.surname === "string" ? data.surname : this.getRandomSurname();
		this.age                = Math.max(Math.floor(num(data.age)), 0);
		this.exp                = Math.max(num(data.exp), 0);
		this.trait              = data.trait;
		this.job                = this.village.getJob(data.job) ? data.job : undefined;
		this.engineerSpeciality = null;
		this.rank               = Math.max(Math.floor(num(data.rank)), 0);
		this.isLeader           = Boolean(data.isLeader);
		this.color              = data.color || 0;
		this.variety            = data.variety || 0;
		this.rarity             = data.rarity || 0;
		this.isAdopted          = data.isAdopted || false;

		if (data.engineerSpeciality && this.job === "engineer" && this.game.workshop.getCraft(data.engineerSpeciality)) {
			this.engineerSpeciality = data.engineerSpeciality;
		}

		if (this.trait) {
			var trait = this.trait.name ? this.trait.name : this.trait;
			this.trait = this.traitsByName[trait];
		}
		if (!this.trait) {
			this.trait = this.traitsByName.none;
		}

		var newSkills = {};
		if (data.skills) {
			var skills = data.skills;
			for (var job in skills) {
				var skill = Math.max(num(skills[job]), 0);
				if (this.village.getJob(job) && (skill > 0 || this.job === job)) {
					newSkills[job] = skill;
				}
			}
		}
		this.skills = newSkills;

		if (this.isLeader) {
			this.makeLeader(true);
		} else if (wasLeader) {
			this.fireLeader(true);
		}

		this.renderInfo();
		this.update();
	},

	decompressData: function (data) {
		var ssn = this._splitSSN(data.ssn, 7);
		data.name = data.name || this.names[ssn[0]];
		data.surname = data.surname || this.surnames[ssn[1]];
		data.age = ssn[2];
		data.trait = this.traits[ssn[3]];
		data.color = ssn[4];
		data.variety = ssn[5];
		data.rarity = ssn[6];

		var uncompressedSkills = {};
		var dataSkills = data.skills || 0;
		var sameSkill = typeof(dataSkills) == "number";
		for (var i = this.village.jobNames.length - 1; i >= 0; --i) {
			var skill = sameSkill ? dataSkills : (dataSkills[i] || 0);
			if (skill > 20001) {
				skill = 20001;
			}
			uncompressedSkills[this.village.jobNames[i]] = skill;
		}
		data.skills = uncompressedSkills;
		data.job = data.job != undefined ? this.village.jobNames[data.job] : null;
		return data;
	},

	_splitSSN: function (mergedResult, numberOfValues) {
		var values = [];
		for (var i = 0; i < numberOfValues; i++) {
			var value = mergedResult % this.statics.SAVE_PACKET_OFFSET;
			mergedResult -= value;
			mergedResult /= this.statics.SAVE_PACKET_OFFSET;
			values.push(value);
		}
		return values;
	}
});


dojo.declare("classes.KGSaveEdit.VillageMap", classes.KGSaveEdit.MetaManager, {
	villageData: null,

	effects: null,

	biomesData: [
		{
			name: "village",
			title: "Village",
			desc: "Improves exploration rate of all biomes",
			unlocked: true,
			terrainPenalty: 1.0,
			faunaPenalty: 0
		}, {
			name: "plains",
			title: "Plains",
			desc: "Improves catnip generation by 1% per level",
			unlocked: true,
			terrainPenalty: 1.0,
			unlocks: {biomes: ["hills"]}
		}, {
			name: "hills",
			title: "Hills",
			desc: "TBD",
			// unlocks: {biomes: ["mountain"]},
			terrainPenalty: 1.2,
			requires: function (game) {
				return game.village.getBiome("plains").level >= 5 || game.village.getBiome("forest").level >= 5;
			},
			lore: {
				5: "You can see small lizards enjoying the sun"
			}
		}, {
			name: "forest",
			title: "Forest",
			desc: "Improves your wood production by 1% per level",
			lore: {
				5: "It smells really nice",
				10: "The forest is rumored to be endless and covering half of the planet",
				15: "There is something in the forest and no one knows what it is. Not many are sure if it really exists. If it does, it is somewhere deep below, days of travel, years, centuries maybe."
			},
			unlocked: true,
			// unlocks: {biomes: ["boneForest"]},
			terrainPenalty: 1.2,
			faunaPenalty: 1.5
		}, {
			name: "boneForest",
			title: "Bone Forest",
			lore: {
				5: "A place where trees are made of bones"
			},
			terrainPenalty: 1.9,
			requires: function (game) {
				return game.village.getBiome("forest").level >= 25 && game.village.getBiome("rainForest").level >= 5;
			}
		}, {
			name: "rainForest",
			title: "Rain Forest",
			description: "TBD",
			terrainPenalty: 1.4,
			5: "The trees are so tall you don't see where it ends. When the rains start they can go for hundreds of years.",
			10: "In the fog you can see the mountains. The mountains have eyes and sometime change places."
		}, {
			name: "mountain",
			title: "Mountain",
			description: "Improves mineral generation by 1% per level",
			lore: {
				5: "Remember to grab your mandatory 50 meters of rope. The ascend will take quite some time.",
				10: "A small and larger structures cut from a limestone are towering there. Griffins call this place The White Citadel.",
				15: "Everything is so pale and white we don’t know what exactly is it made of. There are some red marking and drawings everywhere",
				20: "Why is this place called a citadel? You can see some system there. This place is a structure on its own, a ziggurat made of ziggurats."
			},
			terrainPenalty: 1.2,
			// unlocks: {biomes: ["volcano"]},
			requires: function (game) {
				return game.village.getBiome("hills").level >= 10;
			}
		}, {
			name: "volcano",
			title: "Volcano",
			description: "TBD",
			lore: {
				5: "TBD"
			},
			terrainPenalty: 3.5,
			requires: function (game) {
				return game.village.getBiome("mountain").level >= 25;
			}
		}, {
			name: "desert",
			title: "Desert",
			description: "TBD",
			lore: {
				5: "An endless white desert with occasional red rock formations"
			},
			terrainPenalty: 1.5,
			requires: function (game) {
				return game.village.getBiome("plains").level >= 15;
			}
		}, {
			name: "bloodDesert",
			title: "Crimson Desert",
			description: "",
			lore: {
				5: "There are tales of horrible monsters and lost cities and endless deserts of red sand",
				10: "You can travel further. But you don’t really want to see what’s there in the desert.",
				15: "Once there was an ocean of blood. No one knows why, maybe a frozen shard of Redmoon felt there millenia ago."
			},
			terrainPenalty: 1.5
		}, {
			name: "swamp",
			title: "Swamp",
			description: "Everything that is edible is poisonous and so are the trees and the grass and the air is also poisonous slightly",
			lore: {
				5: "Everything here tries to kill you",
				10: "All plants here are poisonous and so are the trees and the water and the air is also poisonous slightly",
				15: "All you can see are the endless swamplands with lost ziggurats and rotten watchtowers"
			},
			terrainPenalty: 1.95
		}
	],

	biomes: null,
	biomesByName: null,

	currentBiome: null,
	exploredLevel: 0,
	explorersLevel: 0,
	hqLevel: 0,
	energy: 70,

	villageLevel: 0, //keep for mints!

	constructor: function () {
		this.effects = {
			"mapPriceReduction": 0,
			"exploreRatio":      0
		};
		this.registerMetaItems(this.biomesData, classes.KGSaveEdit.GenericItem, "biomes", function (biome) {
			biome.unlocked = Boolean(biome.unlocked);
			biome.defaultUnlocked = biome.unlocked;
			biome.level = 0;
			biome.cp = 0;
		});
		this.resetMap();
	},

	resetMap: function () {
		this.init();
	},

	init: function () { },

	render: function () {
		var self = this;
		var game = self.game;

		var panel = game._createPanel(game.village.tabBlockNode, {
			id: "mapPanel",
			class: "bottom-margin"
		}, "Map", true, !game.getFeatureFlag("VILLAGE_MAP"));

		var table = dojo.create("table", {
			id: "mapBlock",
			class: "bottom-margin"
		}, panel.content);

		var tr = dojo.create("tr", {innerHTML: "<td>Explorers level</td><td></td>"}, table);

		game._createInput({class: "integerInput"}, tr.children[1], self, "explorersLevel");

		var btn = new classes.KGSaveEdit.MapButton(game, {
			name: $I("village.btn.upgradeExplorers"),
			description: $I("village.btn.upgradeExplorers.desc"),
			prices: [{name: "manpower", val: 100}],
			dataProp: "explorersLevel"
		});
		btn.registerTooltip(tr);

		tr = dojo.create("tr", {innerHTML: "<td>HQ level</td><td></td>"}, table);

		game._createInput({class: "integerInput"}, tr.children[1], self, "hqLevel");

		btn = new classes.KGSaveEdit.MapButton(game, {
			name: $I("village.btn.upgradeHQ"),
			description: $I("village.btn.upgradeHQ.desc"),
			prices: [{name: "catnip", val: 1000}],
			dataProp: "hqLevel"
		});
		btn.registerTooltip(tr);

		tr = dojo.create("tr", {innerHTML: "<td>Supplies</td><td> days</td>"}, table);

		game._createInput(null, tr.children[1], self, "energy", "first");

		tr = dojo.create("tr", {innerHTML: "<td>Current biome</td><td></td>"}, table);

		self.currentBiomeNode = dojo.create("select", {
			innerHTML: '<option class="currentBiomeChoice" value="">---</option>'
		}, tr.children[1]);

		on(self.currentBiomeNode, "change", function () {
			self.currentBiome = this.value || null;
			game.update();
		});

		self.biomesBlock = dojo.create("table", {id: "biomesBlock"}, panel.content);

		for (var i = 0; i < self.biomes.length; i++) {
			var biome = self.biomes[i];
			var title = biome.title || biome.name;
			biome.domNode = dojo.create("tr", {
				class: "biomeRow",
				innerHTML: '<td class="name">' + title + '</td><td></td><td> &nbsp;Level </td><td> &nbsp;Progress </td>'
			}, self.biomesBlock);
			biome.nameNode = biome.domNode.children[0];

			game._createCheckbox($I("KGSaveEdit.label.unlocked"), biome.domNode.children[1], biome, "unlocked");

			game._createInput({class: "integerInput"}, biome.domNode.children[2], biome, "level");

			game._createInput({class: "abbrInput"}, biome.domNode.children[3], biome, "cp");
			biome.cpDisplayNode = dojo.create("span", null, biome.domNode.children[3]);

			dojo.create("option", {
				class: "currentBiomeChoice",
				value: biome.name,
				innerHTML: title
			}, self.currentBiomeNode);
		}

		game.setSelectByValue(self.currentBiomeNode, self.currentBiome || "");
	},

	getPriceReduction: function () {
		return Math.sqrt(this.exploredLevel - 1) * 0.00002;
	},

	getEffect: function (effectName) {
		return num(this.effects[effectName]);
	},

	toLevel: function (biome) {
		return 100 * (1 + 1.1 * Math.pow(biome.level + 1, 1.18 + 0.1 * biome.terrainPenalty));
	},

	update: function () {
		this.effects["mapPriceReduction"] = -this.getPriceReduction();
		this.effects["exploreRatio"] = (0.1 * (this.game.village.getBiome("village").level - 1));

		for (var i = 0; i < this.biomes.length; i++) {
			var biome = this.biomes[i];

			var req = this.game.checkRequirements(biome, biome.defaultUnlocked);
			biome.unlocked = req || biome.unlockedNode.prevChecked;
			biome.unlockedNode.checked = biome.unlocked;
			this.game.toggleDisabled(biome.unlockedNode, req);

			dojo.toggleClass(biome.nameNode, "spoiler", !biome.unlocked);

			biome.cpDisplayNode.textContent = " [" + (biome.cp / this.toLevel(biome) * 100).toFixed(2) + "%]";
		}
	},

	save: function () {
		return {
			hqLevel: this.hqLevel,
			energy: this.energy,
			explorersLevel: this.explorersLevel
		};
	},

	load: function (data) {
		this.set("hqLevel", data.hqLevel || 0);
		this.set("energy", data.energy || 100);
		this.set("explorersLevel", data.explorersLevel || 0);
	}
});

//hackity hack
dojo.declare("classes.KGSaveEdit.MapButton", classes.KGSaveEdit.MetaItem, {
	getPrices: function () {
		var prices = dojo.clone(this.prices);
		for (var i = 0; i < prices.length; i++) {
			prices[i].val *= Math.pow(1.25, this.game.village.map[this.dataProp]);
		}
		return prices;
	}
});

});

/* global dojo, require, classes, $I, num */

require(["dojo/on", "dojo/mouse"], function (on, mouse) {
"use strict";

dojo.declare("classes.KGSaveEdit.AchievementsManager", [classes.KGSaveEdit.UI.Tab, classes.KGSaveEdit.Manager], {
	achievementsData: [
		{
			name: "theElderLegacy",
			condition: function () {
				var date = new Date();
				return (date.getMonth() == 0 && date.getFullYear() == 2017);
			},
			hidden: true
		}, {
			name: "unicornConspiracy",
			condition: function () {
				return this.game.resPool.get("unicorns").owned();
			}
		}, {
			name: "uniception",
			condition: function () {
				return this.game.resPool.get("tears").owned();
			}
		}, {
			name: "sinsOfEmpire",
			condition: function () {
				return this.game.resPool.get("alicorn").owned();
			}
		}, {
			name: "anachronox",
			condition: function () {
				return this.game.resPool.get("timeCrystal").owned();
			}
		}, {
			name: "deadSpace",
			condition: function () {
				return this.game.resPool.get("necrocorn").owned();
			}
		}, {
			name: "ironWill",
			condition: function () {
				return this.game.ironWill && !this.game.resPool.get("kittens").owned() && this.game.bld.get("mine").owned();
			}
		}, {
			name: "uberkatzhen",
			condition: function () {
				return this.game.ironWill && !this.game.resPool.get("kittens").owned() && this.game.bld.get("warehouse").owned();
			}
		}, {
			name: "hundredYearsSolitude",
			condition: function () {
				return this.game.ironWill && !this.game.resPool.get("kittens").owned() && this.game.bld.get("steamworks").owned();
			}
		}, {
			name: "soilUptuned",
			condition: function () {
				return this.game.ironWill && !this.game.resPool.get("kittens").owned() && this.game.bld.get("pasture").val >= 45;
			}
		}, {
			name: "atlasUnmeowed",
			condition: function () {
				return this.game.ironWill && !this.game.resPool.get("kittens").owned() && this.game.bld.get("magneto").owned();
			}
		}, {
			name: "meowMeowRevolution",
			condition: function () {
				return this.game.ironWill && !this.game.resPool.get("kittens").owned() && this.game.bld.get("factory").owned();
			}
		}, {
			name: "spaceOddity",
			condition: function () {
				return this.game.ironWill && this.game.space.getProgram("moonMission").owned();
			},
			hasStar: true,
			starCondition: function () {
				return this.game.ironWill && this.game.space.getProgram("moonMission").owned() && this.game.resPool.get("paragon").value < 10;
			}
		}, {
			name: "jupiterAscending",
			condition: function () {
				return this.game.space.getProgram("orbitalLaunch").owned() && this.game.calendar.year <= 1;
			},
			hasStar: true,
			starCondition: function () {
				return Boolean(this.game.startedWithoutChronospheres) &&
					this.game.space.getProgram("orbitalLaunch").owned() &&
					this.game.calendar.year <= 1;
			}
		}, {
			name: "shadowOfTheColossus",
			condition: function () {
				return this.game.bld.get("ziggurat").owned() && this.game.village.maxKittens === 1;
			}
		}, {
			name: "sunGod",
			condition: function () {
				return this.game.religion.faith >= 696342;
			}
		}, {
			name: "heartOfDarkness",
			condition: function () {
				return this.game.resPool.get("zebras").value > 1;
			}
		}, {
			name: "winterIsComing",
			unethical: true,
			condition: function () {
				return this.game.deadKittens >= 10;
			}
		}, {
			name: "youMonster",
			unethical: true,
			condition: function () {
				return this.game.deadKittens >= 100;
			},
			hasStar: true,
			starDescription: "", // sigh
			starCondition: function () {
				return this.game.deadKittens >= 666666;
			}
		}, {
			name: "superUnethicalClimax",
			unethical: true,
			condition: function () {
				return this.game.cheatMode;
			}
		}, {
			name: "systemShock",
			unethical: true,
			condition: function () {
				return this.game.systemShockMode;
			}
		}, {
			name: "lotusMachine",
			condition: function () {
				return this.game.resPool.get("karma").owned();
			}
		}, {
			name: "serenity",
			condition: function () {
				return this.game.resPool.get("kittens").value >= 50 && this.game.deadKittens === 0;
			},
			hasStar: true,
			starCondition: function () {
				return this.game.resPool.get("kittens").value >= 1000 && this.game.deadKittens === 0;
			}
		}, {
			name: "utopiaProject",
			condition: function () {
				return this.game.village.happiness >= 1.5 && this.game.resPool.get("kittens").value > 35;
			},
			hasStar: true,
			starCondition: function () {
				return this.game.village.happiness >= 5 && this.game.resPool.get("kittens").value > 35;
			}
		}, {
			name: "deathStranding",
			condition: function () {
				return this.game.space.getPlanet("furthestRing").reached;
			}
		}, {
			name: "cathammer",
			condition: function () {
				return this.game.stats.getStat("totalYears").val >= 40000;
			},
			hasStar: true,
			starCondition: function () {
				return this.game.calendar.trueYear() >= 40000;
			}
		}, {
			//---------------- added in Kittens Game 1.4.9.x - 1.5.0.x ----------------
			name: "sadnessAbyss",
			condition: function () {
				return this.game.resPool.get("sorrow").value >= 100;
			}
		}, {
			name: "veryLargeArray",
			condition: function () {
				return this.game.bld.get("observatory").on >= 100 &&
					!this.game.workshop.get("seti").researched;
			}
		}, {
			name: "eternalBacchanalia",
			condition: function () {
				return this.game.calendar.festivalDays >=
					100 * this.game.calendar.daysPerSeason * this.game.calendar.seasonsPerYear;
			},
			hasStar: true,
			starCondition: function () {
				//The game declares a starDescription but leaves its starCondition
				//commented out as a TODO, so there is nothing to detect yet.
				return false;
			}
		}, {
			//The game tests this with challenges.getCountUniqueCompletions(), which
			//the editor does not implement, so the base achievement has no
			//auto-detection and is edited by hand.
			name: "challenger",
			hasStar: true,
			starCondition: function () {
				//Star is getCountCompletions() >= 100 - total completions across all
				//challenges, not distinct ones.
				var total = 0;
				for (var i = 0; i < this.game.challenges.challenges.length; i++) {
					total += num(this.game.challenges.challenges[i].on);
				}
				return total >= 100;
			}
		}, {
			//Was previously a badge; the game now grants the achievement to saves
			//that still carry the old badge, which is what this mirrors.
			name: "betterSafeThanSorry",
			condition: function () {
				var badge = this.game.achievements.getBadge("betterSafeThanSorry");
				return Boolean(badge && badge.unlocked);
			},
			hasStar: true,
			starCondition: function () {
				//Awarded manually in the game too; it only defines starCondition so
				//the star renders.
				return false;
			}
		}
	],

	badgesData: [
		{
			name: "lotus",
			title: "Lotus Eater",
			description: "Have more than 50 total resets",
			difficulty: "A",
			condition: function () {
				return this.game.stats.getStat("totalResets").val >= 50;
			}
		}, {
			name: "ivoryTower",
			title: "Ivory Tower",
			description: "Have a reset in a IW atheism",
			difficulty: "S+"
		}, {
			name: "useless",
			title: "Effective Management",
			description: "Have a useless leader",
			difficulty: "F",
			condition: function () {
				var leader = this.game.village.getLeader();
				return leader && leader.trait.name === "none";
			}
		}, {
			name: "beta",
			title: "Beta Decay",
			description: "Participate in a beta test",
			difficulty: "B",
			condition: function () {
				if (window && window.location && window.location.href) {
					return window.location.href.indexOf("beta") >= 0;
				}
				return false;
			}
		}, {
			name: "silentHill",
			title: "Silent Hills",
			description: "Have not MOTD content",
			difficulty: "S",
			condition: function () {
				return (this.game.server.motdContent == "");
			}
		}, {
			name: "evergreen",
			title: "Wood badge",
			description: "Craft a wood I think?",
			difficulty: "F"
		}, {
			name: "deadSpace",
			title: "Dead Space",
			description: "Have kittens wander in the void",
			difficulty: "S",
			condition: function () {
				var kittens = this.game.resPool.get("kittens");
				return (kittens.value >= 1000 && kittens.maxValue === 0);
			}
		}, {
			name: "reginaNoctis",
			title: "Regina Noctis",
			description: "Have 500 kittens and no alicorns",
			difficulty: "S",
			condition: function () {
				return (this.game.resPool.get("kittens").value > 500 && this.game.resPool.get("alicorn").value === 0);
			}
		}, {
			name: "ghostInTheMachine",
			title: "Experience a game bug (TBD see newrelic#errorHandle)",
			description: "♋︎⬧︎⧫︎♏︎❒︎🕯︎⬧︎ ●︎♋︎■︎♑︎◆︎♋︎♑︎♏︎ 🖳︎✆",
			difficulty: "S"
		}, {
			name: "abOwo",
			title: "Ab Owo",
			description: "Reset in atheism on day 0",
			difficulty: "A"
		}, {
			name: "cleanPaws",
			title: "Clean Paws",
			description: "Peaceful trading without cat-power",
			difficulty: "C"
		}, {
			//---------------- added in Kittens Game 1.4.9.x - 1.5.0.x ----------------
			//Badges whose auto-detection needs game APIs the editor does not
			//implement are listed without a condition; they remain fully editable.
			name: "sequenceBreak",
			title: "Sequence Break",
			description: "Skip Moon in the space tab",
			difficulty: "D",
			condition: function () {
				return !this.game.space.getPlanet("moon").reached &&
					this.game.space.getPlanet("dune").reached;
			}
		}, {
			name: "fantasticFurColor",
			title: "Fantastic Fur Color",
			description: "Have a leader with a rare fur colour",
			difficulty: "F",
			condition: function () {
				var leader = this.game.village.leader;
				return Boolean(leader && leader.color);
			}
		}, {
			name: "whatYearIsIt",
			title: "What Year is it Again?",
			description: "Forcefully resolve a Temporal Paradox. May have unknown side effects.",
			difficulty: "C"
		}, {
			name: "tardis",
			title: "Time Advancing Relative Dimensions In Space",
			description: "Prioritize time travel over space travel.",
			difficulty: "C"
		}, {
			name: "wheredThisComeFrom",
			title: "Where'd This Come From?",
			description: "Chronoreset to gain resources.",
			difficulty: "S"
		}, {
			name: "lostDates",
			title: "Lost Dates",
			description: "Accumulate 5 years of timeslip.",
			difficulty: "B",
			condition: function () {
				return this.game.time.flux <= -5;
			}
		}, {
			name: "buffet",
			title: "A Whale of a Buffet",
			description: "Reach 1000 Leviathan energy.",
			difficulty: "A",
			condition: function () {
				var race = this.game.diplomacy.get("leviathans");
				return Boolean(race) && race.energy >= 1000;
			}
		}, {
			//Needs village.getOverpopulation() and cached space effects, neither of
			//which the editor models, so there is no auto-detection.
			name: "newHome",
			title: "A New Home",
			description: "Have more housing on Yarn than on Cath.",
			difficulty: "D"
		}, {
			name: "betterSafeThanSorry",
			title: "Better Safe Than Sorry (old)",
			description: "Get Carbon Sequestration with no pollution.",
			difficulty: "E"
		}, {
			name: "soLongAndThanksForAllTheHay",
			title: "So Long, and Thanks for All the Hay",
			description: "Have exactly 42 alicorns.",
			difficulty: "S",
			condition: function () {
				var epsilon = 1e-12;
				return Math.abs(this.game.resPool.get("alicorn").value - 42) < epsilon;
			}
		}
	],

	tabName: "Achievements",

	achievements: null,
	achievementsByName: null,

	badgesUnlocked: false,

	constructor: function () {
		this.i18nKeys = {tabName: "tab.name.achievements"};
		this.registerMetaItems(this.achievementsData, classes.KGSaveEdit.AchievementMeta, "achievements", function (ach) {
			ach.starUnlocked = Boolean(ach.starUnlocked);

			ach.i18nKeys = {
				title: "achievements." + ach.name + ".title",
				description: "achievements." + ach.name + ".desc"
			};
			if (ach.hasStar && !Object.prototype.hasOwnProperty.call(ach, "starDescription")) {
				ach.i18nKeys.starDescription = "achievements." + ach.name + ".starDesc";
			}
		});

		this.registerMetaItems(this.badgesData, classes.KGSaveEdit.AchievementMeta, "badges");
	},

	get: function (name) {
		var achievement = this.achievementsByName[name];
		if (name && !achievement) {
			console.error("Achievement not found", name);
		}
		return achievement;
	},

	getBadge: function (name) {
		var badge = this.badgesByName[name];
		if (name && !badge) {
			console.error("Badge not found", name);
		}
		return badge;
	},

	renderTabBlock: function () {
		dojo.create("div", {
			id: "achievementsHeader",
			class: "bottom-margin",
			innerHTML: $I("achievements.panel.label")
		}, this.tabBlockNode);
		this.achievementsProgress = dojo.create("div", {
			id: "achievementsProgress",
			class: "bottom-margin"
		}, this.tabBlockNode);

		this.achievementsBlock = dojo.create("table", {
			id: "achievementsBlock",
			class: "bottom-margin"
		}, this.tabBlockNode);

		dojo.create("div", {
			id: "badgesHeader",
			class: "bottom-margin",
			innerHTML: $I("badges.panel.label")
		}, this.tabBlockNode);
		this.badgesProgress = dojo.create("div", {
			id: "badgesProgress",
			class: "bottom-margin"
		}, this.tabBlockNode);

		this.badgesBlock = dojo.create("table", {id: "badgesBlock"}, this.tabBlockNode);
	},

	render: function () {
		this.game.callMethods(this.achievements, "render", this.achievementsBlock, "achievement");
		this.game.callMethods(this.badges, "render", this.badgesBlock, "badge");
	},

	hasUnlocked: function () {
		for (var i = this.achievements.length - 1; i >= 0; i--) {
			if (this.achievements[i].unlocked) {
				return true;
			}
		}
		return false;
	},

	getVisible: function () {
		return this.hasUnlocked();
	},

	update: function () {
		var hasNewMarker = false;

		var completedAchievements = 0;
		var totalAchievements = 0;
		var completedStars = 0;
		var uncompletedStars = 0;

		for (var i = this.achievements.length - 1; i >= 0; i--) {
			var ach = this.achievements[i];
			ach.update();

			if (ach.hidden) {
				continue;
			}

			if (!ach.unethical) {
				totalAchievements++;
				if (ach.unlocked) {
					completedAchievements++;
				}
			}
			if (ach.hasStar) {
				if (ach.starUnlocked) {
					completedStars++;
				} else {
					uncompletedStars++;
				}
			}
			hasNewMarker = hasNewMarker || ach.isNewStar || ach.isNew;
		}

		var stars = "";
		for (i = completedStars; i > 0; --i) {
			stars += "&#9733;";
		}
		for (i = uncompletedStars; i > 0; --i) {
			stars += "&#9734;";
		}

		this.achievementsProgress.innerHTML = $I("achievements.header", [completedAchievements, totalAchievements]) + stars;

		var badgesUnlocked = this.badgesUnlocked;
		var completedBadges = 0;
		var totalBadges = 0;

		for (i = this.badges.length - 1; i >= 0; i--) {
			var badge = this.badges[i];
			badge.update();
			totalBadges++;
			if (badge.unlocked) {
				badgesUnlocked = true;
				completedBadges++;
			}
			hasNewMarker = hasNewMarker || badge.isNew;
		}
		this.badgesUnlocked = badgesUnlocked;

		this.badgesProgress.innerHTML = $I("badges.header", [completedBadges, totalBadges]);
		// dojo.toggleClass(this.badgesProgress, "spoiler", !this.badgesUnlocked);

		this.game._toggleNewMarker(this.tabWrapper, hasNewMarker);
	},

	updateTabMarker: function () {
		var hasNewMarker = false;
		for (var i = this.achievements.length - 1; i >= 0; i--) {
			var ach = this.achievements[i];
			if (ach.isNewStar || ach.isNew) {
				hasNewMarker = true;
				break;
			}
		}

		if (!hasNewMarker) {
			for (i = this.hats.length - 1; i >= 0; i--) {
				if (this.hats[i].isNew) {
					hasNewMarker = true;
					break;
				}
			}
		}
		this.game._toggleNewMarker(this.tabWrapper, hasNewMarker);
	},

	save: function (saveData) {
		saveData.achievements = this.game.filterMetadata(this.achievements, ["name", "unlocked", "starUnlocked"]);
		saveData.ach = {
			badgesUnlocked: this.badgesUnlocked,
			badges: this.game.filterMetadata(this.badges, ["name", "unlocked"])
		};
	},

	load: function (saveData) {
		this.loadMetadata(saveData, "achievements", "get", function (ach, saveAch) {
			ach.set("unlocked", saveAch.unlocked);
			ach.isNew = false;
			if (ach.hasStar) {
				ach.isNewStar = false;
				ach.set("starUnlocked", saveAch.starUnlocked);
			}
		}, true);

		if (saveData.ach) {
			this.councilUnlocked = saveData.ach.councilUnlocked || false;
			this.loadMetadata(saveData, "ach.badges", "getBadge", function (badge, saveBadge) {
				badge.isNew = false;
				badge.set("unlocked", saveBadge.unlocked);
			});
		}
	}
});


dojo.declare("classes.KGSaveEdit.AchievementMeta", [classes.KGSaveEdit.GenericItem], {
	rendered: false,

	constructor: function () {
		this.unlocked = Boolean(this.unlocked);
		this.isNew = false;
	},

	render: function (parent, className) {
		this.seti18n();

		// TODO turn the title attributes into proper tooltips?

		this.domNode = dojo.create("tr", {
			class: className || "achievement",
			innerHTML: '<td title="' + this.description + '">' + (this.title || this.name) + "</td><td></td><td></td>"
		}, parent);
		this.nameNode = this.domNode.children[0];

		var input = this.game._createCheckbox($I("KGSaveEdit.achievements.earned"), this.domNode.children[1], this, "unlocked");
		this.unlockedLabel = input.label;
		on(input.label, mouse.enter, dojo.hitch(this, function () {
			if (this.isNew) {
				this.isNew = false;
				dojo.removeClass(this.unlockedLabel, "newMarker");
				this.metaObj.updateTabMarker();
			}
		}));

		if (this.hasStar) {
			input = this.game._createCheckbox((this.starUnlocked ? "&#9733;" : "&#9734;"),
				this.domNode.children[2], this, "starUnlocked");
			this.starUnlockedLabel = input.label;
			this.starText = input.text;
			if (this.starDescription) {
				input.label.title = this.starDescription;
			}
			on(input.label, mouse.enter, dojo.hitch(this, function () {
				if (this.isNewStar) {
					this.isNewStar = false;
					dojo.removeClass(this.starUnlockedLabel, "newMarker");
					this.metaObj.updateTabMarker();
				}
			}));
		}

		this.rendered = true;
	},

	update: function () {
		if (!this.rendered) {
			return;
		}

		var wasUnlocked = this.unlocked;
		if (this.condition) {
			var unlocked = this.condition();

			if (unlocked) {
				this.game.setCheckbox(this.unlockedNode, unlocked, true, true);

			} else if (this.unlocked !== this.unlockedNode.prevChecked) {
				this.game.setCheckbox(this.unlockedNode, this.unlockedNode.prevChecked, true, true);
			}
			this.game.toggleDisabled(this.unlockedNode, unlocked);

			if (wasUnlocked !== this.unlocked) {
				this.isNew = this.unlocked;
			}
			this.game._toggleNewMarker(this.unlockedLabel, this.isNew);

			dojo.toggleClass(this.domNode, "hidden", this.hidden && !this.unlocked);
		}

		if (this.hasStar) {
			var starWasUnlocked = this.starUnlocked;

			var starUnlocked = this.starCondition();
			if (starUnlocked) {
				this.game.setCheckbox(this.starUnlockedNode, starUnlocked, true, true);
			} else if (this.starUnlocked !== this.starUnlockedNode.prevChecked) {
				this.game.setCheckbox(this.starUnlockedNode, this.starUnlockedNode.prevChecked, true, true);
			}
			this.game.toggleDisabled(this.starUnlockedNode, starUnlocked);

			if (starWasUnlocked !== this.starUnlocked) {
				this.isNewStar = this.starUnlocked;
			}
			this.game._toggleNewMarker(this.starUnlockedLabel, this.isNewStar);

			this.starText.innerHTML = this.starUnlocked ? "&#9733;" : "&#9734;";
		}
	}
});


dojo.declare("classes.KGSaveEdit.StatsManager", [classes.KGSaveEdit.UI.Tab, classes.KGSaveEdit.Manager], {
	statsData: [
		{
			name: "totalKittens",
			title: "stats.kittens.total",
			val: 0,
			compareVal: function (game) {
				return game.resPool.get("kittens").value;
			},
			unlocked: true
		}, {
			name: "kittensDead",
			title: "stats.kittens.dead",
			val: 0,
			compareVal: function (game) {
				return game.deadKittens;
			},
			unlocked: true
		}, {
			name: "totalYears",
			title: "stats.years.total",
			val: 0,
			compareVal: function (game) {
				return game.calendar.year;
			},
			unlocked: true
		}, {
			name: "totalResets",
			title: "stats.run.number",
			val: 0,
			unlocked: true
		}, {
			name: "totalParagon",
			title: "stats.paragon.total",
			val: 0,
			compareVal: function (game) {
				return game.resPool.get("paragon").value + game.resPool.get("burnedParagon").value;
			}
		}, {
			name: "eventsObserved",
			title: "stats.events.total",
			val: 0
		}, {
			name: "unicornsSacrificed",
			title: "stats.unicorns",
			val: 0,
			inputClass: "integerInput abbrInput"
		}, {
			name: "buildingsConstructed",
			title: "stats.buildings",
			val: 0
		}, {
			name: "totalClicks",
			title: "stats.clicks.total",
			val: 0
		}, {
			name: "totalTrades",
			title: "stats.trades.total",
			val: 0
		}, {
			name: "totalCrafts",
			title: "stats.crafts.total",
			val: 0
		}, {
			name: "averageKittens",
			title: "stats.kittens.avg",
			val: 0,
			calculate: function (game) {
				var years = game.stats.getStat("totalYears").val;
				var kittens = game.stats.getStat("totalKittens").val;
				return years != 0 ? kittens / Math.ceil(years / 100) : 0;
			}
		}, {
			//Added in Kittens Game 1.5.x. Both were listed as unhandled save data
			//by the Extras tab until now.
			name: "transcendenceTier",
			title: "stats.transcendenceTier",
			val: 0,
			calculate: function (game) {
				return game.religion.transcendenceTier;
			}
		}, {
			name: "totalChallengesCompleted",
			title: "stats.challenges.total",
			val: 0,
			calculate: function (game) {
				//Mirrors challenges.getCountCompletions(): every completion counts,
				//not merely every distinct challenge completed.
				var total = 0;
				for (var i = 0; i < game.challenges.challenges.length; i++) {
					total += num(game.challenges.challenges[i].on);
				}
				return total;
			}
		}
	],

	statsCurrentData: [
		{
			name: "totalTrades",
			title: "stats.trades.current",
			val: 0
		}, {
			name: "totalCrafts",
			title: "stats.crafts.current",
			val: 0
		}, {
			name: "averageKittens",
			title: "stats.kittens.current",
			val: 0,
			calculate: function (game) {
				var years = game.calendar.year;
				var kittens = game.resPool.get("kittens").value;
				return years != 0 ? kittens / Math.ceil(years / 100) : 0;
			}
		}, {
			name: "timePlayed",
			title: "stats.time.current",
			val: "",
			calculate: function (game) {
				return game.toDisplaySeconds(game.calendar.trueYear() * game.calendar.seasonsPerYear * game.calendar.daysPerSeason * game.calendar.ticksPerDay / game.ticksPerSecond);
			}
		}
	],

	tabName: "Stats",
	getVisible: function () {
		return this.game.karmaKittens > 0 || this.game.science.get("math").owned();
	},

	stats: null,
	statsByName: null,
	allStats: null,

	statsCurrent: null,
	statsCurrentByName: null,

	constructor: function () {
		this.i18nKeys = {tabName: "tab.name.stats"};
		this.allStats = [];

		var statHandler = function (stat) {
			this.allStats.push(stat);
		};

		this.registerMetaItems(this.statsData, classes.KGSaveEdit.StatsMeta, "stats", statHandler);
		this.registerMetaItems(this.statsCurrentData, classes.KGSaveEdit.StatsMeta, "statsCurrent", statHandler);
	},

	renderTabBlock: function () {
		dojo.create("div", {innerHTML: $I("stats.group.all")}, this.tabBlockNode);
		this.statsBlock = dojo.create("table", {
			id: "statsBlock",
			class: "bottom-margin"
		}, this.tabBlockNode);

		dojo.create("div", {innerHTML: $I("stats.group.current")}, this.tabBlockNode);
		this.statsCurrentBlock = dojo.create("table", {id: "statsCurrentBlock"}, this.tabBlockNode);
	},

	render: function () {
		this.game.callMethods(this.stats, "render", this.statsBlock);
		this.game.callMethods(this.statsCurrent, "render", this.statsCurrentBlock);
	},

	getStat: function (name) {
		return this.statsByName[name];
	},

	getStatCurrent: function (name) {
		return this.statsCurrentByName[name];
	},

	update: function () {
		this.game.callMethods(this.allStats, "update");
	},

	save: function (saveData) {
		saveData.stats = this.game.filterMetadata(this.stats, ["name", "val"]);
		saveData.statsCurrent = this.game.filterMetadata(this.statsCurrent, ["name", "val"]);
	},

	load: function (saveData) {
		this.loadMetadata(saveData, "stats", "getStat", function (stat, saveStat) {
			stat.set("val", num(saveStat.val));
		}, true);
		this.loadMetadata(saveData, "statsCurrent", "getStatCurrent", function (stat, saveStat) {
			var saveVal = saveStat.val;
			if (typeof stat.val === "number") {
				saveVal = num(saveVal);
			}
			stat.set("val", saveVal);
		}, true);
	}
});


dojo.declare("classes.KGSaveEdit.StatsMeta", classes.KGSaveEdit.GenericItem, {
	constructor: function () {
		this.i18nKeys = {title: this.title};
	},

	render: function (parent) {
		this.seti18n();

		this.domNode = dojo.create("tr", {
			class: "statastic",
			innerHTML: "<td>" + this.title + "</td><td></td>"
		}, parent);

		if (this.calculate) {
			this.valText = dojo.create("span", {
				innerHTML: this.val
			}, this.domNode.children[1]);
		} else {
			this.game._createInput({
				class: this.inputClass || "integerInput"
			}, this.domNode.children[1], this, "val");
		}
	},

	update: function () {
		var val = this.val;

		if (this.compareVal && this.game.editorOptions.fixStats) {
			val = Math.max(val, this.compareVal(this.game)) || 0;
		}

		if (val !== this.val) {
			this.set("val", val, true, true);
		}

		if (this.calculate) {
			this.valText.innerHTML = this.val;
		}
	}
});

});

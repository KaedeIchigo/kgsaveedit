/* global dojo, require, classes, $I, num */

require([], function () {
"use strict";

dojo.declare("classes.KGSaveEdit.ReligionManager", [classes.KGSaveEdit.UI.Tab, classes.KGSaveEdit.Manager], {
	zigguratUpgradesData: [
		{
			name: "unicornTomb",
			prices: [
				{name: "ivory", val: 500},
				{name: "tears", val: 5}
			],
			priceRatio: 1.15,
			// unlocks: {"zigguratUpgrades": ["ivoryTower"]},
			unlocked: true,
			effects: {
				"unicornsRatioReligion": 0.05
			}
		}, {
			name: "ivoryTower",
			prices: [
				{name: "ivory", val: 25000},
				{name: "tears", val: 25}
			],
			priceRatio: 1.15,
			// unlocks: {"zigguratUpgrades": ["ivoryCitadel"]},
			requires: {zigguratUpgrades: ["unicornTomb"]},
			effects: {
				"unicornsRatioReligion": 0.1,
				"riftChance":            0.0005
			}
		}, {
			name: "ivoryCitadel",
			prices: [
				{name: "ivory", val: 50000},
				{name: "tears", val: 50}
			],
			priceRatio: 1.15,
			// unlocks: {"zigguratUpgrades": ["skyPalace"]},
			requires: {zigguratUpgrades: ["ivoryTower"]},
			effects: {
				"unicornsRatioReligion": 0.25,
				"ivoryMeteorChance":     0.0005
			}
		}, {
			name: "skyPalace",
			prices: [
				{name: "ivory",    val: 125000},
				{name: "tears",    val: 500},
				{name: "megalith", val: 5}
			],
			priceRatio: 1.15,
			// unlocks: {"zigguratUpgrades": ["unicornUtopia"]},
			requires: {zigguratUpgrades: ["ivoryCitadel"]},
			effects: {
				"goldMaxRatio":          0.01,
				"unicornsRatioReligion": 0.5,
				"alicornChance":         0.0001,
				"alicornPerTick":        0,
				"ivoryMeteorRatio":      0.05
			},
			calculateEffects: function (self, game) {
				var alicorns = 0;
				if (game.resPool.get("alicorn").value > 0) {
					alicorns = 0.00002;
				}
				self.effects["alicornPerTick"] = alicorns;
			}
		}, {
			name: "unicornUtopia",
			prices: [
				{name: "gold",  val: 500},
				{name: "ivory", val: 1000000},
				{name: "tears", val: 5000}
			],
			priceRatio: 1.15,
			// unlocks: {"zigguratUpgrades": ["sunspire"]},
			requires: {zigguratUpgrades: ["skyPalace"]},
			effects: {
				"unicornsRatioReligion": 2.5,
				"alicornChance":         0.00015,
				"alicornPerTick":        0,
				"tcRefineRatio":         0.05,
				"ivoryMeteorRatio":      0.15
			},
			calculateEffects: function (self, game) {
				var alicorns = 0;
				if (game.resPool.get("alicorn").value > 0) {
					alicorns = 0.000025;
				}
				self.effects["alicornPerTick"] = alicorns;
			}
		}, {
			name: "sunspire",
			prices: [
				{name: "ivory", val: 750000},
				{name: "gold",  val: 1250},
				{name: "tears", val: 25000}
			],
			priceRatio: 1.15,
			requires: {zigguratUpgrades: ["unicornUtopia"]},
			effects: {
				"unicornsRatioReligion": 5,
				"alicornChance":         0.0003,
				"alicornPerTick":        0,
				"tcRefineRatio":         0.1,
				"ivoryMeteorRatio":      0.5
			},
			calculateEffects: function (self, game) {
				var alicorns = 0;
				if (game.resPool.get("alicorn").value > 0) {
					alicorns = 0.00005;
				}
				self.effects["alicornPerTick"] = alicorns;
			}
		}, {
			name: "marker",
			prices: [
				{name: "unobtainium", val: 2500},
				{name: "spice",       val: 50000},
				{name: "tears",       val: 5000},
				{name: "megalith",    val: 750}
			],
			priceRatio: 1.15,
			requires: {perks: ["megalomania"]},
			effects: {
				"corruptionRatio": 0.000001
			},
			calculateEffects: function (self, game) {
				self.effects["corruptionRatio"] = 0.000001 * (1 + game.getLimitedDR(game.getEffect("corruptionBoostRatioChallenge"), 2));
			},
			getEffectiveValue: function (game) {
				return this.val * (1 + game.getLimitedDR(game.getEffect("corruptionBoostRatioChallenge"), 2));
			}
		}, {
			name: "unicornGraveyard",
			prices: [
				{name: "necrocorn", val: 5},
				{name: "megalith",  val: 1000}
			],
			priceRatio: 1.15,
			requires: {perks: ["blackCodex"]},
			upgrades: {buildings: ["ziggurat"]},
			effects: {
				"cultureMaxRatioBonus": 0.01,
				"blackLibraryBonus":    0.02
			}
		}, {
			name: "unicornNecropolis",
			prices: [
				{name: "alicorn",   val: 100},
				{name: "necrocorn", val: 15},
				{name: "void",      val: 5},
				{name: "megalith",  val: 2500}
			],
			priceRatio: 1.15,
			requires: {zigguratUpgrades: ["unicornGraveyard"]},
			effects: {
				"corruptionBoostRatio": 0.10
			}
		}, {
			name: "blackPyramid",
			prices: [
				{name: "unobtainium", val: 5000},
				{name: "spice",       val: 150000},
				{name: "sorrow",      val: 5},
				{name: "megalith",    val: 2500}
			],
			priceRatio: 1.15,
			requires: {perks: ["megalomania"]},
			effects: {
				"pyramidGlobalResourceRatio":   0,
				"pyramidRecoveryRatio":         0,
				"pyramidGlobalProductionRatio": 0,
				"pyramidFaithRatio":            0,
				"pyramidSpaceCompendiumRatio":  0,
				"pyramidPerYearRatio":          0,
				"craftRatio":                   0,
				"UniversalKnowHow":             0,
				"timeRatio":                    0,
				"deficitRecoveryRatio":         0,
				"blackLibraryBonus":            0
			},
			//Effects the pyramid re-exports as "pyramid<Name>" from "pact<Name>".
			simpleEffectNames: [
				"GlobalResourceRatio",
				"RecoveryRatio",
				"GlobalProductionRatio",
				"FaithRatio",
				"SpaceCompendiumRatio",
				"PerYearRatio"
			],
			//Effects re-exported under their own name, read from "pact<Name>".
			//These carry pactOfArcane and pactOfChronicler; without them those two
			//pacts contributed nothing at all.
			prefixEffectNames: [
				"craftRatio",
				"UniversalKnowHow",
				"timeRatio"
			],
			action: function (self, game) { //sigh
				self.effects = {
					"pyramidGlobalResourceRatio":   0,
					"pyramidRecoveryRatio":         0,
					"pyramidGlobalProductionRatio": 0,
					"pyramidFaithRatio":            0,
					"pyramidSpaceCompendiumRatio":  0,
					"pyramidPerYearRatio":          0,
					"craftRatio":                   0,
					"UniversalKnowHow":             0,
					"timeRatio":                    0,
					"deficitRecoveryRatio":         0,
					"blackLibraryBonus":            0
				};
				if (!game.getFeatureFlag("MAUSOLEUM_PACTS")) {
					return;
				}

				//The game uses (transcendenceTier - 24); this was -25, which cost one
				//multiple of every pact effect at any tier above 25.
				var transcendenceTierModifier = Math.max(game.religion.transcendenceTier - 24, 1);
				var deficitModifier = game.religion.getDebtPenaltyRatio();

				for (var i = 0; i < self.simpleEffectNames.length; i++) {
					self.effects["pyramid" + self.simpleEffectNames[i]] =
						game.getEffect("pact" + self.simpleEffectNames[i]) * transcendenceTierModifier * deficitModifier;
				}
				for (var j = 0; j < self.prefixEffectNames.length; j++) {
					self.effects[self.prefixEffectNames[j]] =
						game.getEffect("pact" + self.prefixEffectNames[j]) * transcendenceTierModifier * deficitModifier;
				}

				self.effects["deficitRecoveryRatio"] = game.getEffect("pactDeficitRecoveryRatio");
				var pactBlackLibraryBoost = game.getEffect("pactBlackLibraryBoost") * transcendenceTierModifier;
				if (pactBlackLibraryBoost) {
					var unicornGraveyard = game.religion.getZU("unicornGraveyard");
					self.effects["blackLibraryBonus"] = pactBlackLibraryBoost * unicornGraveyard.effects["blackLibraryBonus"] * (1 + unicornGraveyard.getOn()) * deficitModifier;
				}
			},
			getEffectiveValue: function (game) {
				return this.val + (game.challenges.getChallenge("blackSky").owned() ? 1 : 0);
			}
		}
	],

	religionUpgradesData: [
		{
			name: "solarchant",
			prices: [
				{name: "faith", val: 100}
			],
			priceRatio: 2.5,
			upgradable: true,
			faith: 150,
			effects: {
				"faithRatioReligion": 0.1
			}
		}, {
			name: "scholasticism",
			prices: [
				{name: "faith", val: 250}
			],
			priceRatio: 2.5,
			upgradable: true,
			faith: 300,
			upgrades: {buildings: ["temple"]}
		}, {
			name: "goldenSpire",
			prices: [
				{name: "gold",  val: 150},
				{name: "faith", val: 350}
			],
			priceRatio: 2.5,
			upgradable: true,
			faith: 500,
			upgrades: {buildings: ["temple"]}
		}, {
			name: "sunAltar",
			prices: [
				{name: "gold",  val: 250},
				{name: "faith", val: 500}
			],
			priceRatio: 2.5,
			upgradable: true,
			faith: 750,
			upgrades: {buildings: ["temple"]}
		}, {
			name: "stainedGlass",
			prices: [
				{name: "gold",  val: 250},
				{name: "faith", val: 500}
			],
			priceRatio: 2.5,
			upgradable: true,
			faith: 750,
			upgrades: {buildings: ["temple"]}
		}, {
			name: "solarRevolution",
			prices: [
				{name: "gold",  val: 500},
				{name: "faith", val: 750}
			],
			faith: 1000,
			effects: {
				"solarRevolutionRatio": 0
			},
			calculateEffects: function (self, game) {
				self.effects["solarRevolutionRatio"] = game.religion.getSolarRevolutionRatio();
			}
		}, {
			name: "basilica",
			prices: [
				{name: "gold",  val: 750},
				{name: "faith", val: 1250}
			],
			priceRatio: 2.5,
			upgradable: true,
			faith: 10000,
			upgrades: {buildings: ["temple"]}
		}, {
			name: "templars",
			prices: [
				{name: "gold",  val: 3000},
				{name: "faith", val: 3500}
			],
			priceRatio: 2.5,
			upgradable: true,
			faith: 75000,
			upgrades: {buildings: ["temple"]}
		}, {
			name: "apocripha",
			prices: [
				{name: "gold",  val: 5000},
				{name: "faith", val: 5000}
			],
			faith: 100000
		}, {
			name: "transcendence",
			prices: [
				{name: "gold",  val: 7500},
				{name: "faith", val: 7500}
			],
			// unlocks: {challenges: ["atheism"]},
			faith: 125000
		}, {
			//Added in Kittens Game 1.5.x. Stackable only once Transcendence is on.
			name: "frescoes",
			prices: [
				{name: "gold",  val: 5000},
				{name: "faith", val: 4000},
				{name: "spice", val: 8000}
			],
			faith: 200000,
			priceRatio: 2.5,
			upgrades: {buildings: ["chapel"]}
		}
	],

	transcendenceUpgradesData: [
		{
			name: "blackObelisk",
			prices: [
				{name: "relic", val: 100}
			],
			tier: 1,
			priceRatio: 1.15,
			effects: {
				"solarRevolutionLimit": 0.05
			},
			calculateEffects: function (self, game) {
				self.effects["solarRevolutionLimit"] = 0.05 * game.religion.transcendenceTier;
			},
			flavor: true
		}, {
			name: "blackNexus",
			prices: [
				{name: "relic", val: 5000}
			],
			tier: 3,
			priceRatio: 1.15,
			effects: {
				"relicRefineRatio": 1.0
			},
			flavor: true
		}, {
			name: "blackCore",
			prices: [
				{name: "relic", val: 10000}
			],
			tier: 5,
			priceRatio: 1.15,
			effects: {
				"blsLimit": 1
			},
			flavor: true
		}, {
			name: "singularity",
			prices: [
				{name: "relic", val: 25000}
			],
			tier: 7,
			priceRatio: 1.15,
			effects: {
				"globalResourceRatio": 0.10
			},
			flavor: true
		}, {
			name: "blackLibrary",
			prices: [
				{name: "relic", val: 30000}
			],
			tier: 9,
			priceRatio: 1.15,
			effects: {
				"compendiaTTBoostRatio": 0.02
			},
			flavor: true
		}, {
			name: "blackRadiance",
			prices: [
				{name: "relic", val: 37500}
			],
			tier: 12,
			priceRatio: 1.15,
			effects: {
				"blsCorruptionRatio": 0.0012
			},
			flavor: true
		}, {
			name: "blazar",
			prices: [
				{name: "relic", val: 50000}
			],
			tier: 15,
			priceRatio: 1.15,
			upgrades: {chronoforge: ["temporalImpedance"]},
			effects: {
				//Should at least improve impedance scaling by some value (5%? 10%). Probably something else
				"timeRatio": 0.10,
				"rrRatio":   0.02
			},
			flavor: true
		}, {
			name: "darkNova",
			prices: [
				{name: "relic", val: 75000},
				{name: "void",  val: 7500}
			],
			tier: 20,
			priceRatio: 1.15,
			effects: {
				"energyProductionRatio": 0.02
			},
			flavor: true
		}, {
			name: "mausoleum",
			tier: 23,
			priceRatio: 1.15,
			prices: [
				{name: "relic",     val: 50000},
				{name: "void",      val: 12500},
				{name: "necrocorn", val: 10}
			],
			// unlocks: {pacts: ["pactOfCleansing", "pactOfDestruction",  "pactOfExtermination", "pactOfPurity"]},
			requires: function (game) {
				return game.getFeatureFlag("MAUSOLEUM_PACTS");
			},
			upgrades: {pacts: ["fractured"]},
			effects: {
				"pactsAvailable": 1
			},
			calculateEffects: function (self, game) {
				if (!game.getFeatureFlag("MAUSOLEUM_PACTS")) {
					self.effects["pactsAvailable"] = 0;
					// self.unlocked = false;
					return;
				}
				self.effects = {
					"pactsAvailable": 1 + game.getEffect("mausoleumBonus")
				};
				if (game.religion.isFractured) {
					self.effects["pactsAvailable"] = 0;
				}
			}
		}, {
			name: "holyGenocide",
			description: "And tear will not fall down",
			prices: [
				{name: "relic", val: 100000},
				{name: "void",  val: 25000}
			],
			tier: 25,
			priceRatio: 1.15,
			// unlocks: {challenges: ["postApocalypse"]},
			togglable: true,
			effects: {
				"maxKittensRatio": -0.01,
				"simScalingRatio":  0.02,
				"activeHG":         0
			},
			calculateEffects: function (self, game) {
				self.effects["activeHG"] = game.religion.activeHolyGenocide;
			},
			flavor: true
		}, {
			//Added in Kittens Game 1.5.x. Gated behind the DARK_PARACOSM feature
			//flag in the game; the editor has no flag system, so it is always
			//listed and left for manual toggling.
			name: "darkParacosm",
			prices: [
				{name: "relic",   val: 230000},
				{name: "void",    val: 29000},
				{name: "paragon", val: 8}
			],
			tier: 27,
			priceRatio: 2,
			effects: {
				"milleninumParagon": 1
			},
			flavor: true
		}
		//Holy Memecide
	],

	pactsData: [
		{
			name: "pactOfCleansing",
			prices: [
				{name: "relic", val: 100}
			],
			priceRatio: 1,
			// unlocks: {/* "pacts": ["pactOfFanaticism"] */},
			requires: {transcendenceUpgrades: ["mausoleum"]},
			effects: {
				"pactsAvailable":          -1,
				"necrocornPerDay":          0,
				"pactDeficitRecoveryRatio": 0.003,
				"pactGlobalResourceRatio":  0.0005
				// "cathPollutionPerTickCon": -5
			},
			calculateEffects: function (self, game) {
				self.effects["necrocornPerDay"] = game.getEffect("pactNecrocornConsumption");
			}
		}, {
			name: "pactOfDestruction",
			prices: [
				{name: "relic", val: 100}
			],
			priceRatio: 1,
			// unlocks: {/* "pacts": ["pactOfGlowing"] */ /* will deal with this later */},
			requires: {transcendenceUpgrades: ["mausoleum"]},
			effects: {
				"pactsAvailable":           -1,
				"necrocornPerDay":           0,
				"pactDeficitRecoveryRatio": -0.0001,
				"pactGlobalProductionRatio": 0.0005
				// "cathPollutionPerTickProd":  10
			},
			calculateEffects: function (self, game) {
				self.effects["necrocornPerDay"] = game.getEffect("pactNecrocornConsumption");
			}
		}, {
			name: "pactOfExtermination",
			prices: [
				{name: "relic", val: 100}
			],
			priceRatio: 1.02,
			requires: {transcendenceUpgrades: ["mausoleum"]},
			effects: {
				"pactsAvailable": -1,
				"necrocornPerDay": 0,
				"pactFaithRatio":  0.001
			},
			calculateEffects: function (self, game) {
				self.effects["necrocornPerDay"] = game.getEffect("pactNecrocornConsumption");
			}
		}, {
			name: "pactOfPurity",
			label: $I("religion.pact.pactOfPurity.label"),
			description: $I("religion.pact.pactOfPurity.desc"),
			prices: [
				{name: "relic", val: 100}
			],
			priceRatio: 1,
			// unlocks: {/* "pacts": ["pactOfFlame", "pactOfFanaticism"] */},
			requires: {transcendenceUpgrades: ["mausoleum"]},
			effects: {
				"pactsAvailable":          -1,
				"necrocornPerDay":          0,
				"pactDeficitRecoveryRatio": 0.005,
				"pactBlackLibraryBoost":    0.0005
				// "cathPollutionPerTickCon": -7
			},
			calculateEffects: function (self, game) {
				self.effects["necrocornPerDay"] = game.getEffect("pactNecrocornConsumption");
			}
		}, {
			//Added in Kittens Game 1.5.x, alongside the MAUSOLEUM_PACTS feature.
			name: "pactOfArcane",
			prices: [
				{name: "relic", val: 100}
			],
			priceRatio: 1,
			requires: {transcendenceUpgrades: ["mausoleum"]},
			effects: {
				"pactsAvailable":        -1,
				"necrocornPerDay":        0,
				"pactcraftRatio":         0.001,
				"pactUniversalKnowHow":   0.1
			},
			calculateEffects: function (self, game) {
				self.effects["necrocornPerDay"] = game.getEffect("pactNecrocornConsumption");
			}
		}, {
			name: "pactOfChronicler",
			prices: [
				{name: "relic", val: 100}
			],
			priceRatio: 1,
			requires: {transcendenceUpgrades: ["mausoleum"]},
			effects: {
				"pactsAvailable":   -1,
				"necrocornPerDay":   0,
				"pactPerYearRatio":  0.003,
				"umbraBoostRatio":   0.1,
				"pacttimeRatio":     0.1
			},
			calculateEffects: function (self, game) {
				self.effects["necrocornPerDay"] = game.getEffect("pactNecrocornConsumption");
			},
			upgrades: {spaceBuilding: ["hrHarvester"]}
		}, {
			name: "payDebt",
			prices: [
				{name: "necrocorn", val: 0}
			],
			priceRatio: 1,
			limitBuild: 1,
			upgrades: {pacts: ["payDebt"]},
			effects: {
				"pactsAvailable": 0
			},
			special: true
		}, {
			name: "fractured",
			prices: [
				{name: "catnip", val: 1}
			],
			priceRatio: 1,
			limitBuild: 1,
			effects: {
				"pyramidGlobalResourceRatio":   -0.5,
				"pyramidGlobalProductionRatio": -0.5,
				"pyramidFaithRatio":            -0.5,
				"pactsAvailable":                0
			},
			special: true
		}
	],

	necrocornDeficit: 0,
	fractureNecrocornDeficit: 50,

	isFractured: false,

	zigguratUpgrades: null,
	zigguratUpgradesByName: null,
	religionUpgrades: null,
	religionUpgradesByName: null,
	transcendenceUpgrades: null,
	transcendenceUpgradesByName: null,
	pacts: null,
	pactsByName: null,

	faith: 0,
	faithRatio: 0,
	corruption: 0,
	transcendenceTier: 0,

	//the amount of currently active HG buildings (typically refils during reset)
	activeHolyGenocide: 0,

	hasTranscendeceUpgrade: false, //cache for getRU("transcendence").owned()

	effectsBase: {
		"kittensKarmaPerMinneliaRatio": 0.0001, //unspent pacts can make karma
		"pactNecrocornConsumption":    -0.0005
	},

	getEffectBase: function (name) {
		return num(this.effectsBase[name]);
	},

	tabName: "Religion",
	leaderBonuses: ["wise"],
	getVisible: function () {
		return this.game.resPool.get("faith").unlocked || (this.game.challenges.isActive("atheism") && this.game.bld.get("ziggurat").owned());
	},

	constructor: function () {
		this.i18nKeys = {tabName: "tab.name.religion"};
		this.registerMetaItems(this.zigguratUpgradesData, classes.KGSaveEdit.ZigguratMeta, "zigguratUpgrades");
		this.registerMetaItems(this.religionUpgradesData, classes.KGSaveEdit.ReligionMeta, "religionUpgrades");
		this.registerMetaItems(this.transcendenceUpgradesData, classes.KGSaveEdit.TranscendenceMeta, "transcendenceUpgrades");
		this.registerMetaItems.call(this, this.pactsData, classes.KGSaveEdit.PactsMeta, "pacts");

		this.addMeta(this.zigguratUpgrades);
		this.addMeta(this.religionUpgrades);
		this.addMeta(this.transcendenceUpgrades);
		this.addMeta(this.pacts);
	},

	getZU: function (name) {
		var upgrade = this.zigguratUpgradesByName[name];
		if (name && !upgrade) {
			console.error("Ziggurat upgrade not found", name);
		}
		return upgrade;
	},

	getRU: function (name) {
		var upgrade = this.religionUpgradesByName[name];
		if (name && !upgrade) {
			console.error("Religion upgrade not found", name);
		}
		return upgrade;
	},

	getTU: function (name) {
		var upgrade = this.transcendenceUpgradesByName[name];
		if (name && !upgrade) {
			console.error("Transcendence upgrade not found", name);
		}
		return upgrade;
	},

	getPact: function (name) {
		var pact = this.pactsByName[name];
		if (name && !pact) {
			console.error("Pact not found", name);
		}
		return pact;
	},

	getApocryphaBonus: function () {
		return this.game.getUnlimitedDR(this.faithRatio, 0.1) * 0.1;
	},

	getHGScalingBonus: function () {
		//TODO: test this
		var scalingRatio = this.game.getLimitedDR(this.game.getEffect("simScalingRatio"), 1);
		if (!scalingRatio /*|| !this.game.village.maxKittensRatioApplied*/) {
			return 1;
		}

		return (1 / (1 - this.game.getLimitedDR(this.game.getEffect("maxKittensRatio"), 1))) * (1 + scalingRatio);
	},

	_getTranscendTotalPrice: function (tier) {
		return this.game.getInverseUnlimitedDR(Math.exp(tier) / 10, 0.1);
	},

	getSolarRevolutionRatio: function () {
		var uncappedBonus = this.getRU("solarRevolution").owned() ? this.game.getUnlimitedDR(this.faith, 1000) / 100 : 0;
		return (
			this.game.getLimitedDR(uncappedBonus, 10 + this.game.getEffect("solarRevolutionLimit") +
				(this.game.challenges.getChallenge("atheism").on > 0 ? this.transcendenceTier : 0)) *
			(1 + this.game.getLimitedDR(this.game.getEffect("faithSolarRevolutionBoost"), 4))
		);
	},

	pactsMilleniumKarmaKittens: function (millennia) {
		//pacts karma effect
		/*
		unspent pacts generate karma each 1000 years based on kitten numbers
		pactsAvailable are created by mausoleum cryptotheology and radicalXenophobia
		this function adds appropriate karmaKittens and returns change in karma; temporary logs karma generation
		TODO: maybe make HG bonus play into this
		*/
		var kittens = this.game.resPool.get("kittens").value;
		var gain = 0;
		if (kittens > 35 && this.game.getEffect("pactsAvailable") > 0) {
			var kittensKarmaPerMinneliaRatio = this.game.getEffect("kittensKarmaPerMinneliaRatio");
			gain = (millennia * this.game._getKarmaKittens(kittens) * this.game.getUnlimitedDR(kittensKarmaPerMinneliaRatio *
				Math.max(1 + 0.1 * (this.game.religion.transcendenceTier - 25), 1) * (this.game.getEffect("pactsAvailable")), 100));
		}
		return gain;
	},

	getCorruptionPerTick: function () {
		if (this.game.resPool.get("alicorn").owned()) {
			//30% bls * 20 Radiance should yield ~ 50-75% boost rate which is laughable but we can always buff it
			var blsBoost = 1 + Math.sqrt(this.game.resPool.get("sorrow").value * this.game.getEffect("blsCorruptionRatio"));
			var corruptionBoost = (this.game.resPool.get("necrocorn").owned() ?
				0.25 * (1 + this.game.getEffect("corruptionBoostRatio")) : // 75% penalty
				1);
			return this.game.getEffect("corruptionRatio") * blsBoost * corruptionBoost;
		}
		return 0;
	},

	/**
	 * Mirrors pactsManager.getDebtPenaltyRatio() in the game. Pact effects are
	 * scaled by this before they reach the Black Pyramid. It used to be
	 * approximated here as (1 - deficit / 50), which ignored both the fractured
	 * pact and the punishment exemption the siphoning policy grants.
	 */
	getDebtPenaltyRatio: function () {
		//The game tests getPact("fractured").on; the editor models that state on
		//the manager instead (PactMeta.getOn for "fractured" just reflects this
		//flag), so read it from there.
		if (this.isFractured || this.necrocornDeficit >= this.fractureNecrocornDeficit) {
			return 0; //maximum debt
		}

		var lowerBound = this.game.getEffect("smallDebtPunishmentExemption");
		if (this.necrocornDeficit <= lowerBound) {
			return 1; //no debt worth punishing
		}

		return 1 - (this.necrocornDeficit - lowerBound) /
			(this.fractureNecrocornDeficit - lowerBound);
	},

	getNecrocornDeficitConsumptionModifier: function () {
		if (this.necrocornDeficit <= 0) {
			return 1;
		}
		var necrocornDeficitRepaymentModifier = 1;
		var necrocornPerDay = this.game.getEffect("necrocornPerDay");
		necrocornDeficitRepaymentModifier = 1 + 0.15 * (1 + this.game.getEffect("deficitRecoveryRatio") / 2);
		if ((this.game.resPool.get("necrocorn").value + necrocornPerDay * necrocornDeficitRepaymentModifier) < 0) {
			necrocornDeficitRepaymentModifier = Math.max((necrocornPerDay * necrocornDeficitRepaymentModifier + this.game.resPool.get("necrocorn").value) / necrocornPerDay, 0);
		}
		return necrocornDeficitRepaymentModifier;
	},

	renderTabBlock: function () {
		var panel = this.game._createPanel(this.tabBlockNode, {
			id: "zigguratPanel",
			class: "bottom-margin"
		}, $I("religion.panel.ziggurat.label"), true);
		this.zigguratBlock = dojo.create("table", {id: "zigguratBlock"}, panel.content);
		this.zigguratBlockHeader = panel.header;

		panel = this.game._createPanel(this.tabBlockNode, {
			id: "religionPanel",
			class: "bottom-margin"
		}, $I("religion.panel.orderOfTheSun.label"), true);

		var table = dojo.create("table", {class: "bottom-margin"}, panel.content);

		var tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.religion.totalFaith") + "</td><td></td>"
		}, table);
		this.game._createInput({class: "abbrInput"}, tr.children[1], this, "faith");
		this.solarBonusSpan = dojo.create("span", {id: "solarBonusSpan", class: "leftSpacer"}, tr.children[1]);

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.religion.apocryphaBonus") + "</td><td></td>"
		}, table);
		this.game._createInput({class: "abbrInput"}, tr.children[1], this, "faithRatio");
		this.apocryphaBonusSpan = dojo.create("span", {id: "apocryphaBonusSpan", class: "leftSpacer"}, tr.children[1]);

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.religion.corruptionTimer") + "</td><td></td>"
		}, table);
		this.game._createInput({class: "abbrInput"}, tr.children[1], this, "corruption");

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.religion.transcendenceTier") + "</td><td></td>"
		}, table);
		this.game._createInput({class: "integerInput"}, tr.children[1], this, "transcendenceTier");

		this.religionBlock = dojo.create("table", {id: "religionBlock"}, panel.content);
		this.religionBlockHeader = panel.header;

		panel = this.game._createPanel(this.tabBlockNode, {
			id: "transcendencePanel",
			class: "bottom-margin"
		}, $I("religion.panel.cryptotheology.label"), true);

		this.transcendenceBlock = dojo.create("table", {id: "transcendenceBlock"}, panel.content);
		this.transcendenceBlockHeader = panel.header;

		panel = this.game._createPanel(this.tabBlockNode, {
			id: "pactsPanel"
		}, "Pacts", true, !this.game.getFeatureFlag("MAUSOLEUM_PACTS"));

		this.pactsBlock = dojo.create("table", {id: "pactsBlock"}, panel.content);
		this.pactsBlockHeader = panel.header;

		tr = dojo.create("tr", {
			innerHTML: "<td>" + $I("KGSaveEdit.religion.necrocornDeficit") + "</td><td></td>" //not using resources.necrocornDeficit.title because capitals
		}, this.pactsBlock);
		this.game._createInput({class: "abbrInput"}, tr.children[1], this, "necrocornDeficit");

		var div = dojo.create("div", null, panel.content);
		this.fracturedNode = this.game._createCheckbox($I("religion.pact.fractured.label"), div, this).cbox;
	},

	render: function () {
		var self = this;
		for (var i = 0, len = self.zigguratUpgrades.length; i < len; i++) {
			var zu = self.zigguratUpgrades[i];
			zu.render();
			dojo.place(zu.domNode, self.zigguratBlock);
		}

		for (i = 0, len = self.religionUpgrades.length; i < len; i++) {
			var ru = self.religionUpgrades[i];
			ru.render();
			dojo.place(ru.domNode, self.religionBlock);
		}

		for (i = 0, len = self.transcendenceUpgrades.length; i < len; i++) {
			var tu = self.transcendenceUpgrades[i];
			tu.render();
			dojo.place(tu.domNode, self.transcendenceBlock);
		}

		for (i = self.pacts.length - 1; i >= 0; i--) { //reversed on purpose
			var pact = self.pacts[i];
			pact.render();
			if (!pact.special) {
				dojo.place(pact.domNode, self.pactsBlock, "first");
			}
		}

		var hg = self.getTU("holyGenocide");
		hg.domNode.children[2].innerHTML = " &nbsp;" + $I("effectsMgr.statics.activeHG.title") + " ";
		var input = self.game._createInput({class: "integerInput"}, hg.domNode.children[2], self, "activeHolyGenocide");
		input.handler = function () {
			self.game.upgradeItems({transcendenceUpgrades: ["holyGenocide"]});
		};
	},

	update: function () {
		this.hasTranscendeceUpgrade = this.getRU("transcendence").owned(true);

		var pactsFlag = this.game.getFeatureFlag("MAUSOLEUM_PACTS");
		var deficitOverrun = this.necrocornDeficit >= this.fractureNecrocornDeficit;
		this.fracturedNode.checked = deficitOverrun || this.fracturedNode.prevChecked;
		this.game.toggleDisabled(this.fracturedNode, deficitOverrun);
		this.isFractured = pactsFlag && this.fracturedNode.checked;

		this.game.callMethods(this.zigguratUpgrades, "update");
		this.game.callMethods(this.religionUpgrades, "update");
		this.game.callMethods(this.transcendenceUpgrades, "update");
		this.game.callMethods(this.pacts, "update");

		dojo.toggleClass(this.zigguratBlockHeader, "spoiler", !this.game.bld.get("ziggurat").owned());
		dojo.toggleClass(this.religionBlockHeader, "spoiler", this.game.challenges.isActive("atheism"));
		dojo.toggleClass(this.transcendenceBlockHeader, "spoiler", !this.transcendenceTier || !this.game.science.get("cryptotheology").owned());

		var canSeePacts = this.getZU("blackPyramid").owned() && (this.getTU("mausoleum").owned() || this.game.science.getPolicy("radicalXenophobia").owned());
		canSeePacts = canSeePacts && pactsFlag;
		dojo.toggleClass(this.pactsBlockHeader, "spoiler", !canSeePacts);

		var text = "";

		if (this.getRU("solarRevolution").owned()) {
			var bonus = this.getSolarRevolutionRatio();
			text = " (" + this.game.getDisplayValueExt(100 * bonus) + "% " + $I("religion.faithCount.bonus") + ")";
		}
		this.solarBonusSpan.textContent = text;

		var ratio = this.getApocryphaBonus();
		this.apocryphaBonusSpan.textContent = " [" + this.game.getDisplayValueExt(ratio * 100, true, false, 1) + "%]";
	},

	save: function (saveData) {
		var self = this;
		var isAtheism = self.game.challenges.isActive("atheism");

		saveData.religion = {
			faith: self.faith,
			corruption: self.corruption,
			faithRatio: self.faithRatio,
			transcendenceTier: self.transcendenceTier,
			activeHolyGenocide: self.activeHolyGenocide,
			necrocornDeficit: self.necrocornDeficit,
			// Duplicated save, for older versions like mobile
			tcratio: self._getTranscendTotalPrice(self.transcendenceTier),
			zu: self.game.filterMetadata(self.zigguratUpgrades, ["name", "val", "on", "unlocked"]),
			ru: self.game.filterMetadata(self.religionUpgrades, ["name", "val", "on"], function (saveRU) {
				if (isAtheism) {
					saveRU.val = 0;
					saveRU.on = 0;
				}
			}),
			tu: self.game.filterMetadata(self.transcendenceUpgrades, ["name", "val", "on", "unlocked"]),
			pact: self.game.filterMetadata(self.pacts, ["name", "val", "on", "unlocked"], function (savePact) {
				var on = this.getOn();
				savePact.val = on;
				savePact.on =  on;
			})
		};
	},

	load: function (saveData) {
		if (!saveData.religion) {
			return;
		}

		this.set("faith", num(saveData.religion.faith));
		this.set("corruption", num(saveData.religion.corruption));
		this.set("faithRatio", num(saveData.religion.faithRatio));
		this.set("activeHolyGenocide", num(saveData.religion.activeHolyGenocide));
		this.set("necrocornDeficit", num(saveData.religion.necrocornDeficit));
		var transcendenceTier = num(saveData.religion.transcendenceTier);
		// Read old save
		if (transcendenceTier == 0 && saveData.religion.tcratio > 0) {
			transcendenceTier = Math.max(0, Math.round(Math.log(10 * this.game.getUnlimitedDR(saveData.religion.tcratio, 0.1))));
		}
		this.set("transcendenceTier", transcendenceTier);

		this.loadMetadata(saveData, "religion.zu", "getZU", null, true);
		this.loadMetadata(saveData, "religion.ru", "getRU", null, true);
		this.loadMetadata(saveData, "religion.tu", "getTU", null, true);
		this.loadMetadata(saveData, "religion.pact", "getPact", null, true);
	}
});


dojo.declare("classes.KGSaveEdit.ZigguratMeta", classes.KGSaveEdit.MetaItemStackable, {
	upgradeType: "zigguratUpgrades",
	unlocked: false,

	constructor: function () {
		this.i18nKeys = {
			label: "religion.zu." + this.name + ".label",
			description: "religion.zu." + this.name + ".desc"
		};
		if (this.flavor) {
			this.i18nKeys.flavor = "religion.zu." + this.name + ".flavor";
		}
	},

	render: function () {
		this.seti18n();

		this.domNode = dojo.create("tr", {
			class: "zigguratUpgrade",
			innerHTML: "<td>" + (this.label || this.name) + "</td><td></td>"
		});
		this.nameNode = this.domNode.children[0];
		this.game._createValInput(null, this.domNode.children[1], this);

		this.registerHighlight(this.domNode);
		this.registerTooltip(this.domNode);
	},

	update: function () {
		this.updateEnabled();
		this.unlocked = this.game.checkRequirements(this);
		dojo.toggleClass(this.nameNode, "spoiler", !this.unlocked);

		if (this.action) {
			this.action(this, this.game);
		}
	},

	load: function (saveData) {
		this.set("val", num(saveData.val));
		this.set("unlocked", Boolean(saveData.unlocked));
	}
});


dojo.declare("classes.KGSaveEdit.ReligionMeta", classes.KGSaveEdit.MetaItemStackable, {
	upgradeType: "religionUpgrades",
	upgradable: false,

	constructor: function () {
		this.i18nKeys = {
			label: "religion.ru." + this.name + ".label",
			description: "religion.ru." + this.name + ".desc"
		};
		if (this.flavor) {
			this.i18nKeys.flavor = "religion.ru." + this.name + ".flavor";
		}
	},

	owned: function (override) {
		if (!override && this.game.challenges.isActive("atheism")) {
			return false;
		}
		return this.val > 0;
	},

	getName: function () {
		var name = this.label || this.name;
		if (this.owned()) {
			if (this.upgradable && this.game.religion.hasTranscendeceUpgrade) {
				name += " (" + this.val + ")";
			} else {
				name += " " + $I("btn.complete");
			}
		}
		return name;
	},

	getPrices: function () {
		var prices = dojo.clone(this.prices) || [];
		var priceRatio = this.priceRatio || 2.5;
		if (!this.upgradable) {
			priceRatio = 1;
		}

		var pricesDiscount = this.game.getLimitedDR((this.game.getEffect(this.name + "CostReduction")), 1);
		var priceModifier = 1 - pricesDiscount;

		for (var i = 0; i < prices.length; i++) {
			var resPriceDiscount = this.game.getEffect(prices[i].name + "CostReduction");
			resPriceDiscount = this.game.getLimitedDR(resPriceDiscount, 1);
			var resPriceModifier = 1 - resPriceDiscount;
			prices[i].val *= Math.pow(priceRatio, this.val) * resPriceModifier * priceModifier;
		}
		return this.game.village.getEffectLeader("wise", prices);
	},

	render: function () {
		this.seti18n();

		this.domNode = dojo.create("tr", {
			class: "religionUpgrade",
			innerHTML: "<td>" + (this.label || this.name) + '</td><td></td><td class="invisible"></td>'
		});
		this.nameNode = this.domNode.children[0];

		var input = this.game._createCheckbox($I("KGSaveEdit.religion.complete"), this.domNode.children[1], this);
		this.ownedCheckbox = input.cbox;
		dojo.addClass(input.cbox, "ownedInput");
		input.cbox.handler = function () {
			var ru = this.metaObj;
			if (this.checked !== Boolean(ru.val)) {
				var value = this.checked ? Math.max(ru.valNode.prevValue, 1) : 0;
				ru.val = this.game.setInput(ru.valNode, num(value), true, true);
				ru.on = value;
			}
		};

		this.game._createValInput(null, this.domNode.children[1], this);
		this.valNode.handler = function () {
			this.game.setCheckbox(this.metaObj.ownedCheckbox, this.parsedValue, true, true);
			this.metaObj.on = this.parsedValue;
		};

		// create dummy elements to prevent the rendering from jumping around as you toggle transcendence
		dojo.create("input", {
			type: "checkbox",
			disabled: true,
			class: "invisible"
		}, this.domNode.children[2]);
		dojo.create("input", {
			type: "text",
			disabled: true,
			class: "invisible"
		}, this.domNode.children[2]);

		this.registerHighlight(this.domNode);
		this.registerTooltip(this.domNode);
	},

	update: function () {
		this.updateEnabled();
		dojo.toggleClass(this.nameNode, "spoiler", this.game.religion.faith < this.faith);

		var t = Boolean(this.upgradable && this.game.religion.hasTranscendeceUpgrade);
		dojo.toggleClass(this.ownedCheckbox.parentNode, "hidden", t);
		dojo.toggleClass(this.valNode, "hidden", !t);
	},

	load: function (saveData) {
		this.set("val", num(saveData.val));
	}
});


dojo.declare("classes.KGSaveEdit.TranscendenceMeta", classes.KGSaveEdit.MetaItemStackable, {
	upgradeType: "transcendenceUpgrades",
	unlocked: false,

	constructor: function () {
		this.i18nKeys = {
			label: "religion.tu." + this.name + ".label",
			description: "religion.tu." + this.name + ".desc"
		};
		if (this.flavor) {
			this.i18nKeys.flavor = "religion.tu." + this.name + ".flavor";
		}
	},

	render: function () {
		this.seti18n();

		this.domNode = dojo.create("tr", {
			class: "transcendenceUpgrade",
			innerHTML: "<td>" + (this.label || this.name) + '</td><td class="rightAlign"></td><td></td>'
		});
		this.nameNode = this.domNode.children[0];

		this.onNodeSpan = dojo.create("span", {innerHTML: " / "}, this.domNode.children[1]);

		this.game._createInput({
			class: "integerInput ownedInput",
			title: $I("KGSaveEdit.buildings.on.title")
		}, this.onNodeSpan, this, "on", "first");
		this.game._createValInput(null, this.domNode.children[1], this);

		this.registerHighlight(this.domNode);
		this.registerTooltip(this.domNode);
	},

	getEffect: function (effectName) {
		var effectValue = this.effects[effectName] || 0;
		if (this.name === "holyGenocide") {
			//activeHG *is* the active count - calculateEffects assigns
			//activeHolyGenocide straight into it - so scaling it again squared the
			//value. The game returns this one directly and stacks only the rest.
			if (effectName === "activeHG") {
				return this.game.religion.activeHolyGenocide;
			}
			return effectValue * this.game.religion.activeHolyGenocide;
		}
		return effectValue * this.getOn();
	},

	update: function () {
		this.updateEnabled();
		var unlocked = this.game.religion.transcendenceTier >= this.tier;
		if (unlocked && this.requires) {
			unlocked = this.game.checkRequirements(this);
		}
		this.unlocked = unlocked;
		dojo.toggleClass(this.nameNode, "spoiler", !this.unlocked);
		dojo.toggleClass(this.onNodeSpan, "hidden", !this.togglable);
	},

	load: function (saveData) {
		this.set("val", num(saveData.val));
		this.set("on", num(saveData.on));
		this.set("unlocked", Boolean(saveData.unlocked));
	}
});


dojo.declare("classes.KGSaveEdit.PactsMeta", classes.KGSaveEdit.MetaItemStackable, {
	upgradeType: "pacts",

	constructor: function () {
		this.i18nKeys = {
			label: "religion.pact." + this.name + ".label",
			description: "religion.pact." + this.name + ".desc"
		};
	},

	owned: function () {
		return this.getOn() > 0;
	},

	getOn: function () {
		if (this.name === "fractured") {
			return this.game.religion.isFractured ? 1 : 0;
		}
		if (this.game.religion.isFractured) {
			return 0;
		}
		if (this.name === "payDebt") {
			return this.game.religion.necrocornDeficit > 0 ? 1 : 0;
		}
		var on = this.val;
		if (typeof this.limitBuild === "number") {
			on = Math.min(on, this.limitBuild);
		}
		return on;
	},

	getEffect: function (effectName) {
		if (!this.game.getFeatureFlag("MAUSOLEUM_PACTS")) {
			return 0;
		}
		return num(this.effects[effectName]) * this.getOn();
	},

	render: function () {
		this.seti18n();

		this.domNode = dojo.create("tr", {
			class: "pact",
			innerHTML: "<td>" + (this.label || this.name) + '</td><td></td>'
		});
		this.nameNode = this.domNode.children[0];

		this.game._createValInput(null, this.domNode.children[1], this);

		if (!this.special) {
			this.registerHighlight(this.domNode);
			this.registerTooltip(this.domNode);
		}
	},

	updateEnabled: function () {
		if (!this.special) {
			var prices = this.getPrices() || [];
			var limited = this.game.resPool.isStorageLimited(prices);
			var buildLimited = this.game.religion.isFractured || this.game.getEffect("pactsAvailable") <= 0 || typeof this.limitBuild === "number" && this.limitBuild <= this.val;
			dojo.toggleClass(this.nameNode, "limited", this.game.opts.highlightUnavailable && limited);
			dojo.toggleClass(this.nameNode, "btnDisabled", limited || buildLimited || !this.game.resPool.hasRes(prices));
		}
	},

	update: function () {
		this.updateEnabled();
		if (this.special) {
			this.unlocked = this.getOn() > 0;
		} else {
			this.unlocked = this.game.checkRequirements(this, false);
			dojo.toggleClass(this.nameNode, "spoiler", this.game.religion.isFractured || !this.unlocked);
		}
	},

	load: function (saveData) {
		this.set("val", num(saveData.val));
	}
});

});

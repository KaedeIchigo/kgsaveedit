/* global dojo, require, classes, $I, num */

require([], function () {
"use strict";

dojo.declare("classes.KGSaveEdit.ScienceManager", [classes.KGSaveEdit.UI.Tab, classes.KGSaveEdit.Manager], {
	techData: [
		{
			name: "calendar",
			prices: [
				{name: "science", val: 30}
			],
			unlocked: true,
			// unlocks: {tabs: ["time"], tech: ["agriculture"]},
			flavor: true
		}, {
			name: "agriculture",
			prices: [
				{name: "science", val: 100}
			],
			// unlocks: {buildings: ["barn"], tech: ["mining", "archery"], jobs: ["farmer"]},
			requires: {tech: ["calendar"]},
			flavor: true
		}, {
			name: "archery",
			prices: [
				{name: "science", val: 300}
			],
			// unlocks: {buildings: ["zebraOutpost", "zebraWorkshop", "zebraForge"], jobs: ["hunter"], tech: ["animal"]},
			requires: {tech: ["agriculture"]},
			flavor: true
		}, {
			name: "mining",
			prices: [
				{name: "science", val: 500}
			],
			// unlocks: {buildings: ["mine", "workshop"], tech: ["metal"], upgrades: ["bolas"]},
			requires: {tech: ["agriculture"]},
			flavor: true
		}, {
			name: "metal",
			prices: [
				{name: "science", val: 900}
			],
			// unlocks: {buildings: ["smelter"], upgrades: ["huntingArmor"]},
			requires: {tech: ["mining"]}
		}, {
			name: "animal",
			prices: [
				{name: "science", val: 500}
			],
			// unlocks: {buildings: ["pasture", "unicornPasture"], tech: ["civil", "math", "construction"]},
			requires: {tech: ["archery"]}
		}, {
			name: "brewery",
			prices: [
				{name: "science", val: 1200}
			],
			hidden: true // not used anymore
		}, {
			name: "civil",
			prices: [
				{name: "science", val: 1500}
			],
			// unlocks: {tech: ["currency"]},
			requires: {tech: ["animal"]},
			flavor: true
		}, {
			name: "math",
			prices: [
				{name: "science", val: 1000}
			],
			// unlocks: {tabs: ["stats"], buildings: ["academy"], upgrades: ["celestialMechanics"]},
			requires: {tech: ["animal"]},
			flavor: true
		}, {
			name: "construction",
			prices: [
				{name: "science", val: 1300}
			],
			// unlocks: {buildings: ["logHouse", "warehouse", "lumberMill", "ziggurat"], tech: ["engineering"], upgrades: ["compositeBow", "advancedRefinement", "reinforcedSaw"]},
			requires: {tech: ["animal"]},
			flavor: true
		}, {
			name: "engineering",
			prices: [
				{name: "science", val: 1500}
			],
			// unlocks: {buildings: ["aqueduct"], tech: ["writing"], policies: ["stripMining", "clearCutting", "environmentalism"]},
			requires: {tech: ["construction"]}
		}, {
			name: "currency",
			prices: [
				{name: "science", val: 2200}
			],
			// unlocks: {buildings: ["tradepost"], policies: ["diplomacy", "isolationism"], upgrades: ["goldOre"]},
			requires: {tech: ["civil"]}
		}, {
			name: "writing",
			prices: [
				{name: "science", val: 3600}
			],
			// unlocks: {buildings: ["amphitheatre"], tech: ["philosophy", "machinery", "steel"], policies: ["liberty", "tradition"], upgrades: ["register"], crafts: ["parchment"]},
			requires: {tech: ["engineering"]},
			flavor: true
		}, {
			name: "philosophy",
			prices: [
				{name: "science", val: 9500}
			],
			// unlocks: {buildings: ["temple"], tech: ["theology"], policies: ["stoicism", "epicurianism"], crafts: ["compedium"]},
			requires: {tech: ["writing"]},
			flavor: true
		}, {
			name: "machinery",
			prices: [
				{name: "science", val: 15000}
			],
			// unlocks: {buildings: ["steamworks"], upgrades: ["printingPress", "factoryAutomation", "crossbow"]}
			requires: {tech: ["writing"]}
		}, {
			name: "steel",
			prices: [
				{name: "science", val: 12000}
			],
			// unlocks: {upgrades: ["deepMining", "coalFurnace", "combustionEngine", "reinforcedWarehouses", "steelAxe", "steelArmor"], crafts: ["steel"]},
			requires: {tech: ["writing"]}
		}, {
			name: "theology",
			prices: [
				{name: "science",    val: 20000},
				{name: "manuscript", val: 35}
			],
			// unlocks: {jobs: ["priest"], tech: ["astronomy", "cryptotheology"]},
			requires: {tech: ["philosophy"]},
			upgrades: {buildings: ["temple"]},
			flavor: true
		}, {
			name: "astronomy",
			prices: [
				{name: "science",    val: 28000},
				{name: "manuscript", val: 65}
			],
			// unlocks: {buildings: ["observatory"], tech: ["navigation"], policies: ["knowledgeSharing", "culturalExchange", "bigStickPolicy", "cityOnAHill"]},
			requires: {tech: ["theology"]}
		}, {
			name: "navigation",
			prices: [
				{name: "science",    val: 35000},
				{name: "manuscript", val: 100}
			],
			// unlocks: {buildings: ["harbor"], tech: ["physics", "archeology", "architecture"], upgrades: ["caravanserai", "cargoShips", "astrolabe", "titaniumMirrors", "titaniumAxe"], crafts: ["ship"]},
			requires: {tech: ["astronomy"]}
		}, {
			name: "architecture",
			prices: [
				{name: "science",   val: 42000},
				{name: "compedium", val: 10}
			],
			// unlocks: {tech: ["acoustics"]},
			requires: {buildings: ["mansion", "mint"], tech: ["navigation"]},
			flavor: true
		}, {
			name: "physics",
			prices: [
				{name: "science",   val: 50000},
				{name: "compedium", val: 35}
			],
			// unlocks: {tech: ["chemistry", "electricity", "metaphysics"], upgrades: ["pneumaticPress", "pyrolysis", "steelSaw"], crafts: ["blueprint"]},
			requires: {tech: ["navigation"]}
		}, {
			name: "metaphysics",
			prices: [
				{name: "unobtainium", val: 5},
				{name: "science",     val: 55000}
			],
			requires: {tech: ["physics"]}
		}, {
			name: "chemistry",
			prices: [
				{name: "science",   val: 60000},
				{name: "compedium", val: 50}
			],
			// unlocks: {buildings: ["calciner", "oilWell"], upgrades: ["alloyAxe", "alloyArmor", "alloyWarehouses", "alloyBarns"], crafts: ["alloy"]},
			requires: {tech: ["physics"]}
		}, {
			name: "acoustics",
			prices: [
				{name: "science",   val: 60000},
				{name: "compedium", val: 60}
			],
			// unlocks: {buildings: ["chapel"], tech: ["drama"]},
			requires: {tech: ["architecture"]}
		}, {
			name: "drama",
			prices: [
				{name: "science",   val: 90000},
				{name: "parchment", val: 5000}
			],
			// unlocks: {buildings: ["brewery"]},
			requires: {tech: ["acoustics"]}
		}, {
			name: "archeology",
			prices: [
				{name: "science",   val: 65000},
				{name: "compedium", val: 65}
			],
			// unlocks: {buildings: ["quarry"], jobs: ["geologist"], tech: ["biology"], upgrades:["geodesy"]},
			requires: {tech: ["navigation"]},
			flavor: true
		}, {
			name: "electricity",
			prices: [
				{name: "science",   val: 75000},
				{name: "compedium", val: 85}
			],
			// unlocks: {buildings: ["magneto"], tech: ["industrialization"]},
			requires: {tech: ["physics"]},
			flavor: true
		}, {
			name: "biology",
			prices: [
				{name: "science",   val: 85000},
				{name: "compedium", val: 100}
			],
			// unlocks: {buildings: ["biolab"], tech: ["biochemistry"]},
			requires: {tech: ["archeology"]},
			flavor: true
		}, {
			name: "biochemistry",
			prices: [
				{name: "science",   val: 145000},
				{name: "compedium", val: 500}
			],
			// unlocks: {tech: ["genetics"], upgrades: ["biofuel"]},
			requires: {tech: ["biology"]},
			flavor: true
		}, {
			name: "genetics",
			prices: [
				{name: "science",   val: 190000},
				{name: "compedium", val: 1500}
			],
			// unlocks: {upgrades: ["unicornSelection", "gmo"]},
			requires: {tech: ["biochemistry"]},
			flavor: true
		}, {
			name: "industrialization",
			prices: [
				{name: "science",   val: 100000},
				{name: "blueprint", val: 25}
			],
			// unlocks: {tech: ["mechanization", "metalurgy", "combustion"], upgrades: ["barges", "advancedAutomation", "logistics"], policies: ["sustainability", "fullIndustrialization"]},
			requires: {tech: ["electricity"]}
		}, {
			name: "mechanization",
			prices: [
				{name: "science",   val: 115000},
				{name: "blueprint", val: 45}
			],
			// unlocks: {buildings: ["factory"], jobs: ["engineer"], tech: ["electronics"], upgrades: ["pumpjack", "strenghtenBuild"], crafts: ["concrate"]},
			requires: {tech: ["industrialization"]}
		}, {
			name: "metalurgy",
			prices: [
				{name: "science",   val: 125000},
				{name: "blueprint", val: 60}
			],
			// unlocks: {upgrades: ["electrolyticSmelting", "oxidation", "miningDrill"]},
			requires: {tech: ["industrialization"]}
		}, {
			name: "combustion",
			prices: [
				{name: "science",   val: 115000},
				{name: "blueprint", val: 45}
			],
			// unlocks: {tech: ["ecology"], upgrades: ["offsetPress", "fuelInjectors", "oilRefinery"]},
			requires: {tech: ["industrialization"]}
		}, {
			name: "ecology",
			prices: [
				{name: "science",   val: 125000},
				{name: "blueprint", val: 55}
			],
			// unlocks: {stages: [{bld: "pasture", stage: 1}], policies: ["conservation", "openWoodlands"]},
			requires: {tech: ["combustion"]}
		}, {
			name: "electronics",
			prices: [
				{name: "science",   val: 135000},
				{name: "blueprint", val: 70}
			],
			// unlocks: {
			// 	stages: [{bld: "library", stage: 1}, {bld: "amphitheatre", stage: 1}]
			// 	tech: ["nuclearFission", "rocketry", "robotics"],
			// 	upgrades: ["cadSystems", "refrigeration", "seti", "factoryLogistics", "factoryOptimization", "internet"]
			// },
			requires: {tech: ["mechanization"]}
		}, {
			name: "robotics",
			prices: [
				{name: "science",   val: 140000},
				{name: "blueprint", val: 80}
			],
			// unlocks: {
			// 	stages: [{bld: "aqueduct", stage: 1}],
			// 	tech: ["ai"],
			// 	upgrades: ["steelPlants", "rotaryKiln", "assistance", "factoryRobotics"],
			// 	crafts: ["tanker"]
			// },
			requires: {tech: ["electronics"]}
		}, {
			name: "ai",
			prices: [
				{name: "science",   val: 250000},
				{name: "blueprint", val: 150}
			],
			// unlocks: {buildings: ["aiCore"], tech: ["quantumCryptography"], upgrades: ["neuralNetworks", "aiEngineers", "machineLearning"], buildings: ["aiCore"]},
			requires: {tech: ["robotics"]}
		}, {
			name: "quantumCryptography",
			prices: [
				{name: "science", val: 1250000},
				{name: "relic",   val: 1024}
			],
			// unlocks: {tech: ["blackchain"]},
			requires: {tech: ["ai"]}
		}, {
			name: "blackchain",
			prices: [
				{name: "science", val: 5000000},
				{name: "relic",   val: 4096}
			],
			// unlocks: {upgrades: ["invisibleBlackHand"]},
			requires: {tech: ["quantumCryptography"]}
		}, {
			name: "nuclearFission",
			prices: [
				{name: "science",   val: 150000},
				{name: "blueprint", val: 100}
			],
			// unlocks: {buildings: ["reactor"], tech: ["nanotechnology", "particlePhysics"], upgrades: ["reactorVessel", "nuclearSmelters"]},
			requires: {tech: ["electronics"]}
		}, {
			name: "rocketry",
			prices: [
				{name: "science",   val: 175000},
				{name: "blueprint", val: 125}
			],
			// unlocks: {tabs: ["space"], tech: ["sattelites", "oilProcessing"], upgrades: ["oilDistillation"]},
			requires: {tech: ["electronics"]}
		}, {
			name: "oilProcessing",
			prices: [
				{name: "science",   val: 215000},
				{name: "blueprint", val: 150}
			],
			// unlocks: {upgrades: ["factoryProcessing"], crafts: ["kerosene"]},
			requires: {tech: ["rocketry"]}
		}, {
			name: "sattelites",
			prices: [
				{name: "science",   val: 190000},
				{name: "blueprint", val: 125}
			],
			// unlocks: {tech: ["orbitalEngineering"], upgrades: ["photolithography", "orbitalGeodesy", "uplink", "thinFilm"], policies:["outerSpaceTreaty", "militarizeSpace"]},
			requires: {tech: ["rocketry"]},
			flavor: true
		}, {
			name: "orbitalEngineering",
			prices: [
				{name: "science",   val: 250000},
				{name: "blueprint", val: 250}
			],
			// unlocks: {
			// 	tech: ["exogeology", "thorium"],
			// 	upgrades: ["hubbleTelescope", "satelliteRadio", "astrophysicists", "solarSatellites", "spaceEngineers", "starlink"]
			// },
			requires: {tech: ["sattelites"]}
		}, {
			name: "thorium",
			prices: [
				{name: "science",   val: 375000},
				{name: "blueprint", val: 375}
			],
			// unlocks: {upgrades: ["thoriumReactors", "thoriumEngine", "qdot"], crafts: ["thorium"]},
			requires: {tech: ["orbitalEngineering"]}
		}, {
			name: "exogeology",
			prices: [
				{name: "science",   val: 275000},
				{name: "blueprint", val: 250}
			],
			// unlocks: {tech: ["advExogeology"], upgrades: ["unobtainiumReflectors", "unobtainiumHuts", "unobtainiumDrill", "hydroPlantTurbines", "storageBunkers"]},
			requires: {tech: ["orbitalEngineering"]}
		}, {
			name: "advExogeology",
			prices: [
				{name: "science",   val: 325000},
				{name: "blueprint", val: 350}
			],
			// unlocks: {upgrades: ["eludiumCracker", "eludiumReflectors", "eludiumHuts", "mWReactor" /*, "eludiumDrill"*/], crafts: ["eludium"]},
			requires: {tech: ["exogeology"]}
		}, {
			name: "nanotechnology",
			prices: [
				{name: "science",   val: 200000},
				{name: "blueprint", val: 150}
			],
			// unlocks: {tech: ["superconductors"], upgrades: ["augumentation", "nanosuits", "photovoltaic", "fluidizedReactors"]},
			requires: {tech: ["nuclearFission"]}
		}, {
			name: "superconductors",
			prices: [
				{name: "science",   val: 225000},
				{name: "blueprint", val: 175}
			],
			// unlocks: {tech: ["antimatter"], upgrades: ["coldFusion", "spaceManufacturing", "cryocomputing"]},
			requires: {tech: ["nanotechnology"]}
		}, {
			name: "antimatter",
			prices: [
				{name: "science", val: 500000},
				{name: "relic",   val: 1}
			],
			// unlocks: {tech: ["terraformation"], upgrades: ["amReactors", "amBases", "amDrive", "amFission"]},
			requires: {tech: ["superconductors"]}
		}, {
			name: "terraformation",
			prices: [
				{name: "science", val: 750000},
				{name: "relic",   val: 5}
			],
			// unlocks: {tech: ["hydroponics"], space: [{planet: "yarn", bld: "terraformingStation"}]},
			requires: {tech: ["antimatter"]}
		}, {
			name: "hydroponics",
			prices: [
				{name: "science", val: 1000000},
				{name: "relic",   val: 25}
			],
			// unlocks: {tech: "exogeophysics", space: [{planet: "yarn", bld: "hydroponics"}]},
			requires: {tech: ["terraformation"]}
		}, {
			name: "exogeophysics",
			prices: [
				{name: "science", val: 25000000},
				{name: "relic",   val: 500}
			],
			requires: {tech: ["hydroponics"]}
		}, {
			name: "particlePhysics",
			prices: [
				{name: "science",   val: 185000},
				{name: "blueprint", val: 135}
			],
			// unlocks: {buildings: ["accelerator"], tech: ["chronophysics", "dimensionalPhysics"], upgrades: ["enrichedUranium", "railgun"]},
			requires: {tech: ["nuclearFission"]}
		}, {
			name: "dimensionalPhysics",
			prices: [
				{name: "science", val: 235000}
			],
			// unlocks: {upgrades: ["energyRifts", "lhc"]},
			requires: {tech: ["particlePhysics"]}
		}, {
			name: "chronophysics",
			prices: [
				{name: "science",     val: 250000},
				{name: "timeCrystal", val: 5}
			],
			// unlocks: {buildings: ["chronosphere"], tech: ["tachyonTheory"], upgrades: ["stasisChambers", "fluxCondensator"]},
			requires: {tech: ["particlePhysics"]}
		}, {
			name: "tachyonTheory",
			prices: [
				{name: "science",     val: 750000},
				{name: "timeCrystal", val: 25},
				{name: "relic",       val: 1}
			],
			// unlocks: {tech: ["voidSpace"], upgrades: ["tachyonAccelerators", "chronoforge", "chronoEngineers"]},
			requires: {tech: ["chronophysics"]}
		}, {
			name: "cryptotheology",
			prices: [
				{name: "science", val: 650000},
				{name: "relic",   val: 5}
			],
			// unlocks: {upgrades: ["relicStation"]},
			requires: {tech: ["theology"]}
		}, {
			name: "voidSpace",
			prices: [
				{name: "science",     val: 800000},
				{name: "timeCrystal", val: 30},
				{name: "void",        val: 100}
			],
			// unlocks: {tech: ["paradoxalKnowledge"], upgrades: ["voidAspiration"], voidSpace: ["cryochambers"], challenges: ["atheism"]},
			requires: {tech: ["tachyonTheory"]}
		}, {
			name: "paradoxalKnowledge",
			prices: [
				{name: "science",     val: 1000000},
				{name: "timeCrystal", val: 40},
				{name: "void",        val: 250}
			],
			// unlocks: {upgrades: ["distorsion"], chronoforge: ["ressourceRetrieval"], voidSpace: ["chronocontrol", "voidResonator"]},
			requires: {tech: ["voidSpace"]}
		}
	],

	/**
	 * If policy is blocked, it means some conflicting policy was researched first
	 * Once policy is blocked, there is no way to unlock it other than reset
	 */
	policiesData: [
		{
			name: "liberty",
			prices: [
				{name: "culture", val: 150}
			],
			requires: {tech: ["writing"]},
			blockedBy: ["tradition"],
			// unlocks: {policies: ["authocracy", "republic"]},
			// blocks: ["tradition"],
			effects: {
				"maxKittens": 0
			},
			calculateEffects: function (self, game) {
				self.effects["maxKittens"] = game.ironWill ? 0 : 1;
			}
		}, {
			name: "tradition",
			prices: [
				{name: "culture", val: 150}
			],
			requires: {tech: ["writing"]},
			blockedBy: ["liberty"]
			// unlocks: {policies: ["authocracy", "monarchy"]},
			// blocks: ["liberty"]
		},
		//----------------	classical age --------------------
		{
			name: "monarchy",
			prices: [
				{name: "culture", val: 1500}
			],
			requires: {policies: ["tradition"]},
			blockedBy: ["authocracy", "republic"],
			// unlocks: {policies: ["liberalism", "fascism"]},
			// blocks: ["authocracy", "republic", "communism"],
			upgrades: {buildings: ["factory"]},
			effects: {
				"goldPolicyRatio": -0.1
			}
		}, {
			name: "authocracy",
			label: "policy.autocracy.label",
			description: "policy.autocracy.desc",
			prices: [
				{name: "culture", val: 1500}
			],
			requires: {policies: ["liberty", "tradition"]},
			blockedBy: ["monarchy", "republic"],
			// unlocks: {policies: ["communism", "fascism", "socialism"]},
			// blocks: ["monarchy", "republic", "liberalism"],
			effects: {
				"rankLeaderBonusConversion": 0
			},
			calculateEffects: function (self, game) {
				var uncappedHousing = 0;
				for (var i = 0; i < game.bld.buildingGroups.length; i++) {
					if (game.bld.buildingGroups[i].name === "population") {
						for (var k = 0; k < game.bld.buildingGroups[i].buildings.length; k++) {
							if (!game.resPool.isStorageLimited(game.bld.getPrices(game.bld.buildingGroups[i].buildings[k]))) {
								uncappedHousing += 1;
							}
						}
						break;
					}
				}
				self.effects["rankLeaderBonusConversion"] = 0.004 * uncappedHousing;
			}
		}, {
			name: "republic",
			prices: [
				{name: "culture", val: 1500}
			],
			requires: {policies: ["liberty"]},
			blockedBy: ["monarchy", "authocracy"],
			// unlocks: {policies: ["liberalism", "communism", "socialism"]},
			// blocks: ["monarchy", "authocracy", "fascism"],
			effects: {
				"boostFromLeader": 0.01
			}
		},
		//----------------	meme --------------------
		{
			name: "socialism",
			prices: [
				{name: "culture", val: 7500}
			],
			requires: {policies: ["authocracy", "republic"]}
		},
		//----------------	industrial age --------------------
		{
			name: "liberalism",
			prices: [
				{name: "culture", val: 15000}
			],
			requires: function (game) {
				return ((game.science.getPolicy("monarchy").owned() || game.science.getPolicy("republic").owned()) &&
					game.bld.get("factory").owned());
			},
			blockedBy: ["authocracy", "communism", "fascism"],
			// blocks: ["communism", "fascism"],
			effects: {
				"goldCostReduction": 0.2,
				"globalRelationsBonus": 10
			}
		}, {
			name: "communism",
			prices: [
				{name: "culture", val: 15000}
			],
			requires: function (game) {
				return ((game.science.getPolicy("republic").owned() || game.science.getPolicy("authocracy").owned()) &&
					game.bld.get("factory").owned());
			},
			blockedBy: ["monarchy", "liberalism", "fascism"],
			// blocks: ["liberalism", "fascism"],
			effects: {
				"factoryCostReduction": 0.3,
				"coalPolicyRatio": 0.25,
				"ironPolicyRatio": 0.25,
				"titaniumPolicyRatio": 0.25
			}
		}, {
			name: "fascism",
			prices: [
				{name: "culture", val: 15000}
			],
			requires: function (game) {
				return ((game.science.getPolicy("monarchy").owned() || game.science.getPolicy("authocracy").owned()) &&
					game.bld.get("factory").owned());
			},
			blockedBy: ["republic", "liberalism", "communism"],
			// blocks: ["liberalism", "communism"],
			effects: {
				"logHouseCostReduction": 0.5
			}
		},
		//----------------	information age --------------------
		{
			name: "technocracy",
			prices: [
				{name: "culture", val: 150000}
			],
			requires: {spaceMission: ["duneMission"]},
			blockedBy: ["theocracy", "expansionism"],
			// blocks: ["theocracy", "expansionism"],
			effects: {
				"technocracyScienceCap": 0.2
			}
		}, {
			name: "theocracy",
			prices: [
				{name: "culture", val: 150000}
			],
			requires: {spaceMission: ["duneMission"]},
			requiredLeaderJob: "priest",
			blockedBy: ["technocracy", "expansionism"],
			// blocks: ["technocracy", "expansionism"],
			effects: {
				"faithPolicyRatio": 0.2
			}
		}, {
			name: "expansionism",
			prices: [
				{name: "culture", val: 150000}
			],
			requires: {spaceMission: ["duneMission"]},
			blockedBy: ["technocracy", "theocracy"],
			// blocks: ["technocracy", "theocracy"],
			effects: {
				"unobtainiumPolicyRatio": 0.15
			}
		},
		//----------------	tier 5 age --------------------
		{
			name: "transkittenism",
			prices: [
				{name: "culture", val: 1500000}
			],
			// requires trading with the elders so
			blockedBy: ["necrocracy", "radicalXenophobia"],
			// blocks: ["necrocracy", "radicalXenophobia"],
			effects: {
				"aiCoreProductivness": 1,
				"aiCoreUpgradeBonus": 0.1
			}
		}, {
			name: "necrocracy",
			prices: [
				{name: "culture", val: 1500000}
			],
			// requires trading with the elders so
			blockedBy: ["transkittenism", "radicalXenophobia"],
			// blocks: ["transkittenism", "radicalXenophobia"],
			effects: {
				"blsProductionBonus": 0.001,
				"leviathansEnergyModifier": 0.05
			}
		}, {
			name: "radicalXenophobia",
			prices: [
				{name: "culture", val: 1500000}
			],
			// requires trading with the elders so
			blockedBy: ["transkittenism", "necrocracy"],
			// blocks: ["transkittenism", "necrocracy"],
			effects: {
				"holyGenocideBonus": 1
			}
		},
		//----------------    Foreign Policy --------------------
		{
			name: "diplomacy",
			prices: [
				{name: "culture", val: 1600}
			],
			requires: {tech: ["currency"]},
			blockedBy: ["isolationism"],
			// unlocks: {policies: ["knowledgeSharing", "culturalExchange"]},
			// blocks: ["isolationism"],
			effects: {
				"tradeCatpowerDiscount": 5
			}
		}, {
			name: "isolationism",
			prices: [
				{name: "culture", val: 1600}
			],
			requires: {tech: ["currency"]},
			blockedBy: ["diplomacy"],
			// unlocks: {policies: ["bigStickPolicy", "cityOnAHill"]},
			// blocks: ["diplomacy"],
			effects: {
				"tradeGoldDiscount": 1
			}
		}, {
			name: "zebraRelationsAppeasement",
			prices: [
				{name: "culture", val: 5000}
			],
			// requires trading with zebras so
			blockedBy: ["zebraRelationsBellicosity"],
			// blocks: ["zebraRelationsBellicosity"],
			effects: {
				"goldPolicyRatio": -0.05,
				"zebraRelationModifier": 15
			}
		}, {
			name: "zebraRelationsBellicosity",
			prices: [
				{name: "culture", val: 5000}
			],
			// requires trading with zebras so
			blockedBy: ["zebraRelationsAppeasement"],
			// blocks: ["zebraRelationsAppeasement"],
			effects: {
				"nonZebraRelationModifier": 5,
				"zebraRelationModifier": -10
			}
		}, {
			name: "knowledgeSharing",
			prices: [
				{name: "culture", val: 4000}
			],
			requires: function (game) {
				return game.science.getPolicy("diplomacy").owned() && game.science.get("astronomy").owned();
			},
			blockedBy: ["culturalExchange"],
			// blocks: ["culturalExchange"],
			effects: {
				"sciencePolicyRatio": 0.05
			}
		}, {
			name: "culturalExchange",
			prices: [
				{name: "culture", val: 4000}
			],
			requires: function (game) {
				return game.science.getPolicy("diplomacy").owned() && game.science.get("astronomy").owned();
			},
			blockedBy: ["knowledgeSharing"],
			// blocks: ["knowledgeSharing"],
			effects: {
				"culturePolicyRatio": 0.05
			}
		}, {
			name: "bigStickPolicy",
			prices: [
				{name: "culture", val: 4000}
			],
			requires: function (game) {
				return game.science.getPolicy("isolationism").owned() && game.science.get("astronomy").owned();
			},
			blockedBy: ["cityOnAHill"],
			// blocks: ["cityOnAHill"],
			effects: {
				"embassyCostReduction": 0.15
			}
		}, {
			name: "cityOnAHill",
			prices: [
				{name: "culture", val: 4000}
			],
			requires: function (game) {
				return game.science.getPolicy("isolationism").owned() && game.science.get("astronomy").owned();
			},
			blockedBy: ["bigStickPolicy"],
			// blocks: ["bigStickPolicy"],
			effects: {
				"onAHillCultureCap": 0.05
			}
		}, {
			name: "outerSpaceTreaty",
			prices: [
				{name: "culture", val: 10000}
			],
			requires: {tech: ["sattelites"], spaceBuilding: ["sattelite"]},
			blockedBy: ["militarizeSpace"],
			// blocks: ["militarizeSpace"],
			effects: {
				"globalRelationsBonus": 10
			}
		}, {
			name: "militarizeSpace",
			prices: [
				{name: "culture", val: 10000}
			],
			requires: {tech: ["sattelites"], spaceBuilding: ["sattelite"]},
			blockedBy: ["outerSpaceTreaty"],
			// blocks: ["outerSpaceTreaty"],
			effects: {
				"satelliteSynergyBonus": 0.1
			}
		},
		//----------------   Philosophy   --------------------
		{
			name: "stoicism",
			prices: [
				{name: "culture", val: 2500}
			],
			requires: {tech: ["philosophy"]},
			blockedBy: ["epicurianism"],
			// unlocks: {policies: ["rationality", "mysticism"]},
			// blocks: ["epicurianism"],
			effects: {
				"luxuryConsuptionReduction": 0.5
			}
		}, {
			name: "epicurianism",
			prices: [
				{name: "culture", val: 2500}
			],
			requires: {tech: ["philosophy"]},
			blockedBy: ["stoicism"],
			// unlocks: {policies: ["rationality", "mysticism"]},
			// blocks: ["stoicism"],
			effects: {
				"luxuryHappinessBonus": 1
			}
		}, {
			name: "rationality",
			prices: [
				{name: "culture", val: 3000}
			],
			requires: {policies: ["stoicism", "epicurianism"]},
			blockedBy: ["mysticism"],
			// blocks: ["mysticism"],
			effects: {
				"sciencePolicyRatio": 0.05,
				"ironPolicyRatio": 0.05
			}
		}, {
			name: "mysticism",
			prices: [
				{name: "culture", val: 3000}
			],
			requires: {policies: ["stoicism", "epicurianism"]},
			blockedBy: ["rationality"],
			// blocks: ["rationality"],
			effects: {
				"culturePolicyRatio": 0.05,
				"faithPolicyRatio": 0.05
			}
		},
		//----------------   Environmental Policy   --------------------
		{
			name: "stripMining",
			prices: [
				{name: "science", val: 2000}
			],
			requires: {tech: ["engineering"]},
			blockedBy: ["clearCutting", "environmentalism"],
			// unlocks: {policies: ["sustainability", "fullIndustrialization"]},
			// blocks: ["clearCutting", "environmentalism"],
			effects: {
				"environmentUnhappiness": -2,
				"mineralsPolicyRatio": 0.3
			}
		}, {
			name: "clearCutting",
			prices: [
				{name: "science", val: 2000}
			],
			requires: {tech: ["engineering"]},
			blockedBy: ["stripMining", "environmentalism"],
			// unlocks: {policies: ["sustainability", "fullIndustrialization"]},
			// blocks: ["stripMining", "environmentalism"],
			effects: {
				"environmentUnhappiness": -2,
				"woodPolicyRatio": 0.3
			}
		}, {
			name: "environmentalism",
			prices: [
				{name: "culture", val: 2000}
			],
			requires: {tech: ["engineering"]},
			blockedBy: ["stripMining", "clearCutting"],
			// unlocks: {policies: ["conservation", "openWoodlands"]},
			// blocks: ["stripMining", "clearCutting"],
			effects: {
				"environmentHappinessBonus": 3
			}
		}, {
			name: "sustainability",
			prices: [
				{name: "culture", val: 10000}
			],
			requires: function (game) {
				return ((game.science.getPolicy("stripMining").owned() || game.science.getPolicy("clearCutting").owned()) &&
					game.science.get("industrialization").owned());
			},
			blockedBy: ["fullIndustrialization"],
			// blocks: ["fullIndustrialization"],
			effects: {
				"environmentHappinessBonus": 5
			}
		}, {
			name: "fullIndustrialization",
			prices: [
				{name: "culture", val: 10000}
			],
			requires: function (game) {
				return ((game.science.getPolicy("stripMining").owned() || game.science.getPolicy("clearCutting").owned()) &&
					game.science.get("industrialization").owned());
			},
			blockedBy: ["sustainability"],
			// blocks: ["sustainability"],
			upgrades: {buildings: ["factory"]},
			effects: {
				"environmentFactoryCraftBonus": 0.05
			}
		}, {
			name: "conservation",
			prices: [
				{name: "culture", val: 10000}
			],
			requires: function (game) {
				return game.science.getPolicy("environmentalism").owned() && game.science.get("ecology").owned();
			},
			blockedBy: ["openWoodlands"],
			// blocks: ["openWoodlands"],
			effects: {
				"environmentHappinessBonus": 5
			}
		}, {
			name: "openWoodlands",
			prices: [
				{name: "culture", val: 10000}
			],
			requires: function (game) {
				return game.science.getPolicy("environmentalism").owned() && game.science.get("ecology").owned();
			},
			blockedBy: ["conservation"],
			// blocks: ["conservation"],
			effects: {
				"woodPolicyRatio":     0.125,
				"mineralsPolicyRatio": 0.125
			}
		}/*, {
			name: "spaceBasedTerraforming",
			prices: [
				{name: "culture", val: 45000}
			],
			blockedBy: ["clearSkies"],
			// blocks: ["clearSkies"],
			effects: {
				"mysticismBonus" : 0.05
			}
		}, {
			name: "clearSkies",
			prices: [
				{name: "culture", val: 45000}
			],
			blockedBy: ["spaceBasedTerraforming"],
			// blocks: ["spaceBasedTerraforming"]
			effects: {
				"mysticismBonus" : 0.05
			}
		}*/
	],

	tabName: "Science",
	leaderBonuses: ["scientist"],
	getVisible: function () {
		return this.game.bld.get("library").owned() || this.get("calendar").owned() || this.get("chronophysics").owned();
	},

	effectsBase: {
		"environmentHappinessBonusModifier": 1,
		"environmentUnhappinessModifier":    1
	},

	getEffectBase: function (name) {
		return num(this.effectsBase[name]);
	},

	techs: null,
	techsByName: null,

	policies: null,
	policiesByName: null,

	hideResearched: false,
	policyToggleBlocked: false,
	policyToggleResearched: false,

	constructor: function () {
		this.i18nKeys = {tabName: "tab.name.science"};
		this.registerMetaItems(this.techData, classes.KGSaveEdit.ScienceMeta, "techs");
		this.registerMetaItems(this.policiesData, classes.KGSaveEdit.PolicyMeta, "policies");
		this.addMeta(this.techs);
		this.addMeta(this.policies);
	},

	renderTabBlock: function () {
		var div = dojo.create("div", {class: "bottom-margin"}, this.tabBlockNode);
		this.game._createCheckbox($I("science.toggleResearched.label"), div, this, "hideResearched");

		this.techsBlock = dojo.create("table", {
			id: "techsBlock",
			class: "bottom-margin",
			innerHTML: '<tr><th colspan="2">' + $I("techs.panel.label") + "</th></tr>"
		}, this.tabBlockNode);

		div = dojo.create("div", {class: "bottom-margin", innerHTML: " &nbsp; "}, this.tabBlockNode);
		this.game._createCheckbox($I("science.policyToggleResearched.label"), div, this, "policyToggleResearched", "first");
		this.game._createCheckbox($I("science.policyToggleBlocked.label"), div, this, "policyToggleBlocked");

		this.policiesBlock = dojo.create("table", {
			id: "policiesBlock",
			class: "bottom-margin",
			innerHTML: '<tr><th colspan="2">' + $I("policy.panel.label") + "</th></tr>"
		}, this.tabBlockNode);
	},

	render: function () {
		for (var i = 0, len = this.techs.length; i < len; i++) {
			var tech = this.techs[i];
			tech.render();
			dojo.place(tech.domNode, this.techsBlock);
		}

		for (i = 0, len = this.policies.length; i < len; i++) {
			var policy = this.policies[i];
			policy.render();
			dojo.place(policy.domNode, this.policiesBlock);
		}
	},

	update: function () {
		this.game.callMethods(this.techs, "update", this.hideResearched);
		this.game.callMethods(this.policies, "update");
	},

	get: function (name) {
		var tech = this.techsByName[name];
		if (name && !tech) {
			console.error("Tech not found", name);
		}
		return tech;
	},

	getPolicy: function (name) {
		var policy = this.policiesByName[name];
		if (name && !policy) {
			console.error("Policy not found", name);
		}
		return policy;
	},

	save: function (saveData) {
		saveData.science = {
			hideResearched: this.hideResearched,
			policyToggleResearched: this.policyToggleResearched,
			policyToggleBlocked: this.policyToggleBlocked,
			techs: this.game.filterMetadata(this.techs, ["name", "unlocked", "researched"]),
			policies: this.game.filterMetadata(this.policies, ["name", "unlocked", "blocked", "researched"])
		};
	},

	load: function (saveData) {
		if (saveData.science) {
			this.game.setCheckbox(this.hideResearchedNode, saveData.science.hideResearched);
			this.policyToggleResearched = saveData.science.policyToggleResearched;
			this.policyToggleBlocked = saveData.science.policyToggleBlocked;

			this.loadMetadata(saveData, "science.techs", "get", null, true);
			this.loadMetadata(saveData, "science.policies", "getPolicy", null, true);
		}
	},

	// console-only shortcut
	unlockAllTechs: function () {
		for (var i = this.techs.length - 1; i >= 0; i--) {
			var tech = this.techs[i];
			tech.set("unlocked", true);
		}
		this.game.update();
		return true;
	},

	researchAllTechs: function () {
		for (var i = this.techs.length - 1; i >= 0; i--) {
			var tech = this.techs[i];
			tech.set("unlocked", true);
			tech.set("researched", true);
		}
		this.game.update();
		return true;
	}
});


dojo.declare("classes.KGSaveEdit.ScienceMeta", classes.KGSaveEdit.UpgradeMeta, {
	upgradeType: "tech",

	constructor: function () {
		this.i18nKeys = {
			label: "science." + this.name + ".label",
			description: "science." + this.name + ".desc",
			effectDesc: "science." + this.name + ".effectDesc"
		};
		if (this.flavor) {
			this.i18nKeys.flavor = "science." + this.name + ".flavor";
		}
	},

	getDescription: function () {
		if (this.researched) {
			return this.description + "<br>Effect: " + this.effectDesc;
		}
		return this.description;
	},

	getPrices: function () {
		var prices = this.prices ? dojo.clone(this.prices) : [];
		return this.game.village.getEffectLeader("scientist", prices);
	}
});


dojo.declare("classes.KGSaveEdit.PolicyMeta", classes.KGSaveEdit.UpgradeMeta, {
	upgradeType: "policies",

	blocked: false,

	constructor: function () {
		this.i18nKeys = {
			label: this.label || "policy." + this.name + ".label",
			description: this.description || "policy." + this.name + ".desc"
		};
		if (this.flavor) {
			this.i18nKeys.flavor = "policy." + this.name + ".flavor";
		}
	},

	getName: function () {
		var name = this.label || this.name;
		if (this.blocked) {
			return name + " " + $I("btn.blocked.capital");
		}
		if (this.researched) {
			return name + " " + $I("btn.complete.capital");
		}
		return name;
	},

	handler: function () {
		if (this.requiredLeaderJob && this.game.village.leader) {
			this.game.village.renderGovernment();
		}
		// this.game.calculateAllEffects();
	},

	update: function () {
		// dojo.toggleClass(this.domNode, "metaOwned", this.researched);

		this.blocked = false;
		if (this.blockedBy) {
			for (var i = 0; i < this.blockedBy.length; i++) {
				var blockingPolicy = this.game.science.getPolicy(this.blockedBy[i]);
				if (blockingPolicy.researched) {
					this.blocked = true;
					break;
				}
			}
		}

		var hideme = (this.game.science.policyToggleBlocked && this.blocked) || (this.game.science.policyToggleResearched && this.researched);
		if (!hideme && this.hidden) {
			hideme = !this.unlocked && !this.researched;
		}
		dojo.toggleClass(this.domNode, "collapsed", Boolean(hideme));

		var req = this.game.checkRequirementsOR(this);
		if (req) {
			if (!this.unlocked) {
				this.unlockedNode.checked = true;
				this.unlocked = true;
			}
		} else {
			if (this.unlocked !== this.unlockedNode.prevChecked) {
				this.unlockedNode.checked = this.unlockedNode.prevChecked;
				this.unlocked = this.unlockedNode.checked;
			}
		}

		dojo.toggleClass(this.nameNode, "spoiler", !this.unlocked);
		this.game.toggleDisabled(this.unlockedNode, req);
		this.game.toggleDisabled(this.researchedNode, this.blocked && !this.researched);
		this.updateEnabled();

		// if (this.calculateEffects) {
		// 	this.calculateEffects(this, this.game);
		// }
	}
});

});

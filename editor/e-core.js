/* global dojo, require, classes, $I */

function num(value) {
	if (!isFinite(value)) {
		return 0;
	}
	return Number(value) || 0;
}

require(["dojo/on", "dojo/mouse"], function (on, mouse) {
"use strict";

/**
 * Super class. Contains a method to set any property and also update the associated form element, if any.
 * Also has a method for updating translations.
 */
dojo.declare("classes.KGSaveEdit.core", null, {
	set: function (key, value) {
		if (this[key + "Node"] && this[key + "Node"].dataProp === key) {
			var args = [].slice.call(arguments, 2);
			args = [this[key + "Node"], value].concat(args);
			value = this.game.setEle.apply(this.game, args);
		}
		this[key] = value;
		return value;
	},

	seti18n: function () {
		if (this.i18nKeys) {
			for (var key in this.i18nKeys) {
				this[key] = $I(this.i18nKeys[key]);
			}
		}
	}
});

dojo.declare("classes.KGSaveEdit.UI.Tab", classes.KGSaveEdit.core, {
	game: null,

	tabNode: null,
	tabBlockNode: null,
	tabWrapper: null,
	isVisible: true,

	tabName: "Undefined",
	leaderBonuses: null,

	constructor: function (game) {
		this.game = game;
	},

	getVisible: function () {
		return true;
	},

	renderTab: function () {
		var self = this;
		self.seti18n();

		//wrap tab link for css
		self.tabWrapper = dojo.create("span", {
			class: "wrapper separated" + (self.isVisible ? "" : " spoiler") + (self.tabNodeClass ? " " + self.tabNodeClass : "")
		});

		self.tabNode = dojo.create("a", {
			class: "tab " + self.tabName,
			href: "#"
		}, self.tabWrapper);
		self.tabNameNode = dojo.create("span", {
			class: "tabName",
			innerHTML: self.tabName
		}, self.tabNode);

		self.tabBlockNode = dojo.create("div", {
			class: "tabBlock hidden" + (self.tabBlockClass ? " " + self.tabBlockClass : "")
		});

		on(self.tabNode, "click", function (ev) {
			ev.preventDefault();
			self.game.openTab(self);
		});

		if (self.game.activeTab === self) {
			dojo.addClass(self.tabNode, "activeTab");
			dojo.removeClass(self.tabBlockNode, "hidden");
		}
	},

	renderTabBlock: function () { },

	updateTab: function () {
		if (this.getTabName) {
			this.tabNameNode.innerHTML = this.getTabName();
		}

		this.isVisible = this.getVisible();
		dojo.toggleClass(this.tabWrapper, "spoiler", !this.isVisible);
		var showBonus = false;
		if (this.leaderBonuses) {
			var leader = this.game.village.getLeader();

			for (var i = this.leaderBonuses.length - 1; i >= 0; i--) {
				var bonusName = this.leaderBonuses[i];
				var isLeaderBonus = leader && leader.trait.name === bonusName;
				dojo.toggleClass(this.tabNameNode, bonusName, isLeaderBonus);
				showBonus = showBonus || isLeaderBonus;
			}
		}
		dojo.toggleClass(this.tabNameNode, "traitLeaderBonus", showBonus);
	},

	onTabOpen: function () { }
});

dojo.declare("classes.KGSaveEdit.MetaManager", classes.KGSaveEdit.core, {
	game: null,

	constructor: function (game) {
		this.game = game;
	},

	/**
	 * Loops through `dataArray`, and creates new `ClassObj`s out of its data
	 * Creates array/itemByName objects for storing the new items if necessary
	 * If a function is passed as `fn`, calls it with `this` set to the manager
	 */
	registerMetaItems: function (dataArray, ClassObj, key, fn) {
		var arr = this[key] || [];
		var byName = this[key + "ByName"] || {};
		this[key] = arr;
		this[key + "ByName"] = byName;

		for (var i = 0; i < dataArray.length; i++) {
			var item = new ClassObj(this.game, dataArray[i]);
			item.metaObj = this;
			arr.push(item);
			byName[item.name] = item;

			if (fn) {
				fn.call(this, item);
			}
		}
	},

	loadMetadata: function (saveData, path, getFn, loadFn, storeExtra) {
		var saveArr = this.game.resolveObjPath(saveData, path);
		if (!saveArr || !saveArr.length) {
			return;
		}

		if (!dojo.isFunction(loadFn)) {
			loadFn = null;
		}

		for (var i = 0; i < saveArr.length; i++) {
			var saveMeta = saveArr[i];
			if (saveMeta && saveMeta.name) {
				var meta = this[getFn](saveMeta.name);
				if (meta) {
					if (loadFn) {
						loadFn.call(this, meta, saveMeta);
					} else if ("load" in meta) {
						meta.load(saveMeta);
					}
				} else if (storeExtra) {
					this.game.extrasTab.storeExtraData(path, saveMeta, i);
				}
			}
		}
	}
});

dojo.declare("classes.KGSaveEdit.Manager", classes.KGSaveEdit.MetaManager, {
	game: null,
	effectNames: null,
	effectsCached: null,
	meta: null,

	constructor: function (game) {
		this.game = game;

		this.effectsCached = {};
		this.effectNames = {};
		this.meta = [];

		this.registerEffectNames(this.effectsBase);
	},

	render: function () {
		this.seti18n();
	},

	registerEffectNames: function (effects) {
		if (effects) {
			for (var effectName in effects) {
				this.effectNames[effectName] = true;
				this.game.globalEffectNames[effectName] = true;
			}
		}
	},

	addMeta: function (metaList) {
		this.meta.push(metaList);
		for (var i = 0; i < metaList.length; i++) {
			this.registerEffectNames(metaList[i].get("effects"));
		}
	},

	getMeta: function (name, metadata) {
		for (var i = metadata.length - 1; i >= 0; i--) {
			var meta = metadata[i];

			if (meta.name === name) {
				return meta;
			}
		}
		return null;
	},

	invalidateCachedEffects: function () {
		this.effectsCached = {};
		this.calculateEffectsBase();
	},

	calculateEffectsBase: function () { },

	getEffect: function (effectName) {
		return num(this.getEffectBase(effectName)) + num(this.getEffectCached(effectName));
	},

	getEffectBase: function () {
		return 0;
	},

	getEffectCached: function (effectName) {
		if (!this.effectNames[effectName]) {
			return 0;
		}

		var cached = this.effectsCached[effectName];
		if (!isNaN(cached)) {
			return cached;
		}

		var effect = 0;
		for (var i = this.meta.length - 1; i >= 0; i--) {
			var effectMeta = this.getMetaEffect(effectName, this.meta[i]);
			effect += effectMeta;
		}

		this.effectsCached[effectName] = effect;
		return effect;
	},

	getMetaEffect: function (effectName, metadata) {
		var totalEffect = 0;
		if (!metadata.length) {
			return 0;
		}

		for (var i = metadata.length - 1; i >= 0; i--) {
			totalEffect += num(metadata[i].getEffect(effectName));
		}

		return totalEffect || 0;
	}
});


dojo.declare("classes.KGSaveEdit.GenericItem", classes.KGSaveEdit.core, {
	game: null,

	name: "Undefined",

	constructor: function (game, data) {
		this.game = game;
		dojo.mixin(this, data);
		this.metaData = data;
	}
});


dojo.declare("classes.KGSaveEdit.TooltipItem", classes.KGSaveEdit.core, {
	getTooltip: function () {
		return "Unimplemented";
	},

	getTooltipOffset: function (node) {
		var pos = dojo.position(node);
		return {
			left: pos.x + pos.w + 20,
			top: pos.y
		};
	},

	registerTooltip: function (node) {
		if (!node) {
			return;
		}

		var self = this;
		var tooltip = dojo.byId("tooltipBlock");

		var updateTooltip = function () {
			tooltip.removeAttribute("style");
			tooltip.innerHTML = "";

			var viewPos = dojo.position(tooltip.parentNode);
			self.getTooltip(node);

			if (dojo.hasClass(tooltip, "hidden")) {
				return;
			}

			var pos = self.getTooltipOffset(node);
			pos.top = Math.abs(pos.top - viewPos.y);

			//keep tooltip from moving outside viewing area
			var tooltipPos = dojo.position(tooltip);
			pos.top = Math.min(pos.top, viewPos.h - 25 - tooltipPos.h);

			pos.left = Math.min(pos.left, viewPos.w - 25 - tooltipPos.w);

			tooltip.style.top = pos.top + "px";
			tooltip.style.left = pos.left + "px";
		};

		on(node, mouse.enter, function () {
			self.game.tooltipUpdateFunc = updateTooltip;
			updateTooltip();
		});

		on(node, mouse.leave, function () {
			tooltip.removeAttribute("style");
			tooltip.innerHTML = "";
			dojo.addClass(tooltip, "hidden");
			self.game.tooltipUpdateFunc = null;
		});
	}
});


dojo.declare("classes.KGSaveEdit.MetaItem", [classes.KGSaveEdit.GenericItem, classes.KGSaveEdit.TooltipItem], {
	multiplyEffects: false,

	get: function (key) {
		return this[key];
	},

	render: function () {
		this.seti18n();
	},

	owned: function () {
		return false;
	},

	getDescription: function () {
		return this.description + (this.desc2 ? "\n" + this.desc2 : "");
	},

	getEffect: function () {
		return 0;
	},

	getEffects: function () {
		return this.get("effects") || {};
	},

	getNextEffectValue: function (effectName) {
		if (!this.updateEffects) {
			return undefined;
		}

		this.on++;
		this.updateEffects(this, this.game);
		var nextEffectValue = this.effects[effectName];
		this.on--;
		this.updateEffects(this, this.game);
		return nextEffectValue;
	},

	getPrices: function () {
		return this.prices ? dojo.clone(this.prices) : [];
	},

	update: function () { },

	updateEnabled: function () {
		var prices = this.getPrices() || [];
		var limited = this.game.resPool.isStorageLimited(prices);
		dojo.toggleClass(this.nameNode, "limited", this.game.opts.highlightUnavailable && limited);
		dojo.toggleClass(this.nameNode, "btnDisabled", limited || !this.game.resPool.hasRes(prices));
	},

	registerHighlight: function (node) {
		var self = this;
		on(node, mouse.enter, function () {
			dojo.query(".highlited").removeClass("highlited");

			var prices = self.getPrices();
			var resPool = self.game.resPool;
			if (prices) {
				for (var i = prices.length - 1; i >= 0; i--) {
					var res = resPool.get(prices[i].name);
					if (res) {
						dojo.addClass(res.domNode, "highlited");
					}
				}
			}
		});

		on(node, mouse.leave, function () {
			dojo.query(".highlited").removeClass("highlited");
		});
	},

	getTooltip: function () {
		var tooltip = dojo.byId("tooltipBlock");
		tooltip.className = "button_tooltip";

		if (this.getName) {
			dojo.create("div", {
				class: "tooltipName",
				innerHTML: this.getName()
			}, tooltip);
		}

		var descBlock;
		if (this.description || this.getDescription) {
			descBlock = dojo.create("div", {
				class: "tooltipDesc",
				innerHTML: this.getDescription ? this.getDescription() : this.description
			}, tooltip);
		}

		if (this.isAutomationEnabled !== undefined) { //TODO: use proper metadata flag
			dojo.create("div", {
				innerHTML: this.isAutomationEnabled ? $I("btn.aon.tooltip") : $I("btn.aoff.tooltip"),
				class: "tooltipDesc small" + (this.isAutomationEnabled ? " auto-on" : " auto-off")
			}, tooltip);
		}

		if (
			this.effects && this.effects["cathPollutionPerTickProd"] > 0 &&
			this.game.science.get("chemistry").owned() && !this.game.opts.disablePollution
		) {
			dojo.create("div", {
				innerHTML: $I("btn.pollution.tooltip"),
				class: "tooltipDesc small pollution"
			}, tooltip);
		}

		var prices = this.getPrices ? this.getPrices() : this.prices;
		if (prices) {
			if (descBlock) {
				dojo.addClass(descBlock, "tooltipDescBottom");
			}
			this.game.renderPrices(tooltip, prices);
		}

		if (!this.hideEffects) {
			this.game.renderEffects(tooltip, this);
		}

		if (this.flavor) {
			dojo.create("div", {
				class: "tooltipFlavor",
				innerHTML: this.flavor
			}, tooltip);
		}
	}
});


dojo.declare("classes.KGSaveEdit.MetaItemStackable", classes.KGSaveEdit.MetaItem, {
	val: 0,
	on: 0,
	togglable: false,
	togglableOnOff: false,

	multiplyEffects: true,

	owned: function () {
		return this.val > 0;
	},

	getOn: function () {
		if (!this.togglable) {
			return this.val;
		} else if (this.togglableOnOff) {
			return this.on > 0 ? this.val : 0;
		}
		var on = Math.min(this.on, this.val) || 0;
		if (typeof this.limitBuild === "number") {
			on = Math.min(on, this.limitBuild);
		}
		return on;
	},

	getName: function () {
		var label = this.get("label");
		if (this.owned()) {
			if (this.togglable && !this.togglableOnOff) {
				return label + " (" + this.getOn() + "/" + this.val + ")";
			}
			return label + " (" + this.val + ")";
		}
		return label;
	},

	getEffect: function (effectName) {
		var effects = this.getEffects();
		return num(effects[effectName] * this.getOn());
	},

	getPrices: function () {
		var prices = dojo.clone(this.prices) || [];
		var ratio = this.priceRatio || 1;

		var pricesDiscount = this.game.getLimitedDR((this.game.getEffect(this.name + "CostReduction")), 1);
		var priceModifier = 1 - pricesDiscount;

		for (var i = 0; i < prices.length; i++) {
			var resPriceDiscount = this.game.getEffect(prices[i].name + "CostReduction");
			resPriceDiscount = this.game.getLimitedDR(resPriceDiscount, 1);
			var resPriceModifier = 1 - resPriceDiscount;
			prices[i].val *= Math.pow(ratio, this.val) * resPriceModifier * priceModifier;
		}
		return prices;
	},

	updateEnabled: function () {
		var prices = this.getPrices() || [];
		var limited = this.game.resPool.isStorageLimited(prices);
		var buildLimited = typeof this.limitBuild === "number" && this.limitBuild <= this.val;
		dojo.toggleClass(this.nameNode, "limited", this.game.opts.highlightUnavailable && limited);
		dojo.toggleClass(this.nameNode, "btnDisabled", limited || buildLimited || !this.game.resPool.hasRes(prices));
	}
});


});

if (!Finam) { var Finam = {}; }

Finam.Composite = {};

Finam.Composite.Sets = {
	list: [],
	num: null,
	add: function(num, majorQuote, quotes) {
		this.list.push({
			num: num,
			majorQuote: majorQuote,
			quotes: quotes
		});
	}
}

Finam.Composite.Main = function (opts) {
	this.markets = [];
	var d = this.dom = {};
	var c = this.controls = {};
	d.elm = $('#' + opts.id);
	this.quote = opts.quote;
	this.colors = ['#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'];
	this.quotes = [];
	this.count = 0;
	this.controls.selectors = [];
	this.period = opts.period;
	this.loaded = false;
	var self = this;
	var markets = (opts.markets || []).reverse();
	markets[markets.length] = { value: 0, title: 'Выберите рынок' };
	markets = markets.reverse();
	$(document).ready(function () {
		self.controls.composite = new Finam.UI.Controls.HTML5.Composite({
			container: d.elm.find('.finam-ui-composite-chart').attr('id'),
			ready: function () {
				if (self.controls.periods) {
					self.period = self.controls.periods.value()
				} else {
					self.period = 1;
				}
				self.controls.composite.setMajorIssue(self.quote, self.period, self.colors[0]);
				self.index++;
			},
			load: function () {
				if(!self.loaded){
				var sets = Finam.Composite.Sets;
				$.each(sets.list, function (idx1, set) {
					if (set.num == sets.num && set.majorQuote == self.quote) {
						$.each(set.quotes, function (idx2, quote) {
							if (quote > 0) {
								self.controls.composite.addIssue('chart-' + (idx2 + 1), quote, self.colors[idx2 + 1]);
								self.index++;
								if (self.controls.selectors) {
								var selector = self.controls.selectors[idx2];
									if (self.controls.selectorsself != undefined) { self.controls.selectors[idx2].quote(quote); }
								}
							}
						});
					}
				})
				self.loaded = true;
				self.loadState();
				}
			}
		});
		$.each(d.elm.find('.finam-ui-composite-selector'), function (index, item) {
			item = $(item).attr('index', index + 1);
			self.quotes[self.quotes.length] = null;
			self.controls.selectors[self.controls.selectors.length] = new Finam.Composite.QuoteSelector({
				main: self,
				index: index,
				elm: item,
				markets: markets,
				color: self.colors[index + 1],
				change: function (quote) {
					if (quote != null) {
						self.controls.composite.addIssue('chart-' + (index + 1), quote, self.colors[index + 1]);
					} else {
						self.controls.composite.removeIssue('chart-' + (index + 1));
					}
					self.quotes[index] = quote;
					self.saveState();
				}
			});
		});
		self.controls.periods = new Finam.Composite.Periods({
			elm: d.elm.find('.finam-ui-composite-periods'),
			change: function (period) {
				self.period = period;
				self.controls.composite.setPeriod(period);
				self.saveState();
			}
		});
	});
	return this;
};
Finam.Composite.Main.prototype = {
	setQuote: function (quote) {
		this.quote = quote;
		if (self.controls) {
			if (self.controls.periods) {
				this.period = self.controls.periods.value()
			} else {
				this.period = 1;
			}
		}
		try {
			this.controls.composite.setMajorIssue(this.quote, this.period, this.colors[0]);
		}
		catch (err) {
			Finam.IssuerProfile.Main.setMajorIssue(this.quote, this.period, this.colors[0]);
		}
		return this;
	},
	addIssue: function (quote) {
		var index = this.count;
		if (index < this.controls.selectors.length) {
			//console.log(quote);
		}
		return this;
	},
	addQuote: function (quote) {
		this.quote = quote;
		this.controls.composite.addIssue(quote, 5, this.colors[0]);
		return this;
	},
	loadState: function() {
		var state = document.location.hash.replace('#', '').split('_');
		if (state.length >= 1) {
			this.controls.periods.value(state[0].replace('-', ' '));
		}
		for (var i = 0; i < 2; i++) {
			if (state.length >= i + 2) {
				var quote = parseInt(state[i + 1]);
				if (!isNaN(quote)) {
					this.quotes[i] = quote;
					this.controls.selectors[i].quote(quote);
					this.controls.composite.addIssue('chart-' + (i + 1), quote, this.colors[i + 1]);
				}
			}
		}
		return this;
	},
	saveState: function() {
		var state = [this.period.replace(' ', '-')];
		var quotes = this.quotes;
		for (var i = 0; i < quotes.length; i++) {
			if (!!quotes[i]) {
				state.push(quotes[i]);
			}
		}
		document.location.hash = '#' + state.join('_');
		return this;
	}
};

Finam.Composite.QuoteSelector = function (opts) {
	opts = opts || {};
	var self = this;
	this.main = opts.main,
	this._index = opts._index;
	this._market = null;
	this._quote = null;
	this._quotes = {};
	this._quotesId = {};
	this._query = null;
	this._change = opts.change;
	var d = this.dom = {};
	d.elm = opts.elm || $('#' + opts.id);
	d.elm = d.elm.addClass('finam-ui-composite-quote-selector').html('<div class="finam-ui-composite-quote-selector-market"><div class="finam-ui-composite-quote-selector-title"></div><div class="finam-ui-composite-quote-selector-arrow">&#9660;</div></div><div class="finam-ui-composite-quote-selector-quote"><div class="finam-ui-composite-quote-selector-color"></div><div class="finam-ui-composite-quote-selector-title"><input type="text" name="quote" /></div><div class="finam-ui-composite-quote-selector-arrow">&#9660;</div></div>');
	d.market = {};
	d.market.control = d.elm.find('.finam-ui-composite-quote-selector-market');
	d.market.title = d.market.control.find('.finam-ui-composite-quote-selector-title');
	d.market.arrow = d.market.control.find('.finam-ui-composite-quote-selector-arrow');
	var q = d.quote = {};
	q.control = d.elm.find('.finam-ui-composite-quote-selector-quote').hide();
	q.color = d.quote.control.find('.finam-ui-composite-quote-selector-color').css('background-color', opts.color);
	q.title = d.quote.control.find('.finam-ui-composite-quote-selector-title');
	q.input = d.quote.control.find('INPUT').attr('readonly', 'readonly');
	q.arrow = d.quote.control.find('.finam-ui-composite-quote-selector-arrow');
	var c = this.controls = {};
	c.market = new Finam.UI.Controls.Utils.DropdownList({
		max: 6,
		width: d.market.control.outerWidth(),
		list: opts.markets || [],
		control: d.elm,
		title: d.market.title,
		arrow: d.market.arrow,
		change: function (value) {
			self.market(value);
		}
	});
	c.quote = new Finam.UI.Controls.Utils.DropdownList({
		max: 6,
		width: q.control.outerWidth(),
		list: [],
		control: d.elm,
		title: null,
		arrow: q.arrow,
		combo: true,
		change: function (value) {
			if (!parseInt(value)) {
				var bundles = Finam.IssuerProfile._bundleIndexes || []; //WTF?
				value = bundles[value]; //null;
			} else {
				if (parseInt(value) == 0) {
					value = null;
				}
			}
			self._quote = value;
			opts.change(value);
			self.redraw();
		},
		className: 'finam-ui-composite-quote-selector-quote-list'
	});
	q.input.bind('focus', function (event) {
		if (self._quote == null && self._market != null) {
			q.input.val('');
		} else {
		}
	});
	q.input.bind('blur', function (event) {
		if (q.input.val() == '') {
			self._quote = null;
			opts.change(null);
		}
		if (self._quote == null) {
			q.input.val(Finam.Composite.QuoteSelector.Strings.emptyQuote);
		}
	});
	q.input.bind('keyup', function (event) {
		switch (event.which) {
			case 13:
				self._quote = self.controls.quote.select().hide().value();
				opts.change(self._quote);
				self.redraw();
				break;
			case 40: //вниз
				self.controls.quote.next();
				break;
			case 38: //вверх
				self.controls.quote.prev();
				break;
			default:
				var query = q.input.val().toLowerCase();
				var matches = [];
				var quotes = self._quotes[self._market];
				if (query.length >= 2 && quotes != undefined) {
					for (var i = 0; i < quotes.length; i++) {
						if (quotes[i].lower != undefined && quotes[i].lower.indexOf(query) != -1) {
							matches.push(quotes[i]);
						}
					}
				}
				if (matches.length > 0) {
					self.controls.quote.create(matches).show();
					self._query = query;
				} else {
					self.controls.quote.create(quotes).hide();
					self._query = null;
				}
				break;
		}
	});
	for (var i = 0; i < aEmitentMarkets.length; i++) {
		this._quotesId[aEmitentIds[i]] = ({
			id: aEmitentIds[i],
			title: aEmitentNames[i],
			market: aEmitentMarkets[i]
		});
	}
	this.redraw();
	return this;
}
Finam.Composite.QuoteSelector.prototype = {
	redraw: function() {
		var m = this.dom.market;
		m.title.width(Math.floor(m.control.innerWidth() - m.arrow.outerWidth() - (m.title.innerWidth() - m.title.width())));
		var q = this.dom.quote;
		var padding = q.title.outerWidth() - q.title.width();
		if (this._quote == null) {
			q.color.hide();
			q.title.width(Math.floor(q.control.innerWidth() - q.arrow.outerWidth() - padding));
			q.input.val(Finam.Composite.QuoteSelector.Strings.emptyQuote);
		} else {
			q.title.width(Math.floor(q.control.innerWidth() - q.arrow.outerWidth() - q.color.outerWidth() - padding));
			q.color.show();
			q.input.val(this._quotesId[this._quote].title);
		}
		if (this._query != null) {
			this.controls.quote.create(this._quotes[this._market]);
		}
		return this;
	},
	setMarkets: function(markets) {
		this.controls.market.create(markets);
		return this;
	},
	market: function(market) {
		if (market == undefined) {
			return this._market;
		} else {
			if (market != this.controls.market.value()) {
				this.controls.market.value(market);
			}
			if (market != this._market) {
				this.dom.quote.control.show();
				this._market = market;
				var quotes = this._quotes[this._market] || [{ value: 0, title: 'не выбрано' }];
				if (quotes.length <= 1) {
					for (var i = 0; i < aEmitentMarkets.length; i++) {
						if (aEmitentMarkets[i] == this._market) {
							quotes[quotes.length] = ({
								value: aEmitentIds[i],
								title: aEmitentNames[i],
								lower: aEmitentNames[i].toLowerCase()
							});
						}
					}
					this._quotes[this._market] = quotes;
				}
				this.dom.quote.input.removeAttr('readonly');
				this.controls.quote.create(quotes);
			}
			return this;
		}
	},
	quote: function(quote) {
		if (quote == undefined) {
			return this.controls.quote.value();
		} else {
			if (quote != this._quote) {
				this._quote = quote;
				var index = $.inArray(quote, aEmitentIds);
				if (index != -1) {
					var market = aEmitentMarkets[index];
					this.market(market);
					this.controls.quote.value(quote);
					this.redraw();
				}
			}
		}
		return this;
	}
};
Finam.Composite.QuoteSelector.Strings = {
	emptyQuote: 'Выберите или введите название'
};

Finam.Composite.Periods = function(opts) {
	opts = opts || {};
	var d = this.dom = {};
	d.elm = opts.elm;
	var self = this;
	d.list = d.elm.find('A').bind('click', function(event) {
		var link = $(event.target);
		self.period = link.attr('value');
		self.redraw();
		opts.change(self.period);
		return false
	});
	this.period = '1 year';
	this.redraw();
	return this;
};
Finam.Composite.Periods.prototype = {
	redraw: function() {
		var self = this;
		$.each(this.dom.list, function(index, item) {
			item = $(item);
			if (item.attr('value') == self.period) {
				item.addClass('selected');
			} else {
				item.removeClass('selected');
			}
		});
		return this;
	},
	value: function(val) {
		if (!!val) {
			this.period = val;
			this.redraw();
			return this;
		} else {
			return this.period;
		}
	}
};

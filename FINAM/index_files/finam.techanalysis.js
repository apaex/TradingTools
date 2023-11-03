if (!Finam) { var Finam = {}; }

Finam.TechAnalysis = {};

Finam.TechAnalysis.Main = {
	_quote: 8,
	_settings: {
		chartType: 'CANDLE',
		pitch: 60,
		ma: {
			value: null,
			period: null
		},
		volume: 'off',
		ind: {
			value: null,
			period: null
		},
		ext1: {
			value: null,
			period: null
		},
		ext2: {
			value: null,
			period: null
		}
	},
	dom: {},
	controls: {},
	profile: null,
	storage: null,
	init: function(profile) {
		this.profile = profile;
		var self = this;
		$(document).ready(function() {
			self.storage = new Finam.Utils.Storage('TechAnalysisBeta');
			self.controls.pitch = new Finam.TechAnalysis.Indicator('issuer-profile-techanalysis-pitch', {
				change: function(value) {
					self.setPitch(value);
				}
			});
			self.controls.chartType = new Finam.TechAnalysis.Indicator('issuer-profile-techanalysis-chart-type', {
				change: function(value) {
					self.setChartType(value);
				}
			});
			self.controls.ma = new Finam.TechAnalysis.Indicator('issuer-profile-techanalysis-ma', 'issuer-profile-techanalysis-ma-period', {
				change: function(value, period) {
					self.setMAIndicator({
						name: value,
						period: period
					});
				}
			});
			self.controls.volume = $('#issuer-profile-techanalysis-volume').bind('click', function(event) {
				self.setVolume(self.controls.volume.is(':checked') ? 'on' : 'off');
			});
			self.controls.ind = new Finam.TechAnalysis.Indicator('issuer-profile-techanalysis-ind', 'issuer-profile-techanalysis-ind-period', {
				change: function(value, period) {
					self.setIndicator({
						name: value,
						period: period
					});
				}
			});
			self.controls.ext1 = new Finam.TechAnalysis.Indicator('issuer-profile-techanalysis-ext1', 'issuer-profile-techanalysis-ext-period1', {
				change: function(value, period) {
					self.setExtIndicator1({
						name: value,
						period: period
					});
				}
			});
			self.controls.ext2 = new Finam.TechAnalysis.Indicator('issuer-profile-techanalysis-ext2', 'issuer-profile-techanalysis-ext-period2', {
				change: function(value, period) {
					self.setExtIndicator2({
						name: value,
						period: period
					});
				}
			});
			if (!!self.storage.getItem('pitch')) {
				self.controls.pitch.value(self.storage.getItem('pitch'));
			}
			if (!!self.storage.getItem('chartType')) {
				self.controls.chartType.value(self.storage.getItem('chartType'));
			}
			if (self.storage.getItem('volume')) {
				self.controls.volume.prop('checked', (self.storage.getItem('volume') == 'on' ? true : false));
			}
			$.each(['ma', 'ind', 'ext1', 'ext2'], function(index, indicator) {
				var value = self.storage.getItem(indicator + '.value');
				var period = self.storage.getItem(indicator + '.period');
				if (value != 'NONE' && period != null) {
					self.controls[indicator].value(value);
					self.controls[indicator].period(period);
				}
			});
			self.pitch(self.controls.pitch.value());
			self.chartType(self.controls.chartType.value());
			self.volume(self.controls.volume.is(':checked'));
			$.each(['ma', 'ind', 'ext1', 'ext2'], function(index, indicator) {
				if (self.controls[indicator].value() != 'NONE') {
					self.ta(indicator, self.controls[indicator].value(), self.controls[indicator].period());
				}
			});
			self.techanalysis = new Finam.UI.Controls.HTML5.TechAnalysis({
				container: 'issuer-profile-techanalysis-chart-inner',
				ready: function() {
					self.techanalysis.setOptions(self.quote(), self.pitch(), self.chartType());
					self.controls.pitch.value(self.pitch());
					self.controls.chartType.value(self.chartType());
				},
				load: function() {
					self.setMAIndicator();
					self.setVolume();
					self.setIndicator();
					self.setExtIndicator1();
					self.setExtIndicator2();
				},
				quote: function(quote) {
					quote.date = new Date(quote.lastTime * 1000);
					var dateText = quote.date.formatDate('hh:nn:ss');
					$('#issuer-profile-techanalysis-time-title').html(dateText);
					$.each(['open', 'low', 'high', 'last', 'change', 'close', 'volume'], function(index, name) {
						var elm = $('#issuer-profile-techanalysis-quotes-' + name);
						var value = parseFloat(quote[name]);
						if (name == 'volume') {
							var title = elm.prev();
							var last = title.prev();
							if (value > 0) {
								elm.html(value.prepareNumber(0)).show();
								title.show();
								last.removeClass('last');
							} else {
								elm.hide();
								title.hide();
								last.addClass('last');
							}
						} else {
							value = value.toFixed(aEmitentDecp[parseInt(quote.id)]);
							elm.html(value);
							if (name == 'change') {
								elm.removeClass('up').removeClass('down');
								elm.addClass(value > 0 ? 'up' : (value < 0 ? 'down' : ''));
							}
						}
					});
				}
			});
			/*
			self.controls.time = new Finam.UI.Controls.Utils.DropdownList({
				max: 'max',
				list: [{value: '18:20 МСК', title: '18:20 МСК'}],
				control: $('#issuer-profile-techanalysis-time'),
				title: $('#issuer-profile-techanalysis-time-title'),
				arrow: null,
				change: function(value) {
					//
				}
			});
			var refresh = [
					{value: 0, title: '<span>не обновлять</span>'}, 
					{value: 1, title: '<span>раз в 1 сек.</span>', selected: true}, 
					{value: 5, title: '<span>раз в 5 сек.</span>'}, 
					{value: 30, title: '<span>раз в 30 сек.</span>'}, 
					{value: 60, title: '<span>раз в 60 сек.</span>'}
				];
			self.controls.refresh = new Finam.UI.Controls.Utils.DropdownList({
				max: 'max',
				list: refresh,
				control: $('#issuer-profile-techanalysis-refresh-title'),
				title: $('#issuer-profile-techanalysis-refresh-title'),
				arrow: null,
				change: function(value) {
					//
				}
			});
			*/
		});
		return this;
	},
	quote: function(quote) {
		if (!!quote) {
			this._quote = quote;
			$('#issuer-profile-techanalysis-old').attr('href', '/analysis/charts/?em=' + this._quote);
			return this;
		} else {
			return this._quote;
		}
	},
	pitch: function(pitch) {
		if (!!pitch) {
			var pitch = parseInt(pitch) || this._settings.pitch || 60;
			this._settings.pitch = pitch;
			this.storage.setItem('pitch', pitch);
			//this.controls.pitch.value(pitch);
			return this;
		} else {
			return this._settings.pitch;
		}
	},
	chartType: function(chartType) {
		if (!!chartType) {
			var chartType = (chartType == '' ? undefined : chartType) || this._settings.chartType || 'CANDLE';
			this._settings.chartType = chartType;
			this.storage.setItem('chartType', chartType);
			return this;
		} else {
			return this._settings.chartType;
		}
	},
	volume: function(volume) {
		if (volume != undefined) {
			this._settings.volume = (volume == 'on' ? 'on' : 'off');
			this.storage.setItem('volume', this._settings.volume);
			return this;
		} else {
			return this._settings.volume;
		}
	},
	ta: function(name, value, period) {
		if (!!name) {
			if (!!value) {
				this._settings[name].value = value;
				this._settings[name].period = period;
				this.storage.setItem(name + '.value', value);
				this.storage.setItem(name + '.period', period);
			} else {
				return this._settings[name];
			}
		} else {
			return null;
		}
	},
	ma: function(value, period) {
		return this.ta('ma', value, period);
	},
	ind: function(value, period) {
		return this.ta('ind', value, period);
	},
	ext1: function(value, period) {
		return this.ta('ext1', value, period);
	},
	ext2: function(value, period) {
		return this.ta('ext2', value, period);
	},
	/*
	taIndicator: function(name, value, period) {
		if (!!name) {
			this.setTaIndicator(name, { value: value, period: period });
		} else {
			return this._settings[name];
		}
	},
	ma: function(value, period) {
		return this.taIndicator('ma', value, period);
	},
	indicator: function(value, period) {
		return this.taIndicator('indicator', value, period);
	},
	extIndicator1: function(value, period) {
		return this.taIndicator('extIndicator1', value, period);
	},
	extIndicator2: function(value, period) {
		return this.taIndicator('extIndicator2', value, period);
	},
	*/
	setQuote: function(quote) {
		this.quote(quote);
		this.techanalysis.setIssueId(this.quote());
		return this;
	},
	setPitch: function(pitch) {
		this.pitch(pitch);
		this.techanalysis.setPitch(this.pitch());
		return this;
	},
	setChartType: function(chartType) {
		this.chartType(chartType);
		this.techanalysis.setChartType(this.chartType());
		return this;
	},
	setVolume: function(volume) {
		this.volume(volume);
		this.techanalysis.showVolumeIndicator(this.volume() == 'on');
	},
	setTaIndicator: function(name, opts) {
		opts = this.updateOptions(name, opts);
		this.ta(name, opts.name, opts.period);
		return (opts.value == 'NONE' ? null : opts);
	},
	setMAIndicator: function(opts) {
		this.techanalysis.setMAIndicator(this.setTaIndicator('ma', opts));
		return this;
	},
	setIndicator: function(opts) {
		this.techanalysis.setExtIndicatorToChart(this.setTaIndicator('ind', opts));
		return this;
	},
	setExtIndicator1: function(opts) {
		this.techanalysis.setExtIndicator1(this.setTaIndicator('ext1', opts));
		return this;
	},
	setExtIndicator2: function(opts) {
		this.techanalysis.setExtIndicator2(this.setTaIndicator('ext2', opts));
		return this;
	},
	updateOptions: function(name, opts) {
		opts = opts || {};
		opts.name = opts.name || this._settings[name].value || 'NONE';
		opts.period = parseInt(opts.period || this._settings[name].period || (!!this.controls[name] ? this.controls[name].period() : null));
		switch (opts.value) {
			case 'BB':
				opts.coefficient = 3;
				break;
			case 'MACD':
				opts.fastEMA = 12;
				opts.slowEMA = 26;
				opts.signalSMA = opts.period;
				break;
			case 'OSC':
				opts.fastSMA = opts.period;
				opts.slowSMA = opts.period * 2;
				break;
			case 'PTPS':
				opts.step = opts.period;
				opts.maximum = 0.2;
				break;
			case 'STOOSC':
				opts.kPeriod = 5;
				opts.dPeriod = 3;
				opts.slowing = opts.period;
				break;
		}
		return opts;
	},
	setMarkets: function(markets) {
		this.markets = markets;
		if (this.controls.quoteSelector) {
			this.controls.quoteSelector.setMarkets(markets);
		}
		return this;
	},
	toSVG: function() {
		return this.techanalysis.toSVG();
	}
};

Finam.TechAnalysis.Indicator = function(indicator, period, opts) {
	this.combo = false;
	this._value = null;
	this._period = null;
	switch (arguments.length) {
		case 3:
			opts = opts || {};
			break;
		case 2:
			opts = period || {};
			period = null;
			break;
		case 1:
			period = null;
			opts = {};
			break;
	}
	var self = this;
	this.num = Finam.TechAnalysis.Indicator._num++;
	var d = this.dom = {};
	d.select = $('#' + indicator);
	this.width = opts.width || d.select.outerWidth();
	d.control = $('<div id="' + indicator + '-control" class="finam-ui-ta-indicator"><div class="finam-ui-ta-indicator-arrow">&#9660;</div><div class="finam-ui-ta-indicator-title"></div><div class="finam-ui-ta-indicator-period" style="display: none; "><div class="finam-ui-ta-indicator-period-value"></div></div></div>')
		.insertBefore(d.select)
			.css('width', this.width);
	d.arrow = d.control.find('.finam-ui-ta-indicator-arrow');
	d.title = d.control.find('.finam-ui-ta-indicator-title');
	var c = this.controls = {};
	c.list = new Finam.UI.Controls.Utils.DropdownList({
		max: 'max',
		list: d.select,
		control: d.control,
		title: d.title,
		arrow: d.arrow,
		change: function(value) {
			d.select.val(value);
			opts.change(value, self.period());
			if (value == 'NONE') {
				d.period.cell.hide();
			} else {
				if (self.combo) {
					d.period.cell.show();
				}
			}
		}
	})
	d.select
		.bind('change', function() {
			c.list.select(d.select.val());
			opts.change(c.list.value());
		})
		.hide()
	d.period = {
		cell: d.control.find('.finam-ui-ta-indicator-period')
	};
	if (period != null) {
		d.period.cell.addClass('view')
		this.combo = true;
		this._period = {};
		$.each(d.select.find('OPTION'), function(index, option) {
			option = $(option);
			var period = parseFloat(option.attr('period')) || 7;
			period = (option.attr('value') == 'NONE') ? '' : period;
			self._period[option.attr('value')] = period || 7;
		});
		d.period.value = d.period.cell.find('.finam-ui-ta-indicator-period-value');
		d.period.input = $('#' + period);
		d.period.cell.append(d.period.input.detach());
		d.period.input
			.css('marginLeft', (d.period.cell.outerWidth() - d.period.input.outerWidth()) / 2 + 2)
				.css('marginTop', (d.period.cell.outerHeight() - d.period.input.outerHeight()) / 2);
		d.title.css('width', this.width - d.period.cell.outerWidth() - d.arrow.outerWidth() - 3); // 3 - ширина двух бордеров
		var periodFn = function() {
			var value = d.select.val();
			var period = parseFloat(d.period.input.val()) || parseFloat(self._period[value]);
			if (!isNaN(period)) {
				self._period[value] = period;
				d.period.input.val(period);
				d.period.value.html(period);
			}
			d.period.cell.addClass('view').removeClass('edit');
		};
		d.period.value.bind('click', function() {
			d.period.cell.addClass('edit').removeClass('view');
			d.period.input.focus().select();
			Finam.UI.Controls.Utils.DropdownList._hide();
			return false;
		});
		d.period.input.bind('blur', function() {
			periodFn();
			opts.change(self.value(), self.period());
			d.control.removeClass('over');
		});
		d.period.input.bind('keypress', function(event) {
			if (event.which == 13) {
				d.period.input.blur();
				return false;
			}
		});
		$(document).bind('click', function() {
			periodFn();
		});
	} else {
		d.period.cell.hide();
		d.title.css('width', this.width - d.arrow.outerWidth() - 3); // 3 - ширина двух бордеров
	}
	d.control.bind('mouseover', function() {
		d.control.addClass('over');
	});
	if (this.combo) {
		d.control.bind('mouseout', function() {
			if (d.period.cell.hasClass('view')) {
				d.control.removeClass('over');
			}
		});
	} else {
		d.control.bind('mouseout', function() {
			d.control.removeClass('over');
		});
	}
	$(window).bind('resize', function() {
		self.redraw();
	});
	return this;
};
Finam.TechAnalysis.Indicator.prototype = {
	redraw: function() {
		this.dom.select.val(this.value());
		if (this.combo) {
			this.dom.period.value.html(this._period[this.value()]);
			if (this.dom.select.val() == 'NONE') {
				this.dom.period.cell.hide();
			} else {
				this.dom.period.cell.show();
			}
		}
		return this;
	},
	value: function(val) {
		if (val != undefined) {
			this.controls.list.value(val);
		} else {
			return this.controls.list.selected.value;
		}
	},
	period: function(val) {
		if (this.combo) {
			if (val != undefined) {
				this._period[this.value()] = val;
				this.dom.period.input.val(val);
				this.redraw();
			} else {
				return this._period[this.value()];
			}
		} else {
			return null;
		}
	},
	toggle: function() {
		Finam.TechAnalysis.Indicator._hide();
		Finam.TechAnalysis.Indicator._selected = this;
		var self = this;
		if (this.opened) {
			this.dom.list.hide();
			this.opened = false;
		} else {
			this.dom.list.slideDown(600, function() {
				self.opened = true;
			});
		}
		return this;
	},
	hide: function() {
		this.dom.list.hide();
		this.opened = false;
		return this;
	},
	show: function() {
		this.dom.list.show();
		return this;
	}
};
Finam.TechAnalysis.Indicator._num = 0;
Finam.TechAnalysis.Indicator._selected = null;
Finam.TechAnalysis.Indicator._hide = function() {
	if (Finam.TechAnalysis.Indicator._selected != null) {
		Finam.TechAnalysis.Indicator._selected.hide();
	}
}

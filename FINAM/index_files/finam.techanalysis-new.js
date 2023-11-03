if (!Finam) { var Finam = {}; }

Finam.TechAnalysisNew = {};

Finam.TechAnalysisNew.Main = {
	VERSION: 1,
	_quote: 8,
	_publishing: false,
	_defaults: {
		pitch: 60,
		chartType: 'CANDLE',
		showVolume: true,
		dataType: 'CANDLES',
		indicators: [
			{
				id: 'EMA',
				options: { period: 9 }
			},
			{
				id: 'EMA',
				options: { period: 27 }
			},
			{ id: 'ADX' }
		]
	},
	_defaultssimple: {
		pitch: 1440,
		chartType: 'CANDLE',
		showVolume: false,
		dataType: 'CANDLES',
		indicators: []
	},
	init: function(profile) {
		var self = this;
		$.when(Finam.Utils.Library.loadScript(Finam.IssuerProfile.TECHANALYSIS_LIVE_URL))
			.then(function() {
				self.start(profile);
			})
			.fail(function() {
				//fail
			});
	},
	start: function(profile) {
		var self = this;
		self.profile = profile;
		self.storage = new Finam.Utils.Storage('TechAnalysisNew');
		var d = this.dom = {};
		$(document).ready(function () {
			var elm = d.elm = $('#issuer-profile-techanalysis-new');
			var top = d.top = $('#issuer-profile');
			var support = new Finam.UI.Controls.HTML5.Support({
				ie: 9,
				elm: elm
			});
			if (support.enabled()) {
				var chart = d.chart = $('<div id="issuer-profile-techanalysis-new-chart"></div>');
				if (self.VERSION == 1) {
					$(document.body).first().prepend(chart);
					var pos = function () {
						if (!chart.hasClass('fullscreen')) {
							chart.css({
								left: elm.offset().left,
								top: elm.offset().top,
								width: elm.outerWidth(),
								height: elm.outerHeight()
							});
						}
					};
					if (typeof Mobi === "undefined" || !Mobi) {
						pos();
					}
				} else {
					d.elm.append(chart);
					var pos = function() { };
				}
				var tech_ui;
				if ($('#issuer-profile-techanalysis-simple').length == 1) {
					Finam.IssuerProfile.Main.controls.informer = Finam.IssuerProfile.Informer.init()
					self.ta = new Finam.UI.Controls.HTML5.TechAnalysisNew({
						container: 'issuer-profile-techanalysis-new-chart',
						ui: {
							toolbar: false,
							info: false,
							chart: {
								chartControls: false,     // показывать кнопки управления на графике
								legend: {
									showTimeframe: false // показывать timeframe в легенде графика
								}
							}
						}
					})//.setOptions({indicators: []})

					self.ta.bind('onquote', function (quote) {
						quote.pchange = quote.chg;
						quote.change = (quote.chg / 100 * quote.close).toFixed(aEmitentDecp[parseInt(quote.id)] || 4);
						var data = {
							quote: {
								info: quote
							}
						};
						data.quote.info.decp = aEmitentDecp[parseInt(quote.id)]; //profile.issue.quote.decp;
						self.profile.controls.informer.updateQuote(data);

					})
				}
				else {
					self.ta = new Finam.UI.Controls.HTML5.TechAnalysisNew({
						container: 'issuer-profile-techanalysis-new-chart',
						ui: {
							toolbar: {
								search: false
							}
						}
					})
				}
				self.ta.bind('ready', function () {
						self.load();
					})
					.bind('requestFullwindow', function () {
						$(document.body).css({
							overflow: 'hidden'
						});
						var top = Math.max(document.body.scrollTop, document.documentElement.scrollTop, window.pageYOffset);
						var width = Math.min(document.documentElement.clientWidth, document.body.clientWidth);
						var height = Math.min(document.documentElement.clientHeight, document.body.clientHeight);
						chart.css({
							left: 0,
							top: top,
							width: width,
							height: height,
							zIndex: 10000
						});
					})
					.bind('exitFullwindow', function () {
						$(document.body).css({
							overflowY: 'scroll'
						});
						chart.css({
							left: elm.offset().left,
							top: elm.offset().top,
							width: elm.width(),
							height: elm.height(),
							zIndex: 2
						});
					});

				/*
				$('#s').click(function() {
					self.save();
					console.log('saved...');
					return false;
				});
				$('#searchtext').click(function() {
					console.log('loading...');
					self.load();
					return false;
				});
				*/

				$(window).bind({
					resize: function () {
						if (typeof Mobi === "undefined" || !Mobi) {
							pos();
						}
					},
					beforeunload: function (event) {
						if ($('#issuer-profile-techanalysis-simple').length == 0) {
							self.save();
						}
					}
				});
				//temp. фикс костыль убран
				d.info = $('.share-info').attr('onclick', '').bind('click', function () {
					self.publish();
					return false;
				});
			} else {
				$.each(['publish'], function (index, method) {
					self[method] = function () { return self; }
				});
			}
			var up = function () {
				elm.css('zIndex', 990);
				chart.css('zIndex', 1000);
			}
			var down = function () {
				elm.css('zIndex', 0);
				chart.css('zIndex', 0);
			}
			if (!!chart) {
				$('#issuer-profile-socnet-btns A').click(function () {
					down();
				});
				elm.mouseenter(function () {
					up();
					$('#issuer-profile-socnet-btns .socnet-btns-holder').hide();
				});
			}
		});
		return this;
	},
	quote: function (quote) {
		if (!!quote) {
			this._quote = parseInt(quote);
			if (!!this.ta) {
				this.ta.setOptions({
					issueId: quote,
					bannerUrl: this.bannerUrl()
				});
			}
			$('#issuer-profile-techanalysis-old').attr('href', '/analysis/charts/?em=' + this._quote);
			return this;
		} else {
			return this._quote;
		}
	},
	market: function () {
		return this.profile.controls.header.market();
	},
	publish: function () {
		var self = this;
		if (!this._publishing) {
			this._publishing = true;
			var dims = [{ width: 800, height: 500}];
			var marketTitle = self.profile.controls.header.marketTitle();
			var quoteTitle = self.profile.controls.header.quoteTitle();
			this.ta.takeSnapshot(dims).done(function (snapshot) {
				$.ajax({
					url: '/service.asp?name=issuer-profile&action=base2png',
					dataType: 'json',
					type: 'post',
					data: {
						base: snapshot.images[0],
						width: dims[0].width,
						height: dims[0].height,
						title: quoteTitle
					},
					success: function (result, textStatus, jqXHR) {
						self._publishing = false;
						if (result.success) {
							// мдэуж, функция
							taGetSVG('snap=' + result.snapshot, null, marketTitle, quoteTitle, self.quote(), null, 'issuer-profile-main-param', result);
							$('.socnet-btns-holder').show();
						}
					},
					error: function (jqXHR, textStatus, errorThrown) {
						self._publishing = false
						console.log([jqXHR, textStatus, errorThrown]);
					}
				});
			});
		}
		return this;
	},
	load: function () {
		if (!!this.ta) {
			var options = {
				issueId: this.quote()
			};
			var state = $.parseJSON(this.storage.getItem('Settings') || '') || {};
			if ($('#issuer-profile-techanalysis-simple').length == 1) {
				options = {
					issueId: this.quote()
				};
				$.each(this._defaultssimple, function (name, def) {
					options[name] = def;
				});
			} else {
				$.each(this._defaults, function (name, def) {
				options[name] = state[name] || options[name] || def;
			});
			}
			options.bannerUrl = this.bannerUrl();
			this.ta.setOptions(options);
		}
		return this;
	},
	save: function () {
		var self = this;
		if (!!this.ta) {
			this.ta.getOptions(function (options) {
				options = options || {};
				var state = {};
				$.each(self._defaults, function (name, def) {
					state[name] = options[name] || def;
				});
				self.storage.setItem('Settings', JSON.stringify(state));
			});
		}
		return this;
	},
	bannerUrl: function () {
		return '//' + Finam.Utils.URL.host() + '/bannersShow.asp?code=' + this.market() + '_' + this.quote();
	}
};

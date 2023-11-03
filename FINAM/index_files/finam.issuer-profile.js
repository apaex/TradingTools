(function (Finam, $) {
	if (!Finam) {
		var Finam = {};
	}

	Finam.IssuerProfile = {};

	Finam.IssuerProfile.TECHANALYSIS_LIVE_URL =
		'//cloud-cdn.finam.ru/oldta/ta/0.16.34/techanalysis.js';
	Finam.IssuerProfile.TECHANALYSIS_URL =
		'//cloud-cdn.finam.ru/oldta/ta/0.9.3.2/ta.js';
	Finam.IssuerProfile.COMPOSITE_URL =
		'//cloud-cdn.finam.ru/oldta/co/0.9.3/co.js';

	Finam.IssuerProfile._markets = [
		{ value: 200, title: 'ММВБ-Top' },
		{ value: 1, title: 'ММВБ Акции' },
		{ value: 29, title: 'ММВБ ПИФы' },
		{ value: 2, title: 'ММВБ облигации' },
		{ value: 12, title: 'ММВБ Внесписочные облигации' },
		{ value: 8, title: 'АДР' },
		{ value: 6, title: 'Мировые Индексы' },
		{ value: 24, title: 'Товары' },
		{ value: 5, title: 'Forex' },
		{ value: 14, title: 'Фьючерсы ФОРТС' },
		{ value: 3, title: 'РТС' },
		{ value: 38, title: 'RTS Standard' },
		{ value: 20, title: 'RTS Board' },
		{ value: 10, title: 'РТС-GAZ' },
		{ value: 25, title: 'Акции США(BATS)' },
		{ value: 7, title: 'Фьючерсы США' },
		{ value: 27, title: 'Отрасли экономики США' },
		{ value: 26, title: 'Гособлигации США' },
		{ value: 28, title: 'ETF' },
		{ value: 30, title: 'Индексы мировой экономики' },
		{ value: 17, title: 'ФОРТС Архив' },
		{ value: 31, title: 'Сырье Архив' },
		{ value: 16, title: 'ММВБ Архив' },
		{ value: 18, title: 'РТС Архив' },
		{ value: 9, title: 'СПФБ Архив' },
		{ value: 39, title: 'АДР Архив' },
	];
	Finam.IssuerProfile._tabs = [
		'about',
		'comments',
		'dates',
		'news',
		'tehanalys-light',
		'compare',
		'export',
		'tehanalys-light',
		'events',
		'secondary',
		'tehanalys-live',
		'corporate',
		'blogs',
		'sector',
		'tehanalys-live-new',
		'mixed',
		'old',
	];

	Finam.IssuerProfile.Main = {
		mode: 0,
		markets: [],
		issue: null,
		cache: {},
		controls: {},
		dom: {},
		loading: false,
		submitForm: null,
		init: function () {
			var self = this;
			var d = self.dom;
			this.preloader = new Finam.UI.Controls.Utils.Preloader(
				$('#issuer-profile-content')
			);
			$(document).ready(function () {
				var id = this.id;
				var c = self.controls;
				self.cache[self.issue.quote.id] = $.extend({}, self.issue);
				if (
					$('#issuer-profile-techanalysis').length == 1 ||
					$('#issuer-profile-chart').length == 1 ||
					$('#issuer-profile-composite').length == 1
				) {
					self.dom.browsercheck = $('#issuer-profile-content-browsercheck');
					self.controls.support = new Finam.UI.Controls.HTML5.Support({
						ie: 8.0,
						elm: self.dom.browsercheck,
						mode: 'hide',
					});
				}
				// quote selector
				c.header = new Finam.IssuerProfile.QuoteSelector({
					id: 'issuer-profile',
					markets: self.markets || [],
					nullable: true,
					change: function (quote) {
						if (
							!!quote &&
							quote.toString() != '0' &&
							quote != self.issue.quote.id
						) {
							self.setQuote(quote);
						}
						$('#issuer-profile-export-apply').val(0);
					},
				});
				// мучаем переданный рынок в урле
				var selMarket =
					parseInt(Finam.Utils.URL.init().query('market'), 10) ||
					self.issue.quote.market.id;
				c.header.market(selMarket).quote(self.issue.quote.id);
				// отправляем маркет для всех слушателей
				$('#moex-copyright').triggerHandler('set-market', [
					selMarket,
					self.issue.quote.id,
				]);

				// quote favorite
				c.favorite = new Finam.IssuerProfile.FavoriteButton().init(
					self.issue.quote.id
				);
				// menu
				c.menu = Finam.IssuerProfile.Menu.init(self);
				if (
					$('#issuer-profile-chart').length == 1 ||
					$('#issuer-profile-techanalysis-simple').length == 1
				) {
					self.main = true;
					// chart
					c.chart = Finam.IssuerProfile.Chart.init(self);
					// ticker list
					c.tickerList = Finam.IssuerProfile.TickerList.init(self);
					// news
					c.news = Finam.IssuerProfile.News.init(self);
					// about
					c.about = Finam.IssuerProfile.About.init(self);
				} else {
					self.main = false;
				}
				// techanalysis
				if ($('#issuer-profile-techanalysis').length == 1) {
					if ($.support.HTML5) {
						c.techanalysis = Finam.TechAnalysis.Main.init(self);
					} else {
						$('#issuer-profile-techanalysis').hide();
					}
				}
				// techanalysis gif - Finam.IssuerProfile.TechanalysisGif
				// techanalysis new
				if ($('#issuer-profile-techanalysis-new').length == 1) {
					c.techanalysisnew = Finam.TechAnalysisNew.Main.init(self);
				}
				// composite
				if ($('#issuer-profile-composite').length == 1) {
					if ($.support.HTML5) {
						$.when(
							Finam.Utils.Library.loadScript(Finam.IssuerProfile.COMPOSITE_URL)
						)
							.then(function () {
								c.composite = new Finam.Composite.Main({
									id: 'issuer-profile-composite',
									quote: self.issue.quote.id,
									markets: self.markets,
								});
							})
							.fail(function () {
								$('#issuer-profile-composite-chart').text(
									'Ошибка при загрузке сравнения графиков.'
								);
							});
					} else {
						$('#issuer-profile-composite').hide();
					}
				}
				// dataExport
				if ($('#issuer-profile-export').length == 1) {
					c.dataExport = Finam.IssuerProfile.Export.init(self);
				}
				// informer
				c.informer = Finam.IssuerProfile.Informer.init(self);
				// social
				c.social = Finam.IssuerProfile.Social.init(self);
			});
			return this;
		},
		update: function (issue) {
			this.updateTitle(issue.quote.title.replace('&nbsp;', ''));
			this.controls.menu.update(issue);
			if (this.main) {
				this.controls.chart.update(issue);
				this.controls.tickerList.update(issue);
				this.controls.informer.update(issue);
				this.controls.news.update(issue);
				this.controls.about.update(issue);
			}
			return this;
		},
		updateTitle: function (title) {
			document.title = 'Финам.ru - ' + title;
			return this;
		},
		setMarkets: function (markets) {
			this.markets = markets || Finam.IssuerProfile._markets;
			if (this.controls.header != undefined) {
				this.controls.header.create(markets);
			}
			return this;
		},
		setMarket: function (market) {
			this.controls.header.market(market);
			return this;
		},
		checkExtendedQuote: function (quote) {
			return quote.toString().indexOf('b') >= 0;
		},
		setQuote: function (quote) {
			var self = this;
			this.issue.quote.id = quote;
			this.controls.header.quote(quote);
			this.controls.favorite.setQuote(quote);
			this.controls.menu.setQuote(quote, this.issue);
			if (!!this.controls.techanalysisnew) {
				this.controls.techanalysisnew.save();
			}
			if (!!this.controls.dataExport) {
				this.controls.dataExport.update(
					quote,
					this.controls.header.quoteCode(),
					this.controls.header.market()
				);
			}
			var locationUrl = this.controls.menu.getUrl(
				quote,
				this.mode,
				this.controls.header.market()
			);
			var subForm = $('#issuer-profile-content FORM');
			if (subForm.length == 1) {
				subForm.attr('action', locationUrl);
				subForm.submit();
			} else {
				window.location = locationUrl;
			}
			return this;
		},
	};

	Finam.IssuerProfile.Menu = {
		init: function (profile) {
			this.profile = profile;
			var d = (this.dom = {});
			var e = (d.elm = $('#issuer-profile-tabs'));
			this.preloader = new Finam.UI.Controls.Utils.Preloader(
				$('#issuer-profile-tabs')
			);
			return this;
		},
		setQuote: function (quote, issue) {
			var self = this;
			var market = Finam.Utils.URL.init().query('market');
			$.each(this.dom.elm.find('A'), function (index, link) {
				link = $(link);
				var mode = parseInt(link.attr('mode'));
				var forum = parseInt(link.attr('forum')) == 1;
				if (isNaN(mode)) {
					var url = link.attr('href').split('=')[0];
					link.attr('href', url + '=' + quote);
				} else {
					link.attr('href', self.getUrl(quote, mode, market));
				}
				if (forum) {
					if (issue.quote != undefined) {
						link.attr('href', issue.quote.forum);
					}
				}
			});
			return this;
		},
		update: function (issue) {
			this.setQuote(issue.quote.id, issue);
			var self = this;
			$.each(this.dom.elm.find('TR'), function (index, item) {
				item = $(item);
				var name = item.attr('name');
				if (name != undefined) {
					switch (name) {
						case 'about':
							if (issue.company.infoExists) {
								item.show();
							} else {
								item.hide();
							}
							break;
						case 'forum':
							item.show();
							break;
						default:
							if (!!issue.news[name] && issue.news[name].count > 0) {
								item.find('A').attr('href', issue.news[name].url);
								item.show();
							} else {
								item.hide();
							}
							break;
					}
				}
			});
			this.preloader.hide();
			return this;
		},
		getUrl: function (quote, mode, market) {
			var url;
			if (Finam.IssuerProfile.Main.checkExtendedQuote(quote)) {
				if (quote.toString() != '0') {
					var item = '00000' + parseInt(quote.replace('b', '')).toString(16);
					item = item.substring(item.length - 5, item.length).toUpperCase();
					var subItem = '';
					if (mode > 0) {
						subItem = '00000' + parseInt(mode).toString(16);
						subItem = subItem
							.substring(subItem.length - 5, subItem.length)
							.toUpperCase();
					}
					url = '/analysis/bundle' + item + subItem;
				}
			} else {
				if (aEmitentUrls[quote]) {
					if (window.location.href.indexOf('/forex/finamta/') > 0) {
						url = '/forex/finamta/' + aEmitentUrls[quote] + '/';
					} else {
						url = '/profile/' + aEmitentUrls[quote] + '/';
					}
					if (mode > 0) {
						url = url + Finam.IssuerProfile._tabs[mode - 1] + '/';
					}
				} else {
					var item = '00000' + parseInt(quote).toString(16);
					item = item.substring(item.length - 5, item.length).toUpperCase();
					var subItem = '';
					if (mode > 0) {
						subItem = '00000' + parseInt(mode).toString(16);
						subItem = subItem
							.substring(subItem.length - 5, subItem.length)
							.toUpperCase();
					}
					if (quote.toString() != '0') {
					}
					url = '/analysis/profile' + item + subItem + '/';
				}
				if (!!market) {
					url += (url.indexOf('?') == -1 ? '?' : '') + 'market=' + market;
				}
			}
			return url;
		},
	};

	Finam.IssuerProfile.Chart = {
		init: function (profile) {
			var self = this;
			$.when(
				Finam.Utils.Library.loadScript(Finam.IssuerProfile.TECHANALYSIS_URL)
			)
				.then(function () {
					self.start(profile);
				})
				.fail(function () {
					//fail
				});
		},
		start: function (profile) {
			this.volumeChecked = false;
			this.volumeVisible = true;
			if ($('#issuer-profile-chart').length == 1) {
				if ($.support.HTML5) {
					var self = this;
					this.techanalysis = new Finam.UI.Controls.HTML5.TechAnalysis({
						container: 'issuer-profile-chart',
						ready: function () {
							var def_type = 'CANDLE'; //'LINE'
							if (window.tectAnalysisdefType !== undefined) {
								if (
									techAnalysisSimplified.indexOf(profile.issue.quote.id) >= 0
								) {
									def_type = 'LINE';
								}
							}
							self.techanalysis.setOptions(
								profile.issue.quote.id,
								1440,
								def_type
							);
						},
						load: function () {
							// TODO: прикрутить показ/скрытие объёмов
							self.techanalysis.showVolumeIndicator(true);
							$.each(
								[
									'setMAIndicator',
									'setExtIndicatorToChart',
									'setExtIndicator1',
									'setExtIndicator2',
									'setExtIndicator3',
								],
								function (i, ind) {
									self.techanalysis[ind](null);
								}
							);
						},
						quote: function (quote) {
							var data = {
								quote: {
									info: quote,
								},
							};
							data.quote.info.decp = aEmitentDecp[parseInt(quote.id)]; //profile.issue.quote.decp;
							profile.controls.informer.updateQuote(data);
						},
					});
				} else {
					$('#issuer-profile-chart-outer').hide();
				}
			}
			return this;
		},
		setQuote: function (quote) {
			if (this.techanalysis) {
				this.volumeChecked = false;
				this.volumeVisible = true;

				this.techanalysis.setIssueId(quote);
			}
			return this;
		},
		update: function (issue) {
			this.volumeVisible =
				issue.quote.info.volume != null &&
				parseInt(issue.quote.info.volume) != 0;
			this.techanalysis.showVolumeIndicator(this.volumeVisible);
			return this;
		},
		toSVG: function () {
			return this.techanalysis.toSVG();
		},
	};

	Finam.IssuerProfile.TickerList = {
		init: function (profile) {
			this.profile = profile;
			this.quote = null;
			this.market = null;
			var d = (this.dom = {});
			var e = (d.elm = $('#issuer-profile-ticker-list'));
			if (e.length == 1) {
				var self = this;
				d.elm.bind('click', function (event) {
					var item = $(event.target);
					if (item.is('A')) {
						var quote = parseInt(item.data('quote'));
						if (quote != self.quote) {
							d.selected.removeClass('ticker-selected');
							d.selected = $(item).addClass('ticker-selected');
							self.quote = quote;
							var market = (self.market = parseInt(item.data('market')));
							//self.profile.controls.header.market(market).quote(quote);
							self.profile.setMarket(market);
							self.profile.setQuote(quote);
						}
					}
					return false;
				});
				this.ready();
			}
			this.preloader = new Finam.UI.Controls.Utils.Preloader(d.elm);
			return this;
		},
		ready: function () {
			var d = this.dom;
			var e = d.elm;
			d.list = e.find('A');
			if (d.list.length > 0) {
				d.selected = e.find('.ticker-selected');
				if (d.selected.length == 0) {
					d.selected = $(e.find('A')[0]).addClass('ticker-selected');
				}
				this.quote = d.selected.data('quote') - 0;
				this.market = d.selected.data('market') - 0;
			}
			if (d.list.length > 1) {
				e.show();
			} else {
				e.hide();
			}
		},
		update: function (issue) {
			this.preloader.hide();
			if (
				issue.quote.linkedTitle != null &&
				issue.quote.linkedList.length > 0
			) {
				var e = this.dom.elm;
				var h = ['<span>' + issue.quote.linkedTitle + '</span> также на: '];
				var l = [];
				var linkedList = issue.quote.linkedList || [];
				var marketList = {};
				var marketId = [];
				$.each(linkedList, function (index, linked) {
					if (!marketList[linked.market.id]) {
						marketList[linked.market.id] = {
							title: linked.market.title,
							list: [],
						};
						marketId.push(linked.market.id);
					}
					marketList[linked.market.id].list.push(
						'<a href="' +
							linked.url +
							'" class="js ' +
							(linked.selected ? 'ticker-selected' : '') +
							'" data-quote="' +
							linked.id +
							'" data-market="' +
							linked.market.id +
							'">' +
							linked.title +
							'</a>)'
					);
				});
				$.each(marketId, function (index, id) {
					market = marketList[id];
					h += market.title + '&nbsp;(' + market.list.join(', ') + ', ';
					if (index < marketList.length) {
						h += ', ';
					}
				});
				e.html(h);
				this.ready();
			} else {
				this.hide();
			}
			return this;
		},
		setQuote: function (quote) {
			var d = this.dom;
			d.selected.removeClass('ticker-selected');
			$.each(this.dom.elm.find('A'), function (index, item) {
				item = $(item);
				if (item.data('quote') - 0 == quote) {
					d.selected = item.addClass('ticker-selected');
					return;
				}
			});
			return this;
		},
		show: function () {
			this.dom.elm.show();
			return this;
		},
		hide: function () {
			this.dom.elm.hide();
			return this;
		},
	};

	Finam.IssuerProfile.News = {
		init: function (profile) {
			this.profile = profile;
			var d = (this.dom = {});
			d.elm = $('#issuer-profile-news-mix');
			d.content = $('#issuer-profile-news-mix-outer');
			this.visible = $('#issuer-profile-news-mix').css('display') != 'none';
			this.preloader = new Finam.UI.Controls.Utils.Preloader(d.content);
			var self = this;
			this.pager = new Finam.UI.Controls.Utils.Pager({
				elm: $('#issuer-profile'),
			}).bind('select', function (page) {
				var url =
					'/service.asp?name=issuer-profile&action=news&page=' +
					(page || 1) +
					'&quote=' +
					self.profile.issue.quote.id;
				self.preloader.show();
				$.ajax({
					url: url,
					dataType: 'html',
					success: function (html) {
						if (html.length > 0) {
							var target = $('#issuer-profile-news-mix-inner');
							target.find('TABLE.news-list').hide();
							target.append(html);
							d.elm.show();
						} else {
							d.elm.hide();
						}
						self.preloader.hide();
					},
					error: function (jqXHR, textStatus, errorThrown) {
						//console.log([jqXHR, textStatus, errorThrown]);
						self.preloader.hide();
					},
				});
			});
			return this;
		},
		update: function (issue) {
			this.pager.destroy();
			if (issue.news.mix.count > 0) {
				if (this.visible) {
					this.preloader.show();
				}
				var url =
					'/service.asp?name=issuer-profile&action=news&quote=' +
					issue.quote.id;
				var self = this;
				$.ajax({
					url: url,
					dataType: 'html',
					success: function (html) {
						if (html.length > 0) {
							var target = $('#issuer-profile-news-mix');
							target.html(html);
							$('#issuer-profile-news-mix').show();
							self.visible = true;
							self.pager.create();
						} else {
							self.visible = false;
							$('#issuer-profile-news-mix').hide();
						}
						self.preloader.hide();
					},
					error: function (jqXHR, textStatus, errorThrown) {
						//console.log([jqXHR, textStatus, errorThrown]);
						self.preloader.hide();
					},
				});
			} else {
				this.preloader.hide();
				$('#issuer-profile-news-mix').hide();
				this.visible = false;
			}
			return this;
		},
	};

	Finam.IssuerProfile.Informer = {
		init: function (profile) {
			this.profile = profile;
			this.cache = {};
			var id = '#issuer-profile-informer';
			var d = (this.dom = {});
			if ($(id).length == 1) {
				d.elm = $(id);
				d.capitalization = $(id + '-capitalization');
				d.sector = $(id + '-sector');
				d.sectorContainer = $(id + '-sector-container');
				d.last = $(id + '-last');
				d.change = $(id + '-change');
				d.pchange = $(id + '-pchange');
				d.high = $(id + '-high');
				d.low = $(id + '-low');
				d.close = $(id + '-close');
				d.open = $(id + '-open');
				d.volume = $(id + '-volume');
				d.weekMin = $(id + '-week-min');
				d.weekMax = $(id + '-week-max');
				d.monthMin = $(id + '-month-min');
				d.monthMax = $(id + '-month-max');
				d.yearMin = $(id + '-year-min');
				d.yearMax = $(id + '-year-max');
				d.footnote = $(id + '-footnote');
				d.bondStatus = $(id + '-bond-status');
				d.bondNominal = $(id + '-bond-nominal');
				d.bondVolume = $(id + '-bond-volume');
				d.bondDatePlacement = $(id + '-bond-datePlacement');
				d.bondDateClose = $(id + '-bond-dateClose');
				d.bondRegNum = $(id + '-bond-regNum');
				d.bondEmpty = $(id + '-bond-empty');
				d.minmax = {
					links: $(id + ' UL LI A'),
					selected: {
						item: null,
						table: null,
					},
				};
				d.minmax.links.bind('click', function (event) {
					var link = $(event.target);
					var item = link.parent('LI');
					if (!item.hasClass('selected') && d.minmax.selected.item != null) {
						d.minmax.selected.item.removeClass('selected');
						d.minmax.selected.table.hide();
					}
					d.minmax.selected.item = item.addClass('selected');
					d.minmax.selected.table = $(
						id + '-' + link.attr('href').replace('#', '')
					).show();
					return false;
				});

				$(d.minmax.links[0]).click();
				this._currency = d.elm.data('currency');
				this.preloader = new Finam.UI.Controls.Utils.Preloader(d.elm);
			}
			return this;
		},
		setQuote: function (quote) {
			if (this.cache[quote] == undefined) {
				this.showPreloader();
				var self = this;
				$.ajax({
					url:
						'/service.asp?name=issuer-profile&action=informer&quote=' + quote,
					dataType: 'json',
					success: function (data) {
						data = Finam.IssuerProfile.Informer.prepare(data);
						//var b = new Clone(data);
						var b = $.extend({}, data);
						self.cache[quote] = b;
						self.update(data);
						self.hidePreloader();
					},
					error: function (jqXHR, textStatus, errorThrown) {
						self.preloader.hide();
						//console.log([jqXHR, textStatus, errorThrown]);
					},
				});
			} else {
				var c = $.extend({}, this.cache[quote]);
				this.update(c);
			}
			return this;
		},
		// конвертация входных данных в числа
		// ----------------------------------
		prepare: function (data) {
			var info = data.quote.info;
			info.decp = parseInt(info.decp);
			var cur = this._currency != '' ? '&nbsp;' + this._currency : '';
			$.each(
				[
					'last',
					'open',
					'high',
					'low',
					'close',
					'bid',
					'ask',
					'change',
					'pchange',
					'weekMin',
					'weekMax',
					'monthMin',
					'monthMax',
					'yearMin',
					'yearMax',
				],
				function (index, name) {
					info[name] = parseFloat(info[name]).toFixed(
						name == 'pchange' ? 2 : info.decp
					);
					if (isNaN(info[name])) {
						info[name] = null;
					} else {
						if (name != 'pchange') {
							info[name] = info[name] + cur;
						}
					}
				}
			);
			info.volume = parseInt(info.volume);
			if (isNaN(info.volume)) {
				info.volume = null;
			}
			data.quote.info = info;
			return data;
		},
		update: function (data) {
			this.preloader.hide();
			var self = this;
			var d = this.dom;
			data = this.prepare(data);
			if (this.dom.elm.length != 0) {
				if (data.company != undefined) {
					if (data.bond != null) {
						this.updateQuoteItem('capitalization', null, true);
						this.updateQuoteItem('sectorContainer', null, true);
					} else {
						var capitalization = $(d.capitalization.closest('TR'));
						if (data.company.capitalization != null) {
							d.capitalization.html(data.company.capitalizationText);
							capitalization.show();
						} else {
							capitalization.hide();
						}
						if (data.company.sector.id != null) {
							d.sector.html(
								'<a href="' +
									data.company.sector.url +
									'">' +
									data.company.sector.title +
									'</a>'
							);
							d.sectorContainer.show();
						} else {
							d.sectorContainer.hide();
						}
					}
				}
				d.footnote.html(data.quote.footnote);
				if (data.quote.info.weekMin != undefined) {
					$.each(
						[
							'weekMin',
							'weekMax',
							'monthMin',
							'monthMax',
							'yearMin',
							'yearMax',
						],
						function (index, name) {
							self.updateQuoteItem(
								name,
								data.quote.info[name],
								false,
								data.quote.info.decp
							);
						}
					);
				}
				this.updateBond(data);
			}
			return this;
		},
		// обновление информера через график
		// (метод вызывается из графика)
		updateQuote: function (data) {
			var self = this;
			data = this.prepare(data);
			$.each(
				['last', 'change', 'pchange', 'high', 'low', 'open', 'close', 'volume'],
				function (index, name) {
					//console.log(name, " -" + data.quote.info[name]);
					self.updateQuoteItem(
						name,
						data.quote.info[name],
						true,
						data.quote.info.decp
					);
				}
			);
			return this;
		},
		updateQuoteItem: function (name, value, hide, decp) {
			var elm = this.dom[name];
			switch (name) {
				//case 'pchange':
				case 'change':
					elm.removeClass('up').removeClass('down');
					if (value != null) {
						elm.addClass(parseFloat(value) >= 0 ? 'up' : 'down');
						if (name == 'pchange') {
							elm.html('(' + value + '%)').show(); //.prepareForDisplay(',', 2)
						} else {
							elm.html(value); //.prepareForDisplay(',', decp)
						}
					} else {
						if (name == 'pchange') {
							elm.hide();
						} else {
							elm.html('—');
						}
					}
					break;

				case 'pchange':
					elm.removeClass('up').removeClass('down');
					if (value != null) {
						elm.addClass(parseFloat(value) >= 0 ? 'up' : 'down');
						if (name == 'pchange') {
							elm.html('(' + value + '%)').show(); //.prepareForDisplay(',', 2)
						} else {
							elm.html(value); //.prepareForDisplay(',', decp)
						}
					} else {
						if (name == 'pchange') {
							elm.hide();
						} else {
							elm.html('—');
						}
					}
					break;
				default:
					var row = $(elm.closest('TR'));
					if (value != null && value != '') {
						if (name == 'volume') {
							value = value.prepareNumber(0);
						} else {
							//value = value.prepareForDisplay(',', decp);
						}
						elm.html(value);
						row.show();
					} else {
						if (hide) {
							elm.html('—');
							row.hide();
						}
					}
			}
			return this;
		},
		updateBond: function (data) {
			if (data.bond == null) {
				// hide all
				var self = this;
				$.each(
					[
						'bondStatus',
						'bondNominal',
						'bondVolume',
						'bondDatePlacement',
						'bondDateClose',
						'bondRegNum',
						'bondEmpty',
					],
					function (index, name) {
						self.updateBondItem(name, null, true);
					}
				);
				return this;
			}

			this.updateBondItem('bondStatus', data.bond.status, true);
			this.updateBondItem(
				'bondNominal',
				data.bond.nominal + ' ' + data.bond.bond_currency,
				true
			);
			this.updateBondItem(
				'bondVolume',
				data.bond.nom_volume + ' ' + data.bond.bond_currency,
				true
			);
			this.updateBondItem('bondDatePlacement', data.bond.date_placement, true);
			this.updateBondItem('bondDateClose', data.bond.date_close, true);
			this.updateBondItem('bondRegNum', data.bond.reg_num, true);
			this.updateBondItem('bondEmpty', '&nbsp;', true);
			return this;
		},
		updateBondItem: function (name, value, hide) {
			var elm = this.dom[name];
			var row = $(elm.closest('TR'));
			if (value != null) {
				elm.html(value);
				row.show();
			} else {
				if (hide) {
					elm.html('—');
					row.hide();
				}
			}
			return this;
		},
		showPreloader: function () {
			this.preloader.show(this.dom.elm);
			return this;
		},
		hidePreloader: function () {
			this.preloader.hide();
			return this;
		},
	};

	Finam.IssuerProfile.About = {
		init: function (profile) {
			this.profile = profile;
			var d = (this.dom = {});
			d.elm = $('#issuer-profile-sidebar-about');
			d.content = $('#issuer-profile-sidebar-about-content');
			d.title = $('#issuer-profile-sidebar-about-title');
			d.siteUrl = $('#issuer-profile-sidebar-about-site-url');
			d.intro = $('#issuer-profile-sidebar-about-text');
			this.preloader = new Finam.UI.Controls.Utils.Preloader(d.content);
			return this;
		},
		update: function (issue) {
			this.preloader.hide();
			var visible = false;
			if (!!issue.company.titleFull) {
				this.dom.title.find('DD').html(issue.company.titleFull);
				this.dom.title.show();
				visible = true;
			} else {
				this.dom.title.hide();
			}
			if (!!issue.company.siteUrl) {
				this.dom.siteUrl
					.find('A')
					.attr('href', 'http://' + issue.company.siteUrl)
					.html(issue.company.siteUrl);
				this.dom.siteUrl.show();
				visible = true;
			} else {
				this.dom.siteUrl.hide();
			}
			if (!!issue.company.intro) {
				this.dom.intro.find('DD').html(issue.company.intro);
				this.dom.intro.show();
				visible = true;
			} else {
				this.dom.intro.hide();
			}
			if (visible) {
				this.dom.elm.show();
			} else {
				this.dom.elm.hide();
			}
			return this;
		},
	};

	Finam.IssuerProfile.Export = {
		init: function () {
			var self = this;
			$.datepicker.setDefaults($.datepicker.regional['ru']);
			this.dates = $(
				'#issuer-profile-export-from, #issuer-profile-export-to'
			).datepicker({
				dateFormat: 'dd.mm.yy',
				defaultDate: '+1w',
				changeYear: true,
				yearRange: '1979:' + new Date().getFullYear(),
				changeMonth: true,
				numberOfMonths: 1,
				onSelect: function (selectedDate) {
					var option =
						this.id == 'issuer-profile-export-from' ? 'minDate' : 'maxDate';
					$(this).removeClass('error');
					self[
						this.id == 'issuer-profile-export-from' ? 'minDate' : 'maxDate'
					] = selectedDate.split('.').reverse().join('');
					var instance = $(this).data('datepicker');
					var date = $.datepicker.parseDate(
						instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
						selectedDate,
						instance.settings
					);
					self.dates.not(this).datepicker('option', option, date);
					$(this).trigger('change');
					self.redraw();
				},
			});

			$('#issuer-profile-export-button').bind('click', function () {
				$('#issuer-profile-export-apply').val(1);
				/*
				Finam.ReCaptcha.getToken(function (token) {
					if (!!token) {
						$('#issuer-profile-export-token').val(token);
					}
					var err = false;
					var apply = $('#issuer-profile-export-apply').val();

					$('#issuer-profile-export-file-name').removeClass('error');
					$('#issuer-profile-export-contract').removeClass('error');
					if ($('#issuer-profile-export-file-name').val().length == 0) {
						$('#issuer-profile-export-file-name').addClass('error');
						err = true;
					}
					if ($('#issuer-profile-export-contract').val().length == 0) {
						$('#issuer-profile-export-contract').addClass('error');
						err = true;
					}
					if (!err) {
						if (apply == 1) {
							var action =
								'http://export.finam.ru/' +
								$('#issuer-profile-export-file-name').val() +
								$('#issuer-profile-export-file-ext').val();
							$(this).attr('action', action);
							$('#issuer-profile-export-apply').val(0);
						}
						$('#chartform').submit();
					} else {
						return false;
					}
				}, 'export');
				*/
				$('#chartform').submit();
			});
			//$('#chartform').bind('submit', function () {
			//	console.info('submit');
			//		return false;
			//	}
			//});
			this.selects = {};
			$.each($('#chartform SELECT'), function (index, select) {
				var control = new Finam.UI.Controls.Select($(select));
				self.selects[control.name()] = control;
			});
			$('#issuer-profile-export-file-name').bind('change', function () {
				if ($(this).val().length == 0) {
					self.redraw();
				}
			});
			$('#issuer-profile-export-period').bind('change', function () {
				self.rebuild();
			});
			$('#issuer-profile-export-contract').bind('change', function () {
				if ($(this).val() == '') {
					$(this).val($('#issuer-profile-export-quote-code').val());
				}
				self.redraw();
			});
			this.sep = $('#sep').val();
			$('#issuer-profile-export-file-ext').bind('change', function () {
				if ($(this).val() == '.csv') {
					self.sep = $('#sep').val();
					$('#sep').val(3);
				} else {
					$('#sep').val(self.sep);
				}
				self.selects.sep.rebuild();
			});
			$('#sep').bind('change', function () {
				self.sep = $(this).val();
			});
			$('#issuer-profile-export-mstime').bind('change', function () {
				$('#issuer-profile-export-mstime-mstimever')
					.val($(this).attr('checked') ? 1 : 0)
					.trigger('change');
			});
			$('#chartform .i-form-state-item').one('change', function () {
				self.rebuild();
				self.redraw();
			});
			return this;
		},
		rebuild: function () {
			var select = document.getElementById('issuer-profile-export-fields');
			var period = document.getElementById(
				'issuer-profile-export-period'
			).value;
			var value = parseInt($('#issuer-profile-export-fields').val()) || 1;
			var enabled = null;
			var values = [];
			for (var i = 0; i < aDataFormatStrs.length; i++) {
				var option = $(
					'#issuer-profile-export-fields OPTION[value="' + (i + 1) + '"]'
				);
				if ((i > -1 && i < 5 && period > 1) || (period == 1 && i > 4)) {
					option.removeClass('disabled');
					values.push(i + 1);
					if (!enabled) {
						enabled = option;
					}
				} else {
					option.addClass('disabled');
				}
			}
			if ($.inArray(value, values) == -1) {
				value = values[0];
			}
			this.selects.datf.rebuild();
			$('#issuer-profile-export-fields').val(value);
			$('#issuer-profile-export-fields').trigger('change');
			return this;
		},
		redraw: function () {
			var market = $('#issuer-profile-export-market').val();
			if (
				market == 1 ||
				market == 2 ||
				market == 12 ||
				market == 16 ||
				market == 29
			) {
				$('#issuer-profile-export-micex').show();
			} else {
				$('#issuer-profile-export-micex').hide();
			}
			var quote = $('#issuer-profile-export-quote').val() - 0;
			var quoteCode = $('#issuer-profile-export-quote-code').val();
			var minDate = $('#issuer-profile-export-from')
				.val()
				.split('.')
				.reverse()
				.join('');
			var maxDate = $('#issuer-profile-export-to')
				.val()
				.split('.')
				.reverse()
				.join('');
			if (quoteCode != '' && minDate != '' && maxDate != '') {
				var minDateParams = $('#issuer-profile-export-from').val().split('.');
				$('#issuer-profile-export-from-d').val(minDateParams[0] - 0);
				$('#issuer-profile-export-from-m').val(minDateParams[1] - 1);
				$('#issuer-profile-export-from-y').val(minDateParams[2] - 0);
				var maxDateParams = $('#issuer-profile-export-to').val().split('.');
				$('#issuer-profile-export-to-d').val(maxDateParams[0] - 0);
				$('#issuer-profile-export-to-m').val(maxDateParams[1] - 1);
				$('#issuer-profile-export-to-y').val(maxDateParams[2] - 0);
				var filename =
					quoteCode + '_' + minDate.substr(2, 6) + '_' + maxDate.substr(2, 6);
				$('#issuer-profile-export-file-name').val(filename);
				$('#issuer-profile-export-file-name').removeClass('error');
			} else {
				$('#issuer-profile-export-file-name').addClass('error');
			}
			return this;
		},
		update: function (quote, quoteCode, market) {
			$('#issuer-profile-export-market').val(market);
			$('#issuer-profile-export-quote').val(quote);
			$('#issuer-profile-export-quote-code').val(quoteCode);
			$('#issuer-profile-export-contract').val(quoteCode);
			this.redraw();
			return this;
		},
	};

	Finam.IssuerProfile.Social = {
		init: function (profile) {
			this.profile = profile;
			var self = this;
			// Social SVG Export
			$('#issuer-profile-svg-export').bind('click', function () {
				if (profile.controls.chart || profile.controls.techanalysis) {
					$.when(
						(profile.controls.chart || profile.controls.techanalysis).toSVG()
					).then(function (svg) {
						self.toSVG(svg);
					});
				}
				return false;
			});
			return this;
		},
		genSVG: function (url, mtitle, qtitle, quote, freqtext, idform) {
			var self = this;
			if (this.profile.controls.chart || this.profile.controls.techanalysis) {
				$.when(
					(
						this.profile.controls.chart || this.profile.controls.techanalysis
					).toSVG()
				).then(function (svg) {
					self.toSVG(svg, url, mtitle, qtitle, quote, freqtext, idform);
				});
			}
		},
		toSVG: function (svg, url, mtitle, qtitle, quote, freqtext, idform) {
			var svg_data = [];
			svg_data[0] = '';
			svg_data[1] = '';
			svg_data[2] = '';

			for (var i = 0; i < svg.length; i++) {
				if (svg[i]) {
					svg_data[i] = svg[i];
				}
			}

			$.post(
				'/service.asp?name=issuer-profile&action=svg2png',
				{
					svgData0: svg_data[0],
					svgData1: svg_data[1],
					svgData2: svg_data[2],
					svgData3: svg_data[3],
					svgData4: svg_data[4],
					svgData5: svg_data[5],
					qtitle: qtitle,
				},
				function (data) {
					taGetSVG(
						'state=' + data,
						url,
						mtitle,
						qtitle,
						quote,
						freqtext,
						idform
					);
				}
			);
			return this;
		},
	};

	Finam.IssuerProfile.ShareTA = {
		init: function (profile) {
			this.profile = profile;
		},
	};

	Finam.IssuerProfile.QuoteSelector = function (opts) {
		var self = this;
		opts = opts || {};
		var d = (this.dom = {});
		var c = (this.controls = {});
		this.nullable = opts.nullable != undefined ? opts.nullable : false;
		this._market = null;
		this._quote = null;
		this._quotes = {};
		this._quotesId = {};
		this.markets = [];
		this._quotes = {};
		this._newQuote = false;
		d.elm = opts.id != undefined ? $('#' + opts.id) : $(document.body);
		d.market = {};
		d.market.elm = $(
			'<div class="finam-ui-quote-selector-market">' +
				$('#issuer-profile-header').attr('market') +
				'</div>'
		);
		d.quote = {};
		d.quote.elm = $(
			'<div class="finam-ui-quote-selector-quote">' +
				$('#issuer-profile-header').attr('quote') +
				'</div>'
		);
		d.quote.elm.insertAfter($('#issuer-profile-header H1'));
		d.market.elm.insertAfter($('#issuer-profile-header H1'));
		$('#issuer-profile-header H1').hide();
		// TODO: combobox в настройки и разделение функционала
		var combo = true;
		$.each(['market', 'quote'], function (index, name) {
			if (name == 'quote' && combo) {
				if (self.market() == -1) {
					var html =
						'<input class="finam-ui-quote-selector-title" value="' +
						d[name].elm.html() +
						'" placeholder="' +
						Finam.IssuerProfile.QuoteSelector.Strings.emptySector +
						'" /><div class="finam-ui-quote-selector-arrow"></div>';
				} else {
					var html =
						'<input class="finam-ui-quote-selector-title" value="' +
						d[name].elm.html() +
						'" placeholder="' +
						Finam.IssuerProfile.QuoteSelector.Strings.emptyQuote +
						'" /><div class="finam-ui-quote-selector-arrow"></div>';
				}
			} else {
				var html =
					'<div class="finam-ui-quote-selector-title">' +
					d[name].elm.html() +
					'</div><div class="finam-ui-quote-selector-arrow"></div>';
			}
			d[name].elm.html(html);
			d[name].title = d[name].elm.find('.finam-ui-quote-selector-title');
			d[name].arrow = d[name].elm.find('.finam-ui-quote-selector-arrow');
			if (name == 'quote' && combo) {
				d.quote.title.focus();
			}
		});
		d.quote.elm.after(
			'<form name="quote-selector"><input type="hidden" name="market" value="" /><input type="hidden" name="quote" value="" /><input type="hidden" name="market-title" value="" /><input type="hidden" name="quote-title" value="" /></form>'
		);
		d.form = {
			market: {
				id: d.quote.elm.parent().find('INPUT[name="market"]'),
				title: d.quote.elm.parent().find('INPUT[name="market-title"]'),
			},
			quote: {
				id: d.quote.elm.parent().find('INPUT[name="quote"]'),
				title: d.quote.elm.parent().find('INPUT[name="quote-title"]'),
			},
		};
		c.market = new Finam.UI.Controls.Utils.DropdownList({
			name: 'market',
			list: opts.markets || [],
			control: d.market.elm,
			title: d.market.title,
			arrow: d.market.arrow,
			max: 10,
			minWidth: 240,
			change: function (value) {
				self.market(value);
			},
		});
		c.quote = new Finam.UI.Controls.Utils.DropdownList({
			name: 'quote',
			list: [],
			control: d.quote.elm,
			title: null,
			arrow: d.quote.arrow,
			max: 10,
			width: null,
			combo: true,
			change: function (quote) {
				if (parseInt(quote) == 0) {
					value = null;
				}
				self.quote(quote);
				// WTF: почему-то перестало автоматически меняться выбранное значение в обычной выпадайке
				/*
				if (combo) {
				d.quote.title.val(self.quoteTitle());
				} else {
				d.quote.title.html(self.quoteTitle());
				}
				*/
				self.redraw();
				opts.change(quote);
			},
		});
		c.market.bind('change', function () {
			c.quote.select();
			self.market(self.controls.market.value());
			opts.change(self.controls.quote.value());
			if (self.controls.market.value() == -1) {
				d.quote.title
					.val(Finam.IssuerProfile.QuoteSelector.Strings.emptySector)
					.addClass('finam-ui-quote-selector-title__empty_yes');
			}
		});
		$.each(['market', 'quote'], function (index, name) {
			$.each([d[name].title, d[name].arrow], function (index, item) {
				item.bind('mousedown', function () {
					d[name].elm.addClass('down');
				});
			});
			$.each([d[name].title, d[name].arrow], function (index, item) {
				item.bind('mouseup', function () {
					d[name].elm.removeClass('down');
				});
			});
		});
		if (combo) {
			d.quote.title.bind('check', function () {
				if (self._quote == null) {
					if (self._market == -1) {
						d.quote.title
							.val(Finam.IssuerProfile.QuoteSelector.Strings.emptySector)
							.addClass('finam-ui-quote-selector-title__empty_yes');
					} else {
						d.quote.title
							.val(Finam.IssuerProfile.QuoteSelector.Strings.emptyQuote)
							.addClass('finam-ui-quote-selector-title__empty_yes');
					}
				} else {
					d.quote.title.removeClass('finam-ui-quote-selector-title__empty_yes');
				}
			});
			d.quote.title.bind('focus', function (event) {
				if (self._quote == null && self._market != null) {
					d.quote.title.val('');
				} else {
				}
				// курсор в начало для ИЕ11
				var inp = $(this)[0];
				if (!!inp.createTextRange) {
					var rng = inp.createTextRange();
					rng.collapse();
					rng.moveStart('character', 0);
					rng.select();
				}
			});
			d.quote.title.bind('blur', function (event) {
				if (d.quote.title.val() == '') {
					self._quote = null;
					opts.change(null);
				}
				$(this).triggerHandler('check');
			});
			d.quote.title.bind('keyup', function (event) {
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
						var query = d.quote.title.val().toLowerCase();
						var matches = [];
						var quotes = self._quotes[self._market];
						if (query.length >= 2 && quotes != undefined) {
							for (var i = 0; i < quotes.length; i++) {
								if (
									quotes[i].lower != undefined &&
									quotes[i].lower.indexOf(query) != -1
								) {
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
		}
		for (var i = 0; i < aEmitentMarkets.length; i++) {
			this._quotesId[aEmitentIds[i]] = {
				id: aEmitentIds[i],
				title: aEmitentNames[i].replace('&nbsp;', ''),
				market: aEmitentMarkets[i],
			};
		}
		this.refresh();
		return this;
	};
	Finam.IssuerProfile.QuoteSelector.prototype = {
		setMarkets: function (markets) {
			this.controls.market.create(markets);
			return this;
		},
		fill: function () {
			this.dom.form.quote.id.val(this.controls.quote.value());
			this.dom.form.quote.title.val(this.controls.quote.title());
			this.dom.form.market.id.val(this.controls.market.value());
			this.dom.form.market.title.val(this.controls.market.title());
			return this;
		},
		redraw: function () {
			this.fill();
			var q = this.dom.quote.title;
			if (this._newQuote || !this._quote) {
				q.val('').focus();
			} else {
				q.val(this._quotesId[this._quote].title);
			}
			q.triggerHandler('check');
			if (this._query != null) {
				this.controls.quote.create(this._quotes[this._market]);
			}
			return this;
		},
		refresh: function () {
			var market = this.market();
			if (!!market) {
				var quotes =
					this._quotes[market] ||
					(!this.nullable ? [] : [{ value: 0, title: 'не выбрано' }]);
				if (quotes.length <= 1) {
					for (var i = 0; i < aEmitentMarkets.length; i++) {
						if (aEmitentMarkets[i] == market) {
							quotes.push({
								value: aEmitentIds[i],
								title: aEmitentNames[i],
								params: {
									market: market,
								},
							});
						}
					}
					this._quotes[market] = quotes;
				}
				this.controls.quote.create(quotes);
			}
			this.redraw();
			return this;
		},
		market: function (market) {
			if (market == undefined) {
				return this._market;
			} else {
				if (market != this.controls.market.value()) {
					this.controls.market.value(market);
				}
				if (market != this._market) {
					this._market = market;
					var quotes = this._quotes[this._market] || [
						{ value: 0, title: 'не выбрано' },
					];
					if (quotes.length <= 1) {
						for (var i = 0; i < aEmitentMarkets.length; i++) {
							if (aEmitentMarkets[i] == this._market) {
								quotes[quotes.length] = {
									value: aEmitentIds[i],
									title: aEmitentNames[i],
									lower: aEmitentNames[i].toLowerCase(),
								};
							}
						}
						this._quotes[this._market] = quotes;
					}
					this.controls.quote.create(quotes);
					this._newQuote = true;
					this.redraw();
				}
				//this.fill();
				return this;
			}
		},
		marketTitle: function () {
			return this.controls.market.title();
		},
		quote: function (quote) {
			if (quote == undefined) {
				return this.controls.quote.value();
			} else {
				if (quote != this._quote) {
					this._quote = quote;
					var curMarket = this.market();
					var index = [];
					// выбираем все рынки, где замешана бумага
					for (var i = 0; i < aEmitentIds.length; i++) {
						if (aEmitentIds[i] == quote) {
							index.push(i);
						}
					}
					if (index.length > 0) {
						// вот эти рынки
						var markets = [];
						for (var i = 0; i < index.length; i++) {
							markets.push(aEmitentMarkets[index[i]]);
						}
						// берём первый попавшийся рынок — в общем случае он должен быть единственным
						var market = markets[0];
						// но если бумага входит в два рынка и более
						if ($.inArray(curMarket, markets) != -1) {
							// то оставляем текущий
							market = curMarket;
						}
						this.market(market);
						this.controls.quote.value(quote);
						this._newQuote = false;
						this.redraw();
					}
				}
			}
			return this;
		},
		quoteCode: function () {
			var index = $.inArray(this.quote(), aEmitentIds);
			if (index != -1) {
				return aEmitentCodes[index];
			} else {
				return null;
			}
		},
		quoteTitle: function () {
			return this.controls.quote.title();
		},
	};
	Finam.IssuerProfile.QuoteSelector.Strings = {
		emptyQuote: 'выберите инструмент',
		emptySector: 'выберите отрасль',
	};

	// Кнопка добавить/удалить из фаворитов на профиле
	// -----------------------------------------------
	Finam.IssuerProfile.FavoriteButton = function () {
		this.elm = $('.favorite-button');
		this.isVisible = false;
		return this;
	};
	Finam.IssuerProfile.FavoriteButton.prototype = {
		init: function (quote) {
			var self = this;
			this.quote = quote;
			this.getStatus(function (isAuth) {
				if (isAuth) {
					self.elm.click(function () {
						if (self.isVisible) {
							self.send();
						}
					});
				} else {
					self.elm.click(function () {
						if (self.isVisible) {
							Finam.User.showLogin();
						}
					});
				}
			});
			return this;
		},

		// обработчик на ajax-событие смены текущей котировки
		setQuote: function (quote) {
			this.quote = quote;
			this.getStatus();
		},

		// отображение кнопки (фаворит/не фаворит)
		setViewStatus: function (status) {
			this.isVisible = status >= 0;

			if (status == 1 && !this.elm.hasClass('favorite-checked')) {
				this.elm.addClass('favorite-checked');
				this.elm.attr('title', 'удалить из моих котировок');
				if (this.elm.hasClass('favorite-unchecked'))
					this.elm.removeClass('favorite-unchecked');
			}
			if (status == 0 && !this.elm.hasClass('favorite-unchecked')) {
				this.elm.addClass('favorite-unchecked');
				this.elm.attr('title', 'добавить в мои котировки');
				if (this.elm.hasClass('favorite-checked'))
					this.elm.removeClass('favorite-checked');
			}
		},

		// получаем тек. статус
		getStatus: function (successCallback) {
			var self = this;
			var url = '/analysis/quotes/service.asp?name=quotes&action=favorites';
			$.ajax({
				url: url,
				dataType: 'json',
				type: 'POST',
				cache: false,
				data: 'command=read&quote=' + self.quote,
				success: function (data) {
					self.setViewStatus(data.result);
					if (typeof successCallback == 'function')
						successCallback(data.isAuth);
				},
				error: function () {},
			});
		},

		// добавляем/удаляем фаворита
		send: function () {
			var self = this;
			var cmd = self.elm.hasClass('favorite-checked') ? 'delete' : 'add';
			var url = '/api/favorite/' + cmd + '/';
			$.ajax({
				url: url,
				dataType: 'json',
				type: 'POST',
				cache: false,
				data: 'quoteId=' + self.quote,
				success: function (data) {
					self.setViewStatus(data.status);
					if (cmd == 'delete') {
						self.setViewStatus(0);
					}
				},
				error: function () {},
			});
		},
	};

	Finam.IssuerProfile.Main.init();
})(Finam, jQuery);

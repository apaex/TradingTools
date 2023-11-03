if (!Finam) { var Finam = {}; }

Finam.NewsBelt = {};

Finam.NewsBelt.Main = {
	_load: false,
	_section: null,
	_loading: false,
	init: function() {
		if (this._load) {
			this.load();
		} else {
			this._page = 1;
			this._section = parseInt($.cookie('NewsBeltSection'));
			if (isNaN(this._section)) {
				this._section = 1;
				this.update();
			}
			var d = this.dom = {};
			d.elm = $('#news-belt-sidebar');
			if (d.elm.length == 1) {
				var self = this;
				this.preloader = {
					list: new Finam.UI.Controls.Utils.Preloader($('#news-belt-sidebar-list')),
					more: new Finam.UI.Controls.Utils.Preloader($('#news-belt-sidebar-more'))
				};
				var control = $('#news-belt-sidebar-selector');
				var title = $('#news-belt-sidebar-selector-title');
				var option = title.html();
				var arrow = $('#news-belt-sidebar-selector-arrow'); 
				this.dropdown = new Finam.UI.Controls.Utils.DropdownList({
					control: control,
					title: title,
					arrow: arrow,
					list: $('#news-belt-sidebar-sections').hide(),
					minWidth: 195,
					params: ['url'],
					change: function(value, option) {
						title.html(option + '<span class="arrow">&#9660;</span>');
						if (!self._loading && value != self._section) {
							//jQMigrateFrom $('#news-belt-sidebar-more-link').attr('href', self.dropdown.param('url')).html(value == 1 ? 'Остальные события' : 'Остальные новости');
							$('#news-belt-sidebar-more-link').prop('href', self.dropdown.param('url')).html(value == 1 ? 'Остальные события' : 'Остальные новости');
							self._loading = true;
							self.preloader.list.show();
							$.ajax({
								url: '/service.asp?name=news-belt&action=page&page=1&section=' + value,
								dataType: 'html',
								success: function(html) {
									$('#news-belt-sidebar-list').html($(html));
									self._section = value;
									self.update();
									self.redraw();
									self.preloader.list.hide();
									self._loading = false;
								},
								error: function(jqXHR, textStatus, errorThrown) {
									self.preloader.list.hide();
									self._loading = false;
									console.log([jqXHR, textStatus, errorThrown]);
								}
							});
						}
					}
				});
				title.html(option + '<span class="arrow">&#9660;</span>');
				this.more = $('#news-belt-sidebar-more BUTTON').bind('click', function() {
					if (!self._loading) {
						self._loading = true;
						self.preloader.more.show();
						$.ajax({
							url: '/service.asp?name=news-belt&action=page&page=' + (self._page + 1) + '&section=' + self._section + '&' + Math.random(),
							dataType: 'html',
							success: function(html) {
								$('#news-belt-sidebar-list').append($(html));
								self.redraw();
								self._page++;
								self.preloader.more.hide();
								self._loading = false;
							},
							error: function(jqXHR, textStatus, errorThrown) {
								self.preloader.more.hide();
								self._loading = false;
								console.log([jqXHR, textStatus, errorThrown]);
							}
						});
					}
				});
				this._windowWidth = $(window).width();
				this._redrawItemsEnabled = ($('#united-lent').length == 1);
				$(window).resize(function() {
					if ($(window).width() != self._windowWidth) {
						self.redraw();
						self._windowWidth = $(window).width();
					}
				});
				$.each(d.elm.find('A'), function (index, link) {
					//jQMigrateFrom if ($(link).attr('href').indexOf('http:') == -1) {
					if ($(link).prop('href').indexOf('http:') == -1) {
						$(link).removeAttr('target');
					}
				});
				this.redraw();
			}
		}
		return this;
	},
	redraw: function() {
		if (this._redrawItemsEnabled) {
			$.each($('#united-lent .news-belt-sidebar-item:gt(14)'), function(index, item) {
				$(item).hide();
			});
			var height = $('#united-lent').outerHeight();
			$.each($('#united-lent .news-belt-sidebar-item:hidden'), function(index, item) {
				item = $(item).css('visibility', 'hidden').show();
				if (item[0].offsetTop + item[0].offsetHeight < height) {
					item.css({
						visibility: 'visible'
					}).show()
				} else {
					item.hide();
				}
			});
		} else {
			$.each($('#news-belt-sidebar-list .news-belt-sidebar-item:hidden'), function(index, item) {
				$(item).show();
			});
		}
		$('#news-belt-sidebar-list .last-in-lent').removeClass('last-in-lent');
		if (this._section == 1) {
			var items = $('#news-belt-sidebar-list .news-belt-sidebar');
			if (items.length > 0) {
				var last = $(items[items.length - 1]);
				last.addClass('last-in-lent');
			}
		}
		return this;
	},
	update: function() {
		var date = new Date();
		date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, date.getHours(), date.getMinutes(), date.getSeconds());
		$.cookie('NewsBeltSection', this._section + '', { path: '/', expires: date });
		return this;
	},
	load: function() {
		var section = parseInt($.cookie('NewsBeltSection')) || 1;
		if ($('#united-lent').length == 1 && section != 1) {
			var self = this;
			$.ajax({
				url: '/service.asp?name=news-belt&action=sidebar',
				dataType: 'html',
				success: function(html) {
					$('#united-lent').html(html);
					self._load = false;
					self.init();
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.log([jqXHR, textStatus, errorThrown]);
				}
			});
		} else {
			var self = this;
			self._load = false;
			self.init();
		}
	}
};

$(document).ready(function() {
	Finam.NewsBelt.Main.init();
});

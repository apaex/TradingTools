(function (Finam, $, window, document, undefined) {

	namespace('Finam.UI.Controls.NewsCalendar')
	
	Finam.UI.Controls.NewsCalendar.Main = function(elm) {
		var self = this;
		var d = this.dom = {};
		elm = d.elm = $(elm);
		var today = (new Date()).formatDate('yyyy-mm-dd');
		var startParam = elm.data('start-param') || 'start-date';
		var endParam = elm.data('end-param') || 'end-date';
		var start = Finam.Utils.Query.one(startParam);
		var end = Finam.Utils.Query.one(endParam) || start;
		var url = document.location.href.split('#');
		if (url[0].indexOf(startParam) == -1) {
			url[0] = url[0] + ((url[0].indexOf('?') != -1) ? '&' : '?') + startParam + '=# start-date #';
		} else {
			url[0] = url[0].replace(startParam + '=' + start, startParam + '=# start-date #');
		}
		if (url[0].indexOf(endParam) == -1) {
			url[0] = url[0] + ((url[0].indexOf('?') != -1) ? '&' : '?') + endParam + '=# end-date #';
		} else {
			url[0] = url[0].replace(endParam + '=' + end, endParam + '=# end-date #');
		}
		this._url = url.join('#');
		self.days = new Finam.UI.Controls.NewsCalendar.Days($(elm).find('.f-news-calendar-days'))
			.resize()
			.redraw(start, end)
			.bind('select', function(start, end) {
				self.select(start, end);
			});
		var maxYear = $(elm).data('max-year') || (new Date()).getFullYear();
		var minYear = $(elm).data('min-year') || maxYear - 7;
		self.range = new Finam.UI.Controls.DateRange($(elm).find('.f-news-calendar-daterange'), {
			start: start,
			end: end,
			minYear: minYear,
			maxYear: maxYear
		})
			.bind('select', function(start, end) {
				self.days.redraw(start, end);
				self.select(start, end);
			});
		return this;
	};
	Finam.UI.Controls.NewsCalendar.Main.prototype = {
		select: function(start, end) {
			var url = this._url.replace('# start-date #', start).replace('# end-date #', end);
			document.location = url;
			return this;
		}
	};

	Finam.UI.Controls.NewsCalendar.Days = function(elm) {
		var d = this.dom = {};
		elm = d.elm = $(elm);
		var self = this;
		$.extend(this, new Finam.Utils.Events());
		var today = (new Date()).formatDate('yyyy-mm-dd');
		var more = $('<li class="f-news-calendar-days__more"><a href="#" class="f-news-calendar-days__link"><span>Ещё</span><i class="fa fa-sort-desc"></i></a></li>');
		this.dom.elm.find('.f-news-calendar-days__item').last().after(more);
		$.each($(elm).find('.f-news-calendar-days__item .f-news-calendar-days__link'), function(idx, link) {
			link = $(link);
			var type = link.data('type');
			var now = (new Date());
			var first = today;
			var last = today;
			switch (type) {
				case 'yesterday':
					var first = now.add('day', -1, 'yyyy-mm-dd');
					var last = first;
					break;
				case 'today':
					// см. выше
					break;
				case 'last-week':
					var first = now.add('day', -6, 'yyyy-mm-dd');
					break;
				case 'last-month':
					var first = now.add('month', -1, 'yyyy-mm-dd');
					break;
				case 'last-year':
					var first = now.add('year', -1, 'yyyy-mm-dd');
					break;
				default:
					if (type.indexOf('year') != -1) {
						var value = parseInt(link.text(), 10);
						var first = (new Date(value, 0, 1)).formatDate('yyyy-mm-dd');
						var last = (new Date(value + 1, 0, 0)).formatDate('yyyy-mm-dd');
					}
					break;
			}
			link.attr('start', first)
			link.attr('end', last);
			link.bind({
				click: function() {
					self.redraw($(this).attr('start'), $(this).attr('end'));
					self.raise('select', $(this).attr('start'), $(this).attr('end'));
					dropdown.hide();
					return false;
				}
			});
		});
		// more
		var hidden = $(elm).find('.f-news-calendar-days__item:hidden .f-news-calendar-days__link');
		if (hidden.length > 0) {
			var list = [];
			$.each(hidden, function(index, elm) {
				list.push({
					value: $(elm).data('type'),
					title: $(elm).text()
				});
			});
			var dropdown = new Finam.UI.Controls.Utils.DropdownList({
				control: $(elm).find('.f-news-calendar-days__more'),
				title: null,
				arrow: null,
				list: list,
				change: function(value, option) {
					$(elm).find('.f-news-calendar-days__item .f-news-calendar-days__link[data-type="' + value + '"]').trigger('click');
				}
			});
			$(elm).find('.f-news-calendar-days__more A').bind({
				click: function() {
					dropdown.show();
					return false;
				}
			});
		}
		$(window).on('orientationchange', function(event) {
			self.resize();
			self.redraw();
		});
		return this;
	};
	Finam.UI.Controls.NewsCalendar.Days.prototype = {
		resize: function() {
			var width = this.dom.elm.closest('.f-news-calendar').outerWidth() - 240; // ширина даты-ранге
			var years = this.dom.elm.find('.f-news-calendar-days__item');
			var yearWidth = 65; //years.outerWidth();
			var visibleCount = Math.floor(width / yearWidth) - 1;
			if (visibleCount < years.length) {
				years.hide();
				var visible = this.dom.elm.find(String.format('.f-news-calendar-days__item:lt({0})', visibleCount));
				visible.show();
				if (visibleCount == 0) {
					this.dom.elm.find('.f-news-calendar-days__more').addClass('f-news-calendar-days__item-first');
				} else {
					this.dom.elm.find('.f-news-calendar-days__more').removeClass('f-news-calendar-days__item-first');
				}
			} else {
				years.show();
			}
			return this;
		},
		redraw: function(start, end) {
			this.dom.elm.find('.f-news-calendar-days_mode_selected').removeClass('f-news-calendar-days_mode_selected');
			if (!!start && !!end) {
				var year = this.dom.elm.find('*[start="' + start + '"][end="' + end + '"]');
				if (year.is(':visible')) {
					year.closest('.f-news-calendar-days__item').addClass('f-news-calendar-days_mode_selected');
					this.dom.elm.find('.f-news-calendar-days__more SPAN').html('Ещё');
				} else {
					this.dom.elm.find('.f-news-calendar-days__more').addClass('f-news-calendar-days_mode_selected');
					this.dom.elm.find('.f-news-calendar-days__more SPAN').html(year.html());
				}
			}
			return this;
		}
	};

	$(document).ready(function() {
		$.each($('.f-news-calendar'), function(index, calendar) {
			new Finam.UI.Controls.NewsCalendar.Main($(calendar));
		});
	});

})(Finam, jQuery, window, document, undefined);

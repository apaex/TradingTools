(function (Finam, $, window, document, undefined) {

	namespace('Finam.UI.Controls');

	Finam.UI.Controls.DateRange = function(elm, opts) {
		opts = opts || {};
		// KAY: определять мобильность по-другому
		opts.mobi = !!window.Mobi || false;
		var self = this;
		this._years = {};
		this._visibleMonths = this.calcVisibleMonths();
		this._minYear = opts.minYear || 1990;
		this._maxYear = (opts.maxYear || (new Date()).getFullYear() + 1);
		this._startYear = this._minYear;
		this._endYear = this._maxYear;
		this._monthWidth = (168 + 24);
		this._sliderWidth = 15;
		this._todayDate = new Date(Date.parse((new Date()).formatDate('yyyy-mm-dd')));
		this._startDate = this._todayDate;
		this._endDate = this._todayDate;
		this._moving = false;
		this._movingExt = 0;
		this._interval = null;
		this._intervalCheck = 0;
		this._swipingInterval = 0;
		this._currSelectedIndex = 1;
		this._deltaMonth = 0;
		this._deltaYear = 0;
		this._list = opts.list || [];

		// dom
		var d = this.dom = {};
		elm = d.elm = $(elm);
		$.extend(this, new Finam.Utils.Events());
		var s = d.selector = $('<div class="f-daterange-selector"><div class="f-daterange-selector__years"><span class="f-daterange-selector__years-prev">«</span><div class="f-daterange-selector__years-list"><div class="f-daterange-selector__years-list-inner"></div></div><span class="f-daterange-selector__years-next">»</span></div><div class="f-daterange-selector__years-slider"><div></div></div><div class="f-daterange-selector__months"><div class="f-daterange-selector__months-inner"></div></div><div class="f-daterange-selector__bottom"><div class="f-daterange-selector__bottom-inner"><span class="f-daterange-selector__start-end"><input type="text" name="start" class="f-daterange-selector__start" /> — <input type="text" name="end" class="f-daterange-selector__end" /></span><input type="button" class="f-daterange-selector__button ibutton yellow-button" value="Показать" /></div></div></div>').css({ display: 'none' });
		$(document.body).append(d.selector);
		// события всяческие
		d.elm.find('.f-news-calendar-daterange__link').bind({
			click: function() {
				self.show();
				return false;
			}
		});
		$(document.body).bind({
			'click, tap': function(event) {
				var control = $(event.target).closest('.f-daterange-selector');
				if (control.length == 0) {
					self.hide();
				}
			}
		});
		$(window).on('orientationchange', function(event) {
			var months = null;
			if (event.orientation == 'portrait') {
				months = 1;
			}
			if (event.orientation == 'landscape') {
				months = 2;
			}
			if (!!months) {
				self._visibleMonths = months;
				self.resize();
				self.redraw();
			}
		});
		/*
		$(window).on('resize', function(event) {
			var months = self.calcVisibleMonths();
			if (months != self._visibleMonths) {
				self._visibleMonths = months;
				self.resize();
				self.redraw();
				self.show();
			}
		});
		*/
		// years
		s.find('.f-daterange-selector__years-list').on('click', '.f-daterange-selector__years-item', function() {
			var year = parseInt($(this).text(), 10);
			var currPointer = self._currDate.getFullYear() * 12 + self._currDate.getMonth();
			var newPointer = year * 12;
			self._deltaMonth = newPointer - currPointer;
			self.move(self._deltaMonth);
			return false;
		});
		s.find('.f-daterange-selector__years-prev').bind({
			'click, tap': function() {
				self.move(-1);
				return false;
			},
			'mousedown, taphold': function() {
				self.start('slide', -1);
				return false;
			},
			'mouseup, vmouseup': function() {
				self.stop('slide');
				return false;
			},
			'selectstart': function(event) {
				return false;
			}
		});
		s.find('.f-daterange-selector__years-next').bind({
			'click, tap': function() {
				self.move(1);
				return false;
			},
			'mousedown, taphold': function() {
				self.start('slide', 1);
				return false;
			},
			'mouseup, vmouseup': function() {
				self.stop('slide');
				return false;
			},
			'selectstart': function(event) {
				return false;
			}
		})
		s.find('.f-daterange-selector__years-slider').bind({
			click: function(event) {
				self.move(self.calcDeltaMonth(event.pageX - self._yearWidth));
			}
		});
		s.find('.f-daterange-selector__years-slider DIV').draggable({
			axis: 'x',
			containment: 'parent',
			drag: function(event, ui) {
				self.move(self.calcDeltaMonth(ui.position.left));
			},
			stop: function() {
				self.move(0);
			}
		})
		// события для мобильных
		s.find('.f-daterange-selector__months').bind({
			tap: function(event) {
				self.stop();
			},
			swipeleft: function() {
				self.start('swipe', -1);
			},
			swiperight: function() {
				self.start('swipe', 1);
			}
		});
		// months
		s.find('.f-daterange-selector__months').on('click', '.f-drs_m-d', function(event) {
			var months = $(this).closest('.f-daterange-selector__months');
			var year = parseInt($(this).closest('TABLE').attr('year'), 10);
			var month = parseInt($(this).closest('TABLE').attr('month'), 10);
			var day = parseInt($(this).attr('day'), 10);
			var date = new Date(year, month - 1, day);
			if (self._currSelectedIndex == 1) {
				self._startDate = date;
				self._endDate = date;
				self._currSelectedIndex = 2;
			} else {
				if (date.formatDate('yyyy-mm-dd') < self._startDate.formatDate('yyyy-mm-dd')) {
					self._endDate = self._startDate;
					self._startDate = date;
				} else {
					self._endDate = date;
				}
				self._currSelectedIndex = 1;
			}
			self.redraw();
			return false;
		});
		s.find('.f-daterange-selector__start, .f-daterange-selector__end').bind({
			keyup: function(event){
				var value = $(this).val().split('.');
				var date = null;
				if (value.length == 3) {
					value[2] = parseInt(value[2]);
					if (value[2] >= self._startYear && value[2] <= self._endYear) {
						value[1] = parseInt(value[1], 10);
						if (value[1] >= 1 && value[1] <= 12) {
							value[0] = parseInt(value[0], 10);
							var check = new Date(value[2], value[1], 0);
							if (value[0] >= 1 && value[0] <= check.getDate()) {
								date = new Date(value[2], value[1] - 1, value[0]);
							}
						}
					}
				}
				s.find('.f-daterange-selector_date_error').removeClass('f-daterange-selector_date_error');
				if (!!date) {
					var name = $(this).attr('name');
					if (name == 'start') {
						var deltaMonths = (date.getFullYear() * 12 + date.getMonth()- self._startDate.getFullYear() * 12 - self._startDate.getMonth());
						self.move(deltaMonths);
					}
					var start = (name == 'start') ? date : self._startDate;
					var end = (name == 'end') ? date : self._endDate;
					if (start <= end) {
						self.init(start, end);
					} else {
						s.find('.f-daterange-selector__start-end').addClass('f-daterange-selector_date_error');
					}
				} else {
					$(this).addClass('f-daterange-selector_date_error');
				}
			}
		});
		// other
		s.find('.f-daterange-selector__button').bind({
			click: function() {
				self.redraw();
				self.raise('select', self._startDate.formatDate('yyyy-mm-dd'), self._endDate.formatDate('yyyy-mm-dd'));
				self.hide();
				return false;
			}
		});
		this.create();
		this.init(opts.start, opts.end || opts.start);
		return;
	};
	Finam.UI.Controls.DateRange.prototype = {
		init: function(start, end) {
			var startDate = new Date(Date.parse(start) || this._todayDate);
			var endDate = new Date(Date.parse(end) || this._todayDate);
			// KAY: добавить добавление годов, если входящие даты выходят за первоначальный диапазон
			this._startDate = startDate;
			this._endDate = endDate;
			this._currDate = startDate;
			var deltaMonth = this.getDateIndex(endDate) - this.getDateIndex(startDate);
			if (deltaMonth <= 1 && this._visibleMonths > 1) {
				this._currDate = startDate.add('month', -1);
			}
			this.resize();
			this.redraw();
			return this;
		},
		create: function() {
			var startYear = this._startYear;
			var endYear = this._endYear;
			var s = this.dom.selector;
			for (var year = startYear; year <= endYear; year++) {
				if (!this._years[year]) {
					// добавляем год в панельку сверху
					var yearElm = $('<a href="#" class="f-daterange-selector__years-item"></a>').html(year).attr('year', year).css('width', this._yearWidth);
					var prevYearElm = s.find('.f-daterange-selector__years-item[year="' + (year - 1) + '"]');
					if (prevYearElm.length != 0) {
						prevYearElm.after(yearElm);
					} else {
						var nextYearElm = s.find('.f-daterange-selector__years-item[year="' + (year + 1) + '"]');
						if (nextYearElm.length != 0) {
							nextYearElm.before(yearElm);
						} else {
							s.find('.f-daterange-selector__years-list-inner').append(yearElm);
						}
					}
					this._startYear = Math.min(this._startYear, year);
					this._endYear = Math.max(this._endYear, year);
					s.find('.f-daterange-selector__years-list-inner').css({ width: s.find('.f-daterange-selector__years-item').length * this._yearWidth });
					this._years[year] = {
						title: s.find('.f-daterange-selector__years-item[year="' + year + '"]')
					};
				}
			}
			return this;
		},
		redraw: function() {
			var startYear = this._startDate.getFullYear();
			var startMonth = this._startDate.getMonth();
			var startIndex = this.getDateIndex(this._startDate);
			var endYear = this._endDate.getFullYear();
			var endMonth = this._endDate.getMonth();
			var endIndex = this.getDateIndex(this._endDate);
			var currYear = this._currDate.getFullYear();
			var currMonth = this._currDate.getMonth();
			if (currYear < this._startYear) {
				currYear = this._startYear;
				currMonth = 0;
			}
			if (currYear > this._endYear) {
				currYear = this._endYear;
				currMonth = 12 - this._visibleMonths;
			} else {
				if (currYear == this._endYear && currMonth > 12 - this._visibleMonths) {
					currMonth = 12 - this._visibleMonths;
				}
			}
			this._currDate = new Date(currYear, currMonth, 1);
			var currIndex = this.getDateIndex(this._currDate);
			var todayIndex = this.getDateIndex(this._todayDate);
			var self = this;
			var s = this.dom.selector;
			// пересовывуем года
			var y = s.find('.f-daterange-selector__years-list-inner');
			var lastYear = this._maxYear;
			var firstYear = lastYear - this._maxVisibleYears + 1;
			if (currYear < firstYear) {
				firstYear = currYear;
				lastYear = firstYear + this._maxVisibleYears - 1;
			} else {
				if (currYear > lastYear) {
					lastYear = currYear;
					firstYear = lastYear - this._maxVisibleYears + 1;
				}
			}
			this._firstYear = firstYear;
			this._lastYear = lastYear;
			var yearX = - (firstYear - this._minYear) * this._yearWidth;
			y.css({
				left: yearX
			});
			// передвигаем слайдер
			var sliderX = Math.floor((currYear - firstYear + currMonth / 12) * this._yearWidth);
			s.find('.f-daterange-selector__years-slider DIV').css({
				left: sliderX + 5
			});
			// перерисувываем месяцы
			// KAY: сделать на 1 месяц
			var m = s.find('.f-daterange-selector__months');
			var monthHtml = '';
			monthHtml += '<table><caption>Месяц</caption><thead><tr><th>ПН</th><th>ВТ</th><th>СР</th><th>ЧТ</th><th>ПТ</th><th class="f-drs_m-w">СБ</th><th class="f-drs_m-w">ВС</th></thead><tbody>';
			monthHtml += '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
			monthHtml += '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
			monthHtml += '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
			monthHtml += '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
			monthHtml += '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
			monthHtml += '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
			monthHtml += '</tbody></table>';
			var monthsHtml = '';
			for (var monthIndex = 0; monthIndex < this._visibleMonths; monthIndex++) {
				monthsHtml += monthHtml;
			}
			m.html(monthsHtml);
			var months = m.find('TABLE');
			for (var monthIndex = 0; monthIndex < this._visibleMonths; monthIndex++) {
				var monthElm = $(months[monthIndex]);
				monthElm.attr('year', currYear);
				monthElm.attr('month', currMonth + monthIndex + 1);
				var date = new Date(currYear, currMonth + monthIndex, 1)
				var year = date.getFullYear();
				var month = date.getMonth();
				var firstDay = date.getDay();
				firstDay = (firstDay == 0 ? 7 : firstDay) - 1;
				var lastDay = new Date(year, month + 1, 0).getDate();
				var dayNum = 1;
				$.each(monthElm.find('TD'), function(dayIndex, dayElm) {
					if (dayIndex >= firstDay && dayNum <= lastDay) {
						var date = new Date(year, month, dayNum);
						$(dayElm).addClass('f-drs_m-d').html(dayNum);
						$(dayElm).attr('day', dayNum);
						var dateIndex = year * 10000 + (month + 1) * 100 + dayNum;
						if (dateIndex >= startIndex && dateIndex <= endIndex) {
							$(dayElm).addClass('f-drs_m-s');
						}
						// вишенка на торт — отмечаем текущую дату
						if (todayIndex == dateIndex) {
							$(dayElm).addClass('f-daterange-selector__months-current');
						}
						dayNum++;
					}
				});
				monthElm.find('CAPTION').html(Date._months[month] + ', ' + year);
			}
			// заполняем поля
			this.dom.elm.find('.f-news-calendar-daterange__start').html(this._startDate.formatDate('dd.mm.yyyy'));
			this.dom.elm.find('.f-news-calendar-daterange__end').html(this._endDate.formatDate('dd.mm.yyyy'));
			s.find('.f-daterange-selector__start').val(this._startDate.formatDate('dd.mm.yyyy'));
			s.find('.f-daterange-selector__end').val(this._endDate.formatDate('dd.mm.yyyy'));
			if (this._visibleMonths > 1) {
				s.find('.f-daterange-selector__start-end').show();
			} else {
				s.find('.f-daterange-selector__start-end').hide();
			}
			if (this.dom.selector.is(':visible')) {
				this.show();
			}
			return this;
		},
		resize: function() {
			var self = this;
			// сделаем размеры
			switch (this._visibleMonths) {
				case 1:
					this._maxVisibleYears = 3;
					this._yearWidth = 40;
					break;
				case 2:
					this._maxVisibleYears = 6;
					this._yearWidth = 50;
					break;
				case 3:
					this._maxVisibleYears = 8;
					this._yearWidth = 60;
					break;
				case 4:
					this._maxVisibleYears = 10;
					this._yearWidth = 70;
					break;
			}
			var mainWidth = this._visibleMonths * 200;
			var monthPadding = (this._visibleMonths < 3 ? 6 : 12);
			var moveButtonWidth = (mainWidth - this._maxVisibleYears * this._yearWidth) / 2;
			var s = this.dom.selector;
			s.css({
				width: mainWidth
			});
			s.find('.f-daterange-selector__bottom, .f-daterange-selector__years').css({
				width: mainWidth
			});
			s.find('.f-daterange-selector__years-list').css({
				width: mainWidth - moveButtonWidth * 2,
				left: moveButtonWidth
			});
			s.find('.f-daterange-selector__months').css({
				width: mainWidth - monthPadding * 2,
				left: monthPadding
			});
			s.find('.f-daterange-selector__years-prev, .f-daterange-selector__years-next').css({
				width: moveButtonWidth
			});
			if (this._visibleMonths == 1) {
				s.find('.f-daterange-selector__start-end').hide();
			} else {
				s.find('.f-daterange-selector__start-end').show();
			}
			s.find('.f-daterange-selector__years-slider').css({
				left: moveButtonWidth - 5,
				width: this._yearWidth * this._maxVisibleYears + 10
			});
			s.find('.f-daterange-selector__years-item').css({
				width: this._yearWidth
			});
			s.find('.f-daterange-selector__years-list-inner').css({ width: s.find('.f-daterange-selector__years-item').length * this._yearWidth });
			return this;
		},
		move: function(deltaMonth) {
			this._currDate = this._currDate.add('month', deltaMonth);
			this.redraw();
			return this;
		},
		start: function(mode, deltaMonth) {
			var self = this;
			if (self._movingExt == 0 && (mode == 'swipe' || mode == 'slide')) {
				self._movingExt = deltaMonth;
				switch(mode) {
					case 'swipe':
						self._swipingInterval = 50;
						self.swipe();
						break;
					case 'slide':
						self.slide();
						break;
				}
			}
			return this;
		},
		swipe: function() {
			var self = this;
			if (self._movingExt != 0) {
				self._interval = setTimeout(function() {
					self.move(self._movingExt);
					self._swipingInterval = self._swipingInterval + 10;
					if (self._swipingInterval <= 100) {
						self.swipe();
					} else {
						self.stop();
					}
				}, self._swipingInterval);
			}
		},
		stop: function() {
			var self = this;
			if (self._movingExt != 0) {
				if (!self._interval) {
					window.clearTimeout(self._interval);
					self._interval = null;
				}
				self._movingExt = 0;
			}
			return this;
		},
		slide: function() {
			var self = this;
			if (self._movingExt != 0) {
				self._interval = setTimeout(function() {
					self.move(self._movingExt);
					self.slide();
				}, 10);
			}
			return this;
		},
		stopMove: function() {
		},
		show: function() {
			var position = this.dom.elm.offset();
			var x = Math.floor(position.left + this.dom.elm.outerWidth() / 2 - this.dom.selector.outerWidth() / 2 + 1);
			var y = Math.floor(position.top + this.dom.elm.outerHeight());
			x = Math.min(Math.max(x, 5), $(document.body).outerWidth() - this.dom.selector.outerWidth() - 5);
			this.dom.selector.css({
				left: x,
				top: y,
				visibility: 'visible',
				display: 'block'
			});
			this.raise('show');
			return this;
		},
		hide: function() {
			this.dom.selector.css({
				visibility: 'visible',
				display: 'none'
			});
			this.raise('hide');
			return this;
		},
		calcDeltaMonth: function(x) {
			var firstYear = this._firstYear;
			var lastYear = this._firstYear + this._maxVisibleYears - 1;
			var yearIndex = Math.floor(x / this._yearWidth);
			var year = firstYear + yearIndex;
			var month = Math.round((x - yearIndex * this._yearWidth) / this._yearWidth * 12);
			var currYear = this._currDate.getFullYear();
			var currMonth = this._currDate.getMonth();
			this._deltaMonth = (year * 12 + month) - (currYear * 12 + currMonth);
			if (this._deltaMonth == 0) {
				if (year == firstYear && year >= this._minYear) {
					this._deltaMonth = -1;
				}
				if (year == lastYear && year <= this._maxYear) {
					this._deltaMonth = 1;
				}
			}
			return this._deltaMonth;
		},
		getDateIndex: function(dte) {
			var idx = dte.getFullYear() * 10000 + (dte.getMonth() + 1) * 100 + dte.getDate();
			return idx;
		},
		calcVisibleMonths: function() {
			var months = 3;
			var windowWidth = $(window).outerWidth();
			if (windowWidth >= 220) {
				months = 1;
			}
			if (windowWidth >= 420) {
				months = 2;
			}
			if (windowWidth >= 620) {
				months = 3;
			}
			//if (windowWidth >= 820) {
			//	months = 4;
			//}
			return months;
		}
	};

})(Finam, jQuery, window, document, undefined);

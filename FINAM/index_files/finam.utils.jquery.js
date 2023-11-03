(function($) {

	var userAgent = navigator.userAgent.toLowerCase();
	var isOldIe = /msie/.test(userAgent) && !/opera/.test(userAgent);
	var ieVersion = 0;
	if (isOldIe) {
		var rex = /^.* msie ([0-9\.]+)\;.*/.exec(userAgent);
		if (rex != null && rex.length > 1)
			ieVersion = rex[1];
	}

	$.support.IE = {
		isOld: isOldIe,
		version: ieVersion,
		is7: (isOldIe && ieVersion == '7.0'),
		is8: (isOldIe && ieVersion == '8.0'),
		isCompatibility: false
	};

	if ($.support.IE.isOld) {
		if ($.support.IE.is8) {
			$.support.IE.isCompatibility = (document.documentMode < 8);
		} else {
			$.support.IE.isCompatibility = (document.documentMode < 9);
		}
	}

	$.support.placeholder = false;
	var test = document.createElement('INPUT');
	if ('placeholder' in test) $.support.placeholder = true;

	$.support.HTML5 = Modernizr.canvas;
})(jQuery);

// jQuery functions
(function ($) {
	$.fn.setCursorPosition = function(pos, delay) {
		this.each(function(index, elem) {
			var fn = null;
			if (elem.setSelectionRange) {
				var fn = function() { elem.setSelectionRange(pos, pos); }
			} else if (elem.createTextRange) {
				var fn = function() {
					var range = elem.createTextRange();
					range.collapse(true);
					range.moveEnd('character', pos);
					range.moveStart('character', pos);
					range.select();
				}
			}
			if (!!fn) {
				fn();
			}
		});
		return this;
	};

	$.fn.center = function() {
		this.each(function(index, elm) {

		});
		return this;
	};
})(jQuery);

// jQuery functions
(function ($) {
	$.fn.addUTM = function() {
		var utm = Finam.Utils.UTM.url();
		if (utm.length > 0) {
			this.each(function(index, elem) {
				var href = $(elem).attr('href');
				if (!!href) {
					href += (href.indexOf('?') == -1 ? '?' : '&') + utm;
					$(elem).attr('href', href);
				}
			});
		}
		return this;
	};

	$.fn.extend({
		validEmail: function () {

			var input = $(this[0]);

			$(input).bind(($.browser.opera ? 'keypress' : 'keydown'), function (e) {

				var key = e.charCode || e.keyCode || 0;

				return (
					key == 8 ||
					key == 9 ||
					key == 46 ||
					key == 45 ||
					key == 45 ||
					key == 173 ||
					key == 189 ||
					key == 190 ||
					(key >= 33 && key <= 40) ||
					(key >= 48 && key <= 57) ||
					(key >= 65 && key <= 90) ||
					(key >= 96 && key <= 105));

			})

		}
	});

	$.fn.center = function() {
		this.each(function(index, elm) {

		});
		return this;
	};
})(jQuery);

// jQuery layout fixes
(function ($) {
	$(document).ready(function() {
		// INPUT PlaceHolders
		if (!$.support.placeholder && !!document) {
			// шота код несовместим с Finam.Form.Frame
			try {
				var active = document.activeElement;
				if (!!active) {
					$(':text')
						.focus(function () {
							if ($(this).data('placeholder') != '' && $(this).val() == $(this).data('placeholder')) {
								$(this).val('').removeClass('hasPlaceholder');
							}
						})
					$(':text')
						.blur(function () {
							if (!!$(this).attr('placeholder') && ($(this).val() == '' || $(this).val() == $(this).attr('placeholder'))) {
								$(this).val($(this).attr('placeholder')).addClass('hasPlaceholder');
								// что-то атрибут потом не читается
								$(this).data('placeholder', $(this).attr('placeholder'));
							}
						});
					$(':text').blur();
					//$(active).focus();
					$('FORM').submit(function () {
						//$(this).find('.hasPlaceholder').each(function() { $(this).val(''); });
					});
				}
			} catch(e) { };
		}
		// smooth scroll
		$('A.js-scroll[href^="#"]').bind({
			click: function() {
				console.log($(this));
				var name = $(this).attr('href').replace('#', '');
				var anchor = $('A[name="' + name + '"]');
				if (anchor.length == 1) {
					var y0 = parseInt($(this).data('y0'));
					if (isNaN(y0)) {
						var top = $($(this).data('top'));
						// TODO: для всех из топа
						var y0 = top.outerHeight();
						$(this).data('y0', y0)
					}
					var y = anchor.offset().top;
					$('HTML, BODY').animate({ scrollTop: y - y0 }, 150);
					document.location.hash = '#' + name;
				}
				return false;
			}
		});
	});
})(jQuery);

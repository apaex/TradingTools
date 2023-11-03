/*
 * Autocomplete - jQuery plugin 1.1pre
 *
 * Copyright (c) 2007 Dylan Verheul, Dan G. Switzer, Anjesh Tuladhar, J?rn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id: jquery.autocomplete.js 5785 2008-07-12 10:37:33Z joern.zaefferer $
 *
 */
(function ($) {
	$.fn.extend({
		autocomplete: function (urlOrData, options) {
			var isUrl = typeof urlOrData == 'string';
			options = $.extend(
				{},
				$.Autocompleter.defaults,
				{
					url: isUrl ? urlOrData : null,
					data: isUrl ? null : urlOrData,
					delay: isUrl ? $.Autocompleter.defaults.delay : 2,
					max: options && !options.scroll ? 10 : 150,
				},
				options
			);

			// if highlight is set to false, replace it with a do-nothing function
			options.highlight =
				options.highlight ||
				function (value) {
					return value;
				};

			// if the formatMatch option is not specified, then use formatItem for backwards compatibility
			options.formatMatch = options.formatMatch || options.formatItem;

			return this.each(function () {
				new $.Autocompleter(this, options);
			});
		},
		result: function (handler) {
			return this.bind('result', handler);
		},
		search: function (handler) {
			return this.trigger('search', [handler]);
		},
		flushCache: function () {
			return this.trigger('flushCache');
		},
		setOptions: function (options) {
			return this.trigger('setOptions', [options]);
		},
		unautocomplete: function () {
			return this.trigger('unautocomplete');
		},
	});

	$.Autocompleter = function (input, options) {
		var KEY = {
			UP: 38,
			DOWN: 40,
			DEL: 46,
			TAB: 9,
			RETURN: 13,
			ESC: 27,
			COMMA: 188,
			PAGEUP: 33,
			PAGEDOWN: 34,
			BACKSPACE: 8,
		};

		// Create $ object for input element
		var $input = $(input)
			.attr('autocomplete', 'off')
			.addClass(options.inputClass);

		var timeout;
		var previousValue = '';
		var cache = $.Autocompleter.Cache(options);
		var hasFocus = 0;
		var lastKeyPressCode;
		var config = {
			mouseDownOnSelect: false,
		};
		var select = $.Autocompleter.Select(options, input, selectCurrent, config);

		var blockSubmit;

		// prevent form submit in opera when selecting with return key
		$.browser.opera &&
			$(input.form).bind('submit.autocomplete', function () {
				if (blockSubmit) {
					blockSubmit = false;
					return false;
				}
			});

		// only opera doesn't trigger keydown multiple times while pressed, others don't work with keypress at all
		$input
			.bind(
				($.browser.opera ? 'keypress' : 'keydown') + '.autocomplete',
				function (event) {
					// track last key pressed
					lastKeyPressCode = event.keyCode;
					switch (event.keyCode) {
						case KEY.UP:
							event.preventDefault();
							if (select.visible()) {
								select.prev();
							} else {
								onChange(0, true);
							}
							break;

						case KEY.DOWN:
							event.preventDefault();
							if (select.visible()) {
								select.next();
							} else {
								onChange(0, true);
							}
							break;

						case KEY.PAGEUP:
							event.preventDefault();
							if (select.visible()) {
								select.pageUp();
							} else {
								onChange(0, true);
							}
							break;

						case KEY.PAGEDOWN:
							event.preventDefault();
							if (select.visible()) {
								select.pageDown();
							} else {
								onChange(0, true);
							}
							break;

						// matches also semicolon
						case options.multiple &&
							$.trim(options.multipleSeparator) == ',' &&
							KEY.COMMA:
						case KEY.TAB:
						case KEY.RETURN:
							if (selectCurrent()) {
								// stop default to prevent a form submit, Opera needs special handling
								event.preventDefault();
								blockSubmit = true;
								return false;
							}
							break;

						case KEY.ESC:
							select.hide();
							break;

						default:
							clearTimeout(timeout);
							timeout = setTimeout(onChange, options.delay);
							break;
					}
				}
			)
			.focus(function () {
				// track whether the field has focus, we shouldn't process any
				// results if the field no longer has focus
				if ($input.val() == 'Финансовый поиск') {
					$input.val('');
					$input.removeClass('pale ac_input');
				}
				hasFocus++;
			})
			.blur(function () {
				hasFocus = 0;
				if (!config.mouseDownOnSelect) {
					hideResults();
				}
			})
			.click(function () {
				// show select when clicking in a focused field
				if (hasFocus++ > 1 && !select.visible()) {
					onChange(0, true);
				}
			})
			.bind('search', function () {
				// TODO why not just specifying both arguments?
				var fn = arguments.length > 1 ? arguments[1] : null;
				function findValueCallback(q, data) {
					var result;
					if (data && data.length) {
						for (var i = 0; i < data.length; i++) {
							if (data[i].result.toLowerCase() == q.toLowerCase()) {
								result = data[i];
								break;
							}
						}
					}
					if (typeof fn == 'function') fn(result);
					else $input.trigger('result', result && [result.data, result.value]);
				}
				$.each(trimWords($input.val()), function (i, value) {
					request(value, findValueCallback, findValueCallback);
				});
			})
			.bind('flushCache', function () {
				cache.flush();
			})
			.bind('setOptions', function () {
				$.extend(options, arguments[1]);
				// if we've updated the data, repopulate
				if ('data' in arguments[1]) cache.populate();
			})
			.bind('unautocomplete', function () {
				select.unbind();
				$input.unbind();
				$(input.form).unbind('.autocomplete');
			});

		function selectCurrent() {
			var url = '';

			var selected = select.selected();
			if (!selected) return false;
			var additionalRef = '';
			if (selected.data.length > 9) {
				additionalRef = selected.data[9];
			}
			if (
				selected.data[1] == '-1' ||
				selected.data[1] == '0' ||
				selected.data[1] == '16'
			) {
				window.location = searchResultsURLwriter(
					selected.data[1],
					selected.data[2],
					additionalRef
				);
				return true;
			}
			if (selected.data[1] && selected.data[4].length > 0) {
				url = selected.data[4].addURLParameter(
					'fromsearch',
					'service_words_ajax',
					false
				);
				//url = url.addURLParameter("utm_medium", "cpc", false) ;
				//url = url.addURLParameter("utm_campaign", "serch_by_sight", false) ;
				//console.log(['setItem', url, url, url]);
				window.location = url;

				return true;
			}
			if (selected.data[1] == '5') {
				// ||selected.data[1] == "5" || selected.data[1] == "-1"
				window.location = searchResultsURLwriter(
					selected.data[1],
					selected.data[2],
					additionalRef
				);
				return true;
			}
			if (selected.data[1] == '17') {
				// ||selected.data[1] == "5" || selected.data[1] == "-1"
				window.location = searchResultsURLwriter(
					selected.data[1],
					selected.data[2],
					additionalRef
				);
				return true;
			} else {
				var v = selected.result;
				previousValue = v;

				if (options.multiple) {
					var words = trimWords($input.val());
					if (words.length > 1) {
						v =
							words.slice(0, words.length - 1).join(options.multipleSeparator) +
							options.multipleSeparator +
							v;
					}
					v += options.multipleSeparator;
				}

				$input.val(v);
				hideResultsNow();
				$input.trigger('result', [selected.data, selected.value]);
				$input.context.form.submit();
			}
			return true;
		}

		function onChange(crap, skipPrevCheck) {
			if (lastKeyPressCode == KEY.DEL) {
				select.hide();
				return;
			}

			var currentValue = $input.val();

			if (!skipPrevCheck && currentValue == previousValue) return;

			previousValue = currentValue;

			currentValue = lastWord(currentValue);
			if (currentValue.length >= options.minChars) {
				$input.addClass(options.loadingClass);
				if (!options.matchCase) currentValue = currentValue.toLowerCase();
				request(currentValue, receiveData, hideResultsNow);
			} else {
				stopLoading();
				select.hide();
			}
		}

		function trimWords(value) {
			if (!value) {
				return [''];
			}
			var words = value.split(options.multipleSeparator);
			var result = [];
			$.each(words, function (i, value) {
				if ($.trim(value)) result[i] = $.trim(value);
			});
			return result;
		}

		function lastWord(value) {
			if (!options.multiple) return value;
			var words = trimWords(value);
			return words[words.length - 1];
		}

		// fills in the input box w/the first match (assumed to be the best match)
		// q: the term entered
		// sValue: the first matching result
		function autoFill(q, sValue) {
			// autofill in the complete box w/the first match as long as the user hasn't entered in more data
			// if the last user key pressed was backspace, don't autofill
			if (
				options.autoFill &&
				lastWord($input.val()).toLowerCase() == q.toLowerCase() &&
				lastKeyPressCode != KEY.BACKSPACE
			) {
				// fill in the value (keep the case the user has typed)
				$input.val(
					$input.val() + sValue.substring(lastWord(previousValue).length)
				);
				// select the portion of the value not typed by the user (so the next character will erase)
				$.Autocompleter.Selection(
					input,
					previousValue.length,
					previousValue.length + sValue.length
				);
			}
		}

		function hideResults() {
			clearTimeout(timeout);
			// timeout = setTimeout(hideResultsNow, 200);
		}

		function hideResultsNow() {
			var wasVisible = select.visible();
			select.hide();
			clearTimeout(timeout);
			stopLoading();
			if (options.mustMatch) {
				// call search and run callback
				$input.search(function (result) {
					// if no value found, clear the input box
					if (!result) {
						if (options.multiple) {
							var words = trimWords($input.val()).slice(0, -1);
							$input.val(
								words.join(options.multipleSeparator) +
									(words.length ? options.multipleSeparator : '')
							);
						} else $input.val('');
					}
				});
			}
			if (wasVisible)
				// position cursor at end of input field
				$.Autocompleter.Selection(
					input,
					input.value.length,
					input.value.length
				);
		}

		function receiveData(q, data) {
			if (data && data.length && hasFocus) {
				stopLoading();
				if (options.isNewApi) {
					select.displayFromApi(data, q);
				} else {
					select.display(data, q);
				}
				autoFill(q, data[0].value);
				select.show();
			} else {
				hideResultsNow();
			}
		}

		function request(term, success, failure) {
			var end = new Date();

			if (!options.matchCase) term = term.toLowerCase();
			var data = cache.load(term);

			// recieve the cached data
			if (data && data.length) {
				success(term, data);
				// if an AJAX url has been supplied, try loading the data now
			} else if (typeof options.url == 'string' && options.url.length > 0) {
				var extraParams = {
					timestamp: +new Date(),
				};
				$.each(options.extraParams, function (key, param) {
					extraParams[key] = typeof param == 'function' ? param() : param;
				});

				var url = options.isNewApi ? options.url + term : options.url;

				$.ajax({
					// try to leverage ajaxQueue plugin to abort previous requests
					mode: 'abort',
					// limit abortion to this input
					port: 'autocomplete' + input.name,
					dataType: options.dataType,
					url: url,
					data: $.extend(
						{
							q: encodeURI(lastWord(term)),
							limit: options.max,
						},
						extraParams
					),
					success: function (data) {
						var parsed = options.isNewApi
							? data.data.items
							: (options.parse && options.parse(data)) || parse(data);
						cache.add(term, parsed);
						success(term, parsed);
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						// XMLHttpRequest.status
					},
				});
			} else {
				// if we have a failure, we need to empty the list -- this prevents the the [TAB] key from selecting the last successful match
				select.emptyList();
				failure(term);
			}
		}

		function parse(data) {
			var parsed = [];
			var out;
			out = formatAutocompleteOutputData(data);
			var rows = out.split('\n');
			for (var i = 0; i < rows.length; i++) {
				var row = $.trim(rows[i]);
				if (row) {
					row = row.split('|');
					parsed[parsed.length] = {
						data: row,
						value: row[0],
						result:
							(options.formatResult && options.formatResult(row, row[0])) ||
							row[0],
					};
				}
			}
			return parsed;
		}

		function stopLoading() {
			$input.removeClass(options.loadingClass);
		}
	};

	$.Autocompleter.defaults = {
		inputClass: 'ac_input',
		resultsClass: 'ac_results',
		loadingClass: 'ac_loading',
		minChars: 2,
		delay: 200,
		matchCase: false,
		matchSubset: true,
		matchContains: false,
		cacheLength: 0,
		max: 100,
		mustMatch: false,
		extraParams: {},
		selectFirst: false,
		formatItem: function (row) {
			return row[0];
		},
		formatMatch: null,
		autoFill: false,
		width: '100%',
		multiple: false,
		multipleSeparator: ', ',
		highlight: function (value, term) {
			return value.replace(
				new RegExp(
					'(?![^&;]+;)(?!<[^<>]*)(' +
						term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, '\\$1') +
						')(?![^<>]*>)(?![^&;]+;)',
					'gi'
				),
				"<span class='first_strong'>$1</span>"
			);
		},
		scroll: true,
		scrollHeight: 300,
	};

	$.Autocompleter.Cache = function (options) {
		var data = {};
		var length = 0;

		function matchSubset(s, sub) {
			if (!options.matchCase) s = s.toLowerCase();
			var i = s.indexOf(sub);
			if (options.matchContains == 'word') {
				i = s.toLowerCase().search('\\b' + sub.toLowerCase());
			}
			if (i == -1) return false;
			return i == 0 || options.matchContains;
		}

		function add(q, value) {
			if (length > options.cacheLength) {
				flush();
			}
			if (!data[q]) {
				length++;
			}
			data[q] = value;
		}

		function populate() {
			if (!options.data) return false;
			// track the matches
			var stMatchSets = {},
				nullData = 0;

			// no url was specified, we need to adjust the cache length to make sure it fits the local data store
			if (!options.url) options.cacheLength = 1;

			// track all options for minChars = 0
			stMatchSets[''] = [];

			// loop through the array and create a lookup structure
			for (var i = 0, ol = options.data.length; i < ol; i++) {
				var rawValue = options.data[i];
				// if rawValue is a string, make an array otherwise just reference the array
				rawValue = typeof rawValue == 'string' ? [rawValue] : rawValue;

				var value = options.formatMatch(rawValue, i + 1, options.data.length);
				if (value === false) continue;

				var firstChar = value.charAt(0).toLowerCase();
				// if no lookup array for this character exists, look it up now
				if (!stMatchSets[firstChar]) stMatchSets[firstChar] = [];

				// if the match is a string
				var row = {
					value: value,
					data: rawValue,
					result:
						(options.formatResult && options.formatResult(rawValue)) || value,
				};

				// push the current match into the set list
				stMatchSets[firstChar].push(row);

				// keep track of minChars zero items
				if (nullData++ < options.max) {
					stMatchSets[''].push(row);
				}
			}

			// add the data items to the cache
			$.each(stMatchSets, function (i, value) {
				// increase the cache size
				options.cacheLength++;
				// add to the cache
				add(i, value);
			});
		}

		// populate any existing data
		setTimeout(populate, 25);

		function flush() {
			data = {};
			length = 0;
		}

		return {
			flush: flush,
			add: add,
			populate: populate,
			load: function (q) {
				if (!options.cacheLength || !length) return null;
				/*
				 * if dealing w/local data and matchContains than we must make sure
				 * to loop through all the data collections looking for matches
				 */
				if (!options.url && options.matchContains) {
					// track all matches
					var csub = [];
					// loop through all the data grids for matches
					for (var k in data) {
						// don't search through the stMatchSets[""] (minChars: 0) cache
						// this prevents duplicates
						if (k.length > 0) {
							var c = data[k];
							$.each(c, function (i, x) {
								// if we've got a match, add it to the array
								if (matchSubset(x.value, q)) {
									csub.push(x);
								}
							});
						}
					}
					return csub;
				}
				// if the exact item exists, use it
				else if (data[q]) {
					return data[q];
				} else if (options.matchSubset) {
					for (var i = q.length - 1; i >= options.minChars; i--) {
						var c = data[q.substr(0, i)];
						if (c) {
							var csub = [];
							$.each(c, function (i, x) {
								if (matchSubset(x.value, q)) {
									csub[csub.length] = x;
								}
							});
							return csub;
						}
					}
				}
				return null;
			},
		};
	};

	$.Autocompleter.Select = function (options, input, select, config) {
		var CLASSES = {
			ACTIVE: 'ac_over',
		};

		var listItems,
			active = -1,
			data,
			term = '',
			needsInit = true,
			element,
			list;

		// Create results
		function init() {
			if (!needsInit) return;
			element = $('<div/>')
				.hide()
				.addClass(options.resultsClass)
				.css({
					position: 'absolute',
				})
				.appendTo($(document.body));

			list = $('<ul/>')
				.appendTo(element)
				.mouseover(function (event) {
					if (
						target(event).nodeName &&
						target(event).nodeName.toUpperCase() == 'LI'
					) {
						active = $('li', list)
							.removeClass(CLASSES.ACTIVE)
							.index(target(event));
						$(target(event)).addClass(CLASSES.ACTIVE);
					}
				})
				.click(function (event) {
					$(target(event)).addClass(CLASSES.ACTIVE);
					select();

					// TODO provide option to avoid setting focus again after selection? useful for cleanup-on-focus
					input.focus();
					if (!options.isNewApi) {
						return false;
					}
				})
				.mousedown(function () {
					config.mouseDownOnSelect = true;
				})
				.mouseup(function () {
					config.mouseDownOnSelect = false;
				});

			if (options.width > 0) element.css('width', options.width);

			needsInit = false;
		}

		function target(event) {
			var element = event.target;
			while (element && element.tagName != 'LI') element = element.parentNode;
			// more fun with IE, sometimes event.target is empty, just ignore it then
			if (!element) return [];
			return element;
		}

		function moveSelect(step) {
			listItems.slice(active, active + 1).removeClass(CLASSES.ACTIVE);
			movePosition(step);
			var activeItem = listItems
				.slice(active, active + 1)
				.addClass(CLASSES.ACTIVE);
			if (options.scroll) {
				var offset = 0;
				listItems.slice(0, active).each(function () {
					offset += this.offsetHeight;
				});
				if (
					offset + activeItem[0].offsetHeight - list.scrollTop() >
					list[0].clientHeight
				) {
					list.scrollTop(
						offset + activeItem[0].offsetHeight - list.innerHeight()
					);
				} else if (offset < list.scrollTop()) {
					list.scrollTop(offset);
				}
			}
		}

		function movePosition(step) {
			active += step;
			if (active < 0) {
				active = listItems.size() - 1;
			} else if (active >= listItems.size()) {
				active = 0;
			}
		}

		function limitNumberOfItems(available) {
			return options.max && options.max < available ? options.max : available;
		}

		function fillList() {
			list.empty();
			var max = limitNumberOfItems(data.length);
			var description;
			var prescript;
			var previoustype;
			var curenttype;
			var highlightclass;
			var outputwrd;
			previoustype = '';
			prescript = '';

			for (var i = 0; i < max; i++) {
				if (!data[i]) continue;

				var formatted = options.formatItem(
					data[i].data,
					i + 1,
					max,
					data[i].value,
					term
				);
				if (formatted === false) continue;

				var description;
				description = '';
				highlightclass = '';
				curenttype = data[i].data[1];
				//if (curenttype == -1) highlightclass = " main_item ";
				outputwrd = options.highlight(formatted, term);

				if (curenttype != previoustype && previoustype != '') {
					if (previoustype == -1) {
						var lis = $('<div/>')
							.addClass('stepIntoSmlst')
							.html('&nbsp;')
							.addClass('stepIntoSmlst')
							.appendTo(list)[0];
						$.data(lis, 'ac_data', data[i]);
					} else {
						var lis = $('<div/>')
							.addClass('stepIntoSmlst')
							.html('&nbsp;')
							.addClass('stepIntoSmlst')
							.appendTo(list)[0];
						$.data(lis, 'ac_data', data[i]);
					}
				}

				if (data[i].data[3]) {
					if (data[i].data[3].length > 0) {
						if (curenttype == 0 || curenttype == -1) {
							description =
								description +
								"<table class='stepInfo' border='0' cellpadding='0' cellspacing='0' width='100%'><tr valign='top'>";
							description =
								description +
								"<td width='10'><div value=\"" +
								data[i].data[2] +
								"\" class='favorite-button' style='width: 20px;'></div></td>";
							description =
								description +
								"<td nowrap='nowrap'>" +
								'<b>' +
								data[i].data[3] +
								'</b>' +
								"<div class='sm pale'>" +
								data[i].data[0] +
								'</div>' +
								'</td>';
							if (data[i].data.length > 9) {
								if (data[i].data[9].length > 0) {
									description =
										description +
										"<td nowrap='nowrap'> <div class='sm pale'><button class='ibutton yellow-button finam_widget_caller caller' link = '" +
										data[i].data[9] +
										"' style='width: 60px;'>Купить</button></div></td>";
								} else {
									description = description + "<td nowrap='nowrap'></td>";
								}
							} else {
								description = description + "<td nowrap='nowrap'></td>";
							}
							if (data[i].data[5].length > 0) {
								description =
									description +
									"<td width='15%' class='left' nowrap style='vertical-align:center;'>" +
									formatPriceJS(data[i].data[6], 0, data[i].data[8]) +
									'</td>';
								description =
									description +
									"<td width='15%' nowrap style='vertical-align:center;'>" +
									formatPriceJS(data[i].data[5], 1, 0) +
									'</td>';
							}
							description = description + '</tr></table>';
						}
						if (curenttype == 1) {
							description = description + "<span class='stepInto stepBold'>";
							description =
								description + formatAutocompleteOutputData(data[i].data[3]);
							description = description + '</span>';
						}
						if (curenttype == 5) {
							description = "<span class='stepInto'>";
							description =
								description + formatAutocompleteOutputData(data[i].data[3]);
							description = description + '</span>';
						}
					}
				}
				if (curenttype == 16) {
					description =
						description +
						"<table class='stepInfo' border='0' cellpadding='0' cellspacing='0' width='100%'><tr valign='top'>";
					description =
						description +
						"<td width='20'><div value=\"" +
						data[i].data[2] +
						"\" class='favorite-button'></div></td>";
					description =
						description +
						"<td nowrap='nowrap' class='stepBold'>" +
						data[i].data[3].replace(' ', '&nbsp;') +
						'</td>';
					//                            if (data[i].data[5].length > 0) {

					description = description + "<td width='5' nowrap>&nbsp;</td>";
					description =
						description +
						"<td width='15%' nowrap>" +
						formatPriceJS(data[i].data[6], 0, data[i].data[8]) +
						'</td>';
					description =
						description +
						"<td width='15%' nowrap>" +
						formatPriceJS(data[i].data[5], 1, 0) +
						'</td>';
					//                          }
					description = description + '</tr></table>';
				}

				var k;
				k = 0;

				//for (var i = 0; i < 100;  i++) { k++ };

				var li = $('<li/>')
					.html(description)
					.addClass(
						curenttype == 0 || curenttype == -1 || curenttype == 16
							? i % 2 == 0
								? 'ac_even ' + highlightclass
								: 'ac_odd ' + highlightclass
							: ''
					)
					.appendTo(list)[0];

				$.data(li, 'ac_data', data[i]);
				previoustype = curenttype;
				prescript = '';
			}
			listItems = list.find('li');
			if (options.selectFirst) {
				listItems.slice(0, 1).addClass(CLASSES.ACTIVE);
				active = 0;
			}
			// apply bgiframe if available
			if ($.fn.bgiframe) list.bgiframe();

			list.find('.caller').click(function (e) {
				e.stopPropagation();
				window.location = shopResultsURLwriter($(e.target).attr('link'));
				return false;
			});
		}

		// отображение статуса кнопки фаворита(фаворит/не фаворит)
		function setViewStatus(status, elm) {
			if (status == 1 && !elm.hasClass('favorite-checked')) {
				elm.addClass('favorite-checked');
				elm.attr('title', '"удалить из моих котировок');
				if (elm.hasClass('favorite-unchecked'))
					elm.removeClass('favorite-unchecked');
			}
			if (status == 0 && !elm.hasClass('favorite-unchecked')) {
				elm.addClass('favorite-unchecked');
				elm.attr('title', 'добавить в мои котировки');
				if (elm.hasClass('favorite-checked'))
					elm.removeClass('favorite-checked');
			}
		}

		// получаем информацию по фаворитам для котировок
		function favoriteSend(elm, cb) {
			var cmd = elm.hasClass('favorite-checked') ? 'delete' : 'add';
			var url = '/api/favorite/' + cmd + '/';
			$.ajax({
				url: url,
				dataType: 'json',
				type: 'POST',
				cache: false,
				data: 'quoteId=' + elm.attr('value'),
				success: function (data) {
					setViewStatus(data.result, elm);
					if (cb) {
						cb();
					}
				},
				error: function () {},
			});
		}

		// добавляем/удаляем фаворитов
		function getStatuses(quotes) {
			var url = '/analysis/quotes/service.asp?name=quotes&action=favorites';
			$.ajax({
				url: url,
				dataType: 'json',
				type: 'POST',
				cache: false,
				data: 'command=readall&quotes=' + quotes,
				success: function (data) {
					var obj = {};
					var ret = data.result;
					for (var i = 0; i < ret.length; ++i) {
						obj[ret[i].quote_id] = ret[i].isFavorite;
					}

					var items = $('.favorite-button');
					for (i = 0; i < items.length; ++i) {
						var each = $(items[i]);
						setViewStatus(obj[each.attr('value')], each);
						if (obj[each.attr('value')] == -1) continue;
						if (data.isAuth) {
							each.click(function (event) {
								favoriteSend($(this));
								event.stopPropagation();
							});
						} else {
							each.click(function (event) {
								Finam.User.showLogin();
								event.stopPropagation();
							});
						}
					}
				},
				error: function () {},
			});
		}

		function FillFavorites() {
			var s = [];
			for (var i = 0; i < data.length; ++i) {
				var type = data[i].data[1];
				if (type == -1 || type == 0 || type == 16) {
					s.push(data[i].data[2]);
				}
			}
			getStatuses(s.join());
		}

		return {
			displayFromApi: function (d, q) {
				init();
				term = q;
				list.empty();
				var max = limitNumberOfItems(d.length);

				d.slice(0, max).forEach(function (item) {
					var description = '';
					description =
						description +
						"<table link = '" +
						item.link +
						"'class='stepInfo' border='0' cellpadding='0' cellspacing='0' width='100%'><tr valign='top'>";
					description =
						description +
						"<td width='10'><div value=\"" +
						item.quoteId +
						'" class=\'favorite-button ' +
						(item.favoriteStatus === 0
							? 'favorite-unchecked'
							: 'favorite-checked') +
						"' style='width: 20px;'></div></td>";
					description =
						description +
						"<td nowrap='nowrap'>" +
						'<b>' +
						item.name +
						'</b>' +
						"<div class='sm pale'>" +
						item.companyName +
						'</div>' +
						'</td>';
					if (item.canBuy) {
						description =
							description +
							"<td nowrap='nowrap'> <div class='sm pale'><a href='" +
							item.shopLink +
							"'><button class='ibutton yellow-button finam_widget_caller caller' style='width: 60px;'>Купить</button></a></div></td>";
					} else {
						description = description + "<td nowrap='nowrap'></td>";
					}
					description =
						description +
						"<td width='15%' class='left' nowrap style='vertical-align:center;'>" +
						item.price +
						'</td>';
					if (item.percents && item.percents !== '0') {
						description =
							description +
							"<td width='15%' nowrap style='vertical-align:center;'>&nbsp;" +
							"<span class='" +
							(item.rise ? 'up' : 'down') +
							"'>" +
							item.percents +
							'</span>' +
							'</td>';
					}
					description = description + '</tr></table>';

					$(
						'<li><a style="text-decoration: none; color: black" href="' +
							item.link +
							'">' +
							description +
							'</a></li>'
					).appendTo(list);
					listItems = list.find('li');
				});
				var items = $('.favorite-button');
				$(items).click(function (event) {
					var button = event.currentTarget;
					favoriteSend($(button), function () {
						$(button)
							.toggleClass('favorite-unchecked')
							.toggleClass('favorite-checked');
					});
					event.stopPropagation();
					event.preventDefault();
				});
			},
			display: function (d, q) {
				init();
				data = RemoveDuplicates(d);
				term = q;
				fillList();
				FillFavorites();
			},
			next: function () {
				moveSelect(1);
			},
			prev: function () {
				moveSelect(-1);
			},
			pageUp: function () {
				if (active != 0 && active - 8 < 0) {
					moveSelect(-active);
				} else {
					moveSelect(-8);
				}
			},
			pageDown: function () {
				if (active != listItems.size() - 1 && active + 8 > listItems.size()) {
					moveSelect(listItems.size() - 1 - active);
				} else {
					moveSelect(8);
				}
			},
			hide: function () {
				element && element.hide();
				listItems && listItems.removeClass(CLASSES.ACTIVE);
				active = -1;
			},
			visible: function () {
				return element && element.is(':visible');
			},
			current: function () {
				return (
					this.visible() &&
					(listItems.filter('.' + CLASSES.ACTIVE)[0] ||
						(options.selectFirst && listItems[0]))
				);
			},
			show: function () {
				var offset = $(input).offset();
				element
					.css({
						width: $(input).outerWidth() - 2,
						top: $(input).offset().top + $(input).outerHeight(),
						left: $(input).offset().left,
					})
					.show();
				if (options.scroll) {
					list.scrollTop(0);
					list.css({
						maxHeight: 1000, //,
						//overflow: 'auto'
					});

					if (
						$.browser.msie &&
						typeof document.body.style.maxHeight === 'undefined'
					) {
						var listHeight = 0;
						listItems.each(function () {
							listHeight += this.offsetHeight;
						});
						var scrollbarsVisible = listHeight > options.scrollHeight;
						list.css(
							'height',
							scrollbarsVisible ? options.scrollHeight : listHeight
						);
						if (!scrollbarsVisible) {
							// IE doesn't recalculate width when scrollbar disappears
							listItems.width(
								list.width() -
									parseInt(listItems.css('padding-left')) -
									parseInt(listItems.css('padding-right'))
							);
						}
					}
				}
			},
			selected: function () {
				var selected = listItems && listItems.filter('.' + CLASSES.ACTIVE);
				return selected && selected.length && $.data(selected[0], 'ac_data');
			},
			emptyList: function () {
				list && list.empty();
			},
			unbind: function () {
				element && element.remove();
			},
		};
	};

	$.Autocompleter.Selection = function (field, start, end) {
		if (field.createTextRange) {
			var selRange = field.createTextRange();
			selRange.collapse(true);
			selRange.moveStart('character', start);
			selRange.moveEnd('character', end);
			selRange.select();
		} else if (field.setSelectionRange) {
			field.setSelectionRange(start, end);
		} else {
			if (field.selectionStart) {
				field.selectionStart = start;
				field.selectionEnd = end;
			}
		}
		field.focus();
	};
})(jQuery);

function formatAutocompleteOutputData(str) {
	return str.replace(/quote/gi, '"');
}

function formatPriceJS(price, mode, decp) {
	var prc;
	prc = parseFloat(price.replace(',', '.'));
	if (mode == 0) {
		if (decp) {
			return prc.formatDecimal(decp, ' ');
		} else {
			if (parseInt(prc).toString() == prc) {
				return prc;
			} else {
				return prc.toFixed(2);
			}
		}
	}
	if (mode == 1) {
		if (prc > 0) {
			return "<span class='up'>+" + prc.toFixed(2) + '%</span>';
		}
		if (prc < 0) {
			return "<span class='down'>" + prc.toFixed(2) + '%</span>';
		}
		if (prc == 0) {
			return prc;
		}
	}
}

function searchResultsURLwriter(type, ID, shopRef) {
	var dhref, str;
	dhref = Number.prototype.decimalToHex(ID);
	str = '00000000' + '' + dhref;
	dhref = str.substring(str.length - 5);

	switch (type) {
		case '5':
			str =
				'/analysis/newsitem' +
				dhref.substring(dhref.Length - 5) +
				'/?fromsearch=news_ajax';
			break;
		case '-1':
			str =
				'/analysis/profile' +
				dhref.substring(dhref.Length - 5) +
				'/?fromsearch=instument_ajax';
			break;
		case '16':
			str =
				'/analysis/profile' +
				dhref.substring(dhref.Length - 5) +
				'/?fromsearch=instument_ajax';
			break;
		case '17':
			str =
				'/dictionary/wordf' +
				dhref.substring(dhref.Length - 5) +
				'/?fromsearch=service_words_ajax';
			break;
		case '0':
			str =
				'/analysis/profile' +
				dhref.substring(dhref.Length - 5) +
				'/?fromsearch=instument_ajax';
			break;
	}
	return str;
}

function shopResultsURLwriter(shopRef) {
	str =
		'https://shop.finam.ru/stockInfo/' +
		shopRef +
		'/?fromsearch=instument_ajax';
	return str;
}

/// Удаление повторных ссылок на профиль
function RemoveDuplicates(recdata) {
	var dict = {};
	var removing = { length: 0 };
	var id, type, i;
	for (i = 0; i < recdata.length; i++) {
		type = recdata[i].data[1];
		// удаляем повторы котировок
		if (type == '-1' || type == '16' || type == '0') {
			id = recdata[i].data[2];
			if (dict.hasOwnProperty(id)) {
				var isDict = true;
				if (dict[id].type == '0') isDict = true;
				else if (type == '0') isDict = false;
				else if (dict[id].type == '16') isDict = true;
				else if (type == '16') isDict = false;

				if (isDict) {
					removing[i.toString()] = i;
					removing.length++;
				} else {
					removing[dict[id].index.toString()] = dict[id].index;
					removing.length++;
					dict[id].type = type;
					dict[id].index = i;
				}
			} else dict[id] = { type: type, index: i };
		}
	}

	// собственно удаление, если надо
	if (removing.length > 0) {
		var newdata = [];
		for (i = 0; i < recdata.length; i++) {
			if (!removing.hasOwnProperty(i.toString())) {
				newdata.push(recdata[i]);
			}
		}
		return newdata;
	}

	return recdata;
}

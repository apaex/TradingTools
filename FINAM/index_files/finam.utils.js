/* Finam */
if (!Finam) {
	var Finam = {};
}

Finam.Utils = {};

(function (Finam, $, window, document, undefined) {
	window.namespace = function (path) {
		var params = path.split('.');
		var parent = window;
		for (var i = 0; i < params.length; i++) {
			if (!parent[params[i]]) {
				parent[params[i]] = {};
			}
			parent = parent[params[i]];
		}
		//return eval(path);
	};

	/* JavaScript */
	String.prototype.utf8encode = function () {
		var string = this;
		string = string.replace(/\r\n/g, '\n');
		var utftext = '';
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if (c > 127 && c < 2048) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}

		return utftext;
	};

	String.prototype.utf8decode = function () {
		var utftext = this;
		var string = '';
		var i = 0;
		var c = (c1 = c2 = 0);
		while (i < utftext.length) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if (c > 191 && c < 224) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(
					((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
				);
				i += 3;
			}
		}
		return string;
	};

	String.prototype.win2unicode = function (str) {
		var str = this;
		var charmap = unescape(
			'%u0402%u0403%u201A%u0453%u201E%u2026%u2020%u2021%u20AC%u2030%u0409%u2039%u040A%u040C%u040B%u040F' +
				'%u0452%u2018%u2019%u201C%u201D%u2022%u2013%u2014%u0000%u2122%u0459%u203A%u045A%u045C%u045B%u045F' +
				'%u00A0%u040E%u045E%u0408%u00A4%u0490%u00A6%u00A7%u0401%u00A9%u0404%u00AB%u00AC%u00AD%u00AE%u0407' +
				'%u00B0%u00B1%u0406%u0456%u0491%u00B5%u00B6%u00B7%u0451%u2116%u0454%u00BB%u0458%u0405%u0455%u0457'
		);
		var code2char = function (code) {
			if (code >= 0xc0 && code <= 0xff)
				return String.fromCharCode(code - 0xc0 + 0x0410);
			if (code >= 0x80 && code <= 0xbf) return charmap.charAt(code - 0x80);
			return String.fromCharCode(code);
		};
		var res = '';
		for (var i = 0; i < str.length; i++)
			res = res + code2char(str.charCodeAt(i));
		return res;
	};

	String.prototype.escape = function () {
		var ret = '';
		var str = this;
		for (i = 0; i < str.length; i++) {
			var n = str.charCodeAt(i);
			if (n >= 0x410 && n <= 0x44f) n -= 0x350;
			else if (n == 0x451) n = 0xb8;
			else if (n == 0x401) n = 0xa8;
			if ((n < 65 || n > 90) && (n < 97 || n > 122) && n < 256) {
				if (n < 16) {
					ret += '%0' + n.toString(16);
				} else {
					ret += '%' + n.toString(16);
				}
			} else {
				ret += String.fromCharCode(n);
			}
		}
		return ret;
	};

	String.prototype.unescape = function () {
		var r = '';
		for (var i = 0; i < this.length; i++) {
			var c = this.substr(i, 1);
			if (c == '%') {
				var d = this.substr(i + 1, 2);
				var n = parseInt(d, 16);
				r += String.fromCharCode(n + (n > 127 ? 848 : 0));
				i = i + 2;
			} else {
				r += c;
			}
		}
		return r;
	};

	String.prototype.strip = function () {
		return this.replace(/^\s+/, '').replace(/\s+$/, '');
	};

	String.prototype.toQueryParams = function (separator) {
		var match = this.strip().match(/([^?#]*)(#.*)?$/);
		if (!match) return {};
		var r = {};
		var params = match[1].split(separator || '&');
		for (var i = 0; i < params.length; i++) {
			var pair = params[i].split('=');
			if (pair.length == 2) {
				var key = decodeURIComponent(pair[0]);
				var value = decodeURIComponent(pair[1]);
			} else {
				var key = decodeURIComponent(pair[0]);
				var value = key;
			}
			if (r[key] != undefined) {
				if (!$.isArray(r[key])) {
					r[key] = [r[key]];
				}
				r[key].push(value);
			} else {
				r[key] = value;
			}
		}
		return r;
	};

	// TODO Left -> left
	String.prototype.Left = function (str, n) {
		if (n <= 0) return '';
		else if (n > String(str).length) return str;
		else return String(str).substring(0, n);
	};

	// TODO Right -> right
	String.prototype.Right = function (str, n) {
		if (n <= 0) return '';
		else if (n > String(str).length) return str;
		else {
			var iLen = String(str).length;
			return String(str).substring(iLen, iLen - n);
		}
	};

	String.prototype.addURLParameter = function (
		parameterName,
		parameterValue,
		atStart /*Add param before others*/
	) {
		replaceDuplicates = true;
		if (this.indexOf('#') > 0) {
			var cl = this.indexOf('#');
			urlhash = this.substring(this.indexOf('#'), this.length);
		} else {
			urlhash = '';
			cl = this.length;
		}
		sourceUrl = this.substring(0, cl);

		var urlParts = sourceUrl.split('?');
		var newQueryString = '';

		if (urlParts.length > 1) {
			var parameters = urlParts[1].split('&');
			for (var i = 0; i < parameters.length; i++) {
				var parameterParts = parameters[i].split('=');
				if (!(replaceDuplicates && parameterParts[0] == parameterName)) {
					if (newQueryString == '') newQueryString = '?';
					else newQueryString += '&';
					newQueryString +=
						parameterParts[0] +
						'=' +
						(parameterParts[1] ? parameterParts[1] : '');
				}
			}
		}
		if (newQueryString == '') newQueryString = '?';

		if (atStart) {
			newQueryString =
				'?' +
				parameterName +
				'=' +
				parameterValue +
				(newQueryString.length > 1 ? '&' + newQueryString.substring(1) : '');
		} else {
			if (newQueryString !== '' && newQueryString != '?') newQueryString += '&';
			newQueryString +=
				parameterName + '=' + (parameterValue ? parameterValue : '');
		}
		return urlParts[0] + newQueryString + urlhash;
	};

	String.format = function () {
		if (arguments.length > 0) {
			var str = arguments[0];
			for (var i = 1; i < arguments.length; i++) {
				str = str.replace('{' + (i - 1) + '}', arguments[i]);
			}
			return str;
		}
	};

	Number.prototype.pluralForm = function (form1, form2, form5, format) {
		var r = '';
		var form = '';
		format = format || '%n %form';
		var n = Math.abs(this) % 100;
		var n1 = n % 10;
		if (n > 10 && n < 20) {
			form = form5;
		} else {
			if (n1 > 1 && n1 < 5) {
				form = form2;
			} else {
				if (n1 == 1) {
					form = form1;
				} else {
					form = form5;
				}
			}
		}
		r = format.replace('%n', this).replace('%form', form);
		return r;
	};

	// TODO: сделать ещё покрасивее!
	// отделяем тысячи, миллионы пробелами
	Number.prototype.prepareNumber = function (e, sep1, sep2) {
		sep1 = sep1 || '.';
		sep2 = sep2 || ' ';
		var s = new String(this.toFixed(e, sep1));
		var d = '';
		var k = s.indexOf(sep1);
		if (k != -1) {
			d = s.substring(k, s.length);
			s = s.substring(0, k);
		}
		var r = '';
		var c = 0;
		for (var i = s.length; i > 0; i--) {
			r = s.substring(i - 1, i) + r;
			c++;
			if (c == 3) {
				r = sep2 + r;
				c = 0;
			}
		}
		r = r + d;
		return r;
	};

	// <comment>
	// Форматированный вывод числа (с преобразованием в строку)
	// указание разделителя и кол-ва знаков после запятой для числа
	// </comment>
	Number.prototype.prepareForDisplay = function (sep, e) {
		var en = e || 2;
		var sepNum = '.';
		var s = this.prepareNumber(en, sepNum);
		return s.replace(sepNum, sep);
	};

	Number.prototype.decimalToHex = function (d) {
		if (!!d) {
			var hex = Number(d).toString(16);
			hex = '000000'.substr(0, 6 - hex.length) + hex;
		} else {
			hex = '00000' + parseInt(this).toString(16);
			hex = hex.substring(hex.length - 5, hex.length).toUpperCase();
		}
		return hex;
	};

	Number.prototype.formatDecimal = function (_decimal, _separator) {
		var b, rr;
		var decimal = typeof _decimal != 'undefined' ? _decimal : 2;
		decimal = decimal == 0 ? 2 : decimal;
		var separator = typeof _separator != 'undefined' ? _separator : '';
		var r = parseFloat(this);
		var exp10 = Math.pow(10, decimal);
		var decplace;
		r = Math.round(r * exp10) / exp10;
		rr = Number(r).toFixed(decimal).toString().split('.');
		b = rr[0].replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, '$1' + separator);
		decplace = '' + (typeof rr[1] != 'undefined') ? '.' + rr[1] : '';
		r = b + decplace;
		return r;
	};

	Number.prototype.detectDigitsAfterComma = function () {
		var num = this;
		var count = 0;
		var arr = num.toString().split('.');
		if (arr.length >= 2) {
			count = arr[arr.length - 1].length;
		}
		return count;
	};

	Date._months = [
		'Январь',
		'Февраль',
		'Март',
		'Апрель',
		'Май',
		'Июнь',
		'Июль',
		'Август',
		'Сентябрь',
		'Октябрь',
		'Ноябрь',
		'Декабрь',
	];
	Date.prototype.formatDate = function (format) {
		if (format == undefined) {
			return this.toString();
		} else {
			var yyyy = this.getFullYear();
			var m = this.getMonth() + 1;
			var mm = m < 10 ? '0' + m : m;
			var d = this.getDate();
			var dd = d < 10 ? '0' + d : d;
			var h = this.getHours();
			var hh = h < 10 ? '0' + h : h;
			var n = this.getMinutes();
			var nn = n < 10 ? '0' + n : n;
			var s = this.getSeconds();
			var ss = s < 10 ? '0' + s : s;
			var value = format;
			value = value.replace('yyyy', yyyy);
			value = value.replace('mm', mm);
			value = value.replace('dd', dd);
			value = value.replace('hh', hh);
			value = value.replace('nn', nn);
			value = value.replace('ss', ss);
			value = value.replace('m', m);
			value = value.replace('d', d);
			value = value.replace('h', h);
			value = value.replace('n', n);
			value = value.replace('s', s);
			value = value.replace('Month', Date._months[m - 1]);
			return value;
		}
	};
	Date.prototype.add = function (datepart, number, format) {
		var year = this.getFullYear();
		var month = this.getMonth();
		var day = this.getDate();
		var hours = this.getHours();
		var minutes = this.getMinutes();
		var seconds = this.getSeconds();
		switch (datepart) {
			case 'year':
			case 'yyyy':
				year += number;
				break;
			case 'month':
			case 'mm':
				month += number;
				break;
			case 'day':
			case 'dd':
				day += number;
				break;
			case 'hour':
			case 'hh':
				hours += number;
				break;
			case 'minute':
			case 'nn':
				minutes += number;
				break;
			case 'second':
			case 'ss':
				seconds += number;
				break;
		}
		var result = new Date(year, month, day, hours, minutes, seconds);
		if (!!format) {
			result = result.formatDate(format);
		}
		return result;
	};

	/* Events */

	Finam.Utils.Events = function () {
		this._observers = {};
		return this;
	};
	Finam.Utils.Events.prototype = {
		countEvents: function (name) {
			return this._observers[name].count;
		},
		raise: function () {
			var args = Array.prototype.slice.call(arguments);
			if (args.length > 0) {
				var name = args[0];
				var data = args.slice(1);
				if (!!this._observers[name]) {
					if (!this._observers[name].stopped) {
						$.each(this._observers[name].list || [], function (index, item) {
							if (item.timeout) {
								setTimeout(function () {
									item.observer.apply(item.context, data);
								}, 0);
							} else {
								item.observer.apply(item.context, data);
							}
						});
					}
				}
			}
			return this;
		},
		bind: function (name, observer, context, timeout, system) {
			var names = name.split(' ');
			for (var i = 0; i < names.length; i++) {
				var nm = names[i];
				var ctx = context || null;
				this._observers[nm] = this._observers[nm] || {
					stopped: false,
					list: [],
					count: 0,
				};
				var exists = false;
				for (var i = 0; i < this._observers[nm].list.length; i++) {
					if (
						this._observers[nm].list[i].observer.toString() ===
						observer.toString()
					) {
						exists = true;
						break;
					}
				}
				if (!exists) {
					this._observers[nm].list.push({
						observer: observer,
						context: ctx,
						timeout: !!timeout,
					});
					if (!!!system) {
						this._observers[nm].count++;
					}
				}
			}
			return this;
		},
		unbind: function (name, observer, context) {
			if (!!this._observers[name]) {
				if (!observer && !context) {
					this._observers[name] = null;
				} else {
					$.each(this._observers[name].list || [], function (index, item) {
						if (item.observer == observer && item.context == context) {
							delete this._observers[name].list[index];
						}
					});
				}
			}
			return this;
		},
		stopEvent: function (name) {
			if (this._observers[name] != undefined) {
				this._observers[name].stopped = true;
			}
			return this;
		},
		startEvent: function (name) {
			if (this._observers[name] != undefined) {
				this._observers[name].stopped = false;
			}
			return this;
		},
	};

	/* Library */

	Finam.Utils.Library = {
		_scripts: [],
		getScript: function (url, include) {
			var deferred = $.Deferred();
			var script = $('HEAD SCRIPT[src="' + url + '"]');
			if (script.length == 0) {
				$.ajax({
					url: url,
					dataType: 'script',
					crossDomain: true,
					success: function () {
						if (include) {
							var script = document.createElement('script');
							script.setAttribute('src', url);
							script.setAttribute('type', 'text/javascript');
							var head = document.getElementsByTagName('head').item(0);
							head.appendChild(script);
						}
						deferred.resolve();
					},
					error: function (jqXHR, textStatus, errorThrown) {
						console.log([jqXHR, textStatus, errorThrown]);
						deferred.reject();
					},
				});
				return deferred.promise();
			} else {
				setTimeout(function () {
					deferred.resolve();
				}, 0);
			}
		},
		loadScript: function (url) {
			if (!!this._scripts[url]) {
				return this._scripts[url].promise();
			}
			var deferred = $.Deferred();
			this._scripts[url] = deferred;
			var exists = $('SCRIPT[src="' + url + '"]');
			if (exists.length == 0) {
				var script = document.createElement('script');
				script.src = url;
				document.documentElement.appendChild(script);
				script.onerror = function () {
					deferred.reject();
				};
				script.onload = function () {
					if (!this.executed) {
						// выполнится только один раз
						this.executed = true;
						deferred.resolve();
					}
				};
				script.onreadystatechange = function () {
					var self = this;
					if (this.readyState == 'complete' || this.readyState == 'loaded') {
						setTimeout(function () {
							self.onload();
						}, 0); // сохранить "this" для onload
					}
				};
			} else {
				setTimeout(function () {
					deferred.resolve();
				}, 0);
			}
			return deferred.promise();
		},
	};

	/* Storage */

	Finam.Utils.Storage = function (name) {
		var self = this;
		self._keys = null;
		this.name = function () {
			return name || '';
		};
		var itemName = function (name) {
			return self.name() != '' ? self.name() + '.' + name : name;
		};
		if (!!window.localStorage) {
			this.enabled = function () {
				return true;
			};
			this.getItem = function (name) {
				return window.localStorage.getItem(itemName(name));
			};
			this.setItem = function (name, value) {
				window.localStorage.setItem(itemName(name), value);
				self._keys = null;
				return self;
			};
			this.removeItem = function (name) {
				window.localStorage.removeItem(itemName(name));
				self._keys = null;
				return self;
			};
			this.keys = function () {
				if (!self._keys) {
					var name = self.name();
					var list = [];
					if (name != '') {
						for (var i = 0; i < window.localStorage.length; i++) {
							var key = window.localStorage.key(i);
							if (key.split('.')[0] == name) {
								list.push(key);
							}
						}
					} else {
						for (var i = 0; i < window.localStorage.length; i++) {
							var key = window.localStorage.key(i);
							list.push(key);
						}
					}
					self._keys = list;
				}
				return list;
			};
			this.removeAll = function () {
				var name = self.name();
				if (name != '') {
					var keys = self.keys();
					for (var i = 0; i < keys.length; i++) {
						window.localStorage.removeItem(keys[i]);
					}
				}
				self._keys = null;
				return self;
			};
			this.length = function () {
				if (self.name() == '') {
					return window.localStorage.length;
				} else {
					return self.keys().length;
				}
			};
		} else {
			//console.log('Ваш браузер не поддерживает localStorage(). Используем куки.');
			var cookies = document.cookie.split('; ');
			this.enabled = function () {
				return true;
			};
			this.getItem = function (name) {
				//console.log(['getItem', name, itemName(name), $.cookie(itemName(name))]);
				return $.cookie(itemName(name));
			};
			this.setItem = function (name, value) {
				//console.log(['setItem', name, itemName(name), value]);
				$.cookie(itemName(name), value, { path: '/', expires: 365 });
				self._keys = null;
				return self;
			};
			this.removeItem = function (name) {
				$.cookie(itemName(name), null);
				self._keys = null;
				return self;
			};
			this.removeAll = function () {
				var name = self.name();
				if (name != '') {
					var keys = self.keys();
					for (var i = 0; i < keys.length; i++) {
						$.cookie(keys[i], null);
					}
				}
				self._keys = null;
				return self;
			};
			this.keys = function () {
				if (!self._keys) {
					var name = self.name();
					var list = [];
					if (name != '') {
						$.each(cookies, function (index, cookie) {
							var cookie = cookie.split('=');
							if (cookie[0] && cookie[0].split('.')[0] == name) {
								list.push(cookie[0]);
							}
						});
					} else {
						$.each(cookies, function (index, cookie) {
							var cookie = cookie.split('=');
							list.push(cookie[0]);
						});
					}
					self._keys = list;
				}
				return list;
			};
			this.length = function () {
				var keys = self.keys();
				return keys.length;
			};
		}
		return this;
	};
	Finam.Utils.Storage.prototype = {};

	/* Cookies */

	Finam.Utils.Cookies = {
		create: function Cookies__create(name, value, days) {
			if (days) {
				var date = new Date();
				date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
				var expires = '; expires=' + date.toGMTString();
			} else {
				var expires = '';
			}
			document.cookie = name + '=' + value + expires + '; path=/';
		},
		read: function Cookies__read(name) {
			var nameEQ = name + '=';
			var ca = document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
			}
			return null;
		},
		erase: function Cookies__erase(name) {
			this.create(name, '', -1);
		},
	};

	Finam.Utils.URL = {
		_url: null,
		init: function (url) {
			if (!this._url) {
				this._url = document.createElement('A');
			}
			this._url.href = url || document.location.href;
			this.parse();
			return this;
		},
		parse: function () {
			var query = this.search();
			query = query.substring(1, query.length);
			var groupByName = true;
			var parsed = {};
			var hasOwn = parsed.hasOwnProperty;
			var query = query.replace(/\+/g, ' ');
			var pairs = query.split(/[&;]/);
			for (var i = 0; i < pairs.length; i++) {
				var pair = pairs[i].match(/^([^=]*)=?(.*)/);
				if (pair[1]) {
					try {
						var name = decodeURIComponent(pair[1].unescape());
						var value = decodeURIComponent(pair[2].unescape());
					} catch (e) {
						//throw 'Invaid %-encoded sequence';
					}
					if (!groupByName) {
						parsed[name] = value;
					} else if (hasOwn.call(parsed, name)) {
						parsed[name].push(value);
					} else {
						parsed[name] = [value];
					}
				}
			}
			this._parsed = parsed;
			return this;
		},
		value: function () {
			return this._url.href;
		},
		protocol: function (value) {
			if (!!value) {
				this._url.protocol = value;
				return this;
			} else {
				return this._url.protocol;
			}
		},
		host: function (value) {
			if (!!value) {
				this._url.host = value;
				return this;
			} else {
				return this._url.host;
			}
		},
		pathname: function (value) {
			if (!!value) {
				this._url.pathname = value;
				return this;
			} else {
				return this._url.pathname;
			}
		},
		search: function (value) {
			if (!!value) {
				this._url.search = value;
				this.parse();
				return this;
			} else {
				return this._url.search;
			}
		},
		hash: function (value) {
			if (!!value) {
				this._url.hash = value;
				return this;
			} else {
				return this._url.hash;
			}
		},
		query: function (name, value) {
			var parsed = this._parsed || {};
			if (!!value) {
				if (!!parsed[name]) {
					parsed[name].push(value);
				} else {
					parsed[name] = [value];
				}
				return this;
			} else {
				return parsed[name];
			}
		},
		addQuery: function (name, value) {
			var query =
				(this.value().indexOf('?') != -1 ? '&' : '?') + name + '=' + value;
			if (this.value().indexOf('#') == -1) {
				return this.value() + query;
			}
			var params = this.value().split('#');
			return params[0] + query + '#' + params[1];
		},
	};
	Finam.Utils.URL.init();

	Finam.Utils.Query = {
		_params: null,
		params: function () {
			if (!this._params) {
				var params = {};
				var search = unescape(document.location.search);
				if (search.length > 1) {
					search = search.substr(1);
					$.each(search.split('&'), function (index, param) {
						param = param.split('=');
						if (param.length == 1) {
							param.push('');
						}
						if (!!params[param[0]]) {
							params[param[0]].push(param[1]);
						} else {
							params[param[0]] = [param[1]];
						}
					});
				}
				this._params = params;
			}
			return this._params;
		},
		value: function (name) {
			return this.params()[name];
		},
		one: function (name) {
			var value = this.value(name);
			return !!value ? value[0] : undefined;
		},
	};

	Finam.Utils.UTM = {
		_values: null,
		values: function () {
			if (!this._values) {
				var values = {};
				$.each(Finam.Utils.Query.params(), function (name, value) {
					if (name.indexOf('utm_') == 0) {
						values[name] = value;
					}
				});
				this._values = values;
			}
			return this._values;
		},
		url: function () {
			var url = [];
			$.each(this.values(), function (name, value) {
				url.push(name + '=' + value);
			});
			return url.join('&');
		},
	};

	Finam.Utils.Clipboard = {
		copyToClipboard: function (text) {
			if (window.clipboardData) {
				// IE
				window.clipboardData.setData('Text', text);
			} else {
				var DummyVariable = prompt(
					'Буфер обмена заблокирован браузером, нажмите Ctrl+C для копирования этой строки:',
					text
				);
			}
		},
	};

	Finam.Utils.PresetValue = function (control, text) {
		var self = this;
		var defaultPresetValue = 'Пример: +79031234567';
		self.value = text == '' ? defaultPresetValue : text;
		$('#' + control).val(self.value);
		$('#' + control).addClass('pale');
		$('#' + control)
			.attr('onclick', '')
			.bind('click', function () {
				$(this).removeClass('pale');
				$(this).val('');
			});
		$('#' + control)
			.attr('onlbur', '')
			.bind('blur', function () {
				if ($(this).val() == '') {
					$(this).addClass('pale');
					$(this).val(self.value);
				}
			});
		$('#' + control)
			.closest('form')
			.submit(function (event) {
				if ($('#' + control).val() == defaultPresetValue) {
					$('#' + control).val('');
				}
			});
	};

	Finam.Utils.Request = {
		_data: null,
		_requests: [],
		_loading: false,
		init: function () {
			var self = this;
			$.extend(true, this, new Finam.Utils.Events());
			$(document).ready($.proxy(this, 'start'));
			return this;
		},
		start: function () {
			//jQMigrateFrom $(document.body).ajaxStart($.proxy(function () { }, this));
			$(document).ajaxStart($.proxy(function () {}, this));

			//jQMigrateFrom $(document.body).ajaxError($.proxy(function(event, jqXHR, textStatus, errorThrown) {
			//console.log('Ошибка ajax-запроса.', jqXHR, textStatus, errorThrown);
			//Finam.UI.Message.show('Ошибка ajax-запроса.');
			//	this._loading = false;
			//}, this));
			$(document).ajaxError(
				$.proxy(function (event, jqXHR, textStatus, errorThrown) {
					this._loading = false;
				}, this)
			);

			//jQMigrateFrom $(document.body).ajaxSuccess($.proxy(function (event, XMLHttpRequest, ajaxOptions) { this._loading = false; this.send(); }, this));
			$(document).ajaxSuccess(
				$.proxy(function (event, XMLHttpRequest, ajaxOptions) {
					this._loading = false;
					this.send();
				}, this)
			);
			return this;
		},
		send: function (opts) {
			var self = this;
			if (!!opts) {
				opts.type = opts.type || 'GET';
				opts.params = opts.params || {};
				opts.dataType = opts.dataType || 'json';
				opts.params = opts.params || {};
				opts.params.rnd = Math.random();
				opts.url +=
					(opts.url.indexOf('?') == -1 ? '?' : '&') + $.param(opts.params);
				var data = $.extend(true, {}, opts);
				if (!!opts.preloader) {
					data.preloader = new Finam.UI.Controls.Utils.Preloader(
						opts.preloader
					);
				} else {
					data.preloader = { show: function () {}, hide: function () {} };
				}
				data.success = function (result, textStatus, jqXHR) {
					data.preloader.hide();
					opts.success(result, textStatus, jqXHR);
				};
				data.error = function (jqXHR, textStatus, errorThrown) {
					self._loading = false;
					data.preloader.hide();
					if (!!opts.error) {
						opts.error(jqXHR, textStatus, errorThrown);
					}
				};
				this._requests.unshift(data);
			}
			if (!this._loading) {
				var data = (this._data = this._requests.pop());
				if (!!data) {
					this._loading = true;
					data.preloader.show();
					$.ajax(data);
				} else {
					this._loading = false;
					this._data = null;
				}
			}
			return this;
		},
	};
	Finam.Utils.Request.init();

	// Global Message Listener
	Finam.Utils.Messenger = {
		init: function () {
			var self = this;
			$.extend(true, this, new Finam.Utils.Events());
			$(document).ready(function () {
				self.iframe = $(
					String.format(
						'<iframe id="global-messaging-iframe" name="global-messaging-iframe" src="https://www.finam.ru/message.asp" style="position: absolute; top: -100px; left: -100px; width: 1px; height: 1px; border: 0; z-index: 100000; visibility: hidden; "/></iframe>',
						!!Finam.User.USE_EXTERNAL_REGISTRATION
							? 'www.finam.ru'
							: document.location.hostname
					)
				);
				$(document.body).append(self.iframe);
				if (window.addEventListener) {
					window.addEventListener('message', self.listen.bind(self), false);
				} else {
					// IE8
					window.attachEvent('onmessage', self.listen.bind(self), false);
				}
				self.bind('messenger:hack', function (result) {
					var data = {
						ok: false,
						error: 'Нарушение режима безопасности',
					};
					self.raise([result.target, result.action].join(':'), data);
				});
			});
		},
		listen: function (event) {
			// Фейсбук чота тоже постит, оградимся
			try {
				var json = $.parseJSON(event.data);
			} catch (e) {
				var json = {};
			}
			if (!!json && !!json.target & !!json.action) {
				if (event.origin.indexOf('finam.ru') == -1) {
					Finam.UI.Message.show('Нарушение режима безопасности');
				} else {
					//console.log('raise', [json.target, json.action].join(':'), json.data);
					this.raise([json.target, json.action].join(':'), json.data || {});
				}
			}
		},
		postMessage: function (data, targetOrigin) {
			//console.log('postMessage', data, targetOrigin);
			var iframe = window.frames['global-messaging-iframe'];
			iframe.postMessage(data, targetOrigin);
			return this;
		},
	};
	Finam.Utils.Messenger.init();
})(Finam, jQuery, window, document, undefined);

if (typeof console != 'object') {
	// Наличие var console убивает консоль в любом IE! Поэтому используем window.
	window.console = {
		log: function (msg) {
			//alert(msg);
		},
	};
}

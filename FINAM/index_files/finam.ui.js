(function (Finam, $) {
	if (!Finam) {
		var Finam = {};
	}

	Finam.UI = {
		Controls: {},
		Dialogs: {},
		Features: {},
	};

	// Dialogs
	Finam.UI.Dialogs.Modal = function (opts) {
		opts = opts || {};
		var self = this;
		this.index = opts.zIndex || Finam.UI.Dialogs.Modal._num;
		this.id = opts.id || 'FinamUIDialogsModal' + Finam.UI.Dialogs.Modal._num++;
		this.visible = false;
		this.loading = false;
		this.pages = [];
		this.pagesNames = {};
		this.events = {};
		this.modal = typeof opts.modal == 'undefined' ? true : opts.modal;
		$.extend(true, this, new Finam.Utils.Events());
		// TODO: добавить свойства center горизонтальные и вертикальный
		this.location = opts.location || {};
		this.position =
			opts.position ||
			($.support.IE.isOld && $.support.IE.version < 8 ? 'absolute' : 'fixed');
		$.each(['top', 'right', 'bottom', 'left'], function (index, mode) {
			self.location[mode] = self.location[mode] || 'center';
		});
		var d = (this.dom = {});
		d.elm = $(
			'<div id="' +
				this.id +
				'" class="finam-ui-dialog-modal"><div class="finam-ui-dialog-modal-header"><h3></h3><a href="#" class="finam-ui-dialog-modal-close">x</a><div class="finam-ui-dialog-modal-menu"><ul></ul></div></div><div class="finam-ui-dialog-modal-content"></div></div>'
		).hide();
		if ($('#finam-ui-dialog-modal-overlay').length === 0) {
			d.overlay = $(
				'<div id="finam-ui-dialog-modal-overlay" class="ui-widget-overlay"></div>'
			).hide();
			$(document.body).append(d.overlay);
		} else {
			d.overlay = $(document.body)
				.find('#finam-ui-dialog-modal-overlay')
				.addClass('ui-widget-overlay');
		}
		$(document.body).append(d.elm);
		d.header = $('#' + this.id + ' .finam-ui-dialog-modal-header');
		d.title = d.header.find('H3');
		d.menu = $('#' + this.id + ' .finam-ui-dialog-modal-menu');
		d.content = $('#' + this.id + ' .finam-ui-dialog-modal-content');
		d.close = $('#' + this.id + ' .finam-ui-dialog-modal-close').bind(
			'click',
			function () {
				self.close();
				return false;
			}
		);
		d.pages = {};
		this.preloader = new Finam.UI.Controls.Utils.Preloader(d.content);
		this.width(opts.width || 350);
		this._title = opts.title;
		this.title(opts.title || this.id);
		this.redraw();
		return this;
	};
	Finam.UI.Dialogs.Modal.prototype = {
		open: function (opts) {
			if (!this.visible) {
				if (this.selected == null) {
					this.select();
				}
				this.visible = true;
				this.dom.elm.show();
				if (this.modal) {
					Finam.UI.Dialogs.Modal._count++;
				}
				if (Finam.UI.Dialogs.Modal._count == 1) {
					this.dom.overlay.show();
					opts = opts || {};
					if (opts.wait || 0 > 0) {
						var self = this;
						setTimeout(function () {
							self.close(opts.closing);
							if (!!opts.callback) {
								opts.callback();
							}
						}, opts.wait * 1000);
					}
					// TODO: выяснить, почему this.page().open() внутри Finam.UI.Dialogs.Modal._count == 1
					if (!!opts.title) {
						this.dom.title.html(opts.title);
					}
					if (!!opts.text) {
						this.dom.content.html(opts.text);
					}
					this.page().open();
				}
			}
			return this;
		},
		close: function (mode) {
			var self = this;
			if (this.visible) {
				mode = mode || 'hide';
				this.visible = false;
				if (this.modal) {
					Finam.UI.Dialogs.Modal._count--;
				}
				var ending = function () {
					self.preloader.hide();
					if (Finam.UI.Dialogs.Modal._count === 0) {
						self.dom.overlay.hide();
					}
					for (var name in self.pagesNames) {
						self.pagesNames[name].close();
						self.raise('close:' + self.page().name());
					}
					self.title(self._title);
					self.raise('close');
				};
				if (mode === 'hide') {
					this.dom.elm.hide();
					ending();
				}
				if (mode === 'fade') {
					this.dom.elm.fadeOut('fast', function () {
						ending();
					});
				}
			}
			return this;
		},
		redraw: function () {
			var self = this;
			this.dom.menu.find('LI.first').removeClass('first');
			this.dom.menu.find('LI.last').removeClass('last');
			if (this.dom.menu.find('LI').length > 1) {
				this.dom.elm.removeClass('no-menu');
				this.dom.menu.show();
				this.dom.menu.find('LI:first-child').addClass('first');
				this.dom.menu.find('LI:last-child').addClass('last');
			} else {
				this.dom.elm.addClass('no-menu');
				this.dom.menu.hide();
			}
			var elmCss = {
				zIndex: (this.index + 1) * 1000 + 2,
			};
			var top = Math.max(
				document.body.scrollTop,
				document.documentElement.scrollTop
			);
			if ($.support.HTML5 && !$.support.IE.isCompatibility) {
				var width = $(document.body).outerWidth();
				var height = $(document.body).outerHeight();
				this.dom.overlay.css('width', width);
				this.dom.overlay.css('height', height);
				// TODO: общие для разных режимов свойства выставлять отдельно
				elmCss.position = this.position;
				var props = [];
				if (this.location.top == 'center') {
					elmCss.top = '50%';
					elmCss.marginTop = -this.dom.elm.outerHeight() / 2;
				} else {
					$.merge(props, ['top', 'bottom']);
				}
				if (this.location.left == 'center') {
					elmCss.left = '50%';
					elmCss.marginLeft = -this.dom.elm.outerWidth() / 2;
				} else {
					$.merge(props, ['left', 'right']);
				}
				$.each(props, function (index, prop) {
					if (!!self.location[prop]) {
						var val =
							self.location[prop] + (this.position != 'fixed' ? top : 0);
						elmCss[prop] = val;
					}
				});
				this.dom.elm.css(elmCss);
			} else {
				// Банты для IE7
				var width = document.body.clientWidth;
				var heightBody = document.body.clientHeight;
				var heightHtml = document.documentElement.clientHeight;
				if (heightHtml > 0) {
					var height = Math.min(heightBody, heightHtml);
				} else {
					var height = heightBody;
				}
				this.dom.overlay.css('width', width);
				this.dom.overlay.css('height', Math.max(heightBody, heightHtml));
				this.dom.elm.css({
					zIndex: (this.index + 1) * 1000 + 1,
					position: 'absolute',
				});

				// TODO: объединить с выше
				var props = [];
				if (this.location.top == 'center') {
					this.dom.elm.css(
						'top',
						(height - this.dom.elm.outerHeight()) / 2 + top
					);
				} else {
					$.merge(props, ['top', 'bottom']);
				}
				if (this.location.left == 'center') {
					this.dom.elm.css('left', (width - this.dom.elm.outerWidth()) / 2);
				} else {
					$.merge(props, ['left', 'right']);
				}
				var dm = this.dom;
				$.each(props, function (index, prop) {
					if (!!self.location[prop]) {
						var val = self.location[prop] + top;
						dm.elm.css(prop, val);
					}
				});
				this.dom.elm
					.find('.dialog-ok:not(.dialog-ok-ie7)')
					.addClass('dialog-ok-ie7');
			}
			return this;
		},
		load: function (opts) {
			var self = this;
			self.preloader.show();
			$.ajax({
				url: opts.url,
				dataType: 'html',
				success: function (result, textStatus, jqXHR) {
					self.preloader.hide();
					self.open({
						title: opts.title,
						width: opts.width,
					});
					self.html(result);
					if (!!opts.success) {
						opts.success(result, textStatus, jqXHR);
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					self.preloader.hide();
					self.close();
					console.log([jqXHR, textStatus, errorThrown]);
				},
			});
			return this;
		},
		add: function (params) {
			var name = params.name || 'main';
			if (this.pagesNames[name] == undefined) {
				var self = this;
				this.dom.pages[name] = {};
				params.visible =
					params.visible != undefined
						? params.visible
						: params.name != undefined;
				var item = (this.dom.pages[name].item = $(
					'<li page="' + name + '"><div>' + params.title + '</div></li>'
				)
					.css('width', params.width || 'auto')
					.bind({
						click: function (event) {
							var page = $(this).attr('page');
							self.select(page);
						},
					}));
				if (!params.visible) {
					item.hide();
				}
				this.dom.menu.find('UL').append(item);
				var elm = (this.dom.pages[name].elm = $(
					'<div id="' +
						this.id +
						'-' +
						name +
						'-page" class="finam-ui-dialog-modal-page"><div class="finam-ui-dialog-modal-page-message"><div></div></div><div id="' +
						this.id +
						'-' +
						name +
						'" class="finam-ui-dialog-modal-page-content"></div>' +
						(!!params.buttons
							? '<div id="' +
							  this.id +
							  '-' +
							  name +
							  '-buttons" class="finam-ui-dialog-modal-buttons"></div>'
							: '') +
						'</div>'
				).hide());
				this.dom.content.append(elm);
				var message = (this.dom.pages[name].message = elm
					.find('.finam-ui-dialog-modal-page-message')
					.hide());
				params.elm = elm;
				var page = new Finam.UI.Dialogs.ModalPage(this, params);
				if (params.buttons) {
					$.each(params.buttons, function (name, opts) {
						var className =
							name == 'ok' || name == 'cancel' || name == 'button'
								? 'finam-ui-controls-button dialog-' + name
								: opts.className || '';
						var title =
							opts.title ||
							(name == 'ok' ? 'ОК' : name == 'cancel' ? 'Отмена' : '');
						if (name == 'html') {
							elm.find('.finam-ui-dialog-modal-buttons').append(opts.text);
						} else {
							var button = $(
								'<button class="' +
									className +
									'"><span>' +
									title +
									'</span></button>'
							).css('width', opts.width || 'auto');
							if (opts.visible != undefined && !opts.visible) {
								button.hide();
							}
							elm.find('.finam-ui-dialog-modal-buttons').append(button);
							button.bind('click', function (event) {
								opts.click.call(page, arguments);
							});
						}
					});
				}
				this.pages.push(page);
				this.pagesNames[name] = page;
			}
			return this;
		},
		remove: function (name) {
			return this;
		},
		title: function (title) {
			if (title == undefined) {
				return this.dom.title.html();
			} else {
				this.dom.title.html(title);
			}
			return this;
		},
		html: function (html) {
			this.page().html(html);
			return this;
		},
		width: function (width) {
			if (width == undefined) {
				return this._width;
			} else {
				this._width = width;
				if ($.support.IE.isCompatibility) {
					this.dom.header.css('width', width + 10);
				}
				this.dom.content.css('width', width);
				if (!$.support.HTML5) {
					this.dom.header.css('width', width);
					this.dom.elm.css('width', width + 10);
				}
			}
			return this;
		},
		page: function (name) {
			if (!this.selected) {
				this.select();
			}
			name = name || this.selected;
			return this.pagesNames[name];
		},
		select: function (name) {
			if (!name) {
				for (name in this.pagesNames) {
					break;
				}
			}
			if (this.pagesNames[name] != undefined) {
				if (name != this.selected) {
					if (this.selected != null) {
						this.dom.pages[this.selected].elm.hide();
						this.dom.menu.find('LI').removeClass('selected');
					}
					this.selected = name;
					this.dom.pages[name].elm.show();
					this.dom.pages[name].message.hide();
					this.dom.menu.find('LI[page="' + name + '"]').addClass('selected');
					this.redraw();
					this.page().open();
				}
			}
			return this;
		},
		request: function (opts) {
			var self = this;
			self.showPreloader();
			$.ajax({
				url: opts.url,
				dataType: opts.dataType || 'JSON',
				type: opts.type || 'POST',
				data: opts.data,
				success: function (result, textStatus, jqXHR) {
					self.hidePreloader();
					opts.success(result, textStatus, jqXHR);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					self.hidePreloader();
					(opts.error || $.noop)(jqXHR, textStatus, errorThrown);
				},
			});
			return this;
		},
		showPreloader: function () {
			if (this.selected) {
				this.preloader.show(this.dom.pages[this.selected].elm);
			}
			return this;
		},
		hidePreloader: function () {
			this.preloader.hide();
			return this;
		},
	};
	Finam.UI.Dialogs.Modal._num = 0;
	Finam.UI.Dialogs.Modal._count = 0;

	Finam.UI.Dialogs.ModalPage = function (dialog, opts) {
		var self = this;
		opts = opts || {};
		this._name =
			opts.name ||
			'FinamUIDialogsModalPage' + Finam.UI.Dialogs.ModalPage._num++;
		this._title = opts.title;
		this._visible = true;
		this._opened = false;
		this.dom = {};
		this.dialog = function () {
			return dialog;
		};
		this.elm = function () {
			return opts.elm.find('.finam-ui-dialog-modal-page-content');
		};
		this.message = function (type, message, wait) {
			var self = this;
			if (arguments.length === 1) {
				message = type;
				type = 'success';
			}
			if (type === undefined) {
				return $(opts.elm.find('.finam-ui-dialog-modal-page-message'));
			} else {
				var msg = this.message().show();
				msg
					.find('DIV')
					.removeClass('success')
					.removeClass('error')
					.addClass(type)
					.html(message);
				this.dialog().redraw();
				if (!!wait) {
					setTimeout(function () {
						self.message().animate(
							{
								opacity: 'hide',
							},
							300,
							function () {
								// TODO: сделать авторедров для диалога
								self.message().hide();
								self.dialog().redraw();
							}
						);
					}, wait * 1000);
				}
				return this;
			}
		};
		opts.create = opts.create || function () {};
		opts.create.call(this, opts.create.arguments);
		opts.open = opts.open || function () {};
		this.open = function () {
			if (!self._opened) {
				self._opened = true;
				self.message().hide();
				opts.open.call(self, opts.open.arguments);
			}
			self.redraw();
		};
		opts.close = opts.close || function () {};
		this.close = function () {
			if (!!self._opened) {
				self._opened = false;
				opts.close.call(self, opts.close.arguments);
				self.dialog().close();
			}
		};
		this.html = function (html) {
			self.elm().html(html);
			self.redraw();
			return this;
		};
		//opts.elm.resize(function() {
		//	self.dialog().redraw();
		//});
		return this;
	};
	Finam.UI.Dialogs.ModalPage.prototype = {
		name: function (name) {
			if (name == undefined) {
				return this._name;
			} else {
				this._name = name;
			}
			return this;
		},
		title: function (title) {
			if (title == undefined) {
				return this.title;
			} else {
				this.title = title;
			}
		},
		content: function (content) {
			if (content == undefined) {
				return this.elm().html();
			} else {
				this.elm().html(content);
			}
			return this;
		},
		select: function () {
			this.dialog().select(this.name());
			return this;
		},
		clear: function () {
			var self = this;
			$.each(this.elm().find('INPUT'), function (index, item) {
				item = $(item);
				if (
					!!item.attr('type') &&
					item.attr('type') !== 'hidden' &&
					item.attr('type') !== 'radio' &&
					item.attr('type') !== 'checkbox' &&
					item.attr('type') !== 'button'
				) {
					$(item).val('');
				}
			});
			$.each(this.elm().find('SELECT'), function (index, item) {
				$(item).val('');
			});
			return this;
		},
		element: function (name) {
			return this.elm().find('FORM *[name="' + name + '"]');
		},
		close: function () {
			this.dialog().close();
			return this;
		},
		redraw: function () {
			if (this.content().length == 0) {
				this.elm().closest('DIV.finam-ui-dialog-modal-page').addClass('empty');
			} else {
				this.elm()
					.closest('DIV.finam-ui-dialog-modal-page')
					.removeClass('empty');
			}
			this.dialog().redraw();
			return this;
		},
		visible: function (visible) {
			if (visible != undefined) {
				this._visible = visible;
				return this;
			} else {
				return this._visible;
			}
		},
	};
	Finam.UI.Dialogs.ModalPage._num = 0;

	// Utils
	Finam.UI.Controls.Utils = {};
	Finam.UI.Controls.Utils.DropdownList = function (opts) {
		opts = opts || {};
		this.list = opts.list || [];
		this.max = opts.max || 8;
		this.width = opts.width || null;
		this.minWidth = opts.minWidth || null;
		this.opened = false;
		this._name = opts.name;
		this.combo = opts.combo != undefined ? opts.combo : false;
		this.num = Finam.UI.Controls.Utils.DropdownList._num++;
		var d = (this.dom = {});
		this.control = opts.control;
		d.title = opts.title || null;
		d.arrow = opts.arrow || null;
		d.select = opts.list;
		d.list = $('<div class="finam-ui-dropdown-list"></div>');
		//	.insertAfter(this.control);
		$(document.body).append(d.list);
		if (opts.className != undefined) {
			d.list.addClass(opts.className);
		}
		var self = this;
		this.events = {};
		this.list = [];
		this.selected = null;
		this.hover = {
			top: 0,
			prev: null,
			current: null,
		};
		this.flags = {
			width: false,
		};
		var params = opts.params || [];
		if ($.isArray(opts.list)) {
			$.each(opts.list, function (index, item0) {
				var item = {};
				item.index = index;
				item.value = item0.value || item0;
				item.title = item0.title || item0;
				item.params = item0.params || {};
				self.list[index] = item;
				if (
					item.selected != undefined &&
					item.selected &&
					self.selected == null
				) {
					self.selected = item;
				}
			});
		} else {
			$.each($(opts.list).find('OPTION'), function (index, option) {
				option = $(option);
				if (!$(option).prop('disabled')) {
					var item = {};
					item.index = index;
					item.value = option.attr('value');
					item.title = option.html();
					item.params = item.params || {};
					$.each(params, function (idx, param) {
						item.params[param] = option.attr(param);
					});
					self.list[index] = item;
					//jQMigrateFrom if (option.attr('selected') != undefined || option.attr('value') == $(opts.list).val()) {
					if (
						option.prop('selected') != undefined ||
						option.prop('value') == $(opts.list).val()
					) {
						self.selected = self.list[index];
					}
				}
			});
		}
		if (this.selected == null && this.list.length > 0) {
			this.selected = this.list[0];
		}
		this.bind('change', opts.change || $.noop());
		this.create();
		d.list.bind('click', function (event) {
			var item = $(event.target);
			if (!item.is('A')) {
				item = item.parents('A');
			}
			var index = parseInt(item.attr('index'));
			var value = self.list[index].value;
			var title = self.list[index].title;
			self.select(value);
			self.invoke('change', value, title);
			self.hide();
			event.stopPropagation();
			return false;
		});
		if (d.arrow != null) {
			d.arrow.bind('click', function () {
				self.toggle();
				return false;
			});
		}
		if (d.title != null) {
			d.title.bind('click', function () {
				self.toggle();
				return false;
			});
		}
		$(window).bind('resize', function () {
			self.redraw();
			return false;
		});
		$(document).bind('click', function () {
			self.hide();
		});
		if (this.selected != null) {
			this.select(this.selected.value);
		} else {
			this.redraw();
		}
		return this;
	};
	Finam.UI.Controls.Utils.DropdownList.prototype = {
		invoke: function (name) {
			var args = $.makeArray(arguments).slice(1);
			$.each(this.events[name] || [], function (index, func) {
				func.apply(this, args);
			});
			return this;
		},
		bind: function (name, func) {
			if (func != undefined) {
				if (this.events[name] == undefined) {
					this.events[name] = [];
				}
				this.events[name].push(func);
			}
			return this;
		},
		redraw: function (hover) {
			this.dom.list
				.css('top', this.control.offset().top + this.control.outerHeight())
				.css('left', this.control.offset().left);
			//debugger;
			if (this.width != null) {
				this.dom.list.css('width', this.width);
			} else {
				if (this.control.outerWidth() > this.listWidth) {
					this.dom.list.css('width', this.control.outerWidth());
				} else if (this.listWidth < this.minWidth) {
					this.dom.list.css('width', this.minWidth);
				}
			}
			if (!this.flags.width) {
				if (this.max != 'max' && this.list.length > this.max) {
					var height = this.max * 23;
					this.dom.list
						.find('DIV')
						.css('height', height)
						.css('overflowY', 'scroll');
				} else {
					this.dom.list.find('DIV').css('overflowY', 'hidden');
				}
				this.flags.width = true;
			}
			if (hover && this.hover.curr != null) {
				var prevIndex = -1;
				if (this.hover.prev != null) {
					prevIndex = parseInt(this.hover.prev.attr('index'));
				}
				var currIndex = parseInt(this.hover.curr.attr('index'));
				if (prevIndex >= 0) {
					$(this.dom.links[prevIndex]).removeClass('hover');
				}
				$(this.dom.links[currIndex]).addClass('hover');
				if (this.max != 'max' && this.combo) {
					if (prevIndex < currIndex && currIndex > this.max - 1) {
						// идём вниз
						this.hover.top = currIndex - this.max + 1;
					}
					if (prevIndex > currIndex && currIndex < this.hover.top) {
						this.hover.top--;
					}
					this.dom.list.find('DIV').scrollTop(this.hover.top * 23);
				}
			}
			return this;
		},
		select: function (value) {
			if (value == undefined && this.hover.curr != null) {
				value = this.hover.curr.attr('value');
			}
			if (value != undefined && value != null) {
				var self = this;
				if (this.selected != null) {
					var index = this.selected.index;
					for (var index = 0; index < this.list.length; index++) {
						var item = this.list[index];
						if (item.value == value) {
							this.selected = item;
							this.selected.index = index;
							break;
						}
					}
				}
			} else {
				this.selected = this.list[0];
				this.selected.index = 0;
			}
			if (this.selected != null && this.dom.title != null) {
				this.dom.title.html(this.selected.title);
			}
			return this;
		},
		show: function () {
			Finam.UI.Controls.Utils.DropdownList._hide();
			Finam.UI.Controls.Utils.DropdownList._selected = this;
			var self = this;
			this.hover.top = 0;
			this.redraw();
			this.dom.list.show();
			this.dom.list.find('DIV').scrollTop(0);
			var top = 0;
			var topElm = this.dom.list.find('LI:eq(' + this.selected.index + ')');
			if (topElm.length > 0) {
				var top = $(topElm[0]).position().top;
			}
			var height = this.dom.list.find('DIV').height();
			var y = top - height / 2;
			if (y < 0) {
				y = 0;
			}
			this.dom.list.find('DIV').scrollTop(y);
			$(this.dom.list.find('LI')[this.selected.index])
				.find('A')
				.addClass('hover');
			this.opened = true;
			return this;
		},
		hide: function () {
			this.dom.list.hide();
			this.opened = false;
			Finam.UI.Controls.Utils.DropdownList._selected = null;
			return this;
		},
		toggle: function () {
			if (this.opened) {
				this.hide();
			} else {
				this.show();
			}
			return this;
		},
		value: function (val) {
			if (val != undefined) {
				this.select(val);
			} else {
				if (this.selected) {
					return this.selected.value;
				} else {
					return null;
				}
			}
		},
		title: function (title) {
			if (this.selected) {
				if (title != undefined) {
					this.dom.title.html(title);
				} else {
					return this.selected.title;
				}
			} else {
				return null;
			}
		},
		param: function (name, value) {
			if (this.selected) {
				if (value != undefined) {
					this.selected.params[name] = value;
				} else {
					return (this.selected.params || {})[name];
				}
			} else {
				return null;
			}
		},
		create: function (list) {
			var self = this;
			this.list = list || this.list || [];
			if (this.list.length > 0) {
				var l = '';
				$.each(this.list, function (index, item) {
					l +=
						'<li><a href="#" index="' +
						index +
						'" value="' +
						item.value +
						'">' +
						item.title +
						'</a></li>';
				});
				this.dom.list
					.css('width', 'auto')
					.show()
					.html('<div><ul>' + l + '</ul></div>')
					.css('visibility', 'hidden');
				var maxWidth = 0;
				$.each(this.dom.list.find('A'), function (index, item) {
					maxWidth =
						maxWidth < $(item).outerWidth() ? $(item).outerWidth() : maxWidth;
				});
				this.listWidth =
					this.max != 'max' && this.list.length > this.max
						? maxWidth + 22
						: maxWidth;
				this.dom.list
					.css('width', this.listWidth)
					.css('visibility', 'visible')
					.hide();
				this.flags.width = false;
				this.hover = {
					top: 0,
					prev: null,
					curr: null,
				};
				this.dom.links = this.dom.list.find('A').bind({
					mouseover: function (event) {
						self.dom.list.find('A.hover').removeClass('hover');
						$(this).addClass('hover');
						if (self.hover.curr != null && self.hover.curr != $(this)) {
							$(self.hover.curr).removeClass('hover');
						}
						self.hover.curr = $(this);
						self.redraw();
					},
					mouseout: function (event) {
						$(this).removeClass('hover');
						self.hover.prev = $(this);
						self.hover.curr = null;
						self.redraw();
					},
				});
				if (this.selected == null) {
					this.selected = this.list[0];
					this.selected.index = 0;
				}
				if (this.list.length > 0) {
					this.redraw();
				}
			}
			return this;
		},
		next: function () {
			if (this.hover.curr == null) {
				this.hover.prev = null;
				this.hover.curr = $(this.dom.links[0]);
			} else {
				var index = parseInt(this.hover.curr.attr('index')) + 1;
				if (index >= this.dom.links.length) {
					index = this.dom.links.length - 1;
				}
				this.hover.prev = $(this.dom.links[index - 1]);
				this.hover.curr = $(this.dom.links[index]);
			}
			this.redraw(true);
			return this;
		},
		prev: function () {
			if (this.hover.curr == null) {
				this.hover.prev = null;
				this.hover.curr = $(this.dom.links[this.dom.links.length - 1]);
			} else {
				var index = parseInt(this.hover.curr.attr('index')) - 1;
				if (index < 0) {
					index = 0;
				}
				this.hover.prev = $(this.dom.links[index + 1]);
				this.hover.curr = $(this.dom.links[index]);
			}
			this.redraw(true);
			return this;
		},
		width: function (width) {},
	};
	Finam.UI.Controls.Utils.DropdownList._num = 0;
	Finam.UI.Controls.Utils.DropdownList._selected = null;
	Finam.UI.Controls.Utils.DropdownList._hide = function () {
		if (
			Finam.UI.Controls.Utils.DropdownList._selected != null &&
			Finam.UI.Controls.Utils.DropdownList._selected.num != this.num
		) {
			Finam.UI.Controls.Utils.DropdownList._selected.hide();
			Finam.UI.Controls.Utils.DropdownList._selected = null;
		}
	};

	Finam.UI.Controls.Utils.Pager = function (opts) {
		var d = (this.dom = {});
		var e = (d.elm = $(opts.elm));
		this.create();
		return this;
	};
	Finam.UI.Controls.Utils.Pager.prototype = {
		select: function (page) {
			this.page = page;
			this.raise('select', page);
			this.redraw();
			return this;
		},
		create: function () {
			$.extend(this, new Finam.Utils.Events());
			var d = this.dom;
			var e = d.elm;
			var p = (d.pager = e.find('.pager'));
			d.list = p.find('LI.pager-page A');
			d.current = $(p.find('.pager-current A'));
			d.prev = $(p.find('.pager-prev A'));
			d.next = $(p.find('.pager-next A'));
			d.first = $(p.find('.pager-first A'));
			d.last = $(p.find('.pager-last A'));
			this.delta = parseInt(p.attr('delta'), 10);
			this.current = parseInt(p.attr('current'), 10) || 1;
			this.limits = this.calcLimits(this.current);
			this.count = parseInt(p.attr('count'), 10) || 1;
			var minCount = Math.min(
				this.dom.list.length > 0 ? this.dom.list.length : this.delta * 2 + 1,
				this.delta * 2 + 1
			);
			var width = p.find('.pager-list').innerWidth();
			var marginWidth = 10;
			var prevWidth = d.prev.outerWidth();
			var nextWidth = d.next.outerWidth();
			p.find('LI:last').addClass('pager-last');
			this._visibleCount = Math.floor(
				(width - prevWidth - nextWidth - marginWidth) /
					(d.list.first().outerWidth() + marginWidth)
			);
			p.find('LI.pager-page:gt(' + (this._visibleCount - 1) + ')').hide();
			var self = this;
			d.pager.on('click', 'LI.pager-page A', function (event) {
				var page = (self.page = self.checkPage($(this).html()));
				if (page != self.current) {
					self.select(page);
					$(this).blur();
				}
				return false;
			});
			d.prev.bind('click', function (event) {
				d.prev.blur();
				if (self.current - 1 > 0) self.select(self.current - 1);
				return false;
			});
			d.next.bind('click', function (event) {
				d.next.blur();
				if (self.current + 1 <= d.list.length) self.select(self.current + 1);
				return false;
			});
			d.first.bind('click', function (event) {
				d.first.blur();
				self.select(1);
				return false;
			});
			d.last.bind('click', function (event) {
				d.last.blur();
				self.select(self.count);
				return false;
			});
			this.page = this.current;
			this.redraw();
			return this;
		},
		redraw: function () {
			var list = this.dom.list;
			if (this.page != this.current && this.delta <= this.count) {
				if (list.length - this.delta < this.page) {
					for (var i = list.length + 1; i <= this.page + this.delta - 1; i++) {
						var num = $(
							'<li class="pager-page"><a href="#" class="ibutton">' +
								i +
								'</a></li>'
						);
						this.dom.next.before(num);
					}
					list = this.dom.list = this.dom.pager.find('LI.pager-page A');
				}
			}
			$(list[this.current - 1]).removeClass('yellow-button');
			$(list[this.page - 1]).addClass('yellow-button');
			var leftHidden = this.dom.pager.find(
				'LI.pager-page:lt(' + this.page + '):hidden'
			).length;
			var rightHidden = this.dom.pager.find(
				'LI.pager-page:gt(' + this.page + '):hidden'
			).length;
			var firstIndex = parseInt(
				this.dom.pager.find('LI.pager-page:visible').first().text(),
				10
			);
			var lastIndex = parseInt(
				this.dom.pager.find('LI.pager-page:visible ').last().text(),
				10
			);
			if (
				this.page + this.delta > this._visibleCount + leftHidden &&
				this.page > this.current
			) {
				lastIndex = this.page + this.delta - 1;
				if (lastIndex > this.count) {
					lastIndex = this.count;
				}
				firstIndex = lastIndex - this._visibleCount + 1;
			}
			if (this.page - leftHidden <= this.delta && this.page < this.current) {
				firstIndex = this.page - this.delta + 1;
				if (firstIndex <= 0) {
					firstIndex = 1;
				}
				lastIndex = firstIndex + this._visibleCount - 1;
			}
			this.dom.pager.find('LI.pager-page:lt(' + firstIndex + ')').hide();
			this.dom.pager.find('LI.pager-page:gt(' + (lastIndex - 1) + ')').hide();
			var list = this.dom.pager.find('LI.pager-page');
			for (var i = firstIndex; i <= lastIndex; i++) {
				$(list[i - 1]).show();
			}
			this.current = this.page;
			return this;
		},
		redraw2: function () {
			var list = this.dom.list;
			if (this.page != this.current) {
				if (list.length < this.page) {
					var last = list.last();
					for (var i = list.length + 1; i <= this.page; i++) {
						var num = $(
							'<li class="pager-page"><a href="#" class="ibutton">' +
								i +
								'</a></li>'
						);
						last.after(num);
					}
				}
			}
			$(list[this.current - 1]).addClass('yellow-button');
			if (this.page != this.current) {
				var list = this.dom.list;
				$(list[this.current - 1]).removeClass('yellow-button');
				$(list[this.page - 1]).addClass('yellow-button');
				var limits = this.calcLimits(this.page);
				if (this.page > this.current) {
					for (var i = this.limits.last; i < limits.last + 1; i++) {
						$(list[i - 1]).show();
						$(list[i - 1])
							.parent('LI')
							.show();
					}
					for (var i = this.limits.first; i < limits.first; i++) {
						if (i - 1 != 0) {
							$(list[i - 1]).hide();
							$(list[i - 1])
								.parent('LI')
								.hide();
						}
					}
				} else {
					for (var i = limits.first; i < this.limits.first; i++) {
						$(list[i - 1]).show();
						$(list[i - 1])
							.parent('LI')
							.show();
					}
					for (var i = limits.last + 1; i <= this.limits.last; i++) {
						$(list[i - 1]).hide();
						$(list[i - 1])
							.parent('LI')
							.hide();
					}
				}

				//i -???
				//$(list[this.page]).parent('LI').show();
				//this.limits = limits;
			}
			if (this.page == 1) {
				$(this.dom.prev).parent('LI').addClass('pager-disabled');
			} else {
				$(this.dom.prev).parent('LI').removeClass('pager-disabled');
			}
			if (this.page == list.length) {
				$(this.dom.next).parent('LI').addClass('pager-disabled');
			} else {
				$(this.dom.next).parent('LI').removeClass('pager-disabled');
			}
			/*
			var d = this.dom;
			var e = d.elm;
			var p = d.pager = e.find('.pager');
			d.first = $(p.find('.pager-first A'));
			d.last = $(p.find('.pager-last A'));
			var threepoints = d.elm.find('.pager-threepoints');
			var threepoints2 = d.elm.find('.pager-threepoints2');
			if (this.page > 5) {
				threepoints.show();
			} else {
				threepoints.hide();
			}
			if (this.page == this.count) {
				threepoints2.hide();
			}
			if (this.page < this.count - this.delta) {
				threepoints2.show();
				d.last.parent('LI').show();
			} else {
				threepoints2.hide();
			}

			d.last.show();
			*/
			this.current = this.page;
			return this;
		},
		calcLimits: function (current) {
			var first = current <= this.delta ? 1 : current - this.delta;
			var last = current + this.delta + (this.delta - current + first);
			if (last > this.count) {
				last = this.count;
				first = this.count - this.delta - this.delta;
			}
			last = last > this.count ? this.count : last;
			return {
				first: first,
				last: last,
			};
		},
		checkPage: function (page) {
			page = parseInt(page);
			page = isNaN(page) ? 1 : page;
			return page < 1 ? 1 : page > this.count ? this.count : page;
		},
		destroy: function () {
			this.dom.pager.find('A').unbind();
			return this;
		},
	};

	Finam.UI.Controls.Utils.Preloader = function (target, position) {
		this.target = $(target);
		this.elm = $(
			'<div id="finam-ui-preloader-' +
				Finam.UI.Controls.Utils.Preloader._num++ +
				'" class="finam-ui-preloader"><div></div>'
		)
			.appendTo('body')
			.hide();
		if (position == 'fixed' && !$.support.IE.is7) {
			this.elm.css('position', 'fixed');
		}
		if (!!target && parseInt(target.css('zIndex'))) {
			this.elm.css('zIndex', parseInt(target.css('zIndex')) + 1);
		}
		var self = this;
		$(window).bind('resize', function (event) {
			self.redraw();
		});
		return this;
	};
	Finam.UI.Controls.Utils.Preloader.prototype = {
		show: function (target) {
			if (!!target) {
				this.target = $(target);
			}
			if (!!this.target) {
				if (this.target.css('display') != 'none') {
					this.redraw();
					this.elm.show();
				}
				this.target.bind('resize', function () {
					try {
						this.redraw();
					} catch (err) {}
				});
			} else {
				this.elm.show();
			}
			return this;
		},
		hide: function () {
			this.elm.hide();
			return this;
		},
		redraw: function () {
			var target = this.target;
			if (!!target && target.offset() != null) {
				this.elm.css('top', target.offset().top);
				this.elm.css('left', target.offset().left);
				this.elm.width(target.outerWidth());
				this.elm.height(target.outerHeight());
				this.elm.find('DIV').height(target.outerHeight());
			}
			return this;
		},
		size: function (opts) {
			opts = opts || {};
			if (!!opts.width) {
				this.elm.width(opts.width);
			}
			if (!!opts.height) {
				this.elm.height(opts.height);
				this.elm.find('DIV').height(opts.height);
			}
			return this;
		},
		position: function (opts) {
			// относительно BODY
			opts = opts || {};
			if (!!opts.x) {
				switch (opts.x) {
					case 'center':
						this.elm.css({
							marginLeft: -Math.ceil(this.elm.width() / 2),
							left: '50%',
						});
						break;
					default:
						this.elm.css({
							marginLeft: 0,
							left: opts.x,
						});
				}
			}
			if (!!opts.y) {
				switch (opts.y) {
					case 'center':
						break;
					default:
						this.elm.css({
							top: opts.y,
						});
				}
			}
			return this;
		},
	};
	Finam.UI.Controls.Utils.Preloader._num = 0;

	Finam.UI.Controls.Utils.ItemSelector = function (elm, obj) {
		var self = this;
		this._obj = obj;
		this._selected = null;
		this._value = null;
		$.extend(true, this, new Finam.Utils.Events());
		var d = (this.dom = {});
		d.elm = elm;
		d.items = d.elm.find('.finam-ui-item-selector-item');
		d.links = d.elm
			.find('.finam-ui-item-selector-item A')
			.bind('click', function (event) {
				var link = $(this);
				var item = link.closest('.finam-ui-item-selector-item');
				if (!item.hasClass('finam-ui-item-selector-item-disabled')) {
					if (self._selected != item) {
						if (self._selected != null) {
							self._selected.removeClass('selected');
						}
						self._selected = item.addClass('selected');
						self.value(item.attr('value'));
					}
				}
				return false;
			});
		this._selected = d.elm.find('.finam-ui-item-selector-item.selected');
		if (this._selected.length == 0) {
			$(d.links[0]).click();
		} else {
			this._value = $(this._selected[0]).attr('value');
		}
		return this;
	};
	Finam.UI.Controls.Utils.ItemSelector.prototype = {
		value: function (value) {
			if (value == undefined) {
				return this._value;
			} else {
				var link = this.dom.elm.find(
					'.finam-ui-item-selector-item[value="' + value + '"] A'
				);
				if (link.length == 1) {
					if (this._value != value) {
						this._value = value;
						this.raise('change', value);
						link.click();
					}
				}
				return this;
			}
		},
		items: function () {
			return this.dom.items;
		},
		item: function (value) {
			return $(
				this.dom.elm.find('.finam-ui-item-selector-item[value="' + value + '"]')
			);
		},
		title: function (value, title) {
			var item = this.dom.elm.find(
				'.finam-ui-item-selector-item[value="' + value + '"] SPAN'
			);
			if (title == undefined) {
				return $(item).html();
			} else {
				$(item).html(title);
			}
			return this;
		},
		status: function (value, status) {
			var item = this.dom.elm.find(
				'.finam-ui-item-selector-item[value="' + value + '"]'
			);
			if (status == undefined) {
				return $(item).hasClass('finam-ui-item-selector-item-disabled');
			} else {
				if (status) {
					$(item).removeClass('finam-ui-item-selector-item-disabled');
				} else {
					$(item).addClass('finam-ui-item-selector-item-disabled');
				}
			}
			return this;
		},
	};

	Finam.UI.Controls.Utils.State = function (state) {
		var self = this;
		this._state = {};
		this._change = false;
		$.extend(this, new Finam.Utils.Events());
		this.init(state);
		return this;
	};
	Finam.UI.Controls.Utils.State.prototype = {
		init: function (state) {
			var self = this;
			this.stopEvent('change');
			$.each(state || {}, function (key, item) {
				self.add(key, item);
			});
			this.startEvent('change');
			return this;
		},
		parse: function (query, separator) {
			this._state = query.toQueryParams(separator);
			this.raise('change', this);
			return this;
		},
		query: function () {
			return $.param(this._state);
		},
		value: function (name, value) {
			if (value == undefined) {
				if ($.isPlainObject(name)) {
					this._change = false;
					var self = this;
					$.each(name, function (key, value) {
						self._add(key, value);
					});
					if (this._change) {
						this.raise('change', this);
					}
				} else {
					var value = null;
					if (this._state[name] != undefined) {
						value = this._state[name];
					}
					return value;
				}
			} else {
				this.add(name, value);
			}
			return this;
		},
		add: function (name, value) {
			this._change = false;
			this._add(name, value);
			if (this._change) {
				this.raise('change', this);
			}
			return this;
		},
		_add: function (name, value) {
			var self = this;
			if ($.isPlainObject(value)) {
				$.each(value || {}, function (key, item) {
					var name2 = name + '.' + key;
					self._change = self._change || self._state[name2] != item;
					self._add(name2, item);
				});
			} else {
				this._change = this._change || self._state[name] != value;
				this._state[name] = value;
			}
			return this;
		},
		remove: function (name) {
			if (this._state[name] != undefined) {
				delete this._state[name];
				this.raise('change', this);
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

	// HTML5
	Finam.UI.Controls.HTML5 = {};
	Finam.UI.Controls.HTML5._login0 = '1';
	Finam.UI.Controls.HTML5._pass0 = 'test_user_delay_data';
	Finam.UI.Controls.HTML5._cookiesOff =
		'<table class="cookies-off-message"><tr><td>Включите куки и <a href="#" onclick="window.location.reload(); return false; ">перегрузите</a> страницу.</td></tr></table>';
	Finam.UI.Controls.HTML5._domain = '1';
	Finam.UI.Controls.HTML5.oldta_domain = '2';
	Finam.UI.Controls.HTML5.oldco_domain = '3';

	Finam.UI.Controls.HTML5.TechAnalysis = function (opts) {
		opts = opts || {};
		opts.server = opts.server || {};
		var self = this;
		this.firstTimeLoaded = true;
		this.events = {
			ready: opts.ready,
			load: opts.load,
			candle: opts.candle || $.noop,
			quote: opts.quote || $.noop,
			connect: opts.connect || $.noop,
			disconnect: opts.disconnect || $.noop,
			heartbeat: opts.heartbeat || $.noop,
		};
		opts.id =
			opts.id ||
			'HTML5.TechAnalysis' + Finam.UI.Controls.HTML5.TechAnalysis._num++;
		opts.locale = opts.locale || 'ru';
		opts.server.url =
			opts.server.url ||
			'//ta-streaming-' +
				Finam.UI.Controls.HTML5.oldta_domain +
				'.finam.ru/ta/server';
		var login = Finam.UI.Controls.HTML5._login0;
		var pass = Finam.UI.Controls.HTML5._pass0;
		if (!opts.anonym) {
			login = Finam.User.info().id || login;
			pass = Finam.User.info().pass || pass;
		}
		opts.server.login = login + '';
		opts.server.pass = pass + '';
		var done = false;
		if (opts.server.login != '' && opts.server.pass != '') {
			//try {
			this.control = new TechAnalysisChart({
				id: opts.id,
				container: opts.container,
				locale: opts.locale,
				server: {
					url: opts.server.url,
					login: opts.server.login,
					pass: opts.server.pass,
					clientType: 5,
				},
				events: {
					load: function () {
						// События графика. В первый раз вызывается, когда график готов для работы, в остальные разы вызывается, когда приходят в первый раз свечи для выбранной бумаги
						if (self.firstTimeLoaded) {
							self.firstTimeLoaded = false;
							self.events.ready();
						} else {
							self.events.load();
						}
					},
					candle: function (close) {
						// Вызывается при каждом изменении последней свечки (передается ее значение close)
						self.events.candle(close);
					},
					quote: function (quote) {
						//Вызывается, когда приходит котировка для графика. Содержит поля: id, ask, askvol, bid, bidvol, chg, chgdir, last, lastTime, open, close, high, low, value, volume, date, tradeCount, lastTradeSize
						quote.pchange = quote.chg;
						quote.change = ((quote.chg / 100) * quote.close).toFixed(
							aEmitentDecp[parseInt(quote.id)] || 4
						);
						self.events.quote(quote);
					},
					connect: function () {
						self.events.connect();
					},
					disconnect: function () {
						self.events.disconnect();
					},
					heartbeat: function () {
						// Вызывается по тикам от сервера. Можно использовать, чтобы проверять жив ли сервер
						self.events.heartbeat();
					},
				},
			});
			done = true;
			//} catch (e) {
			//	console.log('Finam.UI.Controls.HTML5.TechAnalysis init error');
			//	done = false;
			//}
		}
		if (!done) {
			this.control = {};
			$.each(
				[
					'bind',
					'setOptions',
					'setIssueId',
					'setPitch',
					'setChartType',
					'setMAIndicator',
					'showVolumeIndicator',
					'setExtIndicatorToChart',
					'setExtIndicator1',
					'setExtIndicator2',
					'setExtIndicator3',
					'close',
					'toSVG',
				],
				function (index, func) {
					self.control[func] = $.noop;
				}
			);
			if (login == '' && pass == '') {
				$('#' + opts.container).html(Finam.UI.Controls.HTML5._cookiesOff);
			}
		}
		return this;
	};
	Finam.UI.Controls.HTML5.TechAnalysis.prototype = {
		bind: function (name, func) {
			this.events[name] = func;
			return this;
		},
		setOptions: function (issueId, pitch, chartType) {
			this.control.setOptions(issueId, pitch, chartType);
			return this;
		},
		setIssueId: function (issueId) {
			this.control.setIssueId(issueId);
			return this;
		},
		setPitch: function (pitch) {
			this.control.setPitch(pitch);
			return this;
		},
		setChartType: function (chartType) {
			this.control.setChartType(chartType);
			return this;
		},
		setMAIndicator: function (opts) {
			this.control.setMAIndicator(opts);
			return this;
		},
		showVolumeIndicator: function (visible) {
			this.control.showVolumeIndicator(visible);
			return this;
		},
		setExtIndicatorToChart: function (opts) {
			this.control.setExtIndicatorToChart(opts);
			return this;
		},
		setExtIndicator1: function (opts) {
			this.control.setExtIndicator1(opts);
			return this;
		},
		setExtIndicator2: function (opts) {
			this.control.setExtIndicator2(opts);
			return this;
		},
		setExtIndicator3: function (opts) {
			this.control.setExtIndicator3(opts);
			return this;
		},
		close: function () {
			this.control.close();
			return this;
		},
		toSVG: function () {
			return this.control.toSVG();
			//callback = callback || $.noop;
			//this.control.toSVG(function(svg) {
			//	callback(svg);
			//});
			//return this;
		},
	};
	Finam.UI.Controls.HTML5.TechAnalysis._num = 0;

	Finam.UI.Controls.HTML5.TechAnalysisNew = function (opts) {
		var self = this;
		opts = opts || {};
		opts.server = opts.server || {};
		$.extend(this, new Finam.Utils.Events());
		opts.id =
			opts.id ||
			'HTML5.TechAnalysisNew' + Finam.UI.Controls.HTML5.TechAnalysisNew._num++;
		opts.locale = opts.locale || 'ru';
		opts.server.url =
			opts.server.url ||
			'//ta-streaming-' +
				Finam.UI.Controls.HTML5.oldta_domain +
				'.finam.ru/ta/server';
		opts.fullui = opts.fullui || true;
		var login = Finam.UI.Controls.HTML5._login0;
		var pass = Finam.UI.Controls.HTML5._pass0;
		if (!opts.anonym) {
			login = Finam.User.info().id || login;
			pass = Finam.User.info().pass || pass;
		}
		this.events = {
			ready: opts.ready,
			load: opts.load,
			candle: opts.candle || $.noop,
			quote: opts.quote || $.noop,
			connect: opts.connect || $.noop,
			disconnect: opts.disconnect || $.noop,
			heartbeat: opts.heartbeat || $.noop,
		};
		opts.server.login = login + '';
		opts.server.pass = pass + '';
		var done = false;
		if (opts.server.login != '' && opts.server.pass != '') {
			//try {
			var params = {
				id: opts.id, // Уникальный id графика
				container: opts.container, // id element’а или DOMElement, куда будет вставлен график
				locale: opts.locale, // Локаль графиков: ru, en
				respectSameOriginPolicy: true, //позволяет загружать графики на том же домене, что и сервер
				server: {
					// Настройки подключения к серверу тех. анализа
					url: opts.server.url, //урл сервера со случайно генерированным поддоменом для обхода same origin policy
					login: opts.server.login,
					pass: opts.server.pass,
					clientType: 5,
				},
			};
			if (!!opts.ui) {
				params.ui = opts.ui;
			}
			var ta = (this.control = new finamtrade.TechAnalysis(params));
			ta.onready = function () {
				// Вызывается, когда  график готов для работы
				self.raise('ready');
			};
			ta.onload = function () {
				// Вызывается, когда приходят в первый раз свечи для выбранной бумаги
				self.raise('load');
			};
			ta.onconnect = function () {
				self.raise('connect');
			};
			ta.ondisconnect = function () {
				self.raise('disconnect');
			};
			ta.onheartbeat = function () {
				// Вызывается по тикам от сервера. Можно использовать, чтобы проверять жив ли сервер
				self.raise('heartbeat');
			};
			ta.onquote = function (quote) {
				// Вызывается по тикам от сервера. Можно использовать, чтобы проверять жив ли сервер
				self.raise('onquote', quote);
			};
			ta.onrequestFullwindow = function () {
				// Вызывается, когда пользователь хочет развернуть график на все окно страницы
				self.raise('requestFullwindow');
			};
			ta.onexitFullwindow = function () {
				// Вызывается, когда пользователь хочет свернуть график до первоначального размера на странице
				self.raise('exitFullwindow');
			};
			done = true;
			//} catch (e) {
			//
			//	console.log('Finam.UI.Controls.HTML5.TechAnalysisNew init error');
			//}
		}
		if (!done) {
			this.control = {};
			$.each(
				['setOptions', 'takeSnapshot', 'load', 'close'],
				function (index, func) {
					self.control[func] = $.noop;
				}
			);
		}
		return this;
	};
	Finam.UI.Controls.HTML5.TechAnalysisNew.prototype = {
		setOptions: function (opts) {
			this.control.setOptions(opts);
			return this;
		},
		getOptions: function (callback) {
			//this.control.getOptions(callback);
			this.control.getOptions().then(callback);
			return this;
		},
		takeSnapshot: function (imageDimensions) {
			return $.when(this.control.takeSnapshot(imageDimensions));
		},
		load: function (save) {
			this.control.load(save);
			return this;
		},
		close: function () {
			this.controls.close();
			return this;
		},
	};
	Finam.UI.Controls.HTML5.TechAnalysisNew._num = 0;

	Finam.UI.Controls.HTML5.Composite = function (opts) {
		opts = opts || {};
		opts.server = opts.server || {};
		var self = this;
		this.firstTimeLoaded = true;
		this.events = {
			ready: opts.ready,
			load: opts.load,
			connect: opts.connect || $.noop,
			disconnect: opts.disconnect || $.noop,
			heartbeat: opts.heartbeat || $.noop,
		};
		opts.id =
			opts.id ||
			'HTML5.CompositeCharts' + Finam.UI.Controls.HTML5.Composite._num++;
		opts.locale = opts.locale || 'ru';
		opts.server.url =
			opts.server.url ||
			'//ta-streaming-' +
				Finam.UI.Controls.HTML5.oldta_domain +
				'.finam.ru/ta/server';
		//console.log(opts.server.url);
		opts.server.login =
			(Finam.User.info().id || Finam.UI.Controls.HTML5._login0) + '';
		opts.server.pass = Finam.User.info().pass || Finam.UI.Controls.HTML5._pass0;
		var done = false;
		if (opts.server.login != '' && opts.server.pass != '') {
			try {
				this.control = new CompositeChart({
					id: opts.id,
					container: opts.container,
					locale: opts.locale,
					server: {
						url: opts.server.url,
						login: opts.server.login,
						pass: opts.server.pass,
						clientType: 5,
					},
					events: {
						load: function () {
							// События графика. В первый раз вызывается, когда график готов для работы, в остальные разы вызывается, когда приходят в первый раз свечи для выбранной бумаги
							if (self.firstTimeLoaded) {
								self.firstTimeLoaded = false;
								self.events.ready();
							} else {
								self.events.load();
							}
						},
						connect: function () {
							self.events.connect();
						},
						disconnect: function () {
							self.events.disconnect();
						},
						heartbeat: function () {
							// Вызывается по тикам от сервера. Можно использовать, чтобы проверять жив ли сервер
							self.events.heartbeat();
						},
					},
				});
				done = true;
			} catch (e) {
				done = false;
			}
		}
		if (!done) {
			this.control = {};
			$.each(
				[
					'bind',
					'setMajorIssue',
					'addIssue',
					'removeIssue',
					'setPeriod',
					'close',
				],
				function (index, func) {
					self.control[func] = $.noop;
				}
			);
			if (login == '' && pass == '') {
				$('#' + opts.container).html(Finam.UI.Controls.HTML5._cookiesOff);
			}
		}
		return this;
	};
	Finam.UI.Controls.HTML5.Composite.prototype = {
		bind: function (name, func) {
			this.events[name] = func;
			return this;
		},
		setMajorIssue: function (issueId, period, color) {
			this.control.setMajorIssue(issueId, period, color);
			return this;
		},
		addIssue: function (chartId, issueId, color) {
			this.control.addIssue(chartId, issueId, color);
			return this;
		},
		removeIssue: function (chartId) {
			this.control.removeIssue(chartId);
			return this;
		},
		setPeriod: function (period) {
			this.control.setPeriod(period);
			return this;
		},
		close: function () {
			this.control.close();
			return this;
		},
	};
	Finam.UI.Controls.HTML5.Composite._num = 0;

	Finam.UI.Controls.HTML5.WebPortfolio = function (opts) {
		opts = opts || {};
		opts.server = opts.server || {};
		var self = this;
		var events = (this._events = {
			load: opts.load,
			connect: opts.connect || $.noop,
			disconnect: opts.disconnect || $.noop,
			heartbeat: opts.heartbeat || $.noop,
			portfolio: opts.portfolio || $.noop,
			message: opts.message || $.noop,
			account: opts.account || $.noop,
			createaccount: opts.createaccount || $.noop,
			openft: opts.openft || $.noop,
			onclose: opts.onclose || $.noop,
		});
		opts.id =
			opts.id ||
			'HTML5.WebPortfolio' + Finam.UI.Controls.HTML5.WebPortfolio._num++;
		var view = opts.view || 'portfolio';
		var enabled = true;
		try {
			this.control = new finamtrade.Portfolio({
				id: opts.id,
				container: opts.container,
				locale: opts.locale || 'ru',
				defaultView: view,
				respectSameOriginPolicy: true,
				server: {
					url: opts.server.url || '//td.finam.ru/WebTr/HTML5',
					login: opts.server.login,
					pass: opts.server.pass,
					clientType: opts.server.clientType,
				},
			});
			this.control.onready = function () {
				events.load();
			};
			this.control.onconnect = function () {
				events.connect();
			};
			this.control.ondisconnect = function () {
				events.disconnect();
			};
			this.control.onheartbeat = function () {
				events.heartbeat();
			};
			this.control.onportfolio = function (balance, pl, plPercentage) {
				events.portfolio(balance, pl, plPercentage);
			};
			this.control.onmessage = function (msg) {
				events.message(msg);
			};
			this.control.onaccount = function (code) {
				events.account(code);
			};
			this.control.onclose = function () {
				events.onclose();
			};
		} catch (e) {
			this.control = {};
			$.each(
				['bind', 'buy', 'sell', 'show', 'hide', 'close'],
				function (index, func) {
					self.control[func] = $.noop;
				}
			);
			//console.log('Finam.UI.Controls.HTML5.WebPortfolio create failed.');
			enabled = false;
		}
		this.enabled = function () {
			return enabled;
		};
		return this;
	};
	Finam.UI.Controls.HTML5.WebPortfolio.prototype = {
		bind: function (name, func) {
			this.events[name] = func;
			return this;
		},
		buy: function (order) {
			this.control.buy(order);
			return this;
		},
		sell: function (order) {
			this.control.sell(order);
			return this;
		},
		show: function (view) {
			this.control.show(view);
			return this;
		},
		hide: function () {
			this.control.hide();
			return this;
		},
		close: function () {
			this.control.close();
			return this;
		},
		gup: function (name, def) {
			name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
			var regexS = '[\\?&]' + name + '=([^&#]*)';
			var regex = new RegExp(regexS);
			var results = regex.exec(window.location.href);
			return (results && results[1]) || def;
		},
	};
	Finam.UI.Controls.HTML5.WebPortfolio._num = 0;

	Finam.UI.Controls.HTML5.Support = function (opts) {
		opts = opts || {};
		opts.ie = opts.ie || 8.0;
		var enabled = !(
			!$.support.HTML5 ||
			($.support.IE.isOld && $.support.IE.version < opts.ie)
		);
		var elm = $(opts.elm);
		if (!enabled || $.support.IE.is8 || $.support.IE.isCompatibility) {
			elm.html(Finam.UI.Controls.HTML5.Support.TEMPLATE);
			elm.find('TD').css({ height: elm.outerHeight() });
			if (!!opts.title) {
				elm.find('.f-browsercheck__title').html(opts.title);
			}
			elm.find('.f-browsercheck__compat, .f-browsercheck__compat-or').hide();
			elm.find('.f-browsercheck__compat').hide();
			elm.find('.f-browsercheck__install').show();
			if (enabled && $.support.IE.is8) {
				elm.addClass('f-browsercheck_mode_inline');
				elm
					.find('.f-browsercheck__title')
					.html(opts.inline || Finam.UI.Controls.HTML5.Support.INLINE_TITLE);
			} else {
				elm.addClass('f-browsercheck_mode_block');
				elm
					.find('.f-browsercheck__title')
					.html(opts.block || Finam.UI.Controls.HTML5.Support.BLOCK_TITLE);
				if ($.support.IE.isCompatibility) {
					elm.find('.f-browsercheck__compat').show();
					elm.find('.f-browsercheck__compat-or').show();
					elm.find('.f-browsercheck__install').hide();
				}
			}
			elm.show();
		} else {
			if (opts.mode == 'hide') {
				elm.hide();
			}
		}
		this.enabled = function () {
			return enabled;
		};
		return this;
	};
	Finam.UI.Controls.HTML5.Support.TEMPLATE =
		'<div class="f-browsercheck"><table><tr><td><p><span class="f-browsercheck__title">Чтобы увидеть график</span>, <span class="f-browsercheck__install">обновите браузер</span> <span class="f-browsercheck__compat"><span class="f-browsercheck__compat-or">или </span>отключите режим совместимости</span>.</p></td></tr></table></div>';
	Finam.UI.Controls.HTML5.Support.BLOCK_TITLE = 'Чтобы увидеть график';
	Finam.UI.Controls.HTML5.Support.INLINE_TITLE =
		'Часть функций недоступна в вашей версии браузера';

	// Forms
	Finam.UI.Controls.Select = function (elm) {
		var self = this;
		var d = (this.dom = {});
		if (elm.length != undefined && elm.length > 0) {
			elm = $(elm[0]);
		}
		d.elm = $(elm);
		this.width = elm.outerWidth();
		d.control = $(
			'<div class="finam-ui-controls-select"><div class="finam-ui-controls-select-title"></div><div class="finam-ui-controls-select-arrow"></div></div>'
		).insertBefore(elm);
		d.title = d.control.find('.finam-ui-controls-select-title');
		d.arrow = d.control.find('.finam-ui-controls-select-arrow');
		d.title.css('width', this.width - 15 - 8);
		d.control.css('width', this.width);
		d.elm
			.bind({
				change: function () {
					self.list.value($(this).val());
				},
			})
			.hide();
		d.control.bind({
			mousedown: function () {
				$(this).addClass('down');
			},
			mouseup: function () {
				$(this).removeClass('down');
			},
		});
		this.list = new Finam.UI.Controls.Utils.DropdownList({
			max: 'max',
			list: d.elm,
			control: d.control,
			title: d.title,
			arrow: d.arrow,
			change: function (value) {
				d.elm.val(value);
				d.elm.triggerHandler('change');
			},
		});
		this.list.select(this.dom.elm.val());
		return this;
	};
	Finam.UI.Controls.Select.prototype = {
		rebuild: function () {
			var list = [];
			var options = this.dom.elm.find('OPTION');
			$.each(this.dom.elm.find('OPTION'), function (index, option) {
				option = $(option);
				if (!option.hasClass('disabled')) {
					list.push({ value: option.attr('value'), title: option.text() });
				}
			});
			this.list.create(list);
			this.list.select(this.dom.elm.val());
			return this;
		},
		name: function (name) {
			if (name != undefined) {
				// TODO: установка имени
			} else {
				return this.dom.elm.attr('name');
			}
		},
		selectedIndex: function (idx) {
			if (idx != undefined) {
				this.dom.elm.attr('selectedIndex', idx);
			} else {
				return this.dom.elm.attr('selectedIndex');
			}
		},
	};

	Finam.UI.Controls.Slider = function (elm, opts) {
		opts = opts || {};
		if (elm.length == 0) {
			var fake = {
				bind: function () {
					return this;
				},
				load: function () {
					return this;
				},
			};
			return fake;
		}
		this._name = opts.name;
		this._count = parseInt(elm.attr('count')) || opts.count || 50;
		this._cols = [];
		this._colWidth = 1;
		this._postfix = opts.postfix || '#';
		this._url = opts.url;
		this._pointers = {
			min: {
				x: 0,
				num: 0,
			},
			max: {
				x: 0,
				num: this._count - 1,
			},
		};
		this._cache = {};
		this._disabled = false;
		this._animate = $.support.IE.is8
			? function (col, height) {
					col.css('height', height);
			  }
			: function (col, height) {
					col.animate({ height: height }, 1000);
			  };
		$.extend(this, new Finam.Utils.Events());
		var d = (this.dom = {});
		d.elm = elm
			.addClass('finam-ui-controls-slider')
			.append(
				$(
					'<div class="finam-ui-controls-slider-title"></div><div class="finam-ui-controls-slider-min"><span class="js">min</span><input type="text" readonly="readonly"/></div><div class="finam-ui-controls-slider-max"><span class="js">max</span><input type="text" readonly="readonly"/></div><div class="finam-ui-controls-slider-field"><div class="finam-ui-controls-slider-cols"></div><div class="finam-ui-controls-slider-pointers"><div class="finam-ui-controls-slider-pointer-min"><div></div></div><div class="finam-ui-controls-slider-pointer-max"><div></div></div></div></div><div class="finam-ui-controls-slider-disabled">нет данных</div>'
				)
			);
		d.title = elm.find('.finam-ui-controls-slider-title').html(opts.title);
		d.min = {};
		d.min.elm = elm.find('.finam-ui-controls-slider-min');
		d.min.link = d.min.elm.find('SPAN');
		d.min.value = d.min.elm.find('INPUT');
		d.min.pointer = elm.find('.finam-ui-controls-slider-pointer-min');
		d.max = {};
		d.max.elm = elm.find('.finam-ui-controls-slider-max');
		d.max.link = d.max.elm.find('SPAN');
		d.max.value = d.max.elm.find('INPUT');
		d.max.pointer = elm.find('.finam-ui-controls-slider-pointer-max');
		d.field = d.elm.find('.finam-ui-controls-slider-field');
		d.pointers = d.elm.find('.finam-ui-controls-slider-pointers');
		d.cols = d.elm.find('.finam-ui-controls-slider-cols');
		d.disabled = d.elm.find('.finam-ui-controls-slider-disabled').hide();
		var self = this;
		d.min.pointer
			.draggable({
				containment: [this._x0, this._y0, this._x0 + this._width - 1, this._y0],
				stop: function (event, ui) {
					d.min.pointer.redraw(ui.position.left);
					self.raise('change', self.value());
				},
				drag: function (event, ui) {
					d.min.pointer.redraw(ui.position.left);
				},
			})
			.addTouch();
		d.max.pointer
			.bind('dblclick', function () {
				d.min.pointer.redraw(-1);
				d.max.pointer.redraw(+1);
				return false;
			})
			.draggable({
				axis: 'x',
				containment: [
					this._x0 + 10,
					this._y0,
					this._x0 + this._width - 1 + 10,
					this._y0,
				],
				stop: function (event, ui) {
					d.max.pointer.redraw(ui.position.left - 10);
					self.raise('change', self.value());
				},
				drag: function (event, ui) {
					d.max.pointer.redraw(ui.position.left - 10);
				},
			})
			.addTouch();
		$.extend(true, this.dom.min.pointer, {
			redraw: function (x, animate) {
				d.min.pointer.css('z-index', 104);
				d.max.pointer.css('z-index', 103);
				if (self._pointers.min.x != x || self._pointers.min.x) {
					switch (x) {
						case 'min':
							x = 0;
							break;
						case -1:
							x = self._pointers.min.x - self._colWidth - 1;
							break;
					}
					if (x < 0) {
						x = 0;
					}
					var num = self.calcNum(x);
					if (self._colWidth == 1) {
						var x = num * 2;
					} else {
						var x = Math.floor((num + 0.5) * (self._colWidth + 1) - 1);
					}
					d.min.pointer.css('top', 0);
					if (animate) {
						d.min.pointer.animate({ left: x }, 100);
					} else {
						d.min.pointer.css('left', x);
					}
					self._pointers.min.x = x;
					self._pointers.min.num = num;
					d.max.pointer.draggable({
						containment: [
							self._x0 + x + 10,
							self._y0,
							self._x0 + self._width - 1 + 10,
							self._y0,
						],
					});
				}
				if (self._cols[self._pointers.min.num] != undefined) {
					self.dom.min.value.val(
						self.parseValue(self._cols[self._pointers.min.num].start)
					);
				}
			},
		});
		$.extend(true, this.dom.max.pointer, {
			redraw: function (x, animate) {
				d.max.pointer.css('z-index', 104);
				d.min.pointer.css('z-index', 103);
				if (self._pointers.max.x != x || self._pointers.min.x) {
					var max = (self._colWidth + 1) * (self.count() - 1);
					switch (x) {
						case 'max':
							x = max;
							break;
						case 1:
							x = self._pointers.max.x + self._colWidth + 1;
							break;
					}
					if (x > max) {
						x = max;
					}
					var num = self.calcNum(x);
					if (self._colWidth == 1) {
						var x = num * 2;
					} else {
						var x = Math.floor((num + 0.5) * (self._colWidth + 1) - 1);
					}
					d.max.pointer.css('top', 0);
					if (animate) {
						d.max.pointer.animate({ left: x + 10 }, 100);
					} else {
						d.max.pointer.css('left', x + 10);
					}
					self._pointers.max.x = x;
					self._pointers.max.num = num;
					d.min.pointer.draggable({
						axis: 'x',
						containment: [self._x0, self._y0, self._x0 + x, self._y0],
					});
				}
				if (self._cols[self._pointers.max.num] != undefined) {
					self.dom.max.value.val(
						self.parseValue(self._cols[self._pointers.max.num].end)
					);
				}
			},
		});
		d.min.link.bind('click', function () {
			d.min.pointer.redraw('min', true);
			self.raise('change', self.value());
		});
		d.max.link.bind('click', function () {
			d.max.pointer.redraw('max', true);
			self.raise('change', self.value());
		});
		this._windowWidth = $(window).width();
		$(window).resize(function () {
			if ($(window).width() != self._windowWidth) {
				self.redraw();
				self._windowWidth = $(window).width();
			}
		});
		this.preloader = new Finam.UI.Controls.Utils.Preloader(d.elm);
		this.create();
		return this;
	};
	Finam.UI.Controls.Slider.prototype = {
		create: function (data) {
			var self = this;
			data = data || {};
			this._cols = data.cols || this._cols;
			this._min = data.min;
			this._max = data.max;
			this.count(data.count);
			var cols = this.dom.cols.find('DIV');
			if (this.count() > 0) {
				this.disabled(false);
				if (cols.length > this.count()) {
					for (var i = this.count(); i < cols.length; i++) {
						$(cols[i]).remove();
					}
				} else {
					var fragment = document.createDocumentFragment();
					for (var i = cols.length; i < this.count(); i++) {
						var col = document.createElement('div');
						col.style.left = new String(i * 2) + 'px';
						fragment.appendChild(col);
					}
					this.dom.cols[0].appendChild(fragment);
				}
				this._pointers.min.x = null;
				this._pointers.max.x = null;
				cols = this.dom.cols.find('DIV');
				var maxCount = 0;
				$.each(this._cols, function (index, col) {
					if (maxCount < col.count) {
						maxCount = col.count;
					}
				});
				if (maxCount > 0) {
					$.each(this._cols, function (index, col) {
						var height = Math.ceil((29 * col.count) / maxCount) + 1;
						self._animate($(cols[index]), height);
						$(cols[index]).addClass('col_bg_' + col.level);
					});
				} else {
					$.each(this._cols, function (index, col) {
						self._animate($(cols[index]), 1);
					});
				}
				this.redraw();
			} else {
				this.disabled(true);
				this.reset();
			}
			return this;
		},
		reset: function () {
			var self = this;
			$.each(this.dom.cols.find('DIV'), function (index, col) {
				self._animate($(col), 1);
			});
			this.dom.min.pointer.css('left', 0);
			this.dom.max.pointer.css('right', 0);
			this.dom.min.value.val('');
			this.dom.max.value.val('');
			return this;
		},
		redraw: function () {
			var d = this.dom;
			var self = this;
			var dx = 10;
			var width =
				d.elm.innerWidth() -
				d.min.elm.outerWidth() -
				d.max.elm.outerWidth() -
				10;
			var colWidth = Math.floor((width - (this.count() - 1)) / this.count());
			if (colWidth % 2 == 0 && colWidth > 1) {
				// нечетная ширина столбика
				colWidth--;
			}
			var newWidth = this.count() * colWidth + (this.count() - 1);
			var colStart = Math.floor((width - newWidth) / 2);
			if (this._colWidth != colWidth) {
				$.each(d.cols.find('DIV'), function (index, col) {
					$(col)
						.css('left', index * (colWidth + 1))
						.css('width', colWidth);
				});
				this._colWidth = colWidth;
			}
			d.field.css('top', '35px').css('width', width + 2);
			d.cols.css('top', 0).css('left', colStart).css('width', newWidth);
			d.pointers
				.css('top', 0)
				.css('left', colStart - 4 - dx)
				.css('width', newWidth + 9 + dx * 2);
			var minNum = this.num('min');
			var maxNum = this.num('max');
			this._x0 = d.pointers.offset().left;
			this._y0 = d.pointers.offset().top;
			this._width = newWidth;
			var minX = (colWidth + 1) * minNum;
			var maxX = (colWidth + 1) * maxNum;
			this.dom.min.pointer.redraw(minX, false);
			this.dom.max.pointer.redraw(maxX, false);
			return this;
		},
		calcNum: function (x) {
			return Math.floor(x / (this._colWidth + 1));
		},
		parseValue: function (value) {
			if (value != null) {
				var sign = value < 0 ? '-' : '';
				var absValue = Math.abs(value);
				var r = 0;
				if (this._postfix == '#') {
					var n = 1000000000000;
					var p = ['T', 'B', 'M', 'K'];
					for (var i = 0; i < 4; i++) {
						var r = Math.round(absValue / n);
						if (r > 0) {
							r = sign + r + p[i];
							break;
						}
						n = n / 1000;
					}
				}
				if (r == 0) {
					var r = value.toFixed(2) + (this._postfix == '%' ? '%' : '');
				}
			} else {
				var r = null;
			}
			return r;
		},
		count: function (count) {
			if (count == undefined) {
				return this._count;
			} else {
				count = Math.abs(parseInt(count));
				count = isNaN(count) ? 100 : count;
				if (this._count != count) {
					this._count = count;
					this.create();
					this.raise('create', this);
				}
				return this;
			}
		},
		disabled: function (disabled) {
			if (disabled == undefined) {
				return this._disabled;
			} else {
				if (this._disabled != disabled) {
					this._disabled = disabled;
					if (!disabled) {
						this.dom.disabled.hide();
					} else {
						this.dom.disabled.show().css('width', this.dom.elm.outerWidth());
					}
				}
				return this;
			}
		},
		// TODO: установка позиции слайдера
		num: function (name, num) {
			if (num == undefined) {
				return this._pointers[name].num;
			} else {
			}
		},
		min: function () {
			return this._cols.length > 0 ? this._cols[0].start : null;
		},
		max: function () {
			return this._cols.length > 0
				? this._cols[this._cols.length - 1].end
				: null;
		},
		value: function (value) {
			if (value == undefined) {
				var value = {
					min: null,
					max: null,
				};
				var minNum = this._pointers.min.num || 0;
				var maxNum = this._pointers.max.num || this._cols.length - 1;
				if (minNum != null && maxNum != null) {
					if (this._cols[minNum] != undefined && minNum > 0) {
						value.min = this._cols[minNum].start;
					}
					if (
						this._cols[maxNum] != undefined &&
						maxNum < this._cols.length - 1
					) {
						value.max = this._cols[maxNum].end;
					}
				}
				return value;
			} else {
				value = value || {};
				var change = false;
				if (value.min == 'min' && this.value().min != this.min()) {
					this.dom.min.pointer.redraw('min', true);
					change = true;
				}
				if (value.max == 'max' && this.value().max != this.max()) {
					this.dom.max.pointer.redraw('max', true);
					change = true;
				}
				if (change) {
					this.raise('change', this.value());
				}
			}
		},
		load: function (params) {
			var deferred = $.Deferred();
			if (params) {
				params = params || {};
				params.count = this.count();
				params.mode = this._name;
				var hash = $.param(params);
				var url = (this._loadUrl = this._url + '&' + hash);
			} else {
				var url = this._loadUrl;
			}
			if (url) {
				this.preloader.show();
				this.value({
					min: 'min',
					max: 'max',
				});
				var self = this;
				// TODO: корявая передача урла источника данных
				$.ajax({
					url: url,
					dataType: 'JSON',
					cache: false,
					success: function (result) {
						if (result.slider.min != null && result.slider.max != null) {
							self.create(result.slider);
						} else {
							self.reset();
							self.disabled(true);
						}
						self.preloader.hide();
						deferred.resolve();
					},
					error: function (jqXHR, textStatus, errorThrown) {
						self.preloader.hide();
						deferred.reject();
						//console.log([jqXHR, textStatus, errorThrown]);
					},
				});
			}
			return deferred.promise();
		},
		reload: function () {
			this.load();
			return this;
		},
	};

	/*
	ZEvents = function(obj) {
	this._name = obj || 'ZEvents';
	this._observers = {};
	return this;
	}
	ZEvents.prototype = {
	raise: function (name, data) {
	console.log(this._obj + '.raise("' + name + '")');
	$.each(this._observers[name] || [], function(index, item) {
	item.observer.call(item.context, data);
	});
	return this;
	},
	bind: function (name, observer, context) {
	console.log(this._obj + '.bind("' + name + '")');
	var ctx = context || null;
	this._observers[name] = this._observers[name] || [];
	this._observers[name].push({ observer: observer, context: ctx });
	return this;
	},
	};

	ZItem = function(obj) {
	this._obj = obj || 'ZItem';
	$.extend(true, this, new Finam.Utils.Events(this._obj));
	return this;
	};
	ZItem.prototype = {
	value: function(value) {
	this.raise('change', value);
	return this;
	}
	};

	ZTabs = {
	init: function() {
	$.extend(true, this, new Finam.UI.Controls.Utils.ItemSelector($('#leaders-grid-tabs')));
	return this;
	}
	}
	*/

	Finam.UI.Features.CloudMessage = function (opts) {
		opts = opts || {};
		this.elm = null;
		this.opts = opts;
		this.text = opts.text || '';
		return this;
	};
	Finam.UI.Features.CloudMessage.prototype = {
		element: function () {
			if (this.elm == null) {
				if (this.opts.id == typeof 'undefined')
					this.opts.id = 'cloud-message-element';
				$('#' + this.opts.parent).append(
					'<div id="' +
						this.opts.id +
						'" class="cloud-message"><div>' +
						this.text +
						'</div></div>'
				);
				this.elm = $('#' + this.opts.id);
			}
			return this.elm;
		},
		addtext: function (txt) {
			this.text = txt;
		},
	};

	// Хелпер для JqueryUi tooltip
	// Показывает тултип на несколько секунд, а затем скрывает его
	Finam.UI.Tooltip = function (params) {
		if (!params.elem || !params.message) {
			return;
		}

		$(params.elem)
			.tooltip({
				items: $(params.elem).prop('tagName'),
				content: params.message,
			})
			.tooltip('open');

		setTimeout(function () {
			$(params.elem).tooltip('destroy');
		}, params.duration || 3000);
	};

	Finam.UI.Message = {
		_elm: null,
		_num: 0,
		_visible: false,
		show: function (text) {
			if (!this._elm) {
				this._elm = $(
					'<div id="f-message" class="f-message"><div class="f-message__inner"></div></div>'
				);
				$(document.body).append(this._elm);
			}
			var self = this;
			self._num++;
			var elm = this._elm;
			var msg = $('<div data-num="' + self._num + '">').html(text);
			$('#f-message .f-message__inner').append(msg);
			elm.show();
			var div = elm.find('DIV[data-num="' + self._num + '"]');
			setTimeout(function () {
				if ($('#f-message .f-message__inner DIV').length > 1) {
					div.animate(
						{
							height: 'hide',
							opacity: 'hide',
						},
						500,
						function () {
							self._num--;
							div.remove();
						}
					);
				} else {
					elm.animate(
						{
							height: 'hide',
							opacity: 'hide',
						},
						500,
						function () {
							self._num = 0;
							div.remove();
							self._visible = false;
						}
					);
				}
			}, 3000 + (self._num - 1) * 550);
		},
	};
})(Finam, jQuery);

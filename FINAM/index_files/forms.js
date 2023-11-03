/*
 * Вызов в других местах так
 * formInitial():
 */

var formInitial;
(function (Finam, $, window, document, undefined) {
	$(document).ready(function () {
		form_initialize();
	});

	function form_initialize() {
		var EMAIL_RE =
			/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i;
		var PHONE_RE = /([^0-9\+]+)/gi;
		var PHONE_MASK_RE = /([^0-9\+\#]+)/gi;

		// всё заново
		$('.f-forms-controls-control').each(function (_, control) {
			control = $(control);
			var error = control.children('.f-forms-error');
			control = control.bind({
				error: function (event, type, text, ololo) {
					if (!!type) {
						if (error.filter(':visible').length == 0) {
							error
								.filter('[name="' + type + '"]')
								.first()
								.show();
						}
					} else {
						error.hide();
					}
				},
				redraw: function (event) {},
			});
			if (control.hasClass('f-forms-controls-control_label_top')) {
				control.bind({
					'label:darken': function (event, label) {
						$(label).removeClass('f-forms-controls-label__mode_blur');
					},
					'label:lighten': function (event, label) {
						$(label).addClass('f-forms-controls-label__mode_blur');
					},
					'label:move': function (event, label, empty) {
						if (!!empty) {
							$(label).removeClass('f-forms-controls-label__mode_up');
							$(label).removeClass('f-forms-controls-label__mode_blur');
						} else {
							$(label).addClass('f-forms-controls-label__mode_up');
							$(label).removeClass('f-forms-controls-label__mode_blur');
						}
					},
				});
			}
		});

		// лабели наверху формы перемещаем в контрол
		$(
			'.f-forms-controls-control_label_top .f-forms-controls-textbox > INPUT, .f-forms-controls-control_label_top .f-forms-controls-textbox > TEXTAREA'
		).each(function (_, elm) {
			elm = $(elm);
			var control = elm.closest('.f-forms-controls-control');
			var label = control.find('.f-forms-controls-label').first();
			elm.on('empty', function (event) {
				return $(this).val() == '';
			});
			elm.on('focus', function (event, label) {
				control.trigger('label:lighten', label);
			});
			elm.on('blur', function (event, label) {
				control.trigger('label:darken', label);
			});
			elm.on('change hastext notext', function (event) {
				control.trigger('label:move', [label, $(elm).triggerHandler('empty')]);
			});
		});

		$('.f-forms-form .f-forms-controls-control .f-forms-controls-textbox').each(
			function (_, elm) {
				elm = $(elm);
				var control = $(elm).closest('.f-forms-controls-control');
				var label = control.find('.f-forms-controls-label').first();
				var input = $(elm)
					.find(
						'.f-forms-controls-textbox__input, .f-forms-controls-textbox__textarea'
					)
					.first();
				input.bind({
					focus: function (event) {
						elm.trigger('error', null);
					},
					blur: function (event) {
						elm.trigger('validate', $(this));
					},
				});
				elm.bind({
					validate: function (event, input) {
						input = $(input);
						if (!!input.attr('not-nullable')) {
							var text = null;
							var value = input.val();
							if (value == '') {
								control.triggerHandler('error', 'nullable');
							} else {
								if (!!input.data('regex')) {
									var regex = new RegExp(input.data('regex'), 'g');
									if (value.replace(regex, '').length > 0) {
										control.triggerHandler('error', 'invalid-text');
									}
								}
							}
						}
					},
				});
				if (input.attr('type') != 'password') {
					input.trigger('change', label);
				}
				control.bind({
					validate: function (event) {
						elm.triggerHandler('validate', input);
					},
				});
			}
		);

		$('.f-forms-form > .f-forms-controls-control .f-forms-controls-email').each(
			function (_, elm) {
				elm = $(elm);
				var control = $(elm).closest('.f-forms-controls-control');
				var input = $(this).find('.f-forms-controls-textbox__input');
				elm.bind({
					validate: function (event, input) {
						input = $(input);
						if (!!input.attr('not-nullable')) {
							var value = input.val();
							if (!EMAIL_RE.test(value.replace('+', ''))) {
								control.trigger('error', 'invalid');
							}
						}
					},
				});
			}
		);

		$('.f-forms-form > .f-forms-controls-control .f-forms-controls-date').each(
			function (_, elm) {
				elm = $(elm);
				var control = $(elm).closest('.f-forms-controls-control');
				var label = control.find('.f-forms-controls-label').first();
				var input = $(this).find('.f-forms-controls-textbox__input');
				input.inputmask('99.99.9999');
				input.bind({
					'change hastext notext': function (event) {
						elm.trigger('label', [label, $(this).triggerHandler('empty')]);
					},
					value: function (event) {
						var value = $(this).val().replace(/_/g, '').replace(/\./g, '');
						return value;
					},
					empty: function (event) {
						var value = $(this).triggerHandler('value');
						return value == '';
					},
				});
				elm.bind({
					validate: function (event, input) {
						input = $(input);
						if (input.triggerHandler('empty')) {
							control.triggerHandler('error', 'nullable');
						} else {
							var invalid = true;
							var value = input.val().split('.').map(Number);
							if (value.length == 3) {
								if (value[1] >= 1 && value[1] <= 12 && value[2] >= 1900) {
									var checkDay = new Date(value[2], value[1], 0).getDate();
									if (value[0] >= 1 && value[0] <= checkDay) {
										invalid = false;
									}
								}
							}
							if (invalid) {
								control.triggerHandler('error', 'invalid');
							}
						}
					},
				});
				input.trigger('change', label);
			}
		);

		var multiMaskOpts = {
			inputmask: {
				definitions: {
					'#': {
						validator: '[0-9]',
						cardinality: 1,
					},
				},
				//clearIncomplete: true,
				showMaskOnHover: false,
				autoUnmask: true,
			},
			match: /[0-9]/,
			replace: '#',
			list: multiMaskList,
			listKey: 'mask',
			onMaskChange: function (maskObj, determined) {
				$(this).data('mask', maskObj.mask);
			},
		};

		$('.f-forms-form > .f-forms-controls-control .f-forms-controls-phone').each(
			function (_, elm) {
				elm = $(elm);
				var control = $(elm).closest('.f-forms-controls-control');
				var label = control.find('.f-forms-controls-label').first();
				var labelText = label.find('SPAN');
				var input = $(elm).find('.f-forms-controls-textbox__input');
				var checked = elm.hasClass('i-smslocker__container');
				input.inputmasks(multiMaskOpts);
				input.bind({
					focus: function (event) {
						elm.trigger('error', null);
						elm.triggerHandler('label', [label, false]);
					},
					keyup: function (event) {
						elm.triggerHandler('label', [label, false]);
					},
					blur: function (event) {
						elm.triggerHandler('validate', $(this));
					},
					'change hastext notext': function (event) {
						if (checked && labelText.text() == 'Мобильный телефон') {
							if (input.outerWidth(true) <= 110) {
								labelText.text('Мобильный');
							} else {
								labelText.text('Мобильный телефон');
							}
						}
						elm.triggerHandler('label', [label, $(this).val() == '']);
					},
					value: function (event) {
						var value = $(this).val().replace(PHONE_RE, '');
						if (value.substr(0, 1) != '+') {
							value = '+' + value;
						}
						return value;
					},
					empty: function (event) {
						var value = $(this).triggerHandler('value');
						var empty = value.charAt(0) != '+' || value.length < 12;
						return empty;
					},
				});
				elm.bind({
					validate: function (event, input) {
						input = $(input);
						if (!!input.attr('not-nullable')) {
							var value = input.val();
							var value = input.triggerHandler('value');
							if (value.replace('+') == '') {
								control.triggerHandler('error', 'nullable');
							} else {
								var mask = input.data('mask').replace(PHONE_MASK_RE, '');
								if (value.length < mask.length) {
									control.triggerHandler('error', 'invalid');
								}
							}
						}
					},
					error: function (event, text) {
						control.triggerHandler('error', text);
					},
					label: function (event, label, empty) {
						control.triggerHandler('label:move', [label, empty]);
					},
				});
				if (input.val() == '') {
					input.val('7');
					input.data('mask', '+7(###)###-##-##');
				}
				input.trigger('change', label);
			}
		);

		$(
			'.f-forms-form > .f-forms-controls-control .f-forms-controls-select'
		).each(function (_, elm) {
			elm = $(elm);
			var control = $(elm).closest('.f-forms-controls-control');
			var label = control.find('.f-forms-controls-label').first();
			var select = $(elm).find('.f-forms-controls-select__select');
			select.bind({
				change: function (event) {
					elm.triggerHandler('redraw');
					elm.triggerHandler('validate');
				},
				empty: function (event) {
					var value = $(this).find('OPTION:selected').text();
					if (value != '') {
						value = $(this).val();
					}
					return value == '';
				},
			});
			elm.bind({
				redraw: function (event) {
					control.triggerHandler('label:move', [
						label,
						select.triggerHandler('empty'),
					]);
				},
				validate: function (event) {
					control.triggerHandler('error', null);
					if (select.triggerHandler('empty')) {
						control.triggerHandler('error', 'nullable');
					}
				},
			});
			select.trigger('redraw', label);
		});

		$('.f-forms-form > .f-forms-controls-control .f-forms-controls-town').each(
			function (_, elm) {
				elm = $(elm);
				var control = $(elm).closest('.f-forms-controls-control');
				var label = control.find('.f-forms-controls-label').first();
				var select = $(elm).find('.f-forms-controls-select__select');
				elm.bind({
					redraw: function (event) {
						var value = parseInt(select.val(), 10);
						var others = elm.find('.f-forms-controls-town__others');
						if (value == -1) {
							others.slideDown();
							others.find('.town-region INPUT').focus();
						} else {
							others.slideUp();
						}
						control.trigger('label:move', [label, value == 0]);
					},
				});
				select.triggerHandler('redraw', label);
			}
		);

		// KAY: checkbox - min & max selected

		// ловим автозаполнение паролей
		// если в форме есть пароль и текстбокс перед ним, то Хром через какое-то время пытается заполнить, а у паролья не срабатывает событие change
		var catched = false;
		$('.f-forms-form').each(function (_, frm) {
			frm = $(frm);
			var password = frm.find('INPUT[type="password"]');
			if (password.length === 1) {
				var control = password.closest('.f-forms-controls-control');
				var login = control.prev('.f-forms-controls-control').first();
				var input = login.find('INPUT');
				var last = input.val();
				var fill = function () {
					if (last != input.val() && input.val() != '') {
						var label = control.find('.f-forms-controls-label').first();
						control.trigger('label:move', [label, false]);
						if (!catched) {
							setTimeout(fill, 300);
							catched = true;
						}
					}
				};
				setTimeout(fill, 300);
			}
		});

		/*
	 скрыто по задаче IP-12808, потому что двойной обработчи вешается
	if (!!Finam.ReCaptcha && Finam.ReCaptcha.enabled()) {
		$('.f-forms-form BUTTON').bind({
			click: function () {
				var button = $(this);
				var form = button.closest('FORM');
				Finam.ReCaptcha.getToken(
					function (token) {
						if (!!token) {
							form.find('INPUT[name="token"]').val(token);
						}
						form.submit();
					}
				);
				return false;
			}
		});
	}
	*/

		$(
			'.f-forms-form > .f-forms-controls-control > .f-forms-controls-confidential INPUT[type="checkbox"], .f-forms-form > .f-forms-controls-control > .f-forms-controls-subscribe INPUT[type="checkbox"]'
		).bind({
			change: function (event) {
				$(this).triggerHandler('validate');
			},
			validate: function (event) {
				var elm = $(this);
				var control = $(elm).closest('.f-forms-controls-control');
				control.triggerHandler('error', null);
				if (!elm.prop('checked')) {
					control.triggerHandler('error', 'nullable');
				}
			},
		});
	}

	formInitial = form_initialize;
})(Finam, jQuery, window, document);

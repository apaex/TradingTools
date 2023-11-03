(function (Finam, $, window, document, undefined) {
	namespace('Finam.UI.Controls');

	Finam.UI.Controls.SMSLocker = {
		_errors: {
			bad_phone_number: 'Отправка СМС на ваш номер не поддерживается.',
			sms_locker_send_error: 'Ошибка в сервисе отправки СМС.',
			invalid_phone: 'Неверный номер телефона<br />Пример: +79161234567.',
			invalid_guid: 'Ошибка при созданиии формы.',
			request_error: 'Сервис отправки СМС недоступен.',
			undefined: 'Ошибка при отправке смски.',
			wait: 'Повторная отправка будет доступна позднее.',
			'invalid-score': 'СМС не может быть отправлено.',
		},
		_inited: false,
		init: function () {
			var self = this;
			if (!self._inited) {
				self._reCapcha = Finam.ReCaptcha || {
					enabled: function () {
						return false;
					},
				};
				$(document).on('click', '.i-smslocker__send', function (event) {
					var frm = $(this).closest('FORM');
					var mode = frm.find('.i-smslocker__mode').val() === '1';
					self.sendSMS(frm, '', mode);
					event.preventDefault();
					return false;
				});

				$(document).on('change', '.i-smslocker__phone', function (event) {
					$(this)
						.closest('FORM')
						.find('.i-smslocker__send, .i-smslocker__send-custom')
						.prop('disabled', false);
				});
			}
			self._inited = true;
			return this;
		},
		sendSessionCaptcha: function (frm, id, params) {
			this.sendSMS(frm, id, params);
		},
		sendSMS: function (frm, id, params) {
			var self = this;
			Finam.ReCaptcha.getToken(function (token) {
				return self.sendSmsCode(frm, id, token, params);
			}, 'smslocker');
			return this;
		},
		sendSmsCode: function (frm, id, token, params) {
			var self = this;
			var phone = this.check(frm);
			if (phone != null) {
				var guid = frm.find('.i-smslocker__guid').val();
				var url = '/api/smslocker/sendcode';
				var vkParams = '';
				var data = {
					guid: guid,
					phone: phone,
					session: id,
					token: token,
				};
				if (params.isVk && Finam.Utils) {
					for (var x in Finam.Utils.URL._parsed) {
						if (x.indexOf('vk_') === 0 || x === 'sign') {
							vkParams += x + '=' + Finam.Utils.URL._parsed[x] + '&';
						}
					}
					data.vkParams = vkParams;
				}
				var container = frm;
				if (!self._preloader) {
					self._preloader = new Finam.UI.Controls.Utils.Preloader(container);
				}
				self._preloader.show(container);
				$.ajax({
					url: url,
					dataType: 'json',
					method: 'POST',
					data: data,
					success: function (response) {
						response = response || {};
						var error = null;
						var data = response.data;
						var status = !!response.status;
						if (!!data) {
							if (!!status) {
								if (!!data.result) {
									document.getElementsByClassName(
										'i-smslocker__send'
									)[0].style.opacity = 0.4;
									frm
										.find('.i-smslocker__send, .i-smslocker__send-custom')
										.prop('disabled', true);
									setTimeout(function () {
										document.getElementsByClassName(
											'i-smslocker__send'
										)[0].style.opacity = 1;
										frm
											.find('.i-smslocker__send, .i-smslocker__send-custom')
											.prop('disabled', false);
									}, 500);
									var code = frm.find('.i-smslocker__code');
									code.prop('disabled', false);
									code.removeClass('disabled');
									code.focus();
									var guid = data.guid;
									if (!!guid) {
										frm.find('.i-smslocker__guid').val(guid);
									}
									Finam.UI.Tooltip({
										elem: $(frm).find('.i-smslocker__phone:visible')[0],
										message: 'SMS код успешно отправлен на номер ' + phone,
									});
								} else {
									error = data.resultText;
								}
							} else {
								error = data.error ? data.error.msg : response.error.msg;
							}
						} else {
							error = 'undefined';
						}
						if (!!error) {
							Finam.UI.Tooltip({
								elem: $(frm).find('.i-smslocker__phone:visible')[0],
								message: self.getError(error),
							});
						}
						self._preloader.hide();
					},
					error: function (jqXHR, textStatus, errorThrown) {
						Finam.UI.Tooltip({
							elem: $(frm).find('.i-smslocker__phone:visible')[0],
							message: self.getError('request_error'),
						});
						self._preloader.hide();
					},
				});
			} else {
				return false;
			}
		},
		getPhoneInput: function (frm) {
			var input;
			if ($(frm).find('.i-smslocker__phone INPUT:visible').length === 0) {
				input = $(frm).find('INPUT.i-smslocker__phone:visible');
			} else {
				if ($(frm).find('.i-smslocker__phone INPUT:visible').length !== 0) {
					input = $(frm).find('.i-smslocker__phone INPUT:visible');
				}
			}
			if (input.length === 0) {
				input = $(frm).find('INPUT.i-smslocker__phone');
			}
			return input;
		},
		getPhone: function (frm) {
			if ($(frm).length === 0) {
				return null;
			}
			var flag = true;
			var digits = '0123456789';
			var input = this.getPhoneInput(frm);
			var phone = input.val();
			if (phone.length === 11 && phone.charAt(0) === '8') {
				phone = '+7' + phone.substring(1, phone.length);
			}
			if (phone.charAt(0) !== '+') {
				phone = '+' + phone;
			}
			phone = phone.replace(/[\s|\(|\)|\-]/gi, '');
			phone = phone.replace(/^0+/gi, '');
			if (phone.charAt(0) === '+') {
				for (var i = 1; i <= phone.length; i++) {
					if (digits.indexOf(phone.charAt(i)) < 0) {
						flag = false;
						break;
					}
				}
			} else {
				flag = false;
			}
			if (phone.length < 12 || phone.length > 23) {
				flag = false;
			}
			return flag ? phone : null;
		},
		check: function (frm) {
			var phone = this.getPhone(frm);
			var input = this.getPhoneInput(frm);
			input.val(phone);
			if (!phone) {
				Finam.UI.Tooltip({
					elem: $(frm).find('.i-smslocker__phone:visible')[0],
					message: this.getError('invalid_phone'),
				});
				frm.find('.i-smslocker__phone:visible').focus();
			}
			return phone;
		},
		getError: function (code) {
			return !!this._errors[code] ? this._errors[code] : 'Неизвестная ошибка';
		},
	};

	Finam.UI.Controls.SMSLocker.init();
})(Finam, jQuery, window, document, undefined);

if (!Finam) {
	var Finam = {};
}

Finam.User = {
	ANON_PASS: '',
	OPEN_ALERT: false,
	SHOW_REG_SUCCESS_INFO: false,
	SERVICE_URL: '/service.asp',
	USE_EXTERNAL_REGISTRATION: false,
	AUTH_RESULT: {
		Ok: 0,
		UserNotFound: 1,
		EmailExists: 2,
		Autentificated: 3,
		NewUser: 4,
		NotActivated: 5,
		Error: 6,
		AlreadyAutentificated: 7,
	},
	init: function (info) {
		this._init(info);
		if (window.finam_user_init) {
			window.dispatchEvent(window.finam_user_init);
		}
	},
	_init: function (info) {
		var self = this;
		this._inited = false;
		this._addContactsEnabled = true;
		this._info = {
			id: null,
			name: null,
			pass: null,
			email: null,
			monitor: null,
			client: null,
			fio: null,
			phone: null,
			mobile: null,
			lastLoginState: null,
			edoxGlobalId: null,
			agent: null,
		};
		var d = (this.dom = {});
		this.info(info);
		$.extend(true, this, new Finam.Utils.Events());
		$(document).ready(function () {
			d.informer = {};
			d.informer.elm = $('.f-user-informer');
			d.informer.name = $('.f-user-informer__profile').addClass('js');
			// TODO: отдельное информер и ссылки
			d.register = $('.i-user-register').addClass('js');
			$(document.body).on('click', '.i-user-register', function () {
				self.showRegister();
				return false;
			});
			d.restore = $('.i-user-restore')
				.addClass('js')
				.bind('click', function () {
					self.showRestore();
					return false;
				});
			d.login = $('.i-user-login').addClass('js');
			$(document.body).on('click', '.i-user-login', function () {
				var backUrl = Finam.Utils.Query.one('backUrl');
				if (!backUrl && $(this).attr('user-backurl') == 'on') {
					backUrl = $(this).attr('href');
				}
				self.setBackUrl(backUrl);
				self._showLogin();
				return false;
			});
			d.logout = $('.i-user-logout')
				.addClass('js')
				.bind('click', function () {
					return self.logout();
				});
			$(document.body).on('click', '.i-user-logout', function () {
				return self.logout();
			});
			$(document.body).on('click', '.i-user-edox', function () {
				Finam.SocialRegistrator.openRegTyped('edoxEntURL', 1);
				return false;
			});
			d.addPhone = $('.i-user-phone-add')
				.addClass('js')
				.bind('click', function () {
					return self.addPhone();
				});
			// menu
			d.menu = {};
			d.menu.main = $('#user-menu-main');
			d.menu.dropdown = $('#user-menu-dropdown');
			if (!self.info().portfolio) {
				$('.user_old_portfolio_enabled').remove();
			}
			// dialogs
			var width = !!window.Mobi ? 286 : 375;
			self.dialog = new Finam.UI.Dialogs.Modal({
				id: 'user-dialog',
				title: 'Пользователь',
				width: width,
			}).add({
				name: 'addEmail',
				title: 'Запрос e-mail',
				visible: false,
				create: function () {
					var page = this;
					this.elm().append(
						$(
							'' +
								'<p>Для продолжения укажите вашу эл.почту</p>' +
								'<form>' +
								'<div class="finam-ui-controls-textbox"><div class="finam-ui-controls-textbox-inner"><input id="user-dialog-add-email" name="email" type="text" /></div></div>' +
								'</form>' +
								''
						)
					);
					this.form = this.elm()
						.find('FORM')
						.bind('submit', function () {
							if ($('#user-dialog-register-back-url').val() == '') {
								Finam.Utils.URL.init();
								$('#user-dialog-register-back-url').val(
									Finam.Utils.URL.value()
								);
							}

							page.dialog().request({
								url: '/net/auth/edoxregistration',
								data:
									page.form.serialize() + '&backUrl=' + Finam.Utils.URL.value(),
								success: function (result) {
									if (!result.ok) {
										switch (result.error) {
											case 'user-exists':
												page.message(
													'error',
													'Пользователь с таким емейлом уже зарегистрирован!<br/>Воспользуйтесь службой <a href="/home/profile/restore/" style="text-decoration: underline !important; ">восстановления пароля</a>.'
												);
												break;
											case 'user-not-found':
												page.message(
													'error',
													'Пользователь ЛК Финам не найден.'
												);
												break;
											case 'error':
												page.message(
													'error',
													'Возникла ошибка, попробуйте продолжить позднее.'
												);
												break;
											case 'not-activated':
												page.message(
													'error',
													"Пользователь ЛК Финам с таким емейлом зарегистрирован, но не активирован. Активируйте аккаунт, перейдя по ссылке в отправленном вам при регистрации письме.<br/><a href='/home/profile/contact/'>Выслать письмо повторно</a>."
												);
												break;
										}
									} else {
										if (result.data == 'new-user-notified') {
											page.dialog().close();
											self.showMessage(
												'Завершение регистрации',
												'Вы успешно зарегистрировались. Инструкции по активации высланы на указанную почту.'
											);
											setTimeout(function () {
												window.location.reload();
											}, 3000);
										}
									}
									page.dialog().close();
								},
								error: function (result, textStatus, jqXHR) {},
							});
							return false;
						});
				},
				buttons: {
					ok: {
						title: 'Отправить',
						width: 145,
						click: function (event) {
							this.form.submit();
						},
					},
				},
				open: function () {
					this.clear();
					$('#user-dialog-add-email').focus();
				},
				globalId: 0,
			});
			self.dialog.bind('close:auth', function () {
				self.raise('close:login');
			});

			self.dialogAddPhone = new Finam.UI.Dialogs.Modal({
				id: 'user-dialog-phone',
				title: 'Номер телефона',
				width: 370,
			}).add({
				name: 'add',
				title: 'Запрос телефона',
				visible: false,
				create: function () {
					var page = this;
					this.elm().append(
						$(
							'' +
								'<p>Для продолжения укажите ваш телефон</p>' +
								'<form><input type="hidden" id="user-dialog-phone-add-guid" name="phone-guid" class="i-smslocker__guid" />' +
								'<label id="user-dialog-phone-add-phone-label" class="finam-ui-controls-label">Телефон<sup>*</sup></label>' +
								'<div class="finam-ui-controls-textbox"><div class="finam-ui-controls-textbox-inner"><input id="user-dialog-phone-add-phone" name="phone" type="text" size="20" maxlength="20" class="i-smslocker__phone" value="" /></div></div>' +
								'<button id="user-dialog-phone-add-send" class="ibutton i-smslocker__send">Получить код</button>' +
								'<label id="user-dialog-phone-add-code-label" class="finam-ui-controls-label">Проверочный код<sup>*</sup></label>' +
								'<div class="finam-ui-controls-textbox"><div class="finam-ui-controls-textbox-inner"><input id="user-dialog-phone-add-code" name="phone-code" type="text" size="8" maxlength="8" class="i-smslocker__code" value="" /></div></div>' +
								'</form>' +
								''
						)
					);
					$('#user-dialog-phone-add-phone')
						.val('7')
						.inputmasks({
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
						});
					var showError = function (type) {
						switch (type) {
							case 'invalid-phone':
								page.message('error', 'Неправильно введён номер телефона.');
								break;
							case 'invalid-code':
								page.message('error', 'Введён некорректный код проверки.');
								break;
							case 'internal-error':
								page.message('error', 'Произошла внутренняя ошибка сервера.');
								break;
							case 'no-auth':
								page.message(
									'error',
									'Вы неавторизованы. Сохранение телефона невозможно.'
								);
								page.dialog().close('fade');
								break;
						}
					};
					this.form = this.elm()
						.find('FORM')
						.bind('submit', function () {
							page.dialog().request({
								url:
									Finam.User.getServiceAuthUrl() +
									'?name=user&action=add-phone&mode=check',
								data: page.form.serialize(),
								success: function (result) {
									if (!!result.ok) {
										page.message('success', 'Телефон сохранён.');
										$('#user-dialog-phone-add-buttons .dialog-ok').hide();
										$('#user-dialog-phone-add-buttons .dialog-button').show();
										self._info.mobile = $('#user-dialog-phone-add-phone').val();
										setTimeout(function () {
											page.dialog().unbind('close:phone-add');
											page.dialog().close('fade');
											self.raise('phone-add');
										}, 3000);
									} else {
										showError(result.error);
									}
								},
								error: function (result, textStatus, jqXHR) {
									showError('internal-error');
								},
							});
							return false;
						});
				},
				buttons: {
					ok: {
						title: 'Отправить',
						width: 145,
						click: function (event) {
							this.form.submit();
						},
					},
					button: {
						title: 'Закрыть',
						visible: false,
						width: 145,
						click: function (event) {
							this.close();
							this.dialog().unbind('close:phone-add');
							self.raise('phone-add');
						},
					},
				},
				open: function () {
					var page = this;
					page.dialog().request({
						url:
							Finam.User.getServiceAuthUrl() +
							'?name=user&action=add-phone&mode=create',
						type: 'GET',
						success: function (result) {
							if (!!result.ok) {
								$('#user-dialog-phone-add-guid').val(result.data);
							} else {
								page.showError(result.error);
							}
						},
						error: function (result, textStatus, jqXHR) {
							page.showError('internal-error');
						},
					});
					$('#user-dialog-phone-add-buttons .dialog-ok').show();
					$('#user-dialog-phone-add-buttons .dialog-button').hide();
				},
			});

			self.dialogAddPhone.bind('close', function () {
				self.raise('close:phone-add');
			});

			self.dialogVerifyEmail = new Finam.UI.Dialogs.Modal({
				id: 'user-dialog-email',
				title: 'Подтверждение емейла',
				width: 370,
			}).add({
				name: 'verify',
				title: 'Подтверждение емейла',
				visible: false,
				create: function () {
					var page = this;
					this.elm().append(
						$(
							'' +
								'<p>Для продолжения отправьте письмо с подтверждением на ваш новый емейл.</p>' +
								'<form>' +
								'<label id="user-dialog-email-verify-email-label" class="finam-ui-controls-label"><span>Новый емейл</span><sup>*</sup></label>' +
								'<div class="finam-ui-controls-textbox"><div class="finam-ui-controls-textbox-inner"><input id="user-dialog-email-verify-email" name="email" type="text" size="20" maxlength="50" value="" readonly=""readonly""/></div></div>' +
								'</form>' +
								''
						)
					);
					this.form = this.elm()
						.find('FORM')
						.bind('submit', function () {
							page.dialog().request({
								url:
									Finam.User.getServiceAuthUrl() +
									'?name=user&action=verify-email&mode=send',
								data: page.form.serialize(),
								success: function (result) {
									if (!!result.ok) {
										page.message(
											'success',
											'На указанный емейл было отправлено письмо с инструкцией по подтверждени.'
										);
									} else {
										page.message('error', result.error);
									}
								},
								error: function (result, textStatus, jqXHR) {
									page.message('error', 'Произошла внутренняя ошибка сервера.');
								},
							});
							return false;
						});
				},
				buttons: {
					ok: {
						title: 'Отправить',
						width: 145,
						click: function (event) {
							this.form.submit();
						},
					},
					button: {
						title: 'Закрыть',
						visible: false,
						width: 145,
						click: function (event) {
							this.close();
							this.dialog().unbind('close:email-verify');
							self.raise('email-verify');
						},
					},
				},
				open: function () {
					var page = this;
					$('#user-dialog-email-verify-email').val(self.info().tempEmail);
				},
			});

			self.dialogVerifyEmail.bind('close', function () {
				self.raise('close:email-verify');
			});

			// добавим новый и последний диалог ввода контактов
			self.dialogAddContacts = new Finam.UI.Dialogs.Modal({
				id: 'user-dialog-contacts',
				title: 'Контакты',
				width: 370,
			}).add({
				name: 'add',
				title: 'Контакты',
				visible: false,
				create: function () {
					var page = this;
					this.elm().append(
						$(
							'' +
								'<p>Для продолжения заполните ваши контакты:</p>' +
								'<form><input type="hidden" id="user-dialog-contacts-guid" name="phone-guid" class="i-smslocker__guid" />' +
								'<div id="user-dialog-contacts-email-block">' +
								'<label id="user-dialog-contacts-email-label" class="finam-ui-controls-label" style="color: #999; width: 120px; height: 24px; line-height: 24px; float: left; clear: left; margin-bottom: 5px;">Емейл<sup>*</sup></label>' +
								'<input id="user-dialog-contacts-email" name="email" type="text" size="50" maxlength="50" value="" style="width: 235px; margin-bottom: 5px;" />' +
								'</div>' +
								'<div id="user-dialog-contacts-phone-block">' +
								'<label id="user-dialog-contacts-phone-label" class="finam-ui-controls-label" style="color: #999; width: 120px; height: 24px; line-height: 24px; float: left; clear: left; margin-bottom: 5px;">Телефон<sup>*</sup></label>' +
								'<input id="user-dialog-contacts-phone" name="phone" type="text" size="20" maxlength="20" class="i-smslocker__phone" value="" style="width: 120px; margin-right: 5px; margin-bottom: 5px; " />' +
								'<button id="user-dialog-contacts-send" class="i-smslocker__send" style="box-sizing: border-box;  width: 110px; padding: 0 !important; margin-top: 5px; ">Получить код</button>' +
								'<div id="user-dialog-contacts-phone-code-and-label">' +
								'<label id="user-dialog-contacts-code-label" class="finam-ui-controls-label" style="color: #999; width: 120px; height: 24px; line-height: 24px; float: left; clear: left; margin-bottom: 5px;">Проверка<sup>*</sup></label>' +
								'<input id="user-dialog-contacts-code" name="phone-code" type="text" size="8" maxlength="8" class="i-smslocker__code" value="" style="margin-top: 5px; " />' +
								'</div>' +
								'</div>' +
								'</form>' +
								''
						)
					);
					$('#user-dialog-contacts-phone')
						.val('7')
						.inputmasks({
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
						});
					var showError = (page.showError = function (type) {
						switch (type) {
							case 'invalid-email':
								page.message('error', 'Неправильно введён емейл.');
								break;
							case 'email-exists':
								page.message('error', 'Такой емейл уже существует.');
								break;
							case 'invalid-phone':
								page.message('error', 'Неправильно введён номер телефона.');
								break;
							case 'empty-code':
								page.message('error', 'Не введён код проверки.');
								break;
							case 'invalid-code':
								page.message('error', 'Введён некорректный код проверки.');
								break;
							case 'internal-error':
								page.message('error', 'Произошла внутренняя ошибка сервера.');
								break;
							case 'no-auth':
								page.message(
									'error',
									'Вы неавторизованы. Сохранение телефона невозможно.'
								);
								page.dialog().close('fade');
								break;
						}
					});
					this.form = this.elm()
						.find('FORM')
						.bind('submit', function () {
							var data = page.form.serialize();
							var path = document.location.pathname;
							if (
								path.indexOf('/home/profile/') === -1 &&
								path.indexOf('/home/login/') === -1
							) {
								data += '&backUrl=' + document.location;
							}
							page.dialog().request({
								url:
									self.getServiceUrl() +
									'?name=user&action=add-contacts&mode=save',
								data: data,
								success: function (result) {
									if (!!result && !!result.ok) {
										page.message(
											'success',
											result.message || 'Контакты сохранёны.'
										);
										$('#user-dialog-contacts-buttons .dialog-ok').hide();
										$('#user-dialog-contacts-buttons .dialog-button').show();
										self._info.mobile = $('#user-dialog-contacts-phone').val();
										$.cookie('ContactsSuccessfullyAdded', true);
										setTimeout(function () {
											page.dialog().unbind('close:contacts-add');
											page.dialog().close('fade');
											self.raise('contacts-add');
										}, 3000);
									} else {
										page.showError(result.error);
									}
								},
								error: function (result, textStatus, jqXHR) {
									page.showError('internal-error');
								},
							});
							return false;
						});
				},
				buttons: {
					ok: {
						title: 'Отправить',
						width: 145,
						click: function (event) {
							this.form.submit();
						},
					},
					button: {
						title: 'Закрыть',
						visible: false,
						width: 145,
						click: function (event) {
							this.close();
							this.dialog().unbind('close:contacts-add');
							self.raise('contacts-add');
						},
					},
				},
				open: function () {
					var page = this;
					var email = self.info().email;
					var temp = self.info().tempEmail;
					if (!!email || !!temp) {
						$('#user-dialog-contacts-email-block').hide();
					} else {
						$('#user-dialog-contacts-email-block').show();
					}
					var phone = self.info().mobile;
					if (!!phone) {
						$('#user-dialog-contacts-phone-block').hide();
					} else {
						$('#user-dialog-contacts-phone-block').show();
					}
					if (!phone) {
						page.dialog().request({
							url:
								self.getServiceUrl() +
								'?name=user&action=add-contacts&mode=create',
							type: 'GET',
							success: function (result) {
								if (!!result.ok) {
									$('#user-dialog-contacts-guid').val(result.data);
								} else {
									page.showError(result.error);
								}
							},
							error: function (result, textStatus, jqXHR) {
								page.showError('internal-error');
							},
						});
					}
					$('#user-dialog-contacts-buttons .dialog-ok').show();
					$('#user-dialog-contacts-buttons .dialog-button').hide();
				},
			});

			self.dialogAddContacts.bind('close', function () {
				self.raise('close:contacts-add');
			});

			// Отправление мессаг в ифрейм
			Finam.Utils.Messenger.bind('user:login', function (data) {
				self.dialog.hidePreloader();
				var page = self.dialog.page('auth');
				if (!!data.ok) {
					self.login(data.info);
					self.authGoals();
					page.clear();
					page.dialog().close();
				} else {
					page.message('error', data.error);
				}
			});
			self.dialog.bind('close', function () {
				self.raise('close');
			});
			self.bind('login', function (info) {
				self.gotoBackUrl(true);
			});
			// внешняя регистрация
			if (!!Finam.User.USE_EXTERNAL_REGISTRATION) {
				var extBackUrl =
					'?backUrl=' + new String(document.location.href).escape();
				$(
					'#user-dialog LI[page="register"], #user-dialog-auth-register-link'
				).unbind('click');
				$(
					'#user-dialog LI[page="register"], #user-dialog-auth-register-link'
				).click(function (event) {
					window.location =
						'https://www.finam.ru/home/profile/register' + extBackUrl;
					//console.log(extBackUrl);
				});
				$('#user-dialog-auth-restore-link A').unbind('click');
				$('#user-dialog-auth-restore-link A').click(function (event) {
					window.location =
						'https://www.finam.ru/home/forgotpass/' + extBackUrl;
					return false;
				});
			}
			if (!!$.cookie('ScrollTop')) {
				window.scrollTo(0, parseInt($.cookie('ScrollTop')) || 0);
				$.cookie('ScrollTop', null);
			}
			/* разборки с внешними регистрациями туда-сюда */
			var backUrl = Finam.Utils.Query.one('backUrl');
			var mode = Finam.Utils.Query.one('mode') || '';
			if (!!backUrl) {
				self.setBackUrl(backUrl);
			}
			if (Finam.Utils.Query.one('action') == 'register') {
				if (!!self.info().id && !!backUrl) {
					window.location = backUrl;
				} else {
					if (!!mode) {
						Finam.SocialRegistrator.openRegTyped(mode, 1);
					} else {
						self.showRegister();
					}
				}
			}
			if (Finam.Utils.Query.one('action') == 'login') {
				if (mode != '') {
					if (!!self.info().id && !!backUrl) {
						window.location = backUrl;
					} else {
						Finam.SocialRegistrator.openRegTyped(mode, 1);
					}
				} else {
					self._showLogin();
				}
			}
			if (Finam.Utils.Query.one('action') == 'restore') {
				self.showRestore();
			}
			// ошибка при логине через Фейсбук (перенесено из бэка)
			var fbError = Finam.Utils.Query.one('fberror');
			if (!!fbError) {
				self.dialog
					.open('auth')
					.page()
					.message('error', 'Такого пользователя не существует!');
			}
			self._inited = true;
		});
		return this;
	},
	getLoginPrefix: function () {
		return !!Finam.User.USE_EXTERNAL_REGISTRATION ? 'https://www.finam.ru' : '';
	},
	getServiceAuthUrl: function () {
		return Finam.User.getLoginPrefix() + Finam.User.SERVICE_URL;
	},
	fillProfile: function () {
		var self = this;
		if (!self.info().mobile) {
			self.dialogAddPhone.unbind('close');
			self.showAddPhone();
		} else {
			if (!self.info().email) {
				self.showAddEmail();
			} else {
				if (!!self.info().tempEmail) {
					self.showVerifyEmail();
				}
			}
		}
		return this;
	},
	authGoals: function () {
		ym(10279138, 'reachGoal', 'avtoriz');
		_gaq.push(['_trackEvent', 'konvert', 'event', 'avtorizaciya']);
	},
	regGoals: function (requestResult) {
		if (typeof yaCounter10279138 !== 'undefined') {
			yaCounter10279138.reachGoal('reg');
		}
		if (typeof _gaq !== 'undefined') {
			_gaq.push(['_trackEvent', 'konvert', 'event', 'registracija']);
		}
		if (requestResult && requestResult.data && requestResult.data.demoFormID) {
			ga('send', {
				hitType: 'event',
				eventCategory: 'konvert',
				eventAction: 'event',
				eventLabel: requestResult.data.demoFormID,
			});
			ym(10279138, 'reachGoal', 'custom_parameter', {
				demoFormId: requestResult.data.demoFormID,
			});
		}
	},
	showMessage: function (title, text, opts) {
		var self = this;
		if (!self.message) {
			self.message = new Finam.UI.Dialogs.Modal({
				id: 'user-dialog-message',
				title: title,
				width: 300,
				modal: true,
			}).add({
				create: function () {
					var page = this;
					page.elm().html('');
					page.redraw();
				},
				open: function () {
					var page = this;
				},
			});
			self.message.bind('close', function () {
				self.raise('close:message');
			});
		}
		opts = opts || {};
		self.message.open({
			title: title,
			text: '<div style="padding: 10px; ">' + text + '</div>',
			wait: opts.wait || 5,
			closing: opts.closing || 'fade',
		});
		return this;
	},
	showAlerts: function (isExample) {
		var self = this;
		var defUrl =
			document.location.pathname.indexOf('default.asp') != -1 ||
			document.location.pathname.substr(-1, 1) == '/';
		if (self.alerts == null || self.alerts == 'undefined') {
			self.alerts = new Finam.UI.Dialogs.Modal({
				id: 'user-dialog-alerts',
				title: 'Последние обновления',
				width: 450,
				modal: false,
				location: {
					top: '80%',
					bottom: 20,
					left: '80%',
					right: 10,
				},
			}).add({
				create: function () {
					var page = this;
					page.dialog().request({
						url: '/SUAlert.asp?mode=body',
						type: 'GET',
						dataType: 'html',
						success: function (result, textStatus, jqXHR) {
							var header = jqXHR.getResponseHeader('SUAlert');
							if (header == 'exists') {
								page.elm().html(result);
								page.redraw();
								self.alerts.open();
							}
						},
					});
				},
				open: function () {
					var page = this;
				},
				buttons: {
					ok: {
						title: 'Закрыть',
						width: 100,
						click: function () {
							this.close();
						},
					},
					html: {
						text: '<div id="modal-specific-icons"><a href="/home/subscribe/" title= "Настройки"><i class="fa fa-cog fa-2x spec-color-gray"></i></a>&nbsp;&nbsp;<a href="/analysis/newsfile001BE/" title= "Подробнее"><i class="fa fa-info-circle fa-2x spec-color-gray"></i></a>&nbsp;&nbsp;<a href="/home/profile/?removensal=1" title="Отключить алерты"><i class="fa fa-trash-o fa-2x spec-color-gray"></i></a></div>',
					},
				},
			});
		}
		if (self.info().id && (self.info().monitor > 0 || !!isExample) && defUrl) {
			if (isExample == 1) {
				self.alerts.load({ url: '/SUAlert.asp?mode=body&isExample=1' });
			} else {
				self.alerts.open();
			}
		}
		return this;
	},
	_showLogin: function () {
		this.showGlobalLogin();
		return this;
	},
	showLogin: function () {
		return this._showLogin();
	},
	hideLogin: function () {
		return this;
	},
	getEdoxScripts: function () {
		var scripts = [];
		var urlPrefix = Finam.User.getLoginPrefix();

		if (!window.React || !window.ReactDOM) {
			scripts.push(urlPrefix + '/js/oop/react.bundle.js');
			scripts.push(urlPrefix + '/frontend/dist/commons.bundle.js');
		}

		if (!window.Page || !window.Page.authWidget) {
			scripts.push(urlPrefix + '/frontend/dist/authWidget.bundle.js');
		}

		return scripts;
	},
	showGlobalLogin: function () {
		const host = location.host;
		const redirectHosts = [
			'www.finambank.ru',
			'forum.finam.ru',
			'www.fdu.ru',
			'bonds.finam.ru',
			'dist.finam.ru',
		];

		if (
			redirectHosts.includes(host) ||
			(	typeof Finam !== 'undefined' &&
				typeof Finam.IS_CLASSIC_FINAM !== 'undefined' &&
				Finam.IS_CLASSIC_FINAM === true
			)
		) {
			window.location.href =
				'https://www.finam.ru/home/profile?backUrl=' + location.href;
			return;
		}

		if (typeof FinamAuth === 'undefined') {
			Finam.loadMultipleScripts(['/js/classic/finam/finam.auth.js'], () => {
				FinamAuth.showWidget();
			});
		} else {
			FinamAuth.showWidget();
		}
	},
	edoxLogout: function () {
		this.logout();
	},
	_showRegister: function () {
		this.showGlobalLogin();
		return this;
	},
	showRegister: function () {
		return this._showRegister();
	},
	hideRegister: function () {
		return this;
	},
	showRestore: function (name) {
		this.showGlobalLogin();
		return this;
	},
	showAddEmail: function (token) {
		this.dialog.select('addEmail').open();
		this.raise('open', this);
		this.raise('open:email-add', this);
		return this;
	},
	showAddPhone: function (token) {
		this.dialogAddPhone.open();
		this.raise('open', this);
		this.raise('open:phone-add', this);
		return this;
	},
	showVerifyEmail: function (opts) {
		this.dialogVerifyEmail.open(opts);
		this.raise('open', this);
		this.raise('open:email-verify', this);
		return this;
	},
	login: function (info) {
		this.info(info);
		$('#user-informer-name').html(info.name);
		this.raise('login', this.info());
		if (this.countEvents('login') == 0) {
			// TODO: использовать евенты для бацкУрла
			if (!!this.backUrl) {
				document.location.href = this.backUrl;
			} else {
				window.location.reload();
			}
		}
		return this;
	},
	register: function (info) {
		this.raise('register', info);
		return this;
	},
	logout: function () {
		if (typeof FinamAuth === 'undefined') {
			Finam.loadMultipleScripts(['/js/classic/finam/finam.auth.js'], () => {
				FinamAuth.logout();
			});
		} else {
			FinamAuth.logout();
		}
	},
	getClient: function () {
		var url =
			Finam.User.getServiceAuthUrl() +
			'?name=user&action=getClient&r=' +
			Math.random();
		$.ajax({
			url: url,
			dataType: 'html',
			success: function (json) {
				if (!!Finam.Utils.Query.one('backUrl')) {
					window.location = Finam.Utils.Query.one('backUrl');
				} else {
					window.location.reload();
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log([jqXHR, textStatus, errorThrown]);
			},
		});
	},
	info: function (info) {
		return this.__info(info);
	},
	__info: function (info) {
		if (typeof info == 'undefined') {
			return this._info;
		} else {
			info = info || {};
			this._info.id = parseInt(info.id) || null;
			this._info.name = info.name || null;
			(this._info.pass = info.pass || null),
				(this._info.email = info.email || null);
			this._info.monitor = parseInt(info.monitor) || null;
			this._info.client = info.client || null;
			this._info.fio = info.fio || null;
			this._info.phone = info.phone || null;
			this._info.mobile = info.mobile || null;
			this._info.company = info.company || null;
			this._info.position = info.position || null;
			this._info.lastaccess = info.lastaccess || null;
			this._info.edoxGlobalId = info.edoxGlobalId || null;
			this._info.agent = info.agent || null;
			this._info.portfolio = info.portfolio;
			this._info.full = info.full;
			this._info.tempEmail = info.tempEmail;
			this.redraw();
		}
	},
	redraw: function () {
		if (this._inited) {
			var info = this.info();
			if (info.id != null) {
				this.dom.informer.name.html(info.name);
				$(document.body)
					.addClass('i-user_logged_yes')
					.removeClass('i-user_logged_no');
				if (info.client) {
					$(document.body)
						.addClass('i-user_client_yes')
						.removeClass('i-user_client_no');
				} else {
					$(document.body)
						.addClass('i-user_client_no')
						.removeClass('i-user_client_yes');
				}
			} else {
				$(document.body)
					.addClass('i-user_logged_no')
					.removeClass('i-user_logged_yes');
			}
			if (this.dom.menu.main.length == 1) {
				if (info.id != null) {
					$('#user-menu-main-logged DIV:first').html(info.name);
					this.dom.menu.main.prop('className', 'logged');
					if (info.client) {
						$('#user-menu-main-client').hide();
					} else {
						$('#user-menu-main-client').show();
					}
				} else {
					this.dom.menu.main.prop('className', 'not-logged');
				}
			}
			if (this.dom.menu.dropdown.length == 1) {
				if (info.id != null) {
					$('#user-menu-dropdown H2').html(info.name);
					this.dom.menu.dropdown.prop('className', 'logged');
					if (info.client) {
						$('#sub1a P:first').hide();
					} else {
						$('#sub1a P:first').show();
					}
				} else {
					$('#user-menu-dropdown H2').html('Персональное');
					this.dom.menu.dropdown.prop('className', 'not-logged');
				}
			}
			$('#user-dialog-register-continue-popup').hide();
		}
		return this;
	},
	title: function (title) {
		this.dialog.title(title);
		return this;
	},
	setBackUrl: function (backUrl) {
		backUrl = !!backUrl ? backUrl : '';
		this.backUrl = backUrl;
		$('#user-dialog-register-back-url').val(backUrl);
		return this;
	},
	gotoBackUrl: function (reload) {
		var backUrl = Finam.Utils.Query.one('backUrl');
		if (!!backUrl) {
			window.location = backUrl;
		} else {
			if (!!reload) {
				window.location.reload();
			}
		}
	},
	getServiceUrl: function () {
		return Finam.User.getLoginPrefix() + '/service.asp';
	},
	setContactsEnabled: function (value) {
		this._addContactsEnabled = !!value;
		return this;
	},
	apiLogin: function (login, password, success, error) {
		$.ajax({
			url: Finam.User.getLoginPrefix() + '/api/user/login',
			type: 'POST',
			dataType: 'application/json',
			data: { login: login, password: password },
			success: function (data) {
				if (typeof success == 'function') success(data);
			},
			error: function (err) {
				if (typeof error == 'function') error(err);
			},
		});
	},
	_logoutThroughApi: function () {
		this.logout();
	},
	logoutThroughApi: function () {
		this._logoutThroughApi();
	},
};

Finam.SocialRegistrator = {
	fbAuthURL: '/service.asp?name=socialreg&network=fb',
	fbRegURL: '/service.asp?name=socialreg&network=fb&mode=1',
	fbEntURL: '/service.asp?name=socialreg&network=fb&mode=2',
	vkAuthURL: '/service.asp?name=socialreg&network=vk&mode=4',
	vkEntURL: '/service.asp?name=socialreg&network=vk&mode=5',
	edoxEntURL: '/passport/edox/auth',
	googleAuthURL: '',
	okAuthURL: '',
	regWindow: null,
	action: null,
	Init: function (a) {
		this.action = a.action;
	},
	openReg: function (regUrl) {
		if (!!Finam.User.USE_EXTERNAL_REGISTRATION) {
			window.location =
				'https://www.finam.ru/?action=login&mode=' +
				regUrl +
				'&backUrl=' +
				new String(document.location.href).escape();
		} else {
			var height = regUrl === 'vkAuthURL' ? 350 : 450;
			var windowFeatures =
				'width=800,height=' +
				height +
				',toolbar=0,location=0,scrollbars=no,status=no,menubar=0';
			this.closeReg();
			this.regWindow = window.open(
				this.getSocialUrl(regUrl),
				'SoacialReg',
				windowFeatures
			);
			if (this.regWindow) {
				this.regWindow.focus();
			} else {
				alert(
					'Необходимо отключить блокировку всплывающих окон в вашем браузере.'
				);
			}
		}
	},
	getSocialUrl: function (name) {
		var url = Finam.SocialRegistrator[name];
		return url;
	},
	openRegTyped: function (regUrl, isform, action) {
		var fbBackUrl = new String(document.location.href).escape();
		$.cookie('fbBackUrl', fbBackUrl, {
			expires: 1,
			path: '/',
			domain: 'finam.ru',
		});
		if (!!Finam.User.USE_EXTERNAL_REGISTRATION) {
			window.location =
				'https://www.finam.ru/?action=login&mode=' +
				regUrl +
				'&backUrl=' +
				fbBackUrl;
		} else {
			window.location = this.getSocialUrl(regUrl) + '&backUrl=' + fbBackUrl;
		}
	},
	closeReg: function () {
		if (this.regWindow) {
			this.regWindow.close();
			this.regWindow = null;
		}
	},
	continueNotify: function () {
		$('#socialreg_continue').html(
			'&nbsp;Для завершения регистрации, заполните недостающие поля анкеты'
		);
		$('#user-dialog-register-social-links-ajax-form-left').show();
	},
	loginAsk: function () {
		Finam.User.dialog.request({
			url:
				Finam.User.getServiceAuthUrl() +
				'?name=user&action=login&mode=handle&rnd=' +
				Math.random(),
			success: function (result, textStatus, jqXHR) {
				var mode = jqXHR.getResponseHeader('FinamAuth');
				switch (mode) {
					case 'ok':
						Finam.User.login(result.info);
						$('#user-informer-name').html(result.info.name);
						Finam.User.dialog.pages[0].clear();
						Finam.User.dialog.pages[0].close();
						break;
					case 'error':
						Finam.User.page.message('error', result.error);
						break;
				}
			},
			error: function (result, textStatus, jqXHR) {},
		});
	},
	go: function (action) {
		this.closeReg();
		if (action) {
			if (!isNaN(action)) {
				if (this.action) {
					this.action(action);
				}
				return;
			}
		}
	},
	setSocField: function (field, value) {
		$('[socfield=' + field + ']').attr('value', value);
	},
	setSocFieldId: function (field, value) {
		$('#' + field).attr('value', value);
	},
};

var vkUID;
var vkToken;

function initFB(user) {
	Finam.SocialRegistrator.setSocField('birthday', user.birthday);
	Finam.SocialRegistrator.setSocField('first_name', user.first_name);
	Finam.SocialRegistrator.setSocField('firstname', user.first_name);
	Finam.SocialRegistrator.setSocField('last_name', user.last_name);
	Finam.SocialRegistrator.setSocField('email', user.email);
	//Finam.SocialRegistrator.setSocField("network", "fb");
	//Finam.SocialRegistrator.setSocField("network-id", user.id);
	Finam.SocialRegistrator.continueNotify();
}

function initVK(user) {
	vkToken = user.access_token;
	vkUID = user.user_id;
	var script = document.createElement('SCRIPT');
	script.src =
		'https://api.vk.com/method/users.get?uid=' +
		vkUID +
		'&access_token=' +
		vkToken +
		'&callback=getProfile&fields=contacts,uid,first_name,last_name,nickname,screen_name,sex,bdate, city, country, timezone, photo, photo_medium, photo_big, has_mobile, rate, contacts, education, online, counters, mobile_phone';
	document.getElementsByTagName('head')[0].appendChild(script);
}

function getit(response) {
	if (response.session) {
		var id = response.session.mid;
	}
	VK.Api.call('users.get', { uids: id, fields: 'sex,photo_big' }, function (r) {
		if (r.response) {
			console.log(r.response);
		}
	});
}

function getProfile(result) {
	if (!result.error) {
		Finam.SocialRegistrator.setSocField(
			'first_name',
			result.response[0].first_name
		);
		Finam.SocialRegistrator.setSocField(
			'firstname',
			result.response[0].first_name
		);
		Finam.SocialRegistrator.setSocField(
			'last_name',
			result.response[0].last_name
		);
		Finam.SocialRegistrator.setSocField(
			'phone',
			result.response[0].mobile_phone
		);
		Finam.SocialRegistrator.setSocField('network', 'vk');
		Finam.SocialRegistrator.setSocField('network-id', result.response[0].uid);
		Finam.SocialRegistrator.continueNotify();
		$('#user-dialog-register-continue-popup').show('slow');
	}
}

document.addEventListener('click', e => {
	const href = e.target.getAttribute('href');

	if (/home\/Login00002\/$/.test(href)) {
		e.preventDefault();
		e.stopPropagation();
		if (typeof FinamAuth === 'undefined') {
			Finam.loadMultipleScripts(['/js/classic/finam/finam.auth.js'], () => {
				FinamAuth.logout();
			});
		} else {
			FinamAuth.logout();
		}
	}
});

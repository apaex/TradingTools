(function (Finam, $) {
	namespace('Finam.Form');

	var USER_DATA_KEY = 'user-data';

	Finam.Form.Utils = {
		moveTo: function (formId, targetId) {
			var frm = $('#' + formId);
			if (frm.length == 1) {
				var target = $('#' + targetId);
				if (target.length == 0) {
					var search = $(targetId);
					if (search.length >= 1) {
						target = $(search[0]);
					}
				}
				if (target.length == 1) {
					var clone = frm.show().clone(true, true);
					frm.remove();
					target.append(clone);
				}
			}
		},

		pasteUserData: function (data) {
			for (var fieldName in data) {
				var value = data[fieldName];
				var el = document.querySelector('.step2 [name=' + fieldName + ']');
				if (el && (el.value === '' || el.value === '+7 (___)-___-__-__')) {
					el.value = value;
					if (fieldName === 'phone') {
						$(el).mask('+7 (999)-999-99-99');
					}
				}
			}
		},

		getUserData: function () {
			var data = {
				phone: '',
				email: '',
				lastname: '',
				firstname: '',
				middlename: '',
			};

			for (var fieldName in data) {
				var el = document.querySelector('.step2 [name=' + fieldName + ']');
				if (el) {
					data[fieldName] = el.value;
				}
			}

			return data;
		},

		getUserDataFromStorage: function () {
			var storage = window && window.localStorage;
			if (storage) {
				try {
					var strData = storage.getItem(USER_DATA_KEY);
					if (strData) {
						return JSON.parse(strData);
					}
				} catch (e) {}
			}

			return {};
		},

		updateUserDataInStorage: function (data) {
			var storage = window && window.localStorage;
			if (storage) {
				var storageData = Finam.Form.Utils.getUserDataFromStorage();
				storage.setItem(
					USER_DATA_KEY,
					JSON.stringify(jQuery.extend({}, storageData, data))
				);
			}
		},
	};

	$(document).ready(function () {
		$.each(
			$('FORM.finam-form_error_enabled, DIV.form-success-text'),
			function (index, frm) {
				frm = $(frm);
				frm.parents(':hidden').show();
			}
		);
		$.cookie('ClientTimezoneOffset', -new Date().getTimezoneOffset(), {
			path: '/',
			expires: 365,
		});
	});
})(Finam, jQuery);

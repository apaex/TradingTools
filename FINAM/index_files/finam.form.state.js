(function (Finam, $) {
	if (!Finam) { var Finam = {}; }

	if (!Finam.Form) { Finam.Form = {} };

	Finam.Form.State = {
		_state: {},
		init: function() {
			var self = this;
			self._storage = new Finam.Utils.Storage('FormStates');
			$.each($('FORM.i-form-state'), function(index, frm) {
				frm = $(frm);
				self._state[frm.attr('name')] = {};
				frm.bind({
					'state:load': function(event) {
						var json = $.parseJSON(self._storage.getItem(frm.attr('name')) || '') || {};
						$.each($(this).find('.i-form-state-item'), function(idx, item) {
							var value = json[$(item).attr('name')];
							$(item).trigger('state:set', value, false);
						});
						frm.trigger('state:save');
						frm.triggerHandler('state:ready');
					},
					'state:save': function(event) {
						var state = self._state[$(this).attr('name')] || {};
						var json = JSON.stringify(state);
						self._storage.setItem(frm.attr('name'), json);
					}
				});
				$.each(frm.find('.i-form-state-item'), function(idx, item) {
					$(item).bind({
						'change': function() {
							if (!!$(this).data('state:enabled')) {
								var value = $(this).triggerHandler('state:get');
								 $(this).trigger('state:set', value, true);
							}
						},
						'state:get': function(event) {
							if ($(this).attr('type') == 'checkbox') {
								var val = $(this).val();
								var value = {};
								value[val] = $(this).prop('checked') ? 'on' : 'off';
							} else {
								var value = $(this).val();
							}
							return value;
						},
						'state:set': function(event, value, save) {
							if (!value) {
								value = $(this).triggerHandler('state:get');
							}
							var frm = $(this).closest('FORM');
							$(this).data('state:enabled', false);
							if ($(this).attr('type') == 'checkbox') {
								var val = $(this).val();
								$(this).prop('checked', (value[val] == 'on' ? true : false));
							} else if ($(this).attr('type') == 'radio') {
								frm.find('INPUT[type="radio"][name="' + $(this).attr('name') + '"]').prop('checked', false);
								frm.find('INPUT[type="radio"][name="' + $(this).attr('name') + '"][value="' + value + '"]').first().prop('checked', true);
							} else {
								$(this).val(value);
								$(this).triggerHandler('change');
							}
							$(this).data('state:enabled', true);
							$(this).trigger('state:save', value, save);
						},
						'state:save': function(event, value, save) {
							var frm = $(this).closest('FORM');
							var state = self._state[frm.attr('name')];
							if ($(this).attr('type') == 'checkbox') {
								var val = $(this).val();
								value[val] = $(this).prop('checked') ? 'on' : 'off';
								state[$(this).attr('name')] = $.extend(state[$(this).attr('name')] || {}, value)
							} else {
								state[$(this).attr('name')] = value;
							}
							self._state[frm.attr('name')] = state;
							if (!!save) {
								frm.trigger('state:save');
							}
						}
					});
				});
				frm.trigger('state:load');
			});
			return this;
		}
	};

	$(document).ready(function() {
		Finam.Form.State.init();
	});

})(Finam, jQuery);

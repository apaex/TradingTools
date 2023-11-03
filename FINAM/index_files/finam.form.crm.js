(function (Finam, $, window, document, undefined) {
	if (!Finam) {
		var Finam = {};
	}
	if (!Finam.Form) {
		Finam.Form = {};
	}

	Finam.Form.CRM = {
		_forms: {},
		init: function () {
			var self = this;
			// background sending
			$.each($('FORM[data-backsending="yes"]'), function (index, frm) {
				frm = $(frm);
				var values = self._forms[frm.attr('name')] || {};
				var elms = frm.find('INPUT[name="email"], INPUT[name="phone"]');
				$.each(elms, function (idx, elm) {
					values[$(elm).attr('name')] = ''; //$(elm).val();
				});
				elms.bind({
					blur: function () {
						var elm = $(this);
						if (elm.val() != values[elm.attr('name')]) {
							var params = frm.serialize() + '&backsending=yes';
							Finam.Utils.Request.send({
								type: 'POST',
								data: params,
								url: frm.attr('action'),
								success: function (result) {
									values[elm.attr('name')] = elm.val();
									frm
										.find('INPUT[name="demo-form-id"]')
										.val(result.demoFormId || '');
								},
							});
						}
					},
				});
			});
			return this;
		},
	};

	$(document).ready(function () {
		Finam.Form.CRM.init();
	});
})(Finam, jQuery, window, document, undefined);

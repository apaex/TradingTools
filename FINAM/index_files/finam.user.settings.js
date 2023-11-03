(function (Finam, $, window, document, undefined) {

	namespace('Finam.User.Settings');

	Finam.User.Settings = function(opts) {
		var self = this;
		$.ajaxSetup({ cache: false });
		opts = opts || {};
		this.type = function() {
			return opts.type || 0;
		};
		this.version = function() {
			return opts.version || 1;
		};
		this.externalId = function() {
			return opts.externalId || 0;
		};
		this.load = function() {
			return $.ajax({
				url: '/api/user/settings/load',
				type: 'GET',
				data: {
					type: self.type(),
					v: self.version(),
					id: self.externalId()
				},
				success: function(result) {
				},
				error: function() {
				}
			});
		};
		this.save = function(value) {
			return $.ajax({
				url: '/api/user/settings/save',
				type: 'POST',
				data: {
					typeId: self.type(),
					version: self.version(),
					externalId: self.externalId(),
					value: value
				},
				success: function(result) {
				},
				error: function() {
				}
			});
		}
		this.del = function() {
			return $.ajax({
				url: '/api/user/settings/delete',
				type: 'POST',
				data: {
					typeId: self.type(),
					version: self.version(),
					externalId: self.externalId(),
				},
				success: function(result) {
				},
				error: function() {
				}
			});
		}
	}

})(Finam, jQuery, window, document);

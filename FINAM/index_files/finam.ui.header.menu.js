(function (Finam, $, window, document, undefined) {

	namespace('Finam.UI.Header');

	var prefix = "menu-highlighting__";
	var classForActiveLink = prefix + "active-link";
	var classForActiveSection = prefix + "active-section";

	Finam.UI.Header.Menu = {
		_items: [
				{
					id: '#menu_about_market',
					title: 'Про рынок',
					links: ['/analysis', '/discussions', '/international/advanced', '/investments/sectors', '/investor/calcrisk', '/analysis/indexes', '/news/headline', '/profile', '/international/newsitem', '/international/imdaily']
				},
				{
					id: '#menu_asset_management',
					title: 'Управление активами',
					links: ['/international/trustmanaging', '/investor/iis', '/services/FullService', '/services/hedging', '/services/indexing', '/services/options', '/services/trustmanaging']
				},
				{
					id: '#menu_education',
					title: 'Обучение',
					links: ['/education/main', '/education/seminars', '/howtotrade/demos', '/investor/lecturers', '/investor/library', '/investor/offero', '/investor/skype', '/webinars']
				},
				{
					id: '#menu_about_company',
					title: 'О компании',
					links: ['/about', '/home/contacts']
				},
				{
					id: '#menu_brokerage_services',
					title: 'Брокерские услуги',
					links: ['/education/managementConsulting', '/howtotrade/jtrade00001', '/howtotrade/quik', '/howtotrade/special', '/howtotrade/tconnector', '/howtotrade/transaq', '/howtotrade/tslab', '/howtotrade/welcome', '/investor/iis', '/services/CommissionRates', '/services/FullService', '/services/OpenAccount0000A', '/services/corpfin', '/services/deposit', '/services/hedging', '/services/insuredshares']
				}
		],
		init: function() {
			var self = this;
			var url = document.location.pathname;
			for (var index1 = 0; index1 < self._items.length; index1++) {
				var item = self._items[index1];
				for (var index2 = 0; index2 < item.links.length; index2++) {
					var link = item.links[index2];
					if (url.indexOf(link) == 0) {
						$(item.id).addClass('menu-highlighting__active-section');
						index1 = self._items.length;
						break;
					}
				}
			}
			return this;
		},
		highlightTop: function(id) {
			$(id).addClass('menu-highlighting__active-section');
			return this;
		},
		highlight: function(path) {
			var pathToSelect;
			if (path) {
					pathToSelect = path;
			} else {
					pathToSelect = window.location.pathname;
			}
			if (pathToSelect !== '/') {
				var activeSubMenuLink = $('a[href*="' + pathToSelect + '"]');
				activeSubMenuLink.addClass(classForActiveLink);
				var topMenuId = activeSubMenuLink.parents('.fui-header__main-menu-popup').attr('id');
				if (topMenuId) {
					var menuPointer = activeSubMenuLink.parents('.fui-header__main-menu-popup').attr('id').replace('_menu', '');
					var activeSectionLink = $('#' + menuPointer);
					activeSectionLink.addClass(classForActiveSection);
				}
			}
			return this;
		},
		highlightForPath: function(path) {
			$('.' + classForActiveLink).removeClass(classForActiveLink);
			$('.' + classForActiveSection).removeClass(classForActiveSection);
			return this.highlight(path);
		}
	}

	$(document).ready(function() {
		Finam.UI.Header.Menu.init().highlight();
	});

})(Finam, jQuery, window, document, undefined);


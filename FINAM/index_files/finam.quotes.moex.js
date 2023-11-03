(function (Finam, $, window, document, undefined) {

	namespace('Finam.Quotes');

	Finam.Quotes.Moex = {
		init: function() {
			$(document).ready(function(){	
				try{
					$(".tooltip").easyTooltip();
				}
				catch(err){
				}
			});
			// делаем единое место для показа/скрытия копирайта на всём сайте
			// пример пользования: 
			// $('#moex-copyright').triggerHandler('set-market', 1);
			$('#moex-copyright').bind('set-market', function(event, market, quote) {
				market = parseInt(market, 10);
				quote = parseInt(quote, 10);
				// все мосбиржи
				moex = [1, 2, 12, 14, 16, 29, 45, 200, 512, 513, 514, 515];
				var copyright = ($.inArray(market, moex) != -1);
				if (!copyright && market == 41 && !!quote) {
					// курс рубля, кроме цб и бивалютной
					var roubles = [182402, 182406, 182441, 182398, 182397, 182456, 182400];
					copyright = ($.inArray(quote, roubles) != -1);
				}
				if (copyright) {
					$('#moex-copyright').show();
				} else {
					$('#moex-copyright').hide();
				}
			});
		}
	}

	Finam.Quotes.Moex.init();

})(Finam, jQuery, window, document, undefined);

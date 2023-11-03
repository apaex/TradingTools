var menu = new Array;

function s_m(sys, img, id, name, url, callback) {
	this.sys=sys;
	this.img=img;
	this.id=id;
	this.name=name;
	this.url=url;
	this.callback=callback;
}

var curBlockMenu;
var blockMenuEventActive = false;

function showMenu(event, menuNum) {
	if (!isLeftButtonEvent(event)) return;
	$z('cell' + menuNum).className = 'hide';
	if (curBlockMenu) {
		var oldNum = curBlockMenu.menuNum;
		hideMenu();
		if (oldNum == menuNum) return;
	}
	var s = '<div class="set_menu" onClick="hideMenu()">';
	var menu_div = document.getElementById("set_menu"+menuNum);
	menu_div.menuNum = menuNum;
	for (var i = 0, l = menu.length; i < l; i++) {
		if (menu[i].url != '') {
			if (menu[i].name == '') {
				s += "<div class=set_line></div>";
			} else {
				if (menu[i].sys == 1) {
					s += "<p class=pb05><a href='"+menu[i].url+"' class=set_link onClick='hideMenu()'><img src=/i/N/"+(menu[i].img !=''?menu[i].img:"no_checked")+".gif width=7 height=7 class=checked>"+menu[i].name+"&nbsp;&nbsp;</a></p>";
				} else {
					s += "<p class=pb05><a href=# class=set_link onClick=\"hideMenu(); cells["+menuNum+"]="+menu[i].id+"; saveMenu(); load_elem('cell"+menuNum+"', '"+menu[i].url+"', '"+menu[i].callback+"'); return false;\"><img src=/i/N/"+( cells[menuNum] == menu[i].id ? "" : "no_") +"checked.gif width=7 height=7 class=checked>"+menu[i].name+"&nbsp;&nbsp;</a></p>";
				}
			}
		}
	}
	s += '</div>';
	menu_div.innerHTML = s;
	curBlockMenu = menu_div;
	if (!blockMenuEventActive) {
		setupEvent(document, 'mousedown', blockMenu_mouseDownEvent);
		setupEvent(document, 'keydown', blockMenu_keyDownEvent);
		blockMenuEventActive = true;
	}
	cancelEvent(event);
}

function blockMenu_mouseDownEvent(event) {
	if (curBlockMenu && isLeftButtonEvent(event)) {
		var el = event.target || event.srcElement;
		while (el && el != curBlockMenu) el = el.parentNode;
		if (!el) hideMenu();
	}
}

function blockMenu_keyDownEvent(event) {
	if (curBlockMenu && event.keyCode == 27) hideMenu();
}

function hideMenu() {
	if (curBlockMenu) {
		var menuNum = curBlockMenu.getAttribute('menuNum');
		if (menuNum == null) {
			menuNum = curBlockMenu.menuNum;
		}
		if (menuNum) {
			$z('cell' + menuNum).className = '';
		}
		curBlockMenu.innerHTML = '<span style="position: absolute">&nbsp;</span>';
		curBlockMenu = null;
	}
//	for(i=0; i<=cell_count; i++){
//		if(document.getElementById("set_menu"+i).style.visibility != 'hidden'){
//			document.getElementById("plus_minus"+i).src='/i/N/plus.gif';
//			document.getElementById("set_menu"+i).style.visibility = 'hidden';
//		}
//	}
}


function saveMenu(){
	var st = cells.join(hpcellsParser);
	if (st == defCells) {
		deleteCookie(cnfcname);
	} else {
		setRPCookie(cnfcname, cells.join(hpcellsParser));
	}
}

var hpcellsParser = new String("X");


/* Charts & Currency */

var aLinks = ['hpi_usdrub', 'hpi_sb', 'hpi_spfu', 'hpi_mice', 'hpi_rtsf', 'hpi_brnt'];
var aCharts = ['HPCN-17NW.gif', 'HPCN-14NW.gif', 'HPCN-8NW.gif', 'HPCN-5NW.gif', 'HPCN-9NW.gif', 'HPCN-18NW.gif'];
var aChartIds = [182400, 3, 108, 13851, 17455, 19473];
var aChartCodes = ['/profile/mosbirzha-valyutnyj-rynok/usdrubtom-usd-rub/?market=41', '/analysis/profile/moex-akcii/sberbank/', '/profile/fyuchersy-usa/sandp-fut/', '/profile/mirovye-indeksy/micex', '/profile/mosbirzha-fyuchersy/rts/', 'profile/tovary/brent/'];
var aChartNum = 3;

function initCharts(cell) {
	cell = $z(cell);
	var num = parseInt(getCookieValue('chartg' + cell.id));
	if (isNaN(num) || num < 0 || num >= aLinks.length) {
		num = aChartNum;
	}
	var cur = parseInt(getCookieValue('cur' + cell.id));
	if (isNaN(cur) || cur < 1 || cur > 3) {
		cur = 1;
	}
	redrawCharts(cell, num);
	redrawCurrency(cell, cur);
}

function redrawCharts(cell, num) {
	var span = cell.getElementsByTagName('li');
	var cur = null;
	for (var i = 0; i < span.length; i++) {
		if ((span[i].getAttribute('name') || '') != '') {
			if (span[i].getAttribute('name') == aLinks[num]) {
				cur = span[i];
			}
			span[i].className = 'l';
		}
	}
	if (cur != null) {
		cur.className = 'active';
	}
	//анонсирование
	//cell.getElementsByTagName('A')[0].href = '/analysis/charts/?id=' + aChartIds[num];
	var chartUrlId = "";
	var chartUrlId = aChartCodes[num]
	cell.getElementsByTagName('A')[0].href = '' + chartUrlId + '';
	cell.getElementsByTagName('IMG')[0].src = 'http://charts.finam.ru/gi/' + aCharts[num];
	setCookieValue('chartg' + cell.id, num);
}

function switchCharts(switcher, num) {
	var cell = switcher;
	while (cell != null) {
		cell = cell.parentNode;
		if (cell.id.indexOf('cell') != -1) {
			redrawCharts(cell, num);
			break;
		}
	}
}

function switchCurrency(switcher, show) {
	var cell = switcher;
	while (cell != null) {
		cell = cell.parentNode;
		if (cell.id.indexOf('cell') != -1) {
			redrawCurrency(cell, show);
			break;
		}
	}
}

function redrawCurrency(cell, show) {
	var span = cell.getElementsByTagName('TABLE')[0].getElementsByTagName('li');
	for (var i = 1; i <= 3; i++) {
		$(cell).find('#currencyswitch' + i).addClass('l');
		$(cell).find('#currencyswitch' + i).removeClass('active');
		$(cell).find('#currency' + i).hide();
	}
	$(cell).find('#currencyswitch'+show).addClass('active');
	$(cell).find('#currencyswitch' + show).removeClass('l');
	$(cell).find('#currency' + show).show();
	setCookieValue('cur' + cell.id, show);
}


function hp_toggle_informers(num) {
	$('.hp_informer_' + 1).hide();
	$('.hp_informer_' + 2).hide();
	$('.hp_informer_' + 3).hide();
	
	for (var i = 1; i <= 3; i++) {
		$('.hp_informer_' + i).hide();
		$('#hp_informers_selector_' + i).removeClass('hp_informers_active');
		$('#currency' + i).hide();
	}
	$('.hp_informer_' + num).show();
	$('#hp_informers_selector_' + num).addClass('hp_informers_active');
	if (num == 1) { $('#currency_selector').show(); $('#currency1').show(); }  //switchCurrency($("#currencyswitch1"), 1);
	else { $('#currency_selector').hide();  }
}
/* ADR */

function initRUBUSD(cell) {
	cell = $z(cell);
	var show = parseInt(getCookieValue('ck' + cell.id));
	if (isNaN(show) || show < 1 || show > 2) {
		show = 1;
	}
	redrawRUBUSD(cell, show);
}

function switchRUBUSD(switcher, show) {
	var cell = switcher;
	while (cell != null) {
		cell = cell.parentNode;
		if (cell.id.indexOf('cell') != -1) {
			redrawRUBUSD(cell, show);
			break;
		}
	}
}

function redrawRUBUSD(cell, show) {
    var indexes = cell.getElementsByTagName('TABLE')[0];
    var ul = cell.getElementsByTagName('UL')[0];
    if (ul != "undefined" && ul!=null) {
        var span = ul.getElementsByTagName('LI');
        span[show - 1].className = 'active';
        span[2 - show].className = '';
        var td = indexes.getElementsByTagName('TD');
        var type = (show == 1 ? 'rub' : 'usd');
        for (var i = 0; i < td.length; i++) {
            if (td[i].className == 'rub' || td[i].className == 'usd') {
                if (td[i].className != type) {
                    td[i].style.display = 'none';
                } else {
                    td[i].style.display = '';
                }
            }
        }
    }
    setCookieValue('ck' + cell.id, show);
}

function switchRUBUSD2(id, ftable, fswitch){
	var indexes = document.getElementById(ftable);
	if (id == 1) {
		indexes.className = 'zebra rub';
	} else {
		indexes.className = 'zebra usd';
	}
	document.getElementById(fswitch + id).className = 'active';
	document.getElementById(fswitch + (3 - id)).className = '';
	setCookieValue('ck' + ftable, id);
}


/* Leaders */

function initHPLeaders(cell) {
	cell = $z(cell);
	redrawHPLeaders(cell, 'rus'); //getCookieValue('hpleaders-' + cell.id));
}

function initHPLeadersWidget() {
	$(document).ready(function() {
		$.each($('.f-gainersloosers-widget'), function(index, cell) {
			console.log(cell);
			redrawHPLeaders(cell, 'rus');
		});
	});
}

function switchHPLeaders(switcher, show) {
	var cell = $(switcher);
	cell = cell.closest('.f-gainersloosers-widget');
	redrawHPLeaders(cell[0], show);
}

function redrawHPLeaders(cell, show) {
	if (show != 'rus' && show != 'eur') {
		show = 'rus';
	}
	var hide = (show == 'rus' ? 'eur' : 'rus');
	var tbody = cell.getElementsByTagName('TBODY');
	for (var i = 0; i < tbody.length; i++) {
		if (tbody[i].className == 'home-page-leaders-table-rus') {
			var tbodyRus = tbody[i];
		} else if (tbody[i].className == 'home-page-leaders-table-eur') {
			var tbodyEur = tbody[i];
		}
	}
	var span = cell.getElementsByTagName('*');
	for (var i = 0; i < span.length; i++) {
		if (span[i].className.indexOf('home-page-leaders-switcher-rus') != -1) {
			var switcherRus = span[i];
		} else if (span[i].className.indexOf('home-page-leaders-switcher-eur') != -1) {
			var switcherEur = span[i];
		} else if (span[i].className.indexOf('home-page-leaders-date-rus') != -1) {
			var dateRus = span[i];
		} else if (span[i].className.indexOf('home-page-leaders-date-eur') != -1) {
			var dateEur = span[i];
		}
	}
	if (show == 'eur') {
		var width = tbodyRus.getElementsByTagName('TD')[0].offsetWidth;
		width = Math.ceil((width - 1) / 2) * 2 - 2;
		var titles = tbodyEur.getElementsByTagName('DIV');
		for (var i = 0; i < titles.length; i++) {
			if (titles[i].className == 'title') {
				titles[i].style.width = width + 'px';
			}
		}
	}
	cell.getElementsByTagName('TABLE')[0].className = 'zebra ' + show;
	if (show == 'rus') {
		tbodyRus.style.display = '';
		tbodyEur.style.display = 'none';
		switcherRus.className = 'home-page-leaders-switcher-rus active';
		switcherEur.className = 'home-page-leaders-switcher-eur';
		switcherRus.getElementsByTagName('SPAN')[0].className = '';
		switcherEur.getElementsByTagName('SPAN')[0].className = '';
		dateRus.style.display = '';
		dateRus.style.visibility = 'visible';
		if (dateEur != null) {
			if (dateEur) dateEur.style.display = 'none';
			if (dateEur) dateEur.style.visibility = 'hidden';
		}
	}
	if (show == 'eur') {
		tbodyRus.style.display = 'none';
		tbodyEur.style.display = '';
		switcherRus.className = 'home-page-leaders-switcher-rus';
		switcherEur.className = 'home-page-leaders-switcher-eur active';
		switcherEur.getElementsByTagName('SPAN')[0].className = '';
		switcherRus.getElementsByTagName('SPAN')[0].className = '';
		dateRus.style.display = 'none';
		dateRus.style.visibility = 'hidden';
		if (dateEur != null) {
			if (dateEur) dateEur.style.display = '';
			if (dateEur) dateEur.style.visibility = 'visible';
		}
	}
	setCookieValue('hpleaders-' + cell.id, show);
}

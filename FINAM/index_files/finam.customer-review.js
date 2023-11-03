if (!Finam) { var Finam = {}; }

Finam.CustomerReview = {
	_opened: {
		box: null,
		btn: null
	},
	replyForm: function(btn, id) {
		var self = this;
		var box = $('#reply' + id);
		var ta = box.find('TEXTAREA');
		if (ta.length == 0) {
			var frm = $('#comment_form').html();
			box.html(frm);
			ta = box.find('TEXTAREA');
			var time = $('#time' + id);
			var user = $('#user' + id);
			if (time.length == 1) {
				time = time.html().split(' ');
				time = time[time.length - 1];
			} else {
				time = null;
			}
			var msg = (time && user.length == 1 ? '> ' : '') + 
						(time ? time.replace('&nbsp;', '') : '') +
						(time && user ? ' ' : '') +
						(user.length ? user.html() : '') +
						(time && user.length ? ', ' : '')
			ta.val(msg);
			setTimeout(function() {
				$(ta).focus();
				$(ta).setCursorPosition(ta.val().length, 500);
			}, 500);
		}
		var show = (box[0].clientHeight == 0);
		var change = function(btn, show) {
			$(btn).attr('src', '/i/i/' + (show ? 'close_reply.gif' : 'reply.gif'));
			$(btn).attr('title', (show ? 'Скрыть' : 'Ответить'));
			return btn;
		}
		if (show) {
			if (this._opened.box != null) {
				this._opened.box.hide();
				change(this._opened.btn, false);
			}
			this._opened.box = box.show();
			this._opened.btn = change(btn, true);
			var area = ta[0];
			if (!!area.selectionStart) {
				// узнаем длину содержимого textarea
				var len = area.value.length;
				area.focus();// aктивируем фокус ввода на объекте
				area.setSelectionRange(len, len);// перемещаемся в конец текста в объекте
				area.focus();// aктивируем фокус ввода на объекте
			}
			// отдельная корявка под Internet Explorer
			if (area.createTextRange) {
				// выделяем весь текст
				var r = area.createTextRange();
				// Свойство collapsed вернет true, если граничные точки имеют
				// одинаковые контейнеры и смещение (false в противном случае)
				r.collapse(false);
				r.select();
			}
			var t = getAbsTop(box) + $z('comment_form').offsetHeight - document.body.clientHeight;
			if (t > document.body.scrollTop) document.body.scrollTop = t;
		} else {
			box.hide();
			change(btn, false);
		}
	},
	init: function() {
		var self = this;
		if ($('#customer-review-comments').length == 1) {
			var d = this.dom = {};
			var pn = location.pathname.toLowerCase();
			if (pn.indexOf('.asp') > 0) {
				this.url = pn.replace('default.asp', 'service.asp');	
			} else {
				if (pn.indexOf('/', pn.length - 1) == -1) {
					pn = pn + '/';
				}
				this.url = pn + 'service.asp';
			}
			this._preloader = new Finam.UI.Controls.Utils.Preloader($('#customer-review-comments'));
		}
		//jQMigrateFrom $(".review").live('focus', function(event){
		$(document).on("focus",".review", function (event) {
			if ($(this).val() == "Ваше сообщение") {
				$(this).val('');
			}
			$(this).css({
				color: "#000",
				height: "4em"
			});
			$(this).css("-webkit-border-radius", "3px 3px 0px 0px").css("border-radius", "3px 3px 0px 0px");
			$(this).parent().children(".customer-block").slideDown("fast");
		})
		$('.review[data-error="true"]').map(function(index, elm) {
			// кто-то ловчее перехватывает фокус, а мы поставим через 0.5 сек
			setTimeout(function() {
				$(elm).focus();
				$(elm).setCursorPosition(elm.value.length, 500);
			}, 500);
		});
		//jQMigrateFrom $(".whom").live('click', function(e) {
		$(document).on("click", ".whom", function (e) {
			$(this).parent().children(".choose").slideDown("fast");
			return false;
		});
		//jQMigrateFrom $(".whom-chat").live('click', function(e) {
		$(document).on("click", ".whom-chat", function (e) {
			$(this).parent().parent().parent().children("input").attr("checked", false);
			$(this).parent().parent().children(".whom").html($(this).html());
			$(this).parent().slideUp("fast");
			return false;
		});
		//jQMigrateFrom $(".whom-admin").live('click', function(e) {
		$(document).on("click", ".whom-admin", function (e) {
			$(this).parent().parent().parent().children("input").attr("checked", "checked");
			$(this).parent().parent().children(".whom").html($(this).html());
			$(this).parent().slideUp("fast");
			return false;
		});
		this.create();
		return this;
	},
	create: function() {
		var self = this;
		$.each($('#customer-review-comments .chat FORM'), function(index, form) {
			form = $(form);
			var action = form.attr('action');
			if (action.indexOf('#') != -1) {
				action = '#' + action.split('#')[1];
			} else {
				action = '';
			}
			form.attr('action', location.pathname + location.search + action)
		});
		$('A.i-comments-delete').click(function(event) {
			var id = $(this).data('comment-id');
			var item = $(this).closest('.chat-item');
			if (!self._preloader) {
				self._preloader = new Finam.UI.Controls.Utils.Preloader(item);
			}
			var url = '/service.asp?name=customer-review&action=delete-comment&id=' + id + '&' + Math.random();
			self._preloader.show(item);
			$.ajax({
				url: url,
				dataType: 'json',
				success: function(json) {
					self._preloader.hide();
					item.slideUp(300, function() {
						var chat = item.closest('.chat');
						if (chat.find('.chat-item:visible').length == 0) {
							chat.hide();
						}
					});
				},
				error: function(jqXHR, textStatus, errorThrown) {
					self._preloader.hide();
					console.log([jqXHR, textStatus, errorThrown]);
				}
			});
			return false;
		});
		return this;
	},
	reload: function() {
		var params = {
			'news-id': $('#customer-review-comments').data('news-id') - 0,
			'news-type': $('#customer-review-comments').data('news-type') - 0,
			'reviews-id': $('#customer-review-comments').data('reviews-id') - 0,
			'mode': $('#customer-review-comments').data('mode'),
			'count': $('#customer-review-comments').data('count') - 0 || 30,
			'order': $('#customer-review-comments').data('order') - 0 || 0
		};
		this._preloader.show();
		$('#customer-review-comment-form-auth A').unbind('click');
		var url = this.url + '?name=customer-review&action=comments&' + $.param(params) + '&' + Math.random();
		var self = this;
		$.ajax({
			url: url,
			dataType: 'html',
			success: function(html) {
				self._preloader.hide();
				$('#customer-review-comments').html(html);
				self.create();
			},
			error: function(jqXHR, textStatus, errorThrown) {
				self._preloader.hide();
				console.log([jqXHR, textStatus, errorThrown]);
			}
		});
	},
	redraw: function() {
		return this;
	}
};

$(document).ready(function() {
	Finam.CustomerReview.init();
});

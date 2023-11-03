//needed in page
//jquery.cookie.js and jquery-1.11.2.min.js

function initFirebase() {
	var updateVersion = $.cookie('firebaseUpdateVersion');
	var appendScript = function (filePath, cb) {
		var script = document.createElement('script');
		script.src = filePath;
		script.onload = cb;
		document.getElementsByTagName('head')[0].appendChild(script);
	};

	var onScriptLoad = function () {
		firebase.initializeApp({
			apiKey: 'AIzaSyCg4e35_BrWXTEttFYlzUT0NqomY39Aaoo',
			authDomain: 'finam-push.firebaseapp.com',
			databaseURL: 'https://finam-push.firebaseio.com',
			projectId: 'finam-push',
			storageBucket: 'finam-push.appspot.com',
			messagingSenderId: '804434075167',
			appId: '1:804434075167:web:e4bb95621c0f8180dfff2a',
		});

		var messaging = firebase.messaging();

		messaging.onMessage(function (payload) {
			Notification.requestPermission(function (result) {
				if (result === 'granted') {
					navigator.serviceWorker.ready
						.then(function (registration) {
							const notificationTitle = payload.data.title;
							const notificationOptions = {
								body: payload.data.body,
								icon: payload.data.icon,
								requireInteraction: payload.data.requireInteraction,
								image: payload.data.image,
								data: { url: payload.data.click_action },
							};
							registration.showNotification(
								notificationTitle,
								notificationOptions
							);
						})
						.catch(function (error) {
							console.log('ServiceWorker registration failed', error);
						});
				}
			});
		});

		if (messaging.onTokenRefresh) {
			messaging.onTokenRefresh(function () {
				messaging
					.getToken()
					.then(function (refreshedToken) {
						var subscriber = new Subscriber();
						subscriber.pushNotificationSubscriber.saveSubscription(
							currentToken
						);
					})
					.catch(function (error) {
						console.log('onTokenRefresh error', error);
					});
			});
		}

		$(document).ready(function () {
			var pathname = window.location.pathname.toLowerCase();
			if (
				!(
					pathname.indexOf('bodyregional.asp') > 0 ||
					pathname.indexOf('body.asp') > 0
				)
			) {
				new Subscriber(messaging);
			}
		});
	};

	if (updateVersion) {
		if (require) {
			var config = {
				paths: {
					'@firebase/app': '/js/lib/firebase-app.8.10.0',
					'@firebase/analytics': '/js/lib/firebase-analytics.8.10.0',
					'@firebase/messaging': '/js/lib/firebase-messaging.8.10.0',
				},
			};

			require.config(config);

			require([
				'@firebase/app',
				'@firebase/analytics',
				'@firebase/messaging',
			], function (firebase) {
				window.firebase = firebase;
				onScriptLoad();
			});
		} else {
			appendScript('/js/lib/firebase-app.8.10.0.js');
			appendScript('/js/lib/firebase-analytics.8.10.0.js');
			appendScript('/js/lib/firebase-messaging.8.10.0.js', onScriptLoad);
		}
	} else {
		appendScript('/js/lib/firebase.js', onScriptLoad);
	}
}

initFirebase();

const SUBSCRIPTION_DATA_KEY = 'subscribtionData';

const diffDateInDays = (date1, date2) => {
	const diffTime = Math.abs(date2 - date1);
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	return diffDays;
};

const _updateSubscriptionData = (token, subscriberId) => {
	return new Promise(resolve => {
		fetch(`/api/push/subscriber/${subscriberId || ''}`, {
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: token,
			}),
			method: 'PUT',
		})
			.then(res => res.json())
			.then(res => {
				const newSubscriptionData = {
					token: token,
					subscriberId: res.data,
					checkDate: new Date(),
				};

				localStorage.setItem(
					SUBSCRIPTION_DATA_KEY,
					JSON.stringify(newSubscriptionData)
				);
				resolve(newSubscriptionData);
			});
	});
};

const getSubscriptionData = () => {
	return new Promise((resolve, reject) => {
		const subscriptionData = JSON.parse(
			localStorage.getItem(SUBSCRIPTION_DATA_KEY)
		);

		firebase
			.messaging()
			.getToken()
			.then(currentToken => {
				const isEmptyOrOldToken =
					!subscriptionData ||
					!subscriptionData.subscriberId ||
					diffDateInDays(new Date(subscriptionData.checkDate), new Date()) > 5;

				if (isEmptyOrOldToken) {
					_updateSubscriptionData(currentToken).then(resolve);
				} else if (subscriptionData.token !== currentToken) {
					_updateSubscriptionData(
						currentToken,
						subscriptionData.subscriberId
					).then(resolve);
				} else {
					resolve(subscriptionData);
				}
			}, reject);
	});
};

var Subscriber = function (messaging) {
	var self = this;
	this.versionFCM = 6;
	this.pushNotificationSubscriber = {
		checkSubscribeStatus: function () {
			// проверка поддержки FCM со стороны браузера
			if (
				window.location.protocol === 'https:' &&
				(window.location.host.indexOf('www.finam.ru') >= 0 ||
					window.location.host.indexOf('stage.finam.ru') >= 0) &&
				'Notification' in window &&
				'serviceWorker' in navigator &&
				'localStorage' in window &&
				'fetch' in window &&
				'postMessage' in window
			) {
				var isSubscribed = $.cookie('subscribeModal');
				var isFCM = $.cookie('subscribedFCM');
				var delay = !isSubscribed ? 22 : 1;
				setTimeout(function () {
					self.pushNotificationSubscriber.subscribe();
				}, delay * 1000); // количество секунд до показа плашки подписки
				getSubscriptionData();
			}
		},
		subscribe: function () {
			Notification.requestPermission()
				.then(function (permission) {
					if (permission !== 'denied') {
						// получаем ID устройства
						messaging
							.getToken()
							.then(function (currentToken) {
								if (!!currentToken) {
									self.pushNotificationSubscriber.saveSubscription(
										currentToken
									);
								} else {
									console.warn('Не удалось получить токен.');
								}
							})
							.catch(function (err) {
								console.warn('При получении токена произошла ошибка.', err);
							});
					} else {
						$.cookie('subscribeModal', 'cancelled', {
							expires: 365,
							path: '/',
							domain: 'finam.ru',
						});
					}
				})
				.catch(function (err) {
					console.warn(
						'Не удалось получить разрешение на показ уведомлений.',
						err
					);
					$.cookie('subscribeModal', 'cancelled', {
						expires: 14,
						path: '/',
						domain: 'finam.ru',
					});
				});
		},
		saveSubscription: function (token) {
			var userId = null;
			if (!!Finam && !!Finam.User && !!Finam.User.info()) {
				userId = Finam.User.info().id;
			}
			$.ajax({
				url: '/push/subscribe',
				dataType: 'JSON',
				type: 'POST',
				data: {
					guid: token,
					userId: userId,
					platformId: 4,
				},
				success: function (json) {
					if (!!json.ok) {
						$.cookie('subscribeModal', 'subscribed', {
							expires: 365,
							path: '/',
							domain: 'finam.ru',
						});
					}
				},
				error: function (qXHR, textStatus, errorThrown) {
					//console.log(qXHR, textStatus, errorThrown)
				},
			});
		},
	};
	this.emailNewsSubscriber = {
		checkDevice: function () {
			return $(window).width() < 768;
		},
		isUrlContains: function (arrayOfStringsToCheck) {
			var currentUrl = window.location.href;
			var returnedResult = false;
			arrayOfStringsToCheck.forEach(function (stingToCheckInUrl) {
				if (currentUrl.indexOf(stingToCheckInUrl) >= 0) {
					returnedResult = true;
				}
			});
			return returnedResult;
		},
		getQueryParameterValue: function (queryParameterName) {
			var re = new RegExp(queryParameterName + '=(\\w+)');
			var executedRegExp = re.exec(location.search);
			var queryParameterValue = executedRegExp && executedRegExp[1];

			return queryParameterValue;
		},
		checkSubscribeStatus: function () {
			if (
				self.emailNewsSubscriber.checkDevice() &&
				// if 'disable-subscription=true' exist in query parameters - don't show modal
				!self.emailNewsSubscriber.getQueryParameterValue(
					'disable-subscription'
				) &&
				!self.emailNewsSubscriber.isUrlContains(['shop.']) &&
				!document.location.pathname == '/'
			) {
				var subscribe = $.cookie('emailNewsSubscriber');

				if (
					!subscribe &&
					subscribe !== 'subscribed' &&
					subscribe !== 'cancelled'
				) {
					self.emailNewsSubscriber.showModal();
				}
			}
		},
		showModal: function () {
			$.ajax({
				url: '/js/shared/SubScribeModal/emailNews.html',
			}).done(function (res) {
				self.emailNewsSubscriber.container = $(res).tmpl({});
				$('.subscribe_btn', self.emailNewsSubscriber.container).on(
					'click',
					self.emailNewsSubscriber.subscribe
				);
				$('.cancel', self.emailNewsSubscriber.container).on(
					'click',
					self.emailNewsSubscriber.remindLater
				);
				self.emailNewsSubscriber.wrapper = $(
					'<div class="subScribeModalWrapper"></div>'
				);
				$('body').append(self.emailNewsSubscriber.wrapper);
				$('body').append(self.emailNewsSubscriber.container);
			});
		},
		remindLater: function () {
			$.cookie('emailNewsSubscriber', 'cancelled', {
				expires: 30,
				path: '/',
				domain: 'finam.ru',
			});
			self.emailNewsSubscriber.container.hide();
			self.emailNewsSubscriber.wrapper.hide();
		},
		subscribe: function () {
			var form = $('form', self.emailNewsSubscriber.container);
			var data = form.serializeArray();
			$.ajax({
				url: '/service.asp?name=user&action=subscribe',
				data: data,
			}).done(function (res) {
				var res = JSON.parse(res);

				if (res.ok) {
					self.emailNewsSubscriber.container.hide();
					self.emailNewsSubscriber.wrapper.hide();
					$.cookie('emailNewsSubscriber', 'subscribed', {
						expires: 365,
						path: '/',
						domain: 'finam.ru',
					});
				} else {
					if (!data['email']) {
						$('.errorMsg', form).css('top', '0');
						setTimeout(function () {
							$('.errorMsg', form).css('top', '-1000%');
						}, 1500);
					}
				}
			});
		},
	};

	this.init = function () {
		var self = this;
		this.pushNotificationSubscriber.checkSubscribeStatus();
		this.emailNewsSubscriber.checkSubscribeStatus();
	};
	this.init();
};

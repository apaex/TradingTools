document.addEventListener('click', event => {
	//configs
	const popupInfo = {
		2222: {
			target: '2222@sip.finam.ru',
			title: 'Клиентская поддержка',
		},
		2200: {
			target: '2200@sip.finam.ru',
			title: 'Голосовой трейдинг',
		},
		3411: {
			target: '3411@sip.finam.ru',
			title: 'Банковские карты',
		},
		1000: {
			target: '1000@sip.finam.ru',
			title: 'Контакт-центр',
		},
	};

	const requestOptions = {
		extraHeaders: ['X-WSS-SRC: FINAMDOTRU'],
		mediaConstraints: { audio: true, video: false },
	};

	if (event.target.classList.contains('js-call-trigger')) {
		const clickedNumber = event.target.dataset.number;

		if (typeof doCall !== 'function') {
			if (typeof JsSIP === 'undefined') {
				if (typeof require !== 'undefined') {
					require(['/cache/header/finam/images/jssip.min.js'], function (
						JsSIP
					) {
						window.JsSIP = JsSIP;
						jssipInit();
						doCall(popupInfo[clickedNumber], requestOptions);
					});
				} else {
					console.error('JsSIP not found');
				}
			} else {
				jssipInit();
				doCall(popupInfo[clickedNumber], requestOptions);
			}
		} else {
			doCall(popupInfo[clickedNumber], requestOptions);
		}
	}
});

function jssipInit() {
	//fallback for old browsers
	if (!window.RTCDataChannel) return; //Just in case

	//recomment if debug needs
	//JsSIP.debug.enable('JsSIP:*');

	const errorCauses = {
		'User Denied Media Access': 'Нет доступа к микрофону',
		'Not found': 'Нет ответа',
	};

	const socketUrl = 'wss://wss.finam.ru';
	const uri = 'sip:webcall@sip.finam.ru';
	const socket = new JsSIP.WebSocketInterface(socketUrl);
	const ua = new JsSIP.UA({
		sockets: [socket],
		uri,
		register: false,
	});

	//turn on popup dragging
	draggableInit();

	function draggableInit() {
		const popup = document.querySelector('.js-call-popup');
		popup.ondragstart = () => false; //prevent default behavior

		popup.addEventListener('mousedown', e => {
			if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
			const shiftX = e.pageX - getCoords(popup).left;
			const shiftY = e.pageY - getCoords(popup).top;

			document.addEventListener('mousemove', moveAt);
			popup.addEventListener('mouseup', clearEvents);

			//Need to be here in case of closure using
			function moveAt(e) {
				popup.classList.add('is-grabbing');
				const coords = {
					left: e.pageX - shiftX,
					top: e.pageY - shiftY,
				};
				const left = preventOverflow(popup, coords.left, coords.top).left;
				const top = preventOverflow(popup, coords.left, coords.top).top;
				popup.style.transform = `translate(${left}px, ${top}px)`;
			}

			function clearEvents() {
				document.removeEventListener('mousemove', moveAt);
				popup.removeEventListener('mouseup', clearEvents);
				popup.classList.remove('is-grabbing');
			}
		});

		//Force popup stay in sight
		function preventOverflow(popup, left, top) {
			const rightEnd = window.innerWidth - popup.offsetWidth;
			const topEnd = window.innerHeight - popup.offsetHeight;
			let leftResult = left;
			let topResult = top;

			if (left < 0) leftResult = 0;
			if (top < 0) topResult = 0;
			if (left >= rightEnd) leftResult = rightEnd;
			if (top >= topEnd) topResult = topEnd;

			return {
				top: topResult,
				left: leftResult,
			};
		}

		//fixing pointer position when dragging
		function getCoords(elem) {
			var box = elem.getBoundingClientRect();
			return {
				top: box.y,
				left: box.x + pageXOffset,
			};
		}
	}

	window.doCall = function doCall(popupInfo, requestOptions) {
		const { target, title } = popupInfo;
		//Nodes
		const popup = document.querySelector('.js-call-popup');
		const remoteAudio = document.querySelector('.js-call-audio');
		const header = document.querySelector('.js-call-popup-title');
		const status = document.querySelector('.js-call-popup-status');
		const closeButton = document.querySelector('.js-call-popup-stop');
		const recallButton = document.querySelector('.js-call-popup-recall');
		const muteButton = document.querySelector('.js-call-popup-mute');
		const timerText = document.querySelector('.js-call-popup-timer');

		//Constants
		const failText = 'Неудачно, повторите попытку';
		const successText = 'Вы на связи';
		const triesCount = 3;

		//Variables that need to be in closure
		let session; //current session will be here
		let counter = 0; //counter of tries
		let timer; //timer of current call

		// remove inline hide which need
		// to prevent popup flash on loading
		popup.setAttribute('style', '');

		const eventHandlers = {
			failed: function (e) {
				//Try several times
				if (counter < triesCount) {
					setTimeout(() => {
						call();
						counter++;
					}, 500);
				} else {
					onFail(e);
					counter = 0;
				}
			},
			ended: function () {
				close();
			},
		};

		//show popup, change title
		header.textContent = title;
		popup.classList.add('is-shown');

		//start call
		call();
		draggableInit();

		//Register events
		closeButton.addEventListener('click', close);
		recallButton.addEventListener('click', call);

		function close() {
			remoteAudio.srcObject = null;
			popup.classList.remove('is-shown');
			clearClasses(popup);
			if (ua) ua.stop();
			closeButton.removeEventListener('click', close);
			recallButton.removeEventListener('click', call);
			muteButton.removeEventListener('click', toggleMute);
			clearTimer();
		}

		function call() {
			status.textContent = 'Набираем...';
			clearClasses();
			ua.start();
			session = ua.call(target, { ...requestOptions, eventHandlers });

			//fires on older and most common browsers
			session.connection.addEventListener('addstream', function (e) {
				if (remoteAudio.srcObject !== null) return; //in case double firing
				addAudio(e.stream);
			});

			//fires in safari and browsers in which addstream was deprecated
			session.connection.addEventListener('track', function (e) {
				if (remoteAudio.srcObject !== null) return; //in case double firing
				addAudio(e.streams[0]);
			});
		}

		function addAudio(stream) {
			onCallStarted();
			remoteAudio.srcObject = stream;

			try {
				remoteAudio.play();
			} catch (e) {
				onFail(e);
			}
		}

		function onCallStarted() {
			popup.classList.add('is-success');
			status.textContent = successText;
			doTimer();
			muteButton.addEventListener('click', toggleMute);
		}

		function clearClasses() {
			popup.classList.remove('is-fail');
			popup.classList.remove('is-success');
			popup.classList.remove('is-muted');
		}

		function onFail(e) {
			popup.classList.add('is-fail');
			status.textContent = errorCauses[e.cause]
				? errorCauses[e.cause]
				: failText;
			ua.stop();
			clearTimer();
		}

		function doTimer() {
			const start = Date.now();
			timerText.textContent = '00:00';
			timer = setInterval(() => {
				const deltaSecs = Math.floor((Date.now() - start) / 1000);
				const deltaMins = Math.floor((Date.now() - start) / 60000);
				const secondsShow = deltaSecs < 60 ? deltaSecs : deltaSecs % 60;
				timerText.textContent = `${doubledDigits(deltaMins)}:${doubledDigits(
					secondsShow
				)}`;
			}, 1000);

			//add zero before digit if it < 10
			function doubledDigits(digit) {
				if (digit < 10) return `0${digit}`;
				return digit;
			}
		}

		function clearTimer() {
			clearInterval(timer);
			timerText.textContent = '';
		}

		function toggleMute() {
			popup.classList.toggle('is-muted');
			if (session) {
				if (!!session.isMuted().audio) {
					session.unmute();
					popup.classList.remove('is-muted');
				} else {
					session.mute();
					popup.classList.add('is-muted');
				}
			}
		}
	};
}

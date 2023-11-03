const TX_CHAT_WRAP = `
	<div class="chat-window" id="txchat-window">
		<div class="chat-header">
			Чат
			<button class="close-button" onClick="toggleTxChat(true)">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M18 6L6 18M6 6l12 12"></path>
				</svg>
			</button>
		</div>
		<div id="txchat-container" class="chat-body">
		</div>
	</div>
`;

const TX_CHAT_STYLE = `
	.chat-window {
		width: 400px;
		height: 500px;
		background-color: #f2f2f2;
		border: 1px solid #ccc;
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
		position: fixed;
		bottom: 10px;
		right: 10px;
		display: none;
		z-index: 1000;
		overflow: hidden;
		flex-direction: column;
	}

	.chat-window.active {
		display: flex;
	}

	.chat-header {
		background-color: #333;
		color: #fff;
		padding: 0 10px;
		display: flex;
		justify-content: space-between;
		height: 50px;
		display: flex;
		align-items: center;
		font-size: 20px;
	}

	.close-button {
		background-color: transparent;
		border: none;
		cursor: pointer;
		width: 20px;
		height: 20px;
		position: absolute;
		top: 14px;
		right: 20px;
	}

	.close-button:hover svg path {
		stroke: red;
	}

	.chat-body {
		flex-grow: 1;
	}

	@media all and (max-width: 760px) {
		.chat-window {
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			width: auto;
			height: auto;
		}
	}
`;

function setCookie(name, value, options) {
	options = options || {};
	options.path = options.path || '/';

	if (options.expires instanceof Date) {
		options.expires = options.expires.toUTCString();
	}

	let updatedCookie =
		encodeURIComponent(name) + '=' + encodeURIComponent(value);

	for (let optionKey in options) {
		updatedCookie += '; ' + optionKey;
		let optionValue = options[optionKey];
		if (optionValue !== true) {
			updatedCookie += '=' + optionValue;
		}
	}

	document.cookie = updatedCookie;
}

// возвращает куки с указанным name,
// или undefined, если ничего не найдено
function getCookie(name) {
	let matches = document.cookie.match(
		new RegExp(
			'(?:^|; )' +
				name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') +
				'=([^;]*)'
		)
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

var _threadChatStatus = '';

function _initThreadChat(showChat) {
	const _hostName = window.location.hostname.replace('www.', '');
	const isTestDomain =
		_hostName === 'test.finam.ru' || _hostName === 'stage.finam.ru';
	const TX_CHAT_CONFIG = {
		appEnv: isTestDomain ? 'dev-dev' : '',
		appName: 'FINAMRU',
		platform: 'HTML5',
	};

	if (_threadChatStatus === 'pending') {
		return;
	}

	if (_threadChatStatus === 'init') {
		if (showChat) {
			toggleTxChat();
		}
		return;
	}
	_threadChatStatus = 'pending';

	const addStyle = () => {
		if (document.querySelector('#txChatStyle')) {
			return;
		}
		const style = document.createElement('style');
		style.setAttribute('id', 'txChatStyle');
		style.textContent = TX_CHAT_STYLE;
		document.head.append(style);
	};

	addStyle();

	if (!document.getElementById('txchat-window')) {
		document
			.getElementsByTagName('body')[0]
			.insertAdjacentHTML('beforeend', TX_CHAT_WRAP);
	}

	const loadScript = (url, callback, delay) => {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		if (script.readyState) {
			// only required for IE <9
			script.onreadystatechange = function () {
				if (
					script.readyState === 'loaded' ||
					script.readyState === 'complete'
				) {
					script.onreadystatechange = null;
					if (!!callback) {
						setTimeout(callback, delay || 1);
					}
				}
			};
		} else {
			//Others
			script.onload = function () {
				if (!!callback) {
					setTimeout(callback, delay || 1);
				}
			};
		}

		script.src = url;
		document.getElementsByTagName('head')[0].appendChild(script);
	};

	const txInitCb = (token = false) => {
		const containerId = 'txchat-container';

		const config = {
			containerId: containerId,
			openChatHeight: 500,
			chatButton: false,
			showUI: true,
			widgetUrl: 'https://txchat-widget.finam.ru/',
			appVersion: '1.0.0',
		};

		const localParamsStr = localStorage.getItem('txChatParams');
		let localParams = {};
		if (localParamsStr) {
			localParamsStr.split(';').forEach(item => {
				const params = item.split('=');
				localParams[params[0]] = params[1];
			});
		}
		window.txchatwidget.create(
			Object.assign(config, TX_CHAT_CONFIG, localParams)
		);
		toggleTxChat();
		_threadChatStatus = 'init';
	};

	loadScript('https://libs-cdn.finam.ru/chat/bundle.js', function () {
		// if (typeof FinamAuth !== 'undefined' && FinamAuth.isUser()) {
		// 	FinamAuth.subscribeToken().then(res => {
		// 		txInitCb(res.token);
		// 	});
		// } else {
		// 	txInitCb();
		// }
		txInitCb();
	});
}

document.addEventListener('click', function (e) {
	if (e.target.closest('.js-call-threads')) {
		if (_threadChatStatus === 'init') {
			toggleTxChat();
		} else {
			_initThreadChat(true);
		}
	}
});

function toggleTxChat(hide = false) {
	if (hide) {
		document.getElementById('txchat-window').classList.remove('active');
	} else {
		document.getElementById('txchat-window').classList.add('active');
	}
}

if (!Finam) {
	var Finam = {};
}

if (!Finam.User) {
	Finam.User = {};
}
Finam.loadScript = loadScript;
Finam.loadMultipleScripts = loadMultipleScripts;
Finam.currentUserInfoinit = function (info) {
	Finam.currentUserInfo = info || {
		id: null,
		name: null,
		pass: null,
		email: null,
		monitor: null,
		client: null,
		fio: null,
		phone: null,
		mobile: null,
		lastLoginState: null,
		edoxGlobalId: null,
		agent: null,
	};
};

function loadScript(url, callback, delay) {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	if (script.readyState) {
		// only required for IE <9
		script.onreadystatechange = function () {
			if (script.readyState === 'loaded' || script.readyState === 'complete') {
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
				setTimeout(callback, delay || 1); // todo: зачем тут вообще задержка?
			}
		};
	}

	script.src = url;
	document.getElementsByTagName('head')[0].appendChild(script);
}

function loadMultipleScripts(urls, callback) {
	var scriptsLeft = urls.length;
	if (!!scriptsLeft) {
		urls.forEach(function (url) {
			return loadScript(
				url,
				function () {
					scriptsLeft--;
					if (scriptsLeft < 1) callback();
				},
				0
			);
		});
	} else {
		callback();
	}
}
function dhtmlLoadScript(url) {
	var e = document.createElement('script');
	e.src = url;
	e.type = 'text/javascript';
	document.getElementsByTagName('head')[0].appendChild(e);
}

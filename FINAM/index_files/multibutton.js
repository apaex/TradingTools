function ednaMultiButton(options) {
	function onChatButtonClick(e) {
		e && e.preventDefault();

		onButtonClick();
	}

	function onButtonClick(e) {
		e && e.preventDefault();

		const isActive = button.classList.contains(activeClass);

		isActive
			? topButtons.classList.add(hideClass)
			: topButtons.classList.remove(hideClass);
		isActive
			? leftButtons.classList.add(hideClass)
			: leftButtons.classList.remove(hideClass);
		button.classList.toggle(activeClass);
	}

	const buttonClass = 'ednamb-button';
	const topButtonsClass = 'ednamb-top-buttons';
	const leftButtonsClass = 'ednamb-left-buttons';
	const hideClass = 'ednamb-hide';
	const activeClass = 'ednamb-active';
	const containerId = options.containerId || 'ednamb-container';
	const leftButtonsList = options.leftButtons || [];
	const topButtonsList = options.topButtons || [];
	const container = document.getElementById(containerId);
	const button = container.querySelector('.' + buttonClass);
	const topButtons = container.querySelector('.' + topButtonsClass);
	const leftButtons = container.querySelector('.' + leftButtonsClass);

	button.addEventListener('click', onButtonClick);

	topButtonsList.forEach(function (item) {
		const a = document.createElement('a');

		a.href = item.url;
		a.textContent = item.text;
		a.classList.add('ednamb-top-button');
		topButtons.appendChild(a);
	});

	leftButtonsList.forEach(function (item) {
		const a = document.createElement('a');

		a.style.backgroundImage = 'url("' + item.image + '")';
		a.classList.add('ednamb-left-button');
		if (item.className) {
			a.classList.add(item.className);
		}

		if (item.url) {
			a.href = item.url;
			a.target = '_blank';
		} else {
			a.href = '#';
			a.addEventListener('click', onChatButtonClick);
		}

		leftButtons.appendChild(a);
	});
}

function _initEdnaMultibutton() {
	ednaMultiButton({
		// Unique DOM ID
		containerId: 'ednamb-container',

		// Left / Bottom buttons
		leftButtons: [
			{
				image: '/cache/header/finam/images/telegram.svg',
				url: 'tg://resolve/?domain=Finam_Support_Bot',
			},
			{
				image: '/cache/header/finam/images/viber.svg',
				url: 'viber://pa/?chatURI=finam_chat',
			},
			{
				image: '/cache/header/finam/images/vk.svg',
				url: 'https://vk.com/im?sel=-17555738',
			},

			// button without `url` displays Chat
			{
				image: '/cache/header/finam/images/edna.svg',
				className: 'js-call-threads',
			},
		],
	});

	document
		.querySelector('#ednamb-container')
		.setAttribute('class', 'ednamb-container');
}

window.onload = function () {
	var _hostName = window.location.hostname.replace('www.', '');
	if (
		_hostName === 'zaoik.finam.ru' ||
		(_hostName === 'finam.ru' &&
			window.location.pathname.indexOf('/about/') === 0)
	) {
		_initEdnaMultibutton();
	}
};

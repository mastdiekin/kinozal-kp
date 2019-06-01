// ==UserScript==
// @name               Рейтинг кинопоиска для kinozal.tv
// @namespace          https://github.com/mastdiekin/kinozal-kp
// @description:ru     Добавляет кнопку рейтинга kinopoisk'a, на странице http://kinozal.tv/top.php к раздачам.

// @include            http://kinozal.tv/top.php*

// @version            1.0.1
// @author             mastdiekin
// @require            http://code.jquery.com/jquery-3.2.1.min.js
// @updateURL          https://raw.githubusercontent.com/mastdiekin/kinozal-kp/master/kinozal_kp.user.js
// @icon               http://kinozal.tv/pic/favicon.ico

// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM_xmlhttpRequest
// ==/UserScript==

(function() {
	'use strict';
	let props = {
		_brand: '#f1d29c',
		brand: '#C0A067',
		kpbrand: '#ff6600',
		transition: '.1s ease',
		buttonText: 'Рейтинг',
		requestText: 'Получить рейтинг',
		readyText: 'Рейтинг кинопоиска'
	}

	let last =  function(array, n) {
		if (array == null)
			return void 0;
		if (n == null)
			return array[array.length - 1];
		return array.slice(Math.max(array.length - n, 0));
	};

	let svg = `<svg enable-background="new 0 0 70 70" version="1.1" viewBox="0 0 70 70" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="m35 0c-19.3 0-35 15.7-35 35s15.7 35 35 35 35-15.7 35-35-15.7-35-35-35zm-13.3 13.5c4.7 0 8.4 3.7 8.4 8.4s-3.7 8.4-8.4 8.4-8.4-3.7-8.4-8.4c0.1-4.7 3.8-8.4 8.4-8.4zm0 43c-4.7 0-8.4-3.7-8.4-8.4s3.7-8.4 8.4-8.4 8.4 3.7 8.4 8.4c-0.1 4.7-3.8 8.4-8.4 8.4zm9.7-17.9c-2-2-2-5.3 0-7.3s5.3-2 7.3 0 2 5.3 0 7.3-5.3 2.1-7.3 0zm16.9 17.9c-4.7 0-8.4-3.7-8.4-8.4s3.7-8.4 8.4-8.4 8.4 3.7 8.4 8.4c-0.1 4.7-3.8 8.4-8.4 8.4zm0-26.4c-4.7 0-8.4-3.7-8.4-8.4s3.7-8.4 8.4-8.4 8.4 3.7 8.4 8.4c-0.1 4.7-3.8 8.4-8.4 8.4z" fill="#ffffff"/></svg>`;
	let base64svg = `PHN2ZyBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA3MCA3MCIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNzAgNzAiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTM1IDBjLTE5LjMgMC0zNSAxNS43LTM1IDM1czE1LjcgMzUgMzUgMzUgMzUtMTUuNyAzNS0zNS0xNS43LTM1LTM1LTM1em0tMTMuMyAxMy41YzQuNyAwIDguNCAzLjcgOC40IDguNHMtMy43IDguNC04LjQgOC40LTguNC0zLjctOC40LTguNGMwLjEtNC43IDMuOC04LjQgOC40LTguNHptMCA0M2MtNC43IDAtOC40LTMuNy04LjQtOC40czMuNy04LjQgOC40LTguNCA4LjQgMy43IDguNCA4LjRjLTAuMSA0LjctMy44IDguNC04LjQgOC40em05LjctMTcuOWMtMi0yLTItNS4zIDAtNy4zczUuMy0yIDcuMyAwIDIgNS4zIDAgNy4zLTUuMyAyLjEtNy4zIDB6bTE2LjkgMTcuOWMtNC43IDAtOC40LTMuNy04LjQtOC40czMuNy04LjQgOC40LTguNCA4LjQgMy43IDguNCA4LjRjLTAuMSA0LjctMy44IDguNC04LjQgOC40em0wLTI2LjRjLTQuNyAwLTguNC0zLjctOC40LTguNHMzLjctOC40IDguNC04LjQgOC40IDMuNyA4LjQgOC40Yy0wLjEgNC43LTMuOCA4LjQtOC40IDguNHoiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=`;

	let styles = `

	<style>
	.element__rating-button {
		display: block;
		position: absolute;
		bottom: 5px;
		border-radius: 3px 3px 0 0;
		left: 50%;
		box-sizing: border-box;
		height: 25px;
		line-height: 25px;
		transform: translate(-50%, 0);
		background-color: ${props.brand};
		border: 0;
		color: #fff;
		outline: none;
		cursor: pointer;
		opacity: 0;
		transition: all ${props.transition};
	}
	.element__rating-button:hover {
		background-color: ${props._brand};
	}
	.element__wrapper {
		display: inline-block;
		position: relative;
		*zoom: 1
	}
	.element__wrapper a {
		position: relative;
	}
	.element__wrapper:hover > .element__rating-button {
		opacity: 1;
	}
	.element__wrapper::after {
		content: " "
		display: table
		clear: both
	}
	.element__preloader {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: rgba(0,0,0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		transition: all ${props.transition};
	}
	.element__preloader svg {
		height: 50px;
		fill: ${props.kpbrand};
		animation: linear 2s rotate infinite;
	}
	.element__preloader svg path {
		fill: ${props.kpbrand};
	}
	.static {
		opacity: 1;
		background-color: ${props.kpbrand};
	}
	.static::before {
		content: url('data:image/svg+xml;base64, ${base64svg}');
		width: 10px;
		height: 10px;
		display: inline-block;
		margin-right: 5px;
	}
	.static:hover {
		background-color: ${props.kpbrand} !important;
	}
	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	</style>

	`;

	$('body').prepend(styles);

	$('.bx1 a').each(function(){

		let th = $(this);

		return createWrapper(th);

	});

	function createWrapper(element) {

		element.wrap( "<div class='element__wrapper'></div>" );

		return createButton(element);

	}

	function createButton(element) {

		let button = document.createElement('button');
		button.className = 'element__rating-button';
		button.id = 'rating';
		button.innerHTML += props.buttonText;
		button.dataset.url = element[0]['href'];
		button.setAttribute('title', props.requestText);

		element.parent().append(button);

		button.addEventListener('click', function(button){

			//отключаем кнопку
			button.srcElement.disabled = 1;

			let preloader = document.createElement('div');
			preloader.className = 'element__preloader';
			preloader.innerHTML += svg;

			element[0].innerHTML += preloader.outerHTML;

			var a = element;

			return requestPage(button, a);

		})

	}

	function requestPage(element, a) {

		let url = element.srcElement.dataset.url;

		let data = GM_xmlhttpRequest({
			method: 'GET',
			url: url,
			headers: {
				'User-Agent': 'Mozilla/5.0',
				'Accept': 'text/xml'
			},
			onload: function (response) {

				if(response.status === 200) {

					//включаем кнопку
					element.srcElement.disabled = 0;

					//удаляем прелодер
					a[0].children[1].remove();

					let doc = response.responseText;
					let html = new DOMParser().parseFromString(doc, "text/html");

					let ul = html.querySelector(".men.w200");
					let items = ul.getElementsByTagName("li");

					for (var i = 1; i < items.length; ++i) {

						items[i].className += ' id-'+[i];

						if(items[i].classList.contains('img')) {
							break;
						}

						var arr = [];

						arr.push(items[i]);


					}

					var lastItemArr = last(arr);

					var kp_rating;

					if(lastItemArr.querySelector('.floatright') === null) {

						kp_rating = 'n/a';

					} else {

						kp_rating = lastItemArr.querySelector('.floatright').innerHTML;

					}

					return createRatingNum(kp_rating, element);

				} else {

					kp_rating = 'error';
					return createRatingNum(kp_rating, element);

				}

			}
		});
	}

	function createRatingNum(rating, element) {

		if(!element.srcElement.classList.contains('static')){
			element.srcElement.classList += ' static';
		}
		element.srcElement.innerHTML = rating;
		element.srcElement.title = props.readyText;

	}
})();
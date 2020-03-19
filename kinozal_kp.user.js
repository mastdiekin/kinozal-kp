// ==UserScript==
// @name               Рейтинг кинопоиска для kinozal.tv
// @namespace          https://github.com/mastdiekin/kinozal-kp
// @description:ru     Добавляет кнопку рейтинга, на странице http://kinozal.tv/top.php к раздачам.

// @include            http://kinozal.tv/top.php*

// @version            1.0.5
// @author             mastdiekin
// @require            http://code.jquery.com/jquery-3.2.1.min.js
// @icon               http://kinozal.tv/pic/favicon.ico

// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM_xmlhttpRequest
// @description Добавляет кнопку рейтинга, на странице http://kinozal.tv/top.php к раздачам.
// ==/UserScript==

(function() {
	'use strict';
	let props = {
		_brand: '#f1d29c',
		brand: '#C0A067',
		transition: '.1s ease',
		buttonText: 'Рейтинг',
		requestText: 'Получить рейтинг',
	}

	let svg = `<svg enable-background="new 0 0 70 70" version="1.1" viewBox="0 0 70 70" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="m35 0c-19.3 0-35 15.7-35 35s15.7 35 35 35 35-15.7 35-35-15.7-35-35-35zm-13.3 13.5c4.7 0 8.4 3.7 8.4 8.4s-3.7 8.4-8.4 8.4-8.4-3.7-8.4-8.4c0.1-4.7 3.8-8.4 8.4-8.4zm0 43c-4.7 0-8.4-3.7-8.4-8.4s3.7-8.4 8.4-8.4 8.4 3.7 8.4 8.4c-0.1 4.7-3.8 8.4-8.4 8.4zm9.7-17.9c-2-2-2-5.3 0-7.3s5.3-2 7.3 0 2 5.3 0 7.3-5.3 2.1-7.3 0zm16.9 17.9c-4.7 0-8.4-3.7-8.4-8.4s3.7-8.4 8.4-8.4 8.4 3.7 8.4 8.4c-0.1 4.7-3.8 8.4-8.4 8.4zm0-26.4c-4.7 0-8.4-3.7-8.4-8.4s3.7-8.4 8.4-8.4 8.4 3.7 8.4 8.4c-0.1 4.7-3.8 8.4-8.4 8.4z" fill="#ffffff"/></svg>`;
	let base64svg = `PHN2ZyBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA3MCA3MCIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNzAgNzAiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTM1IDBjLTE5LjMgMC0zNSAxNS43LTM1IDM1czE1LjcgMzUgMzUgMzUgMzUtMTUuNyAzNS0zNS0xNS43LTM1LTM1LTM1em0tMTMuMyAxMy41YzQuNyAwIDguNCAzLjcgOC40IDguNHMtMy43IDguNC04LjQgOC40LTguNC0zLjctOC40LTguNGMwLjEtNC43IDMuOC04LjQgOC40LTguNHptMCA0M2MtNC43IDAtOC40LTMuNy04LjQtOC40czMuNy04LjQgOC40LTguNCA4LjQgMy43IDguNCA4LjRjLTAuMSA0LjctMy44IDguNC04LjQgOC40em05LjctMTcuOWMtMi0yLTItNS4zIDAtNy4zczUuMy0yIDcuMyAwIDIgNS4zIDAgNy4zLTUuMyAyLjEtNy4zIDB6bTE2LjkgMTcuOWMtNC43IDAtOC40LTMuNy04LjQtOC40czMuNy04LjQgOC40LTguNCA4LjQgMy43IDguNCA4LjRjLTAuMSA0LjctMy44IDguNC04LjQgOC40em0wLTI2LjRjLTQuNyAwLTguNC0zLjctOC40LTguNHMzLjctOC40IDguNC04LjQgOC40IDMuNyA4LjQgOC40Yy0wLjEgNC43LTMuOCA4LjQtOC40IDguNHoiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=`;

	let styles = `

	<style>
	.element__rating-button {
		display: block;
		position: absolute;
		bottom: 0;
		font-size: 12px;
		left: 50%;
		width: 100%;
		box-sizing: border-box;
		line-height: 25px;
		transform: translate(-50%, 0);
		background-color: ${props.brand};
		border: 0;
		color: #fff;
		outline: none;
		cursor: pointer;
		opacity: 0;
		transition: all ${props.transition};
		overflow: hidden;
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
		margin: 0 !important;
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
		fill: ${props._brand};
		animation: linear 2s rotate infinite;
	}
	.element__preloader svg path {
		fill: ${props._brand};
	}
	.static {
		opacity: 1;
		background-color: ${props.brand};
		line-height: 20px;
	}
	.static::before {
		content: url('data:image/svg+xml;base64, ${base64svg}');
		width: 28px;
		position: absolute;
		bottom: -15px;
		left: -10px;
	}
	.static:hover {
		background-color: ${props.brand} !important;
	}
	.final__rating {
		display: block;
		text-align: center;
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
			if(!this.classList.contains('static')) {
				//отключаем кнопку
				button.srcElement.disabled = 1;
				let preloader = document.createElement('div');
				preloader.className = 'element__preloader';
				preloader.innerHTML += svg;
				element[0].innerHTML += preloader.outerHTML;
				var a = element;

				return requestPage(button, a);
			}
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
					let arr = [];
					for (var i = 1; i < items.length; ++i) {
						items[i].className += ' id-'+[i];

						let kpSearch = items[i].innerHTML.match(/Кинопоиск|IMDb/m);

						if(kpSearch) {
							arr.push(kpSearch);
						}
					}

					let imdb_rating, kp_rating;
					let kp_matches = arr.filter(value => /^Кинопоиск/.test(value));
					let imdb_matches = arr.filter(value => /^IMDb/.test(value));
					if(imdb_matches[0]) {
						imdb_rating = createRating(imdb_matches[0].input);
					} else {
						imdb_rating = 'n/a';
					}
					if(kp_matches[0]) {
						kp_rating = createRating(kp_matches[0].input);
					} else {
						kp_rating = 'n/a';
					}

					return createRatingRender(kp_rating, imdb_rating, element);
				}
			}
		});
	}

	function createRating(str) {
		const regex = /(\*|\d+(\.\d+){0,2}(\.\*)?)(\<)/gm;
		let m;
		let arr = [];
		while ((m = regex.exec(str)) !== null) {
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}
			arr.push(m);
		}
		if(arr.length > 0 && arr[0][1]) {
			return arr[0][1]; //rating num (ex. 6.9)
		} else {
			return '—';
		}
	}

	function createRatingRender(kp_rating, imdb_rating, element) {
		if(!element.srcElement.classList.contains('static')){
			element.srcElement.classList += ' static';
		}
		element.srcElement.innerHTML = `
			<span class="final__rating">КП: ${kp_rating}</span>
			<span class="final__rating">IMDb: ${imdb_rating}</span>
		`;
		element.srcElement.title = `Кинопоиск: ${kp_rating}, IMDb: ${imdb_rating}`;
	}
})();
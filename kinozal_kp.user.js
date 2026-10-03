// ==UserScript==
// @name               Рейтинг кинопоиска для kinozal.tv
// @namespace          https://github.com/mastdiekin/kinozal-kp
// @description        Добавляет кнопку рейтинга, на главной странице и на странице топа http://kinozal.tv/top.php к раздачам.

// @match              *kinozal.tv/*
// @match              *kinozal-tv.appspot.com/*
// @match              *kinozal.me/*
// @match              *kinozal.guru/*

// @version            1.0.9
// @author             mastdiekin
// @icon               http://kinozal.tv/pic/favicon.ico

// @grant              GM_registerMenuCommand
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM_addStyle

// @license MIT

// ==/UserScript==

/*=======================================================
  Repository
=======================================================

  https://github.com/mastdiekin/kinozal-kp

*/

const showMainPageRatingEnable = GM_getValue("showMainPageRating", true); //показывает рейтинг у раздач на главной сайта
const showTopPageRatingEnable = GM_getValue("showTopPageRating", true); //добавляет кнопку "Рейтинг" в топе раздач (http://kinozal.tv/top.php)
const reGetRating = GM_getValue("reGetRating", false); //разрешает повторное нажатие на кнопку "Рейтинг"
const siteEncoding = "windows-1251";
const DEFAULT_CACHE_TTL_HOURS = 24; //время хранения рейтинга в кэше по умолчанию

(function () {
	"use strict";

	// -----------------------------------------------------
	// Конфигурация: цвета, тексты, CSS-классы, селекторы.
	// -----------------------------------------------------
	const props = {
		_brand: "#f1d29c",
		brand: "#C0A067",
		transition: ".1s ease",
		buttonText: "Рейтинг",
		requestText: "Получить рейтинг",
	};

	const CLASS = {
		wrapper: "element__wrapper",
		ratingButton: "element__rating-button",
		ratingDiv: "element__rating-div",
		preloader: "element__preloader",
		static: "static",
	};

	const SELECTOR = {
		topPageBody: ".tp1_body",
		topPageLinks: ".mn1_content > .bx1.stable a",
		ratingsList: ".men.w200",
	};

	const svg = `<svg enable-background="new 0 0 70 70" version="1.1" viewBox="0 0 70 70" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="m35 0c-19.3 0-35 15.7-35 35s15.7 35 35 35 35-15.7 35-35-15.7-35-35-35zm-13.3 13.5c4.7 0 8.4 3.7 8.4 8.4s-3.7 8.4-8.4 8.4-8.4-3.7-8.4-8.4c0.1-4.7 3.8-8.4 8.4-8.4zm0 43c-4.7 0-8.4-3.7-8.4-8.4s3.7-8.4 8.4-8.4 8.4 3.7 8.4 8.4c-0.1 4.7-3.8 8.4-8.4 8.4zm9.7-17.9c-2-2-2-5.3 0-7.3s5.3-2 7.3 0 2 5.3 0 7.3-5.3 2.1-7.3 0zm16.9 17.9c-4.7 0-8.4-3.7-8.4-8.4s3.7-8.4 8.4-8.4 8.4 3.7 8.4 8.4c-0.1 4.7-3.8 8.4-8.4 8.4zm0-26.4c-4.7 0-8.4-3.7-8.4-8.4s3.7-8.4 8.4-8.4 8.4 3.7 8.4 8.4c-0.1 4.7-3.8 8.4-8.4 8.4z" fill="#ffffff"/></svg>`;
	const base64svg = encodeURI(`data:image/svg+xml,${svg}`).replace("#", "%23");

	const styles = `
	.${CLASS.ratingButton},
	.${CLASS.ratingDiv}{
		display: block;
		position: absolute;
		bottom: 0;
		font-size: 12px;
		left: 0;
		width: 100%;
		box-sizing: border-box;
		line-height: 25px;
		background-color: ${props.brand};
		border: 0;
		color: #fff;
		outline: none;
		cursor: pointer;
		opacity: 0;
		transition: all ${props.transition};
		overflow: hidden;
	}
	.${CLASS.ratingDiv} {
		opacity: 1;
		cursor: default;
		min-width: 50%;
		min-height: 55px;
		width: auto;
		border-radius: 4px 0 0 0;
		transform: translate(0, 0);
		left: auto;
		right: 0;
		padding: 5px;
		box-sizing: border-box;
	}
	.${CLASS.ratingDiv} .element__preloader {
		border-radius: 4px 0 0 0;
	}
	.${CLASS.ratingButton}:hover {
		background-color: ${props._brand};
	}
	.${CLASS.wrapper} {
		display: block;
		float: left;
		margin: 0 5px 5px 0;
		position: relative;
		*zoom: 1;
	}
	.${CLASS.wrapper} a {
		position: relative;
		display: block;
		margin: 0 !important;
	}
	.${CLASS.wrapper}:hover > .${CLASS.ratingButton} {
		opacity: 1;
	}
	.${CLASS.wrapper}::after {
		content: " ";
		display: table;
		clear: both;
	}
	.${CLASS.preloader} {
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
	.${CLASS.preloader} svg {
		height: 50px;
		fill: ${props._brand};
		animation: linear 2s rotate infinite;
	}
	.${CLASS.preloader} svg path {
		fill: ${props._brand};
	}
	.${CLASS.static} {
		opacity: 1;
		background-color: ${props.brand};
		line-height: 20px;
	}
	.${CLASS.static}::before {
		content: url('${base64svg}');
		width: 28px;
		position: absolute;
		bottom: -15px;
		left: -10px;
	}
	.${CLASS.static}:hover {
		background-color: ${props.brand} !important;
	}
	.final__rating {
		display: block;
		text-align: center;
	}
	.tp1_a {
		display: block;
		float: left;
		position: relative;
	}
	.tp1_desc > .tp1_a {
		float: right;
	}
	.stable a img {
		width: 107px;
		height: 157px
	}
	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	`;
	const disabledStyles = `
	.stable a {
		float: none;
	}
	`;

	const tpBody = [...document.querySelectorAll(SELECTOR.topPageBody)];

	showTopPageRatingEnable && GM_addStyle(disabledStyles); //стили при выключенном рейтинге в /top.php
	GM_addStyle(styles);

	// -----------------------------------------------------
	// Toggle функции
	// -----------------------------------------------------
	function registerToggle(key, label, current) {
		GM_registerMenuCommand(`${current ? "✅" : "❌"} ${label}`, () => {
			GM_setValue(key, !current);
			location.reload();
		});
	}

	// -----------------------------------------------------
	// DOM-хелперы
	// -----------------------------------------------------

	function wrap(toWrap, wrapper) {
		wrapper = wrapper || document.createElement("div");
		toWrap.parentNode.appendChild(wrapper);
		wrapper.classList.add(CLASS.wrapper);
		return wrapper.appendChild(toWrap);
	}

	function createPreloaderElement() {
		const preloader = document.createElement("div");
		preloader.className = CLASS.preloader;
		preloader.innerHTML = svg;
		return preloader;
	}

	// -----------------------------------------------------
	// Кэш рейтингов
	// -----------------------------------------------------

	function cacheKey(url) {
		try {
			const id = new URL(url).searchParams.get("id");
			return "rating:" + (id || url);
		} catch (e) {
			return "rating:" + url;
		}
	}

	function getCacheTtlHours() {
		const hours = Number(GM_getValue("cacheTtlHours", DEFAULT_CACHE_TTL_HOURS));
		return Number.isFinite(hours) && hours >= 0 ? hours : DEFAULT_CACHE_TTL_HOURS;
	}

	function getCachedRating(url) {
		const entry = GM_getValue(cacheKey(url));
		const ttl = getCacheTtlHours() * 60 * 60 * 1000;
		return entry && Date.now() - entry.time < ttl ? entry.value : null;
	}

	GM_registerMenuCommand(`Время кэша рейтингов: ${getCacheTtlHours()} ч`, () => {
		const input = prompt(
			"Сколько часов хранить рейтинги в кэше? (0 — не кэшировать)",
			getCacheTtlHours()
		);
		if (input === null) return; // нажали отмену

		const hours = parseFloat(input.replace(",", "."));
		if (!Number.isFinite(hours) || hours < 0) {
			alert("Введите число не меньше нуля");
			return;
		}

		GM_setValue("cacheTtlHours", hours);
		alert(`Сохранено: ${hours} ч. Применится сразу, а название пункта обновится после перезагрузки страницы.`);
	});

	function setCachedRating(url, value) {
		GM_setValue(cacheKey(url), { time: Date.now(), value });
	}

	// -----------------------------------------------------
	// Топ страница (top.php): кнопка "Рейтинг" по клику
	// -----------------------------------------------------

	function createWrapper() {
		const content = [...document.querySelectorAll(SELECTOR.topPageLinks)];
		content.map((a) => {
			wrap(a);
			createButton(a);
		});
	}

	function createButton(a) {
		let button = document.createElement("button");
		button.className = CLASS.ratingButton;
		button.textContent = props.buttonText;
		button.dataset.url = a.href;
		button.setAttribute("title", props.requestText);
		a.parentNode.appendChild(button);
		button.addEventListener("click", function (e) {
			if (!this.classList.contains(CLASS.static) || reGetRating) {
				const skipCache = this.classList.contains(CLASS.static); // повторное нажатие
				//отключаем кнопку
				e.target.disabled = true;
				a.appendChild(createPreloaderElement());
				return requestPage(e.target, a, skipCache);
			}
		});
	}

	// -----------------------------------------------------
	// Запрос страницы раздачи и разбор рейтингов
	// -----------------------------------------------------

	async function requestPage(element, a, skipCache = false) {
		element = element.dataset.url ? element : element.parentElement;
		const url = element.dataset.url;

		try {
			// если рейтинг есть в кэше, запрос к сайту не нужен. При reGetRating === True - получаем рейтинг по новому
			const cached = skipCache ? null : getCachedRating(url);
			if (cached) {
				createRatingRender(cached.kp, cached.imdb, element);
				return;
			}

			const response = await fetch(url, {
				credentials: "include",
			});

			const buffer = await response.arrayBuffer();
			const text = new TextDecoder(siteEncoding).decode(buffer);

			if (!response.ok) {
				console.error(text.slice(0, 500));
				return;
			}

			requestPageResponse(element, a, {
				status: response.status,
				responseText: text,
			});
		} finally {
			element.disabled = false;

			const preloader = a?.querySelector(`.${CLASS.preloader}`);
			preloader?.remove();
		}
	}

	function requestPageResponse(element, a, response) {
		let doc = response.responseText;
		let html = new DOMParser().parseFromString(doc, "text/html");

		let ul = html.querySelector(SELECTOR.ratingsList);
		if (!ul) {
			console.error("Не найден список рейтингов на странице раздачи");
			return;
		}

		let items = ul.getElementsByTagName("li");
		let arr = [];
		for (var i = 1; i < items.length; ++i) {
			items[i].className += " id-" + [i];
			let kpSearch = items[i].innerHTML.match(/Кинопоиск|IMDb/m);
			kpSearch && arr.push(kpSearch);
		}

		let imdb_rating, kp_rating;
		let kp_matches = arr.filter((value) => /^Кинопоиск/.test(value));
		let imdb_matches = arr.filter((value) => /^IMDb/.test(value));

		imdb_rating = imdb_matches[0] ? createRating(imdb_matches[0].input) : "n/a";
		kp_rating = kp_matches[0] ? createRating(kp_matches[0].input) : "n/a";

		// сохраняем в кэш, только если нашёлся хотя бы один рейтинг
		if (kp_rating !== "n/a" || imdb_rating !== "n/a") {
			setCachedRating(element.dataset.url, { kp: kp_rating, imdb: imdb_rating });
		}

		return createRatingRender(kp_rating, imdb_rating, element);
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

		return arr.length > 0 && arr[0][1] ? arr[0][1] : "-";
	}

	function ratingHtmlTemplate(kp, imdb) {
		return {
			template: `
				<span class="final__rating">КП: ${kp}</span>
				<span class="final__rating">IMDb: ${imdb}</span>
			`,
			title: `Кинопоиск: ${kp}, IMDb: ${imdb}`,
		};
	}

	function createRatingRender(kp_rating, imdb_rating, element) {
		const t = ratingHtmlTemplate(kp_rating, imdb_rating);
		if (!element.classList.contains(CLASS.static)) element.classList.add(CLASS.static);
		element.innerHTML = t.template;
		element.title = t.title;
	}

	// -----------------------------------------------------
	// Рейтинги на главной странице
	// -----------------------------------------------------

	function createMainPageRatingsElement() {
		tpBody.map((el) => {
			const a = el.children[0];
			const img = a.children[0];
			img.insertAdjacentHTML(
				"afterend",
				`<div class='${CLASS.ratingDiv}'><div class='${CLASS.preloader}'>${svg}</div></div>`
			);
			const div = a.children[1];
			div.dataset.url = a.href;
		});
	}

    function mainPageRatings() {
        // Запрашиваем рейтинг, когда карточка появляется в области видимости
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting && entry.boundingClientRect.top >= 0) return;

                    const self = entry.target;
                    obs.unobserve(self);

                    const a = self.children[0];
                    const element = a.children[1];

                    requestPage(element, a);
                    self.classList.add("__init");
                });
            },
            {
                rootMargin: "0px 0px 200px 0px",
            }
        );

        tpBody.forEach((el) => {
            el.children[0].classList.add("tp1_a");
            observer.observe(el);
        });
    }

	//INIT
	(function init() {
		registerToggle("showMainPageRating", "Рейтинг на главной", showMainPageRatingEnable);
		registerToggle("showTopPageRating", "Кнопка «Рейтинг» в топе", showTopPageRatingEnable);
		registerToggle("reGetRating", "Повторный запрос рейтинга по кнопке", reGetRating);

		if (showTopPageRatingEnable) {
			createWrapper();
		}

		if (showMainPageRatingEnable) {
			createMainPageRatingsElement();
			mainPageRatings();
		}
	})();
})();

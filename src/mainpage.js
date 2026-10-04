import { CLASS, SELECTOR, svg } from "./styles";
import { requestPage } from "./rating";

// снимок карточек делается при загрузке модуля, до любых изменений DOM
const tpBody = [...document.querySelectorAll(SELECTOR.topPageBody)];

// возвращает ссылку и картинку карточки, либо null, если вёрстка другая
function getCardParts(el) {
	const a = el.children[0];
	const img = a?.children[0];
	return a && img ? { a, img } : null;
}

function createMainPageRatingsElement() {
	tpBody.forEach((el) => {
		const parts = getCardParts(el);
		if (!parts) return; // нестандартная карточка, пропускаем

		const { a, img } = parts;
		img.insertAdjacentHTML(
			"afterend",
			`<div class='${CLASS.ratingDiv}'><div class='${CLASS.preloader}'>${svg}</div></div>`
		);
		img.nextElementSibling.dataset.url = a.href;
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
				const element = a?.querySelector(`.${CLASS.ratingDiv}`);
				if (!element) return; // для этой карточки плашка не создана

				requestPage(element, a);
				self.classList.add("__init");
			});
		},
		{
			rootMargin: "0px 0px 200px 0px",
		}
	);

	tpBody.forEach((el) => {
		const a = el.children[0];
		if (!a?.querySelector(`.${CLASS.ratingDiv}`)) return; // пропускаем карточки без плашки

		a.classList.add("tp1_a");
		observer.observe(el);
	});
}

export function initMainPageRatings() {
	createMainPageRatingsElement();
	mainPageRatings();
}
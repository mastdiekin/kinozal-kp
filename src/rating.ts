import { CLASS } from "./styles";
import { props } from "./props";
import { createPreloaderElement } from "./dom";
import { getCachedRating, setCachedRating } from "./cache";
import { fetchRatings } from "./api";

export async function requestPage(source: HTMLElement, a: Element | null | undefined, skipCache = false): Promise<void> {
	const element = source.dataset.url ? source : source.parentElement;
	const url = element?.dataset.url;
	if (!element || !url) return;

	try {
		// если рейтинг есть в кэше, запрос к сайту не нужен. При skipCache === true - получаем рейтинг по новому
		const cached = skipCache ? null : getCachedRating(url);
		if (cached) {
			createRatingRender(cached.kp, cached.imdb, element);
			return;
		}

		const { kp, imdb } = await fetchRatings(url);

		// сохраняем в кэш, только если нашёлся хотя бы один рейтинг
		if (kp !== props.unknownRating || imdb !== props.unknownRating) {
			setCachedRating(url, { kp, imdb });
		}

		createRatingRender(kp, imdb, element);
	} catch (err) {
		console.error("Не удалось получить рейтинг:", err);
		renderError(element);
	} finally {
		if (element instanceof HTMLButtonElement) element.disabled = false;

		const preloader = a?.querySelector(`.${CLASS.preloader}`);
		preloader?.remove();
	}
}

function renderError(element: HTMLElement): void {
	// если рейтинг уже показан (повторный запрос по кнопке), оставляем его
	if (element.classList.contains(CLASS.static)) return;

	element.textContent = props.errorText;
	element.title = props.errorTitle;

	// на главной плашка не кнопка, поэтому делаем её кликабельной для повтора
	if (element.classList.contains(CLASS.ratingDiv)) {
		element.classList.add(CLASS.error);
		element.addEventListener("click", retryMainPageBadge, { once: true });
	}
}

function retryMainPageBadge(e: Event): void {
	e.preventDefault(); // плашка лежит внутри ссылки на раздачу
	e.stopPropagation();

	const element = e.currentTarget as HTMLElement;
	element.classList.remove(CLASS.error);
	element.removeAttribute("title");
	element.replaceChildren(createPreloaderElement());

	void requestPage(element, element.parentElement);
}

function ratingHtmlTemplate(kp: string, imdb: string): { template: string; title: string } {
	return {
		template: `
			<span class="final__rating">КП: ${kp}</span>
			<span class="final__rating">IMDb: ${imdb}</span>
		`,
		title: `Кинопоиск: ${kp}, IMDb: ${imdb}`,
	};
}

function createRatingRender(kpRating: string, imdbRating: string, element: HTMLElement): void {
	const t = ratingHtmlTemplate(kpRating, imdbRating);
	if (!element.classList.contains(CLASS.static)) element.classList.add(CLASS.static);
	element.innerHTML = t.template;
	element.title = t.title;
}

import { CLASS } from "./styles";
import { props } from "./props";
import { createPreloaderElement } from "./dom";
import { getCachedRating, setCachedRating } from "./cache";
import { fetchRatings, parseRatings } from "./api";
import { CloudflareChallengeError } from "./errors";
import { Ratings } from "./types";

export async function getRatings(url: string, skipCache: boolean): Promise<Ratings> {
	const cached = skipCache ? null : getCachedRating(url);
	if (cached) return cached;

	const { kp, imdb } = parseRatings(await fetchRatings(url));

	if (kp !== props.unknownRating || imdb !== props.unknownRating) {
		setCachedRating(url, { kp, imdb });
	}
	return { kp, imdb };
}

export async function loadAndRenderRating(source: HTMLElement, a: Element | null | undefined, skipCache = false): Promise<void> {
	const element = source.dataset.url ? source : source.parentElement;
	const url = element?.dataset.url;
	if (!element || !url) return;

	try {
		const { kp, imdb } = await getRatings(url, skipCache);
		createRatingRender(kp, imdb, element);
	} catch (err) {
		console.error("Не удалось получить рейтинг:", err);
		renderError(element, err);
	} finally {
		if (element instanceof HTMLButtonElement) element.disabled = false;
		a?.querySelector(`.${CLASS.preloader}`)?.remove();
	}
}

function renderError(element: HTMLElement, err?: unknown): void {
	// если рейтинг уже показан (повторный запрос по кнопке), оставляем его
	if (element.classList.contains(CLASS.static)) return;

	if (err instanceof CloudflareChallengeError) {
		renderCloudflareError(element, err.url);
		return;
	}

	element.textContent = props.errorText;
	element.title = props.errorTitle;

	// на главной плашка не кнопка, поэтому делаем её кликабельной для повтора
	if (element.classList.contains(CLASS.ratingDiv)) {
		element.classList.add(CLASS.error);
		element.addEventListener("click", retryMainPageBadge, { once: true });
	}
}

function renderCloudflareError(element: HTMLElement, url: string): void {
	element.textContent = props.cloudflareText;
	element.title = props.cloudflareTitle;

	if (!element.classList.contains(CLASS.ratingDiv)) return;

	element.classList.add(CLASS.error);

	element.addEventListener(
		"click",
		(e: Event) => {
			e.preventDefault();
			e.stopPropagation();

			window.open(url, "_blank", "noopener");

			// когда пользователь вернётся на вкладку - повторяем запрос
			window.addEventListener(
				"focus",
				() => {
					element.classList.remove(CLASS.error);
					element.removeAttribute("title");
					element.replaceChildren(createPreloaderElement());
					void loadAndRenderRating(element, element.parentElement, true);
				},
				{ once: true },
			);
		},
		{ once: true },
	);
}

function retryMainPageBadge(e: Event): void {
	e.preventDefault(); // плашка лежит внутри ссылки на раздачу
	e.stopPropagation();

	const element = e.currentTarget as HTMLElement;
	element.classList.remove(CLASS.error);
	element.removeAttribute("title");
	element.replaceChildren(createPreloaderElement());

	void loadAndRenderRating(element, element.parentElement);
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

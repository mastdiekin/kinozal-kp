import { SELECTOR } from "./styles";
import { props, siteEncoding } from "./props";
import type { Ratings } from "./types";

function createRating(str: string): string {
	const regex = /(\*|\d+(\.\d+){0,2}(\.\*)?)(\<)/gm;
	let m: RegExpExecArray | null;
	const arr: RegExpExecArray[] = [];
	while ((m = regex.exec(str)) !== null) {
		if (m.index === regex.lastIndex) {
			regex.lastIndex++;
		}
		arr.push(m);
	}

	return arr.length > 0 && arr[0][1] ? arr[0][1] : "-";
}

// разбирает HTML страницы раздачи, возвращает { kp, imdb } (экспортируется для тестов)
export function parseRatings(text: string): Ratings {
	const html = new DOMParser().parseFromString(text, "text/html");

	const ul = html.querySelector(SELECTOR.ratingsList);
	if (!ul) {
		throw new Error("Не найден список рейтингов на странице раздачи");
	}

	const items = ul.getElementsByTagName("li");
	const arr: RegExpMatchArray[] = [];
	for (let i = 1; i < items.length; ++i) {
		items[i].className += " id-" + i;
		const kpSearch = items[i].innerHTML.match(/Кинопоиск|IMDb/m);
		kpSearch && arr.push(kpSearch);
	}

	const kpMatch = arr.find((m) => m[0] === "Кинопоиск");
	const imdbMatch = arr.find((m) => m[0] === "IMDb");

	const imdb = imdbMatch ? createRating(imdbMatch.input ?? "") : props.unknownRating;
	const kp = kpMatch ? createRating(kpMatch.input ?? "") : props.unknownRating;

	return { kp, imdb };
}

// загружает страницу раздачи и возвращает { kp, imdb }, при ошибке бросает исключение
export async function fetchRatings(url: string): Promise<Ratings> {
	const response = await fetch(url, {
		credentials: "include",
	});

	const buffer = await response.arrayBuffer();
	const text = new TextDecoder(siteEncoding).decode(buffer);

	if (!response.ok) {
		console.error(text.slice(0, 500));
		throw new Error(`HTTP ${response.status}`);
	}

	return parseRatings(text);
}

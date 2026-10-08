import { SELECTOR } from "./styles";
import { props, siteEncoding } from "./props";
import type { Ratings } from "./types";
import { CloudflareChallengeError } from "./errors";

const CF_CHALLENGE_RE =
	/<title>\s*Just a moment|<title>\s*Attention Required|cf-chl-opt|_cf_chl_opt|cf-browser-verification|Checking your browser/i;

function isCloudflareChallenge(response: Response, text: string): boolean {
	// Cloudflare явно сообщает о челлендже этим заголовком
	if (response.headers.get("cf-mitigated") === "challenge") return true;
	return CF_CHALLENGE_RE.test(text);
}

function _createRating(str: string): string {
	const regex = /(\*|\d+(\.\d+){0,2}(\.\*)?)(<)/gm;
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
		if (kpSearch) arr.push(kpSearch);
	}

	const kpMatch = arr.find((m) => m[0] === "Кинопоиск");
	const imdbMatch = arr.find((m) => m[0] === "IMDb");

	const imdb = imdbMatch ? _createRating(imdbMatch.input ?? "") : props.unknownRating;
	const kp = kpMatch ? _createRating(kpMatch.input ?? "") : props.unknownRating;

	return { kp, imdb };
}

// загружает страницу раздачи и возвращает { kp, imdb }, при ошибке бросает исключение
export async function fetchRatings(url: string): Promise<string> {
	const response = await fetch(url, {
		credentials: "include",
	});

	const buffer = await response.arrayBuffer();
	const text = new TextDecoder(siteEncoding).decode(buffer);

	// проверяем до !response.ok: челлендж обычно приходит как 403/503
	if (isCloudflareChallenge(response, text)) {
		throw new CloudflareChallengeError(url);
	}

	if (!response.ok) {
		console.error(text.slice(0, 500));
		throw new Error(`HTTP ${response.status}`);
	}

	return text;
}

import { SELECTOR } from "./styles";
import { siteEncoding } from "./props";

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

// разбирает HTML страницы раздачи, возвращает { kp, imdb }
function parseRatings(text) {
	let html = new DOMParser().parseFromString(text, "text/html");

	let ul = html.querySelector(SELECTOR.ratingsList);
	if (!ul) {
		throw new Error("Не найден список рейтингов на странице раздачи");
	}

	let items = ul.getElementsByTagName("li");
	let arr = [];
	for (var i = 1; i < items.length; ++i) {
		items[i].className += " id-" + [i];
		let kpSearch = items[i].innerHTML.match(/Кинопоиск|IMDb/m);
		kpSearch && arr.push(kpSearch);
	}

	let kp_matches = arr.filter((value) => /^Кинопоиск/.test(value));
	let imdb_matches = arr.filter((value) => /^IMDb/.test(value));

	const imdb = imdb_matches[0] ? createRating(imdb_matches[0].input) : "n/a";
	const kp = kp_matches[0] ? createRating(kp_matches[0].input) : "n/a";

	return { kp, imdb };
}

// загружает страницу раздачи и возвращает { kp, imdb }, при ошибке бросает исключение
export async function fetchRatings(url) {
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
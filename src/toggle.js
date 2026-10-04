import { GM_getValue, GM_registerMenuCommand, GM_setValue } from "$";

//показывает рейтинг у раздач на главной сайта
export const showMainPageRatingEnable = GM_getValue("showMainPageRating", true);
//добавляет кнопку "Рейтинг" в топе раздач (http://kinozal.tv/top.php)
export const showTopPageRatingEnable = GM_getValue("showTopPageRating", true);
//разрешает повторное нажатие на кнопку "Рейтинг"
export const reGetRating = GM_getValue("reGetRating", false);

function registerToggle(key, label, current) {
	GM_registerMenuCommand(`${current ? "✅" : "❌"} ${label}`, () => {
		GM_setValue(key, !current);
		location.reload();
	});
}

// пункты-переключатели в меню Tampermonkey
export function registerToggles() {
	registerToggle("showMainPageRating", "Рейтинг на главной", showMainPageRatingEnable);
	registerToggle("showTopPageRating", "Кнопка «Рейтинг» в топе", showTopPageRatingEnable);
	registerToggle("reGetRating", "Повторный запрос рейтинга по кнопке", reGetRating);
}

export const props = {
	_brand: "#f1d29c",
	brand: "#C0A067",
	transition: ".1s ease",
	buttonText: "Рейтинг",
	requestText: "Получить рейтинг",
	errorText: "Ошибка. Повторить?", // кнопка в топе: клик перезапускает запрос
	cloudflareText: "Проверка Cloudflare. Пройти?",
	cloudflareTitle: "Сайт запросил проверку Cloudflare. Клик откроет страницу, после проверки вернитесь сюда",
	errorTitle: "Не удалось загрузить рейтинг",
	unknownRating: "n/a",
} as const;

export const siteEncoding = "windows-1251";

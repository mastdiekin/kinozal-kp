import { GM_addStyle } from "$";
import { styles, disabledStyles } from "./styles";
import { pruneExpiredCache, registerCacheMenu } from "./cache";
import { initMainPageRatings } from "./mainpage";
import { initTopPageButtons } from "./top";
import { registerToggles, showMainPageRatingEnable, showTopPageRatingEnable } from "./toggle";

(function () {
	"use strict";

	// Стили при выключенном рейтинге в /top.php
	if (showTopPageRatingEnable) GM_addStyle(disabledStyles);

	GM_addStyle(styles);

	// Кэш
	registerCacheMenu();

	// Регистрация пунктов-переключателей меню
	registerToggles();

	// Очистка просроченных записей
	pruneExpiredCache();

	if (showTopPageRatingEnable) {
		initTopPageButtons();
	}

	if (showMainPageRatingEnable) {
		initMainPageRatings();
	}
})();
